// 纸张手绘风的全部颜色（全片只用这些，不临时发明新颜色）
export const PAPER = "#F4ECDA"; // 纸底
export const DOT = "#D8C6A2"; // 背景波点
export const INK = "#2B211C"; // 墨：线、正文、硬投影
export const SIDE = "#6B5442"; // 元素侧面厚度
export const RED = "#D9362B"; // 打击点：结论、警告、圈重点（少用）
export const YEL = "#F7C64A"; // 注意这里：大字、高亮
export const GRN = "#4E8A4A"; // 对、通过、完成
export const BLU = "#3F6FB5"; // 说明、中性信息
export const CREAM = "#FFFDF6"; // 卡片底
// 浅贴纸底：大面积填色用
export const SOFTY = "#FCE38A";
export const SOFTR = "#FFD3C9";
export const SOFTB = "#CFE3F5";
export const SOFTG = "#D9EFC8";

// 估算一行字的宽度（单位：字号）：中文 1，英文数字约 0.56
export const em = (s: string) => [...s].reduce((a, ch) => a + (/[⺀-￿]/.test(ch) ? 1 : ch === " " ? 0.3 : 0.58), 0);
// 给定最大宽度，算出装得下的字号（字绝不能超出框）
export const fit = (s: string, maxW: number, size: number) => Math.min(size, Math.floor(maxW / Math.max(1, em(s))));
