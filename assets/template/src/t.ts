import {Easing, interpolate} from "remotion";
import {CAP, L, MARK} from "./voice";

// ===== 时间工具：画面全部卡在配音上 =====
// src/voice.ts 由 scripts/estimate-align.mjs（没录音，按字数估）或 scripts/align.mjs（真人 / TTS 配音）生成，不要手写帧号。
// 分镜里一律用「全片帧」：
//   T("013")      第 013 句开始（提前 ADV 帧，说到时已经看得清）
//   T("013", 1)   第 013 句第 2 段字幕开始；第三个参数再加减帧：T("013", 1, 6)
//   E("013")      第 013 句结束
//   M("013", 0)   第 013 句 lines.json 里 marks 的第 1 个词说出来的帧（卡重音用）
//   S(1.5)        1.5 秒 = 45 帧
export const FPS = 30;
export const ADV = 3; // 元素和音效提前几帧开始弹
export const LEAD = 12; // 每个分镜从它第一句配音前 LEAD 帧开始：镜头先动，开口时正好到位
export const SUB_ADV = 0; // 字幕提前帧数

const need = <V,>(rec: Record<string, V>, id: string, what: string): V => {
  const v = rec[id];
  if (v === undefined) throw new Error(`voice.ts 里没有第 ${id} 句（${what}）——检查 lines.json 的 id，改完重跑对齐脚本`);
  return v;
};
export const T = (id: string, i = 0, d = 0) => {
  const caps = need(CAP, id, "T");
  if (caps[i] === undefined) throw new Error(`第 ${id} 句只有 ${caps.length} 段字幕，没有第 ${i + 1} 段`);
  return caps[i] + d - ADV;
};
export const E = (id: string, d = 0) => need(L, id, "E")[1] + d;
export const M = (id: string, i: number, d = 0) => {
  const m = MARK[id]?.[i];
  if (m === undefined) throw new Error(`第 ${id} 句没有第 ${i + 1} 个 mark（在 lines.json 里加 "marks": ["词"]）`);
  return m + d - ADV;
};
export const S = (sec: number) => Math.round(sec * FPS);
export const startOf = (id: string) => Math.max(0, need(L, id, "startOf")[0] - LEAD);

const IO = Easing.bezier(0.65, 0, 0.35, 1);
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
// 分段插值：seg(f, [[帧, 值], [帧, 值], ...])，比如走路路线、整组让位
export const seg = (f: number, keys: [number, number][], easing = IO) =>
  keys.length === 1
    ? keys[0][1]
    : interpolate(
        f,
        keys.map((k) => k[0]),
        keys.map((k) => k[1]),
        {...CL, easing},
      );
// 时间窗口：a 帧淡入、b 帧开始淡出，返回 0~1（重点组件的背景变淡、贴纸显隐）
export const win = (f: number, a: number, b: number, fade = 6) => (f < a || f > b + fade ? 0 : Math.min(interpolate(f, [a, a + fade], [0, 1], CL), interpolate(f, [b, b + fade], [1, 0], CL)));
