import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {INK, YEL} from "./kit";

// GitHub 标志（猫头圆标）+ 出场特效：转着弹出来 → 冲击圈 + 星星飞散 → 一道高光扫过（背后的尖刺光芒用户不要，已去掉）
const MARK =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const GhMark: React.FC<{size: number; color?: string}> = ({size, color = INK}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{display: "block"}}>
    <path d={MARK} fill={color} fillRule="evenodd" />
  </svg>
);

export const GhLogo: React.FC<{at: number; size?: number}> = ({at, size = 190}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return <div style={{width: size, height: size}} />;
  // 弹出：从 0 转着放大，冲过头再回弹
  const s = interpolate(t, [0, 7, 11, 15], [0, 1.22, 0.93, 1], C);
  const r = interpolate(t, [0, 11], [-200, 0], {...C, easing: OUT});
  const bob = t > 15 ? Math.sin((Math.floor(frame / 2) * 2) / 14) * 4 : 0;
  // 冲击圈 ×2
  const ring = (d: number) => {
    const p = interpolate(t, [5 + d, 20 + d], [0, 1], {...C, easing: OUT});
    return {r: size * (0.5 + p * 0.75), o: p <= 0 ? 0 : 1 - p};
  };
  const r1 = ring(0);
  const r2 = ring(5);
  // 星星飞散 ×8
  const sp = interpolate(t, [5, 22], [0, 1], {...C, easing: OUT});
  const stars = Array.from({length: 8}).map((_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    const d = size * (0.55 + sp * (0.55 + (i % 3) * 0.12));
    const k = (1 - sp) * (i % 2 ? 1 : 0.7) * size * 0.09;
    return {x: Math.cos(a) * d, y: Math.sin(a) * d, k};
  });
  // 高光扫过
  const shine = interpolate(t, [14, 26], [-1.2, 1.2], C);
  const box = size * 2.6;
  return (
    <div style={{position: "relative", width: size, height: size, translate: `0 ${bob}px`}}>
      <svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`} style={{position: "absolute", left: size / 2 - box / 2, top: size / 2 - box / 2, overflow: "visible", pointerEvents: "none"}}>
        <circle r={r1.r} fill="none" stroke={INK} strokeWidth={7} opacity={r1.o} />
        <circle r={r2.r} fill="none" stroke={YEL} strokeWidth={9} opacity={r2.o} />
        {sp > 0 && sp < 1
          ? stars.map((st, i) => (
              <path key={i} transform={`translate(${st.x} ${st.y}) scale(${st.k / 10})`} d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5Z" fill={i % 2 ? YEL : "#FFF6E6"} stroke={INK} strokeWidth={1.5} />
            ))
          : null}
      </svg>
      <div style={{position: "absolute", left: 0, top: 0, width: size, height: size, scale: `${s}`, rotate: `${r}deg`}}>
        {/* 底下一圈黄色描边 + 硬投影，像贴纸 */}
        <div style={{position: "absolute", left: -size * 0.06, top: -size * 0.06, width: size * 1.12, height: size * 1.12, borderRadius: "50%", backgroundColor: YEL, border: `6px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, boxSizing: "border-box"}} />
        <div style={{position: "absolute", left: size * 0.03, top: size * 0.03, width: size * 0.94, height: size * 0.94, borderRadius: "50%", overflow: "hidden", backgroundColor: "#FFF6E6"}}>
          <GhMark size={size * 0.94} />
          <div style={{position: "absolute", left: `${shine * 100}%`, top: "-20%", width: "38%", height: "140%", rotate: "20deg", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))"}} />
        </div>
      </div>
    </div>
  );
};
