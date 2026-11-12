// 找 ffmpeg / ffprobe：优先环境变量 FFMPEG / FFPROBE，其次 PATH 里的 ffmpeg，最后退回 Remotion 自带的（npx remotion ffmpeg）
import {spawnSync} from "node:child_process";

const has = (cmd) => !spawnSync(cmd, ["-version"], {stdio: "ignore", shell: false}).error;
export const FF = process.env.FFMPEG || (has("ffmpeg") ? "ffmpeg" : null);
export const FP = process.env.FFPROBE || (has("ffprobe") ? "ffprobe" : null);

// 统一调用：ff(["-i", ...]) / probe([...])；没装 ffmpeg 时用 npx remotion ffmpeg
export const ff = (args, opts = {}) => {
  const r = FF ? spawnSync(FF, args, {encoding: "utf8", maxBuffer: 1 << 30, ...opts}) : spawnSync("npx", ["remotion", "ffmpeg", ...args.map((a) => (/\s/.test(a) ? `"${a}"` : a))], {encoding: "utf8", shell: true, maxBuffer: 1 << 30, ...opts});
  if (r.status !== 0) throw new Error(`ffmpeg 失败：${(r.stderr || "").slice(-800)}`);
  return r;
};
export const probe = (args) => {
  const r = FP ? spawnSync(FP, args, {encoding: "utf8"}) : spawnSync("npx", ["remotion", "ffprobe", ...args.map((a) => (/\s/.test(a) ? `"${a}"` : a))], {encoding: "utf8", shell: true});
  if (r.status !== 0) throw new Error(`ffprobe 失败：${(r.stderr || "").slice(-800)}`);
  return r.stdout.trim();
};
export const duration = (file) => Number(probe(["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]));

// 混音要用 adelay / amix / apad / aformat 这些滤镜，Remotion 自带的 ffmpeg 只编了 scale，跑到一半才报 "No such filter"。
// 所以在需要完整 ffmpeg 的脚本开头先查一次，给一句能照做的话，别甩 ffmpeg 原始报错
export const requireFFmpeg = (what) => {
  if (FF) return;
  console.error(
    [
      `这一步（${what}）需要完整版 ffmpeg，但在 PATH 里没找到。`,
      "Remotion 自带的那个是精简版，只有 scale 滤镜，混音/合并会失败。装一个完整版：",
      "  Windows:  winget install Gyan.FFmpeg",
      "  macOS:    brew install ffmpeg",
      "  Linux:    sudo apt install ffmpeg",
      "已经装了但不在 PATH：设环境变量 FFMPEG / FFPROBE 指向对应的 exe。",
    ].join("\n"),
  );
  process.exit(1);
};
