// 开工前自更新：读远端 VERSION，比本地新就整份下载覆盖，不管本地是不是 git 仓库。
//
// 为什么不用单纯 git pull：
//   大多数人装 skill 是「拷文件夹」进来的（skills 目录里没有 .git），git pull 必然失败，
//   然后就会一直用旧版。这个脚本走 GitHub tarball，拷贝安装也能升级。
//
// 为什么只比 VERSION 不下整包：
//   仓库十几 MB（音效+参考图）。版本没变就不下载，每次开工只花一个几百字节的请求。
//
// 用法：node scripts/self-update.mjs [--force] [--dry-run]
//   输出第一段是机器可读状态，方便 agent 判断：
//     SELF_UPDATE=current 1.1.0
//     SELF_UPDATE=updated 1.1.0->1.2.0
//     SELF_UPDATE=skipped no-autoupdate
//     SELF_UPDATE=failed 原因（继续用本地 1.1.0）
//   环境变量 NAIWA_SKILL_REPO 可指向你自己的 fork。
import fs from "fs";
import os from "os";
import path from "path";
import {execFileSync} from "child_process";
import {fileURLToPath} from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = process.env.NAIWA_SKILL_REPO || "jiang11123/naiwa-teacher-anime";
const argv = process.argv.slice(2);
const force = argv.includes("--force");
const dry = argv.includes("--dry-run");

const say = (s) => console.log(s);
const localVersion = () => {
  try {
    return fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
  } catch {
    return "";
  }
};
// 只认 主.次.修订，本地版本缺失按 0.0.0 处理（会被更新）
const cmp = (a, b) => {
  const pa = String(a || "0.0.0").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b || "0.0.0").split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
};

// 先问 API（准），不行再问 raw（带时间戳绕 CDN 缓存）
async function fetchRemoteVersion() {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/VERSION`, {
      headers: {"Accept": "application/vnd.github+json", "User-Agent": "naiwa-skill-self-update"},
    });
    if (r.ok) {
      const j = await r.json();
      if (j.content) return Buffer.from(j.content, "base64").toString("utf8").trim();
    }
  } catch {
    /* 退到 raw */
  }
  const r2 = await fetch(`https://raw.githubusercontent.com/${REPO}/main/VERSION?t=${Date.now()}`, {
    headers: {"User-Agent": "naiwa-skill-self-update"},
  });
  if (!r2.ok) throw new Error(`读不到远端 VERSION（HTTP ${r2.status}）`);
  return (await r2.text()).trim();
}

function copyTree(from, to) {
  // 不覆盖：.git（clone 安装要保住仓库）、node_modules、no-autoupdate（用户主动关更新）、
  // 以及抽帧/产物目录，避免把上一期的东西带进来
  const skip = new Set([".git", "node_modules", "no-autoupdate", "chk", "out"]);
  let n = 0;
  for (const e of fs.readdirSync(from, {withFileTypes: true})) {
    if (skip.has(e.name)) continue;
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(d, {recursive: true});
      n += copyTree(s, d);
    } else {
      fs.copyFileSync(s, d);
      n++;
    }
  }
  return n;
}

function changelogHead(ver) {
  try {
    const s = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
    const m = s.match(new RegExp(`^## ${ver.replace(/\./g, "\\.")}[\\s\\S]*?(?=^## |$)`, "m"));
    if (!m) return "";
    return m[0].trim().split("\n").slice(1, 6).join("\n");
  } catch {
    return "";
  }
}

async function main() {
  if (!force && fs.existsSync(path.join(ROOT, "no-autoupdate"))) {
    say(`SELF_UPDATE=skipped no-autoupdate`);
    return;
  }

  const before = localVersion();
  let remote;
  try {
    remote = await fetchRemoteVersion();
  } catch (e) {
    say(`SELF_UPDATE=failed ${e.message}（继续用本地 ${before || "未知版本"}）`);
    return;
  }

  if (!remote) {
    say(`SELF_UPDATE=failed 远端 VERSION 是空的（继续用本地 ${before || "未知版本"}）`);
    return;
  }

  // 远端不比本地新就不动。相等也算最新；远端更旧说明本地是分支版本，别降级
  if (cmp(remote, before) <= 0) {
    say(`SELF_UPDATE=current ${before}`);
    return;
  }

  if (dry) {
    say(`SELF_UPDATE=dry-run ${before}->${remote}`);
    return;
  }

  // clone 安装的先走 git pull：只拉增量、仓库保持干净。失败（本地改过 / 离线 / 冲突）再退回 tarball
  if (fs.existsSync(path.join(ROOT, ".git"))) {
    try {
      execFileSync("git", ["-C", ROOT, "pull", "--ff-only", "--quiet"], {stdio: "pipe"});
      const now = localVersion();
      if (cmp(now, remote) >= 0) {
        say(`SELF_UPDATE=updated ${before || "无版本号"}->${now}（git pull）`);
        const headGit = changelogHead(now);
        if (headGit) say(headGit);
        return;
      }
    } catch {
      /* 退回 tarball */
    }
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "naiwa-skill-"));
  try {
    // tarball 比 git clone 省一半流量，且不需要本地有 git
    const tgz = "skill.tar.gz";
    const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/refs/heads/main`, {
      headers: {"User-Agent": "naiwa-skill-self-update"},
    });
    if (!res.ok) throw new Error(`下载失败（HTTP ${res.status}）`);
    fs.writeFileSync(path.join(tmp, tgz), Buffer.from(await res.arrayBuffer()));

    // 必须传相对路径 + cwd：Windows 上 Git Bash 的 GNU tar 会把 "C:\..." 的盘符
    // 当成远程主机（报 "Cannot connect to C: resolve failed"），用相对路径绕开
    fs.mkdirSync(path.join(tmp, "unpack"));
    execFileSync("tar", ["-xzf", tgz, "-C", "unpack"], {cwd: tmp, stdio: "pipe"});

    const unpack = path.join(tmp, "unpack");
    const inner = fs.readdirSync(unpack).find((x) => fs.statSync(path.join(unpack, x)).isDirectory());
    if (!inner) throw new Error("解压后没找到目录");
    const src = path.join(unpack, inner);

    // 兜底：别把一次坏包当新版覆盖上去
    const got = fs.readFileSync(path.join(src, "VERSION"), "utf8").trim();
    if (cmp(got, before) <= 0) throw new Error(`下载到的版本 ${got} 不比本地 ${before} 新`);

    const n = copyTree(src, ROOT);
    say(`SELF_UPDATE=updated ${before || "无版本号"}->${got}（${n} 个文件）`);
    const head = changelogHead(got);
    if (head) say(head);
  } catch (e) {
    say(`SELF_UPDATE=failed ${e.message}（继续用本地 ${before || "未知版本"}）`);
  } finally {
    try {
      fs.rmSync(tmp, {recursive: true, force: true});
    } catch {
      /* 临时目录删不掉不影响结果 */
    }
  }
}

await main();
