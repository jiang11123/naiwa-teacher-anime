// 还没有配音时用：按字数估算 scripts/lines.json 每段字幕的时间，生成 src/voice.ts，先把画面做出来
// 有配音后换成：node scripts/asr.py（python scripts/asr.py）→ node scripts/align.mjs
// 用法：node scripts/estimate-align.mjs [每秒字数，默认 4.8（正常口播语速）]
import fs from "fs";

const FPS = 30;
const CPS = Number(process.argv[2] ?? 4.8);
const lines = JSON.parse(fs.readFileSync("scripts/lines.json", "utf8"));
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const len = (s) => [...norm(s)].length;

let t = 0.2;
const L = {};
const CAP = {};
const MARK = {};
const captions = [];
for (const ln of lines) {
  const start = t;
  CAP[ln.id] = [];
  const charAt = []; // 这句里每个字的估算时间
  for (const text of ln.caps) {
    const d = Math.max(0.7, len(text) / CPS);
    CAP[ln.id].push(Math.round(t * FPS));
    const n = len(text);
    for (let k = 0; k < n; k++) charAt.push(t + (d * k) / Math.max(1, n));
    captions.push({start: +t.toFixed(2), end: +(t + d).toFixed(2), text});
    t += d + 0.08;
  }
  if (ln.marks) {
    const all = norm(ln.caps.join(""));
    let pos = 0;
    MARK[ln.id] = ln.marks.map((m) => {
      const k = all.indexOf(norm(m), pos);
      if (k < 0) throw new Error(`第 ${ln.id} 句找不到标记「${m}」`);
      pos = k + norm(m).length;
      return Math.round(charAt[k] * FPS);
    });
  }
  L[ln.id] = [Math.round(start * FPS), Math.round((t - 0.08) * FPS)];
  t += 0.3;
}
const total = Math.ceil((t + 1) * FPS);
fs.writeFileSync(
  "src/voice.ts",
  `// 自动生成（scripts/estimate-align.mjs，按字数估算，还不是真实配音时间），不要手改
export const HAS_VOICE = false;
export const VOICE_FRAMES = ${total};
export const L: Record<string, [number, number]> = ${JSON.stringify(L)};
// 每句里每一小段字幕的开始帧（分镜里按字幕出场用）
export const CAP: Record<string, number[]> = ${JSON.stringify(CAP)};
// 句子里某个词说出来的帧（lines.json 的 marks），按顺序对应
export const MARK: Record<string, number[]> = ${JSON.stringify(MARK)};
export type CaptionLine = {start: number; end: number; text: string};
export const captions: CaptionLine[] = ${JSON.stringify(captions, null, 1)};
`,
);
console.log("估算总长", (total / FPS).toFixed(1), "秒（每秒", CPS, "字）");
