import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {CREAM, INK, RED, SOFTY, YEL, fit} from "./palette";

// 讲“原理 / 流程”的三件套（“你的一句话分四步走完”）：
// - Arrow：画出来的箭头，从 a 长到 b（可虚线），讲“请求飞过去”
// - NodeBox：流程里的一个节点框，hot=1 时红边 + 黄色外发光（讲到哪一步亮哪一步）
// - Steps：竖排的 N 步，没讲到的先淡淡露出占好位置，讲到哪步哪步亮、略放大，每步下面的小字按配音逐条出
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

export const Arrow: React.FC<{a: [number, number]; b: [number, number]; at: number; out?: number; color?: string; dash?: boolean; dur?: number}> = ({a, b, at, out, color = INK, dash = false, dur = 12}) => {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const p = interpolate(f, [at, at + dur], [0, 1], {...CL, easing: Easing.bezier(0.33, 1, 0.68, 1)});
  const o = out === undefined ? 1 : interpolate(f, [out, out + 7], [1, 0], CL);
  const x = a[0] + (b[0] - a[0]) * p;
  const y = a[1] + (b[1] - a[1]) * p;
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none", overflow: "visible"}}>
      <line x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={dash ? "22 16" : undefined} />
      <polygon points="0,-18 30,0 0,18" fill={color} transform={`translate(${x} ${y}) rotate(${ang})`} />
    </svg>
  );
};

export const NodeBox: React.FC<{w: number; h: number; title: string; sub?: string; fill?: string; hot?: number}> = ({w, h, title, sub, fill = CREAM, hot = 0}) => (
  <div style={{width: w, height: h, backgroundColor: fill, border: `6px solid ${hot > 0.5 ? RED : INK}`, borderRadius: 22, boxShadow: hot > 0.5 ? `0 0 0 8px ${YEL}, 8px 9px 0 ${INK}` : `8px 9px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", scale: String(1 + hot * 0.04)}}>
    <div style={{fontSize: fit(title, w - 40, 50), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
    {sub ? <div style={{fontSize: fit(sub, w - 36, 32), fontWeight: 800, color: "#6B5442", whiteSpace: "nowrap", marginTop: 4}}>{sub}</div> : null}
  </div>
);

export type Step = {title: string; lit: number; subs?: [number, string][]};
export const Steps: React.FC<{steps: Step[]; w?: number; h?: number; gap?: number}> = ({steps, w = 820, h = 150, gap = 22}) => {
  const f = useCurrentFrame();
  let cur = -1;
  steps.forEach((s, i) => {
    if (f >= s.lit) cur = i;
  });
  return (
    <div style={{display: "flex", flexDirection: "column", gap}}>
      {steps.map((s, i) => {
        const on = i <= cur;
        const hot = i === cur;
        return (
          <div key={i} style={{width: w, height: h, backgroundColor: hot ? SOFTY : on ? CREAM : "#EFE7D6", border: `5px solid ${INK}`, borderRadius: 18, boxShadow: hot ? `6px 7px 0 ${INK}` : undefined, opacity: on ? 1 : 0.5, scale: String(hot ? 1.03 : 1), padding: "14px 22px", display: "flex", flexDirection: "column", justifyContent: "center"}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div style={{width: 60, height: 60, borderRadius: 99, backgroundColor: hot ? RED : INK, color: CREAM, fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1}}>{i + 1}</div>
              <div style={{fontSize: fit(s.title, w - 140, 48), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{s.title}</div>
            </div>
            {s.subs ? (
              <div style={{display: "flex", gap: 12, marginTop: 8, height: 46}}>
                {s.subs.map(([at, t]) => (
                  <div key={t} style={{padding: "2px 14px 6px", backgroundColor: INK, color: CREAM, borderRadius: 10, fontSize: 30, fontWeight: 900, whiteSpace: "nowrap", opacity: f < at ? 0 : 1, scale: String(interpolate(f - at, [0, 10], [0.5, 1], {...CL, easing: BACK}))}}>{t}</div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
