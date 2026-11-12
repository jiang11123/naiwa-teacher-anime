import React from "react";
import {Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {C, IO, OUT, lerp} from "./Anim";
import {CREAM, GRN, INK, RED, YEL} from "./kit";
import {SIZES} from "../shotSizes";

// 账单类小道具。全片颜色固定：命中 = 绿、没命中 = 黄、输出 = 红
export const HIT = GRN;
export const MISS = YEL;
export const OUTP = RED;
export type Kind3 = "hit" | "miss" | "out";
export const K3: Record<Kind3, {name: string; color: string; soft: string; text: string; price: string}> = {
  hit: {name: "命中缓存", color: HIT, soft: "#D9EFC8", text: "#FFF6E6", price: "¥0.02"},
  miss: {name: "没命中", color: MISS, soft: "#FCEFC2", text: INK, price: "¥1"},
  out: {name: "输出", color: OUTP, soft: "#FFD3C9", text: "#FFF6E6", price: "¥4"},
};

// 真实截图：墨边纸框里放一张图，w = 显示宽度；rings = [帧, x1%, y1%, x2%, y2%, 颜色?]（念到才圈）
export type Mark = [number, number, number, number, number, string?];
export const Real: React.FC<{id: string; w: number; rings?: Mark[]; bg?: string; pad?: number}> = ({id, w, rings = [], bg = "#FFFFFF", pad = 10}) => {
  const frame = useCurrentFrame();
  const [sw, sh] = SIZES[id];
  const h = (sh / sw) * w;
  return (
    <div style={{position: "relative", width: w + pad * 2, height: h + pad * 2, backgroundColor: bg, border: `6px solid ${INK}`, borderRadius: 22, boxShadow: `9px 11px 0 ${INK}`}}>
      <Img src={staticFile(`img/s/${id}.png`)} style={{position: "absolute", left: pad, top: pad, width: w, height: h, borderRadius: 10}} />
      {rings.map(([at, x1, y1, x2, y2, col], i) => {
        const t = frame - at;
        if (t < 0) return null;
        const p = interpolate(t, [0, 10], [0, 1], {...C, easing: OUT});
        const rw = ((x2 - x1) / 100) * w + 16;
        const rh = ((y2 - y1) / 100) * h + 16;
        return (
          <svg key={i} className="boil" width={rw} height={rh} style={{position: "absolute", left: pad + (x1 / 100) * w - 8, top: pad + (y1 / 100) * h - 8, overflow: "visible"}}>
            <rect x={3} y={3} width={rw - 6} height={rh - 6} rx={14} fill="rgba(247,198,74,0.16)" stroke={col ?? RED} strokeWidth={7} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
          </svg>
        );
      })}
    </div>
  );
};

// 三色长条：parts = [比例, 颜色]，每段从 at 帧开始长出来；labels 写在段里
export type Seg = {v: number; kind: Kind3; at: number; label?: string};
export const Stack3: React.FC<{w: number; h?: number; segs: Seg[]; min?: number}> = ({w, h = 130, segs, min = 16}) => {
  const frame = useCurrentFrame();
  const sum = segs.reduce((a, s) => a + s.v, 0);
  const widths = segs.map((s) => Math.max(min, (s.v / sum) * w));
  const over = widths.reduce((a, b) => a + b, 0) - w;
  const big = Math.max(...widths);
  const fin = widths.map((x) => (x === big ? x - over : x));
  let left = 0;
  return (
    <div style={{position: "relative", width: w + 12, height: h + 12, backgroundColor: CREAM, border: `6px solid ${INK}`, borderRadius: 20, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden"}}>
      {segs.map((s, i) => {
        const p = lerp(frame, s.at, s.at + 16, 0, 1, IO);
        const el = (
          <div key={i} style={{position: "absolute", left, top: 0, width: fin[i] * p, height: h, backgroundColor: K3[s.kind].color, borderRight: p > 0 && i < segs.length - 1 ? `5px solid ${INK}` : undefined, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
            {s.label ? <div style={{fontSize: 58, fontWeight: 900, color: K3[s.kind].text, whiteSpace: "nowrap", opacity: p}}>{s.label}</div> : null}
          </div>
        );
        left += fin[i];
        return el;
      })}
    </div>
  );
};

// 价签：挂绳 + 彩色牌，金额大字
export const Tag3: React.FC<{kind: Kind3; w?: number; sub?: string; size?: number}> = ({kind, w = 460, sub = "每百万 token", size = 104}) => {
  const k = K3[kind];
  return (
    <div style={{position: "relative", width: w, padding: "26px 0 24px", textAlign: "center", backgroundColor: k.soft, border: `7px solid ${INK}`, borderRadius: "30px 36px 26px 34px", boxShadow: `9px 11px 0 ${INK}`}}>
      <div style={{position: "absolute", left: w / 2 - 22, top: -24, width: 44, height: 44, borderRadius: "50%", backgroundColor: CREAM, border: `7px solid ${INK}`}} />
      <div style={{fontSize: 54, fontWeight: 900, color: INK, marginTop: 14, whiteSpace: "nowrap"}}>{k.name}</div>
      <div className="comic-text-s" style={{fontSize: size, fontWeight: 900, color: k.color === MISS ? YEL : k.color, lineHeight: 1.2, whiteSpace: "nowrap"}}>{k.price}</div>
      {sub ? <div style={{fontSize: 34, fontWeight: 800, color: "#6B5D4E", whiteSpace: "nowrap"}}>{sub}</div> : null}
    </div>
  );
};

// 计算器：屏幕显示 text，下面一排按键，pressed 帧号表示这一帧前后那个键按下
export const Calc: React.FC<{w?: number; text: string; note?: string; hot?: boolean; keys?: number[]}> = ({w = 560, text, note, hot = false, keys = []}) => {
  const frame = useCurrentFrame();
  const press = keys.findIndex((k) => frame >= k && frame < k + 6);
  return (
    <div style={{position: "relative", width: w, padding: 24, backgroundColor: "#3F6FB5", border: `7px solid ${INK}`, borderRadius: "34px 40px 30px 36px", boxShadow: `10px 12px 0 ${INK}`}}>
      <div style={{height: 150, borderRadius: 16, backgroundColor: hot ? "#FCE38A" : "#DCE8C8", border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 22px", overflow: "hidden"}}>
        <div className="mono" style={{fontSize: text.length > 11 ? 56 : 76, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{text}</div>
      </div>
      {note ? <div style={{marginTop: 8, fontSize: 34, fontWeight: 900, color: "#FFF6E6", textAlign: "center", whiteSpace: "nowrap"}}>{note}</div> : null}
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16}}>
        {["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "="].map((t, i) => {
          const on = press >= 0 && i === (press * 5 + 3) % 12;
          return (
            <div key={t} style={{height: 62, borderRadius: 14, backgroundColor: i % 4 === 3 ? YEL : CREAM, border: `5px solid ${INK}`, boxShadow: on ? "none" : `3px 4px 0 ${INK}`, translate: on ? "3px 4px" : undefined, fontSize: 38, fontWeight: 900, color: INK, textAlign: "center", lineHeight: "50px"}}>
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 数字跳动显示（到点从 from 滚到 to），dec = 小数位
export const Roll2: React.FC<{from?: number; to: number; at: number; dur?: number; dec?: number; pre?: string; suf?: string}> = ({from = 0, to, at, dur = 18, dec = 0, pre = "", suf = ""}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + dur], [from, to], {...C, easing: OUT});
  return <>{`${pre}${v.toFixed(dec)}${suf}`}</>;
};

// 硬币（小，带面值）
export const Cent: React.FC<{size: number; text?: string; fill?: string}> = ({size, text = "¥", fill = YEL}) => (
  <div style={{width: size, height: size, borderRadius: "50%", backgroundColor: fill, border: `${Math.max(4, size * 0.07)}px solid ${INK}`, boxShadow: `${size * 0.05}px ${size * 0.06}px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 900, color: INK}}>{text}</div>
);

// 手写问号（一跳一跳）
export const Ask: React.FC<{size: number; color?: string; seed?: number}> = ({size, color = RED, seed = 0}) => {
  const frame = useCurrentFrame();
  return (
    <div className="comic-text-s" style={{fontSize: size, fontWeight: 900, color, lineHeight: 1, translate: `0px ${Math.sin(Math.floor(frame / 2) / 4 + seed) * 7}px`, rotate: `${Math.sin(seed * 3) * 12}deg`}}>？</div>
  );
};

// 第几步的小标（左上角）
export const StepPin: React.FC<{n: number; text: string}> = ({n, text}) => (
  <div style={{display: "flex", alignItems: "center", gap: 16}}>
    <div style={{width: 92, height: 92, borderRadius: "50%", backgroundColor: RED, border: `6px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, color: "#FFF6E6", fontSize: 58, fontWeight: 900, textAlign: "center", lineHeight: "74px"}}>{n}</div>
    <div className="comic-text-s" style={{fontSize: 74, fontWeight: 900, color: YEL, whiteSpace: "nowrap"}}>{text}</div>
  </div>
);

// 来源小字（数据出处）
export const Src: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontSize: 30, fontWeight: 800, color: "#6B5D4E", whiteSpace: "nowrap"}}>{children}</div>;
