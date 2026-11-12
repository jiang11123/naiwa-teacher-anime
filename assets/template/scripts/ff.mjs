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
