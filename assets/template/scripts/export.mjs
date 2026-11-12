// 导出闸门：整个 skill 里唯一允许的导出入口。
//
// 为什么要有这个脚本：光在文档里写「用户说导出才导出」拦不住人——agent 会把这句话读成流程说明，
// 抽完帧就顺手把成片渲了，用户根本没看过画面。这里把「用户同意」变成一道必须填的输入：
// 填不出用户原话就跑不下去，含糊的回应会被明确拒绝。
//
// 运行：node scripts/export.mjs --confirm "用户说导出那句话说"
// 可选：--allow-no-preview（用户明确说"不用预览、直接导出"时才加） --port=3010 --browser="C:/.../chrome.exe"
import fs from "fs";
import path from "path";
import {spawnSync} from "child_process";
import {probe, duration, requireFFmpeg} from "./ff.mjs";

const argv = process.argv.slice(2);
const pick = (name, dflt = null) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const has = (name) => argv.includes(name);
const confirm = pick("--confirm");
const allowNoPreview = has("--allow-no-preview");
const port = pick("--port", "3010");

const die = (title, lines) => {
  console.error([`\n✗ 拒绝导出：${title}\n`, ...lines.map((l) => "  " + l), ""].join("\n"));
  process.exit(1);
};
// 拦住是一种情况，跑到一半失败是另一种；分开措辞，免得用户以为是被规矩挡住了
const fail = (title, lines) => {
  console.error([`\n✗ 导出失败：${title}\n`, ...lines.map((l) => "  " + l), ""].join("\n"));
  process.exit(1);
};

// ── 闸门 1：必须有用户确认的原话 ────────────────────────────────────────────
// 这些词是"看完觉得还行"，不是"同意导出成片"。视频一旦导出就会被发给别人、传到平台，
// 拦在这一步的成本远低于让用户发现拿到一个他没看过的东西。
const NOT_CONFIRM = [
  "可以了", "可以的", "可以", "不错", "挺好", "很好", "好的", "好", "行", "行吧",
  "嗯", "嗯嗯", "继续", "就这样", "没问题", "收到", "辛苦了", "你看着办", "ok", "okay",
];
if (!confirm || !confirm.trim()) {
  die("缺少用户确认", [
    "这个脚本只认用户明确说过的导出指令，不接受自己判断「差不多了」。",
    "",
    "先做这两件事：",
    "  1. 开预览给用户看：npx remotion studio（地址发给用户，或直接打开预览面板）",
    "  2. 停下等回复。用户说「导出 / 出片 / 渲染成片 / 发我成片」之后，拿他那句话回来：",
    "",
    '     node scripts/export.mjs --confirm "可以，导出吧"',
    "",
    "「可以了」「不错」「继续」这类不算确认——那只是对稿子或画面的评价，不是导出许可。",
  ]);
}
const bare = confirm.trim().replace(/[，。！？、,.!?～~\s]/g, "");
if (NOT_CONFIRM.includes(bare.toLowerCase())) {
  die(`「${confirm.trim()}」不算导出确认`, [
    "这个词只表示「这版还行」，没说要不要出成片。",
    "",
    "回去问一句：「这版可以的话我就导出成片了？」",
    "等用户明确回答「导出」再回来跑，别替他决定。",
  ]);
}

// ── 闸门 2：必须真的抽过帧审过片 ────────────────────────────────────────────
// 抽帧审片是最便宜的一关，跳过它直接导出，等于把没看过的画面交给用户。
const findSheets = (dir, depth = 0) => {
  if (depth > 3 || !fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findSheets(p, depth + 1));
    else if (/^sheet\d*\.(jpg|png)$/i.test(e.name)) out.push(p);
  }
  return out;
};
const sheets = findSheets("chk");
if (!sheets.length && !allowNoPreview) {
  die("还没抽帧审片（第 5 步）", [
    "先跑：node scripts/check.mjs --out chk/r1",
    "然后真的打开 chk/r1/sheet*.jpg 逐格看，改完换 chk/r2 再抽一遍。",
    "",
    "只有用户明确说「不用预览、直接导出」时，才允许加 --allow-no-preview。",
  ]);
}
if (allowNoPreview && !sheets.length) {
  console.log("⚠ 未经抽帧审片就导出（用了 --allow-no-preview）——汇报时要说清这一点。");
}

// ── 准备 ───────────────────────────────────────────────────────────────────
requireFFmpeg("导出"); // 渲染完还要混音，缺完整 ffmpeg 会白等 1 分半才失败

const OUT = "out";
const muted = path.join(OUT, "video-muted.mp4");
const final = path.join(OUT, "video.mp4");
fs.mkdirSync(OUT, {recursive: true});
console.log(`已确认导出：用户说过「${confirm.trim()}」\n`);

const run = (cmd, args, label) => {
  console.log(`\n▶ ${label}`);
  const shell = process.platform === "win32";
  // Windows 下跑 npx 必须借 shell（.cmd 不能直接 exec），而 shell 模式下 Node 只是把参数用空格拼成一行：
  // "C:/Program Files/..." 会被 cmd 从空格处切开，Remotion 收到半截 "C:/Program" 就报 browserExecutable 不存在。
  // 所以带空格或引号的参数要自己加引号，非 Windows 不加（否则引号会变成路径的一部分）。
  const quoted = shell ? args.map((a) => (/[\s"]/.test(a) ? `"${a}"` : a)) : args;
  const r = spawnSync(cmd, quoted, {stdio: "inherit", shell});
  if (r.status !== 0) fail(`${label} 失败`, ["看上面输出的报错；常见原因见 references/pitfalls.md。"]);
};

// 浏览器：优先 --browser，其次环境变量，再次本机已装的 Chrome，最后让 Remotion 自己下载
const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];
const browser = pick("--browser") || process.env.REMOTION_BROWSER || chromePaths.find((p) => p && fs.existsSync(p));
if (browser) console.log(`浏览器：${browser}`);

run("npx", ["tsc", "--noEmit"], "类型检查");
run("npx", [
  "remotion", "render", "Main", muted,
  "--muted",
  `--port=${port}`,
  ...(browser ? [`--browser-executable=${browser}`] : []),
], "渲染画面（无声）");
run(process.execPath, ["scripts/mix-audio.mjs", muted, final], "混配音和音效");

// ── 导出后自检：色彩、时长、音轨 ────────────────────────────────────────────
// ffprobe 在 Windows 上每行以 \r\n 结尾，不 trim 的话拿到的值是 "yuv420p\r"，永远对不上
const info = Object.fromEntries(
  probe(["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=pix_fmt,color_range,color_space,width,height,r_frame_rate",
    "-of", "default=nw=1", final])
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const secs = duration(final);
const mb = (fs.statSync(final).size / 1048576).toFixed(1);
const hasAudio = probe(["-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_name", "-of", "csv=p=0", final]) !== "";

// yuv420p / tv / bt709 是平台正常播放的前提，被改掉会发灰或发白
const bad = [];
if (info.pix_fmt !== "yuv420p") bad.push(`pix_fmt=${info.pix_fmt}（应为 yuv420p）`);
if (info.color_range !== "tv") bad.push(`color_range=${info.color_range}（应为 tv）`);
if (info.color_space !== "bt709") bad.push(`color_space=${info.color_space}（应为 bt709）`);
if (!hasAudio) bad.push("没有音轨");
if (fs.existsSync("public/voice.mp3")) {
  const vd = Number(probe(["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "public/voice.mp3"]));
  if (Math.abs(vd - secs) > 0.5) bad.push(`成片 ${secs.toFixed(2)}s 与配音 ${vd.toFixed(2)}s 差得太多`);
}

console.log(`\n${bad.length ? "⚠" : "✓"} ${final}`);
console.log(`  ${info.width}×${info.height} ${info.r_frame_rate}fps ${info.pix_fmt} ${info.color_range}/${info.color_space} ${secs.toFixed(2)}s ${mb}MB ${hasAudio ? "有音轨" : "无音轨"}`);
if (bad.length) {
  console.log("  需要检查：");
  for (const b of bad) console.log("   - " + b);
  console.log("  多半是 remotion.config.ts 被改了，恢复默认再导一次。");
}
console.log(`\nEXPORT=${bad.length ? "warn" : "ok"} ${final}（确认：「${confirm.trim()}」${sheets.length ? `，审片图 ${sheets.length} 张` : "，未经抽帧审片"}）`);
console.log("下一步不是交付：先做封面 + 发布标题 + 本期总结（第 8 步）。");
