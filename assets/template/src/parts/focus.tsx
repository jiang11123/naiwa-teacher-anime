import React from "react";
import {Easing, Interactive, interpolate, useCurrentFrame} from "remotion";
import {CREAM, INK, PAPER, SOFTY, fit} from "./palette";
import {win} from "../t";

// 屏幕层（不跟 3D 镜头走）的几件东西，放在 src/Overlay.tsx 里用：
// 1. FocusDim：重点组件出来时，后面整个场景盖一层约 0.6 的半透明纸色（用来解决“抓不到重点”）
//    windows = [[开始帧, 结束帧], ...]；相邻几段首尾接上，中间就不会闪
// 2. Big：屏幕坐标里的重点组件，中心在 (x, y)，弹出放大、到 out 退场
// 3. TermNote：术语便签——讲到时先贴在物件旁边（from），再缩小飞到右上角排成一列（slot 第几张）
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);

export const focusAt = (f: number, windows: [number, number][]) => Math.max(0, ...windows.map(([a, b]) => win(f, a, b, 8)));

export const FocusDim: React.FC<{windows: [number, number][]; amount?: number}> = ({windows, amount = 0.62}) => {
  const f = useCurrentFrame();
  const k = focusAt(f, windows);
  if (k <= 0) return null;
  return <div style={{position: "absolute", inset: 0, backgroundColor: PAPER, opacity: amount * k}} />;
};

export const Big: React.FC<{name: string; x: number; y: number; at: number; out: number; rot?: number; children: React.ReactNode}> = ({name, x, y, at, out, rot = 0, children}) => {
  const f = useCurrentFrame();
  if (f < at || f > out + 8) return null;
  const s = interpolate(f - at, [0, 12], [0.5, 1], {...CL, easing: BACK}) * interpolate(f, [out, out + 8], [1, 0.85], CL);
  const o = Math.min(interpolate(f - at, [0, 4], [0, 1], CL), interpolate(f, [out, out + 8], [1, 0], CL));
  return (
    <Interactive.Div name={name} className="boil" style={{position: "absolute", left: x, top: y, width: "max-content", translate: "-50% -50%", scale: String(s), rotate: `${rot}deg`, opacity: o}}>
      {children}
    </Interactive.Div>
  );
};

// 便签本体：上面小字（类别），下面大字（术语）
export const Note: React.FC<{top: string; bottom: string; w?: number}> = ({top, bottom, w = 380}) => (
  <div style={{width: w, padding: "14px 22px 18px", backgroundColor: SOFTY, border: `5px solid ${INK}`, borderRadius: "6px 10px 8px 12px", boxShadow: `7px 8px 0 ${INK}`}}>
    <div style={{fontSize: fit(top, w - 50, 30), fontWeight: 900, color: "#6B5442", whiteSpace: "nowrap"}}>{top}</div>
    <div style={{fontSize: fit(bottom, w - 50, 52), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{bottom}</div>
  </div>
);

export const TermNote: React.FC<{name: string; top: string; bottom: string; at: number; from: [number, number]; slot: number; out?: number; hide?: number; fly?: number}> = ({name, top, bottom, at, from, slot, out, hide = 0, fly = 36}) => {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = interpolate(f, [at + fly, at + fly + 18], [0, 1], {...CL, easing: IO});
  const to: [number, number] = [1720, 90 + slot * 96];
  const x = from[0] + (to[0] - from[0]) * k;
  const y = from[1] + (to[1] - from[1]) * k - Math.sin(Math.PI * k) * 60;
  const s = interpolate(f - at, [0, 12], [0.5, 1], {...CL, easing: BACK}) * (1 - k * 0.5);
  const o = (1 - hide) * interpolate(f - at, [0, 4], [0, 1], CL) * (out === undefined ? 1 : interpolate(f, [out, out + 8], [1, 0], CL));
  return (
    <Interactive.Div name={name} className="boil" style={{position: "absolute", left: x - 190, top: y - 60, width: 380, scale: String(s), rotate: `${(1 - k) * (slot % 2 ? 4 : -4) + k * 2}deg`, opacity: o}}>
      <Note top={top} bottom={bottom} />
    </Interactive.Div>
  );
};

// 白底大气泡（重点组件里常用）
export const BigSay: React.FC<{text: string; size?: number}> = ({text, size = 92}) => (
  <div style={{position: "relative", padding: `${size * 0.28}px ${size * 0.58}px`, backgroundColor: CREAM, border: `7px solid ${INK}`, borderRadius: 40, boxShadow: `10px 12px 0 ${INK}`, fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>
    {text}
    <div style={{position: "absolute", left: 70, bottom: -30, width: 46, height: 46, backgroundColor: CREAM, borderRight: `7px solid ${INK}`, borderBottom: `7px solid ${INK}`, rotate: "45deg"}} />
  </div>
);
