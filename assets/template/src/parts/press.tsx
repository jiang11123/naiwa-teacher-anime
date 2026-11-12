import React from "react";
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {SIZES} from "../shotSizes";
import {C, IO, OUT, lerp} from "./Anim";
import {CREAM, GRN, INK, RED, YEL} from "./kit";

// 压缩、实测、成绩单类道具

// 真实截图卡：public/img/s/<id>.png（scripts/prep-img.cjs 处理过的截图） + 粗边硬投影；rings = [出现帧, x1, y1, x2, y2]（原图像素）
export type PicRing = [number, number, number, number, number, string?];
export const Pic: React.FC<{id: string; w: number; rings?: PicRing[]; frame?: boolean; tilt?: number}> = ({id, w, rings = [], frame: border = true, tilt = 0}) => {
  const frame = useCurrentFrame();
  const [iw, ih] = SIZES[id];
  const k = w / iw;
  return (
    <div style={{position: "relative", width: w, height: ih * k, rotate: `${tilt}deg`, borderRadius: 14, backgroundColor: "#fff", border: border ? `6px solid ${INK}` : undefined, boxShadow: border ? `9px 11px 0 ${INK}` : undefined}}>
      <Img src={staticFile(`img/s/${id}.png`)} style={{position: "absolute", left: 0, top: 0, width: w, height: ih * k, borderRadius: 8}} />
      {rings.map(([at, x1, y1, x2, y2, color = RED], i) => {
        const t = frame - at;
        if (t < 0) return null;
        const p = interpolate(t, [0, 10], [0, 1], {...C, easing: Easing.bezier(0.33, 1, 0.68, 1)});
        const rw = (x2 - x1) * k + 14;
        const rh = (y2 - y1) * k + 14;
        return (
          <svg key={i} width={rw} height={rh} style={{position: "absolute", left: x1 * k - 7, top: y1 * k - 7, overflow: "visible"}}>
            <rect x={3} y={3} width={rw - 6} height={rh - 6} rx={12} fill="rgba(247,198,74,0.12)" stroke={color} strokeWidth={7} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
          </svg>
        );
      })}
    </div>
  );
};

// 通用纸卡
export const Card: React.FC<{w: number; h?: number; fill?: string; dashed?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, h, fill = CREAM, dashed, style, children}) => (
  <div style={{position: "relative", width: w, height: h, borderRadius: "26px 32px 22px 30px", backgroundColor: fill, border: `7px ${dashed ? "dashed" : "solid"} ${INK}`, boxShadow: dashed ? undefined : `10px 12px 0 ${INK}`, ...style}}>{children}</div>
);

// 聊天气泡：me = 用户（黄，靠右小尾巴）/ 否则 Agent（白）
export const Bub: React.FC<{text: string; me?: boolean; size?: number; dim?: boolean}> = ({text, me = true, size = 46, dim = false}) => (
  <div style={{display: "inline-block", padding: `${size * 0.26}px ${size * 0.55}px ${size * 0.34}px`, borderRadius: me ? "26px 26px 6px 26px" : "26px 26px 26px 6px", backgroundColor: me ? "#FCE38A" : "#fff", border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, color: INK, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", opacity: dim ? 0.45 : 1}}>{text}</div>
);

// 档位颜色：不压缩灰蓝、25 万黄、10 万红（全片统一）
export const TIER = {
  none: {name: "不压缩", color: "#3F6FB5", soft: "#CFE3F5"},
  w25: {name: "25 万压缩", color: "#D69A1E", soft: "#FCE38A"},
  w10: {name: "10 万压缩", color: "#D9362B", soft: "#FFD3C9"},
};

// 上下文锯齿：匀速涨到 top，压回 keep，再涨；返回 [当前值, 已压缩次数]
const RATE = 0.2;
export const sawAt = (t: number, top: number, keep: number): [number, number] => {
  if (t <= 0) return [0, 0];
  const first = top / RATE;
  if (t < first) return [t * RATE, 0];
  const period = (top - keep) / RATE;
  const n = Math.floor((t - first) / period);
  return [keep + ((t - first) % period) * RATE, n + 1];
};

// 一档的上下文长度条：刻度 0~30 万，超过就撑满（不压缩那档）
const PX = 46;
export const TierTrack: React.FC<{start: number; top?: number; keep?: number; color: string; soft: string}> = ({start, top, keep, color, soft}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  const [v, n] = top && keep ? sawAt(t, top, keep) : [Math.min(30, Math.max(0, t) * RATE), 0];
  const W = 30 * PX;
  const justCut = top && keep && n > 0 && (t - top / RATE) % ((top - keep) / RATE) < 5;
  return (
    <div style={{position: "relative", width: W, height: 150}}>
      <div style={{position: "absolute", left: 0, top: 50, width: W, height: 74, borderRadius: 16, backgroundColor: CREAM, border: `6px solid ${INK}`, boxShadow: `7px 8px 0 ${INK}`, overflow: "hidden"}}>
        <div style={{height: "100%", width: v * PX, backgroundColor: justCut ? YEL : soft}} />
        {keep ? <div style={{position: "absolute", left: 0, top: 0, height: "100%", width: Math.min(v, keep) * PX, backgroundColor: color, opacity: 0.85}} /> : null}
        {!keep ? <div style={{position: "absolute", left: 0, top: 0, height: "100%", width: v * PX, backgroundColor: color, opacity: 0.7}} /> : null}
      </div>
      {top ? (
        <div style={{position: "absolute", left: top * PX - 4, top: 34, width: 8, height: 106, borderRadius: 4, backgroundColor: RED}}>
          <div style={{position: "absolute", left: -120, width: 248, top: -46, textAlign: "center", fontSize: 38, fontWeight: 900, color: RED, whiteSpace: "nowrap"}}>{top} 万就压缩</div>
        </div>
      ) : (
        <div style={{position: "absolute", right: 18, top: 62, fontSize: 40, fontWeight: 900, color: "#fff", opacity: v >= 30 ? 1 : 0}}>一直涨 →→</div>
      )}
      {keep ? (
        <div style={{position: "absolute", left: keep * PX + 12, top: 0, fontSize: 34, fontWeight: 900, color, whiteSpace: "nowrap", opacity: n > 0 ? 1 : 0}}>留 {keep} 万</div>
      ) : null}
    </div>
  );
};

// 回忆题成绩纸
export const ScoreSheet: React.FC<{score: number; color: string; w?: number}> = ({score, color, w = 210}) => (
  <div style={{position: "relative", width: w, height: w * 1.08, borderRadius: 12, backgroundColor: "#fff", border: `6px solid ${INK}`, boxShadow: `7px 8px 0 ${INK}`, overflow: "hidden"}}>
    {[0, 1, 2, 3].map((r) => (
      <div key={r} style={{position: "absolute", left: w * 0.14, top: w * (0.14 + r * 0.2), width: w * (0.72 - (r % 2) * 0.16), height: 10, borderRadius: 5, backgroundColor: INK, opacity: 0.16}} />
    ))}
    <div style={{position: "absolute", left: 0, width: w, top: w * 0.2, textAlign: "center", color, fontSize: w * 0.52, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap"}}>
      {score}
      <span style={{fontSize: w * 0.2, color: INK}}>/8</span>
    </div>
  </div>
);

// 剪刀（张合，angle 是单片张开角度）
export const Scissors: React.FC<{size: number; angle?: number}> = ({size, angle = 14}) => (
  <svg width={size} height={size * 0.75} viewBox="-160 -120 320 240" style={{overflow: "visible"}}>
    <g transform={`rotate(${angle})`}>
      <path d="M-20 0 L150 -14 L150 6 Z" fill={CREAM} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={-82} cy={30} r={36} fill={RED} stroke={INK} strokeWidth={8} />
      <circle cx={-82} cy={30} r={15} fill={YEL} stroke={INK} strokeWidth={6} />
      <line x1={-54} y1={18} x2={-16} y2={1} stroke={INK} strokeWidth={14} />
    </g>
    <g transform={`rotate(${-angle})`}>
      <path d="M-20 0 L150 14 L150 -6 Z" fill={CREAM} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={-82} cy={-30} r={36} fill={RED} stroke={INK} strokeWidth={8} />
      <circle cx={-82} cy={-30} r={15} fill={YEL} stroke={INK} strokeWidth={6} />
      <line x1={-54} y1={-18} x2={-16} y2={-1} stroke={INK} strokeWidth={14} />
    </g>
  </svg>
);

// 压缩机：一块带"压缩"字的铁块 + 两根导杆
export const PressBlock: React.FC<{w: number}> = ({w}) => (
  <div style={{position: "relative", width: w, height: 190}}>
    {[0.18, 0.82].map((k) => (
      <div key={k} style={{position: "absolute", left: w * k - 15, top: -900, width: 30, height: 900, backgroundColor: "#8E8171", border: `6px solid ${INK}`}} />
    ))}
    <div style={{position: "absolute", left: 0, top: 0, width: w, height: 190, borderRadius: 18, backgroundColor: "#5B5147", border: `8px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, textAlign: "center", color: YEL, fontSize: 120, fontWeight: 900, lineHeight: "160px", letterSpacing: 18}}>压缩</div>
  </div>
);

// 千分位数字（从 0 滚到 to）
export const Digits: React.FC<{to: number; at: number; dur?: number; style?: React.CSSProperties}> = ({to, at, dur = 26, style}) => {
  const frame = useCurrentFrame();
  const v = Math.round(lerp(frame, at, at + dur, 0, to, OUT));
  return <span style={style}>{v.toLocaleString("en-US")}</span>;
};

// 整份文档条：横向一长条，按比例画几行字（裁剪那场用）
export const DocStrip: React.FC<{w: number; h: number; fill?: string; seed?: number}> = ({w, h, fill = "#fff", seed = 1}) => (
  <div style={{position: "relative", width: w, height: h, backgroundColor: fill, overflow: "hidden"}}>
    {Array.from({length: 5}, (_, r) => (
      <div key={r} style={{position: "absolute", left: 18, top: 22 + (r * (h - 40)) / 5, height: 12, borderRadius: 6, backgroundColor: INK, opacity: 0.28, width: w - 36 - ((r * 83 + seed * 37) % Math.max(10, w * 0.28))}} />
    ))}
  </div>
);

// 灵活的"来源"标签：打个比方 / 我的建议 等
export const Source: React.FC<{text: string; fill?: string}> = ({text, fill = "#DDE4FF"}) => (
  <div style={{display: "inline-block", padding: "6px 22px 10px", borderRadius: 12, backgroundColor: fill, color: INK, border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, fontSize: 38, fontWeight: 900, whiteSpace: "nowrap"}}>{text}</div>
);

// 打勾 / 打叉的状态小圆
export const Dot: React.FC<{ok: boolean; size?: number}> = ({ok, size = 60}) => (
  <div style={{display: "inline-block", width: size, height: size, borderRadius: "50%", backgroundColor: ok ? GRN : RED, border: `5px solid ${INK}`, color: "#fff", fontSize: size * 0.62, fontWeight: 900, textAlign: "center", lineHeight: `${size * 0.8}px`}}>{ok ? "✓" : "✗"}</div>
);

export {IO};
