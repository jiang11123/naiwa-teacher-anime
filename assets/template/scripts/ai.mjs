// 把用户用 AI 生成的一段动画（任意分辨率 / 帧率 / 带不带声音都行）转成 public/ai/c<编号>.mp4：
// 去掉声音、30fps、1280×720，整段均匀变速，正好铺满配音里“开始句 → 结束句（下一块的第一句）”这一段
// 用法：node scripts/ai.mjs <原片路径> <编号> <开始句id> <结束句id>
// 然后在 src/Ai.tsx 的 CLIPS 里登记：{k: 编号, from: startOf(开始句), to: startOf(结束句), labels: [...]}
import fs from "node:fs";
import {duration, ff} from "./ff.mjs";

const [src, k, a, b] = process.argv.slice(2);
if (!src || !k || !a || !b) {
  console.error("用法：node scripts/ai.mjs <原片路径> <编号> <开始句id> <结束句id>");
  process.exit(1);
}
const voice = fs.readFileSync("src/voice.ts", "utf8");
const L = JSON.parse(voice.match(/export const L[^=]*= (\{.*?\});/)[1]);
const so = (id) => {
  if (!L[id]) throw new Error(`voice.ts 里没有第 ${id} 句`);
  return Math.max(0, L[id][0] - 12);
};
const dur = duration(src);
const f0 = so(a);
const n = so(b) - f0;
const factor = n / 30 / dur; // setpts 倍数（<1 = 加速）
fs.mkdirSync("public/ai", {recursive: true});
ff([
  "-v", "error", "-y", "-i", src, "-an",
  "-vf", `setpts=PTS*${factor.toFixed(6)},fps=30,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,tpad=stop_mode=clone:stop_duration=1`,
  "-frames:v", String(n), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "medium", "-movflags", "+faststart",
  `public/ai/c${k}.mp4`,
]);
console.log(`c${k}: 原片 ${dur.toFixed(2)}s → ${n} 帧 (${(n / 30).toFixed(2)}s)，速度 x${(1 / factor).toFixed(2)}`);
if (1 / factor > 1.6 || 1 / factor < 0.6) console.log("  ← 变速太多，动作会显得太快 / 太慢：考虑让用户重新生成更合适长度的片段，或只用一部分");
