// 配音对齐：把 lines.json 里校对好的字幕，按字对齐到 ASR 的逐字时间（scripts/words.json，[[开始毫秒, 结束毫秒, "字"], ...]）
// 生成 src/voice.ts（每句起止帧 + 每段字幕开始帧 + marks 重音帧 + 字幕），分镜和音效会自动跟着新配音走
// 流程：配音放 public/voice.mp3 → python scripts/asr.py → node scripts/align.mjs
// 录音和稿子不一样时（漏念 / 改说 / 新加）先改 lines.json 跟录音一致，再跑这个
import fs from "fs";
import {duration} from "./ff.mjs";

const FPS = 30;
const AUDIO_SEC = Number(process.argv[2] ?? duration("public/voice.mp3"));
const lines = JSON.parse(fs.readFileSync("scripts/lines.json", "utf8"));
const words = JSON.parse(fs.readFileSync("scripts/words.json", "utf8"));
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// 转录拆成单字，每个字分到这个 token 的一段时间
const tx = [];
for (const [a, b, w] of words) {
  const cs = [...norm(w)];
  cs.forEach((ch, i) => tx.push({ch, from: a + ((b - a) * i) / cs.length, to: a + ((b - a) * (i + 1)) / cs.length}));
}
// 字幕拆成单字，记住每个字属于哪一段
const cap = [];
const segs = [];
for (const ln of lines) {
  ln.caps.forEach((text, k) => {
    segs.push({id: ln.id, k, text});
    for (const ch of norm(text)) cap.push({ch, seg: segs.length - 1});
  });
}
// 编辑距离对齐（替换 / 漏字 / 多字都算 1）
const n = cap.length;
const m = tx.length;
const D = Array.from({length: n + 1}, () => new Int32Array(m + 1));
for (let i = 0; i <= n; i++) D[i][0] = i;
for (let j = 0; j <= m; j++) D[0][j] = j;
for (let i = 1; i <= n; i++)
  for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j - 1] + (cap[i - 1].ch === tx[j - 1].ch ? 0 : 1), D[i - 1][j] + 1, D[i][j - 1] + 1);
const at = new Array(n).fill(-1);
for (let i = n, j = m; i > 0 && j > 0; ) {
  if (D[i][j] === D[i - 1][j - 1] + (cap[i - 1].ch === tx[j - 1].ch ? 0 : 1)) at[--i] = --j;
  else if (D[i][j] === D[i - 1][j] + 1) i--;
  else j--;
}
console.log("编辑距离", D[n][m], "/", n, "字");

// 每段字幕的开始 / 结束（秒）
const segT = segs.map(() => [Infinity, -Infinity]);
cap.forEach((c, i) => {
  if (at[i] < 0) return;
  const t = tx[at[i]];
  segT[c.seg][0] = Math.min(segT[c.seg][0], t.from / 1000);
  segT[c.seg][1] = Math.max(segT[c.seg][1], t.to / 1000);
});
// 没对上的段（极少）用前后段插值
segT.forEach((s, i) => {
  if (!isFinite(s[0])) s[0] = s[1] = segT[i - 1][1];
});

// 每个字的时间（没对上的字按前后插值）：lines.json 里写 marks: ["42", "38", ...]，按顺序找到这些词说出来的那一帧
const charT = cap.map((_, i) => (at[i] >= 0 ? tx[at[i]].from / 1000 : NaN));
for (let i = 0; i < charT.length; i++) {
  if (!Number.isNaN(charT[i])) continue;
  let a = i - 1;
  while (a >= 0 && Number.isNaN(charT[a])) a--;
  let b = i + 1;
  while (b < charT.length && Number.isNaN(charT[b])) b++;
  const ta = a >= 0 ? charT[a] : charT[b];
  const tb = b < charT.length ? charT[b] : ta;
  charT[i] = ta + ((tb - ta) * (i - a)) / (b - a);
}
const MARK = {};
{
  let base = 0;
  for (const ln of lines) {
    const text = norm(ln.caps.join(""));
    if (ln.marks) {
      let pos = 0;
      MARK[ln.id] = ln.marks.map((m) => {
        const k = text.indexOf(norm(m), pos);
        if (k < 0) throw new Error(`第 ${ln.id} 句找不到标记「${m}」（从第 ${pos} 字往后）`);
        pos = k + norm(m).length;
        return Math.round(charT[base + k] * FPS);
      });
    }
    base += [...text].length;
  }
}

const L = {};
const CAP = {};
const captions = [];
segs.forEach((s, i) => {
  const [a, b] = segT[i];
  CAP[s.id] ??= [];
  CAP[s.id].push(Math.round(a * FPS));
  L[s.id] = L[s.id] ? [L[s.id][0], Math.round(b * FPS)] : [Math.round(a * FPS), Math.round(b * FPS)];
  captions.push({start: +a.toFixed(2), end: +b.toFixed(2), text: s.text});
});
const total = Math.ceil((AUDIO_SEC + 1) * FPS);
fs.writeFileSync(
  "src/voice.ts",
  `// 自动生成（scripts/align.mjs，按真人配音 public/voice.mp3 的 ASR 时间对齐），不要手改：每句配音的 [开始帧, 结束帧] 和字幕
export const HAS_VOICE = true;
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
for (const c of captions) {
  const d = c.end - c.start;
  const warn = d < 0.35 ? "  ← 太短，查一下是不是没对上" : d > 4.5 ? "  ← 太长，查一下是不是吞了停顿" : "";
  console.log(c.start.toFixed(2), c.end.toFixed(2), c.text + warn);
}
