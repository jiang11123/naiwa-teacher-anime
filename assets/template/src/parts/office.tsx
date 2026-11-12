import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {C} from "./Anim";

// 办公室长卷的手绘道具（纸张手绘风：墨色粗线 + 硬投影 + 米白 / 黄 / 红 / 绿 / 蓝）
// 都是纯 SVG / div，尺寸用 w 控制，外层再用 <A> 或 <Prop> 定位
export const INK = "#2B211C";
export const RED = "#D9362B";
export const YEL = "#F7C64A";
export const GRN = "#4E8A4A";
export const BLU = "#3F6FB5";
export const CREAM = "#FFFDF6";
export const PAPER = "#F4ECDA";
export const SOFTY = "#FCE38A";
export const SOFTR = "#FFD3C9";
export const SOFTB = "#CFE3F5";
export const SOFTG = "#D9EFC8";
export const WALL = "#EFE3C8";
const SW = 6;

const shadow = `drop-shadow(7px 9px 0 ${INK})`;

// 桌子（俯视略斜的侧面桌）：w 宽，桌面厚 26，两条腿
export const Desk: React.FC<{w?: number; h?: number}> = ({w = 760, h = 300}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: "visible", filter: shadow}}>
    <rect x={SW} y={SW} width={w - SW * 2} height={34} rx={8} fill="#E9B949" stroke={INK} strokeWidth={SW} />
    <rect x={30} y={40} width={16} height={h - 46} fill={INK} />
    <rect x={w - 46} y={40} width={16} height={h - 46} fill={INK} />
    <rect x={w - 240} y={40} width={180} height={h * 0.55} rx={6} fill="#F2D27A" stroke={INK} strokeWidth={SW} />
    <line x1={w - 240} x2={w - 60} y1={40 + h * 0.27} y2={40 + h * 0.27} stroke={INK} strokeWidth={SW - 1} />
    <rect x={w - 168} y={40 + h * 0.12} width={36} height={10} rx={5} fill={INK} />
    <rect x={w - 168} y={40 + h * 0.38} width={36} height={10} rx={5} fill={INK} />
  </svg>
);

// 办公椅（黄色）
export const Chair: React.FC<{w?: number}> = ({w = 200}) => {
  const h = w * 1.55;
  return (
    <svg width={w} height={h} viewBox="0 0 200 310" style={{overflow: "visible", filter: shadow}}>
      <rect x={40} y={8} width={120} height={150} rx={30} fill={YEL} stroke={INK} strokeWidth={SW} />
      <rect x={22} y={150} width={156} height={34} rx={14} fill={YEL} stroke={INK} strokeWidth={SW} />
      <rect x={92} y={184} width={16} height={70} fill={INK} />
      <path d="M40 270 L100 250 L160 270" fill="none" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />
      <circle cx={40} cy={284} r={13} fill={CREAM} stroke={INK} strokeWidth={SW - 1} />
      <circle cx={160} cy={284} r={13} fill={CREAM} stroke={INK} strokeWidth={SW - 1} />
      <circle cx={100} cy={290} r={13} fill={CREAM} stroke={INK} strokeWidth={SW - 1} />
    </svg>
  );
};

// 文件夹（项目文件夹）：带标签字
export const Folder: React.FC<{w?: number; label?: string; fill?: string; open?: number}> = ({w = 260, label = "", fill = YEL, open = 0}) => {
  const h = w * 0.74;
  return (
    <div style={{position: "relative", width: w, height: h}}>
      <svg width={w} height={h} viewBox="0 0 260 192" style={{position: "absolute", overflow: "visible", filter: shadow}}>
        <path d="M8 34 Q8 22 20 22 L92 22 L112 42 L240 42 Q252 42 252 54 L252 176 Q252 186 240 186 L20 186 Q8 186 8 176 Z" fill="#E2A93A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        {open > 0 ? <rect x={34} y={42 - open * 34} width={180} height={120} rx={6} fill={CREAM} stroke={INK} strokeWidth={SW - 1} /> : null}
        <path d={`M8 ${70 + open * 20} L252 ${70 + open * 20} L252 176 Q252 186 240 186 L20 186 Q8 186 8 176 Z`} fill={fill} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      </svg>
      {label ? (
        <div style={{position: "absolute", left: 0, top: h * 0.46, width: w, textAlign: "center", fontSize: w * 0.15, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
      ) : null}
    </div>
  );
};

// 墙上守则（规则文件）：n = 写了几行；label = 标题；over = 贴得太满（多出来的纸）
export const Rules: React.FC<{w?: number; n?: number; label?: string; sub?: string; over?: number}> = ({w = 300, n = 3, label = "守则", sub = "", over = 0}) => {
  const h = w * 1.25;
  const lines = Array.from({length: 6}, (_, i) => i);
  return (
    <div style={{position: "relative", width: w, height: h}}>
      {Array.from({length: Math.round(over)}, (_, i) => (
        <div key={i} style={{position: "absolute", left: (i % 2 ? 1 : -1) * (w * 0.32 + i * 18), top: (i * 37) % (h * 0.6), width: w * 0.7, height: w * 0.6, backgroundColor: [SOFTY, SOFTR, SOFTB, SOFTG][i % 4], border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, rotate: `${(i % 3) * 6 - 6}deg`, borderRadius: 6}} />
      ))}
      <div style={{position: "absolute", inset: 0, backgroundColor: CREAM, border: `${SW}px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, borderRadius: "10px 14px 8px 12px", padding: w * 0.08, boxSizing: "border-box"}}>
        <div style={{fontSize: w * 0.17, fontWeight: 900, color: INK, textAlign: "center", whiteSpace: "nowrap"}}>{label}</div>
        {sub ? <div style={{fontSize: w * 0.075, fontWeight: 800, color: "#7A6655", textAlign: "center", whiteSpace: "nowrap", marginTop: 2}}>{sub}</div> : null}
        <div style={{marginTop: w * 0.06}}>
          {lines.map((i) => (
            <div key={i} style={{display: "flex", alignItems: "center", gap: w * 0.04, height: w * 0.11, opacity: i < n ? 1 : 0}}>
              <div style={{width: w * 0.05, height: w * 0.05, borderRadius: 99, backgroundColor: [RED, BLU, GRN][i % 3]}} />
              <div style={{flex: 1, height: w * 0.03, borderRadius: 9, backgroundColor: "#CDBFA6"}} />
            </div>
          ))}
        </div>
      </div>
      <div style={{position: "absolute", left: w * 0.36, top: -w * 0.07, width: w * 0.28, height: w * 0.11, backgroundColor: "rgba(247,198,74,0.85)", rotate: "-4deg", border: `3px solid ${INK}`}} />
    </div>
  );
};

// 任务单：一张纸条，title + 几行字；stuff = 塞了几件事（多件时文字挤在一起）
export const Slip: React.FC<{w?: number; title?: string; items?: string[]; fill?: string; rot?: number}> = ({w = 280, title = "任务单", items = [], fill = CREAM, rot = 0}) => {
  const h = w * 1.2;
  const size = items.length > 3 ? w * 0.085 : w * 0.11;
  return (
    <div style={{width: w, height: h, backgroundColor: fill, border: `${SW}px solid ${INK}`, boxShadow: `7px 9px 0 ${INK}`, borderRadius: "6px 10px 6px 8px", padding: w * 0.08, boxSizing: "border-box", rotate: `${rot}deg`, overflow: "hidden"}}>
      <div style={{fontSize: w * 0.12, fontWeight: 900, color: INK, borderBottom: `4px dashed ${INK}`, paddingBottom: 4, whiteSpace: "nowrap"}}>{title}</div>
      {items.map((t, i) => (
        <div key={i} style={{fontSize: size, fontWeight: 800, color: INK, marginTop: w * 0.035, whiteSpace: "nowrap"}}>
          {"· "}
          {t}
        </div>
      ))}
    </div>
  );
};

// 门（可以开）：open 0~1；sign = 门牌字
export const Door: React.FC<{w?: number; open?: number; sign?: string; glow?: boolean}> = ({w = 300, open = 0, sign = "", glow = true}) => {
  const h = w * 2;
  return (
    <div style={{position: "relative", width: w, height: h}}>
      <div style={{position: "absolute", inset: 0, backgroundColor: glow ? "#FFF2B8" : "#5A4636", border: `${SW}px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden"}}>
        {glow ? <div style={{position: "absolute", inset: 0, background: `repeating-conic-gradient(from 0deg at 50% 70%, ${YEL} 0deg 8deg, #FFF2B8 8deg 18deg)`, opacity: 0.7 * open}} /> : null}
      </div>
      <div style={{position: "absolute", inset: 0, // 不用 rotateY：放进 3D 办公室后门板会侧成一条白线。改成平面画法：门板往左压窄 + 外沿往下斜，看起来是朝外推开
transformOrigin: "0% 50%", transform: `scaleX(${1 - 0.7 * open}) skewY(${open * 14}deg)`, filter: `brightness(${1 - 0.12 * open})`, backgroundColor: CREAM, border: `${SW}px solid ${INK}`, boxSizing: "border-box"}}>
        <div style={{position: "absolute", left: w * 0.14, top: h * 0.08, width: w * 0.62, height: h * 0.34, border: `5px solid ${INK}`, borderRadius: 4}} />
        <div style={{position: "absolute", left: w * 0.14, top: h * 0.5, width: w * 0.62, height: h * 0.4, border: `5px solid ${INK}`, borderRadius: 4}} />
        <div style={{position: "absolute", right: w * 0.08, top: h * 0.48, width: w * 0.14, height: w * 0.06, borderRadius: 9, backgroundColor: YEL, border: `4px solid ${INK}`}} />
        {sign ? (
          <div style={{position: "absolute", left: w * 0.1, top: h * 0.16, width: w * 0.7, padding: "4px 0", backgroundColor: INK, color: YEL, fontSize: w * 0.12, fontWeight: 900, textAlign: "center", whiteSpace: "nowrap", borderRadius: 4}}>{sign}</div>
        ) : null}
      </div>
    </div>
  );
};

// 红绿灯：lit = 亮哪几盏（0 红 1 黄 2 绿），竖着放
export const Light: React.FC<{w?: number; lit?: number[]; pulse?: number}> = ({w = 170, lit = [0, 1, 2], pulse = 0}) => {
  const h = w * 2.7;
  const cols = [RED, YEL, GRN];
  return (
    <div style={{position: "relative", width: w, height: h + w * 1.6}}>
      <div style={{position: "absolute", left: 0, top: 0, width: w, height: h, backgroundColor: INK, borderRadius: w * 0.3, boxShadow: `8px 10px 0 #6B5442`}}>
        {cols.map((c, i) => {
          const on = lit.includes(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: w * 0.17,
                top: w * 0.17 + i * w * 0.82,
                width: w * 0.66,
                height: w * 0.66,
                borderRadius: 999,
                backgroundColor: on ? c : "#5B4A3D",
                border: `5px solid ${CREAM}`,
                boxShadow: on ? `0 0 ${w * 0.25 + pulse * 20}px ${c}` : "none",
              }}
            />
          );
        })}
      </div>
      <div style={{position: "absolute", left: w * 0.42, top: h, width: w * 0.16, height: w * 1.6, backgroundColor: INK}} />
    </div>
  );
};

// 锁：closed 0~1（锁环落下扣住）
export const Lock: React.FC<{w?: number; closed?: number; fill?: string}> = ({w = 160, closed = 1, fill = YEL}) => {
  const lift = (1 - closed) * w * 0.28;
  return (
    <svg width={w} height={w * 1.2} viewBox="0 0 160 192" style={{overflow: "visible", filter: shadow}}>
      <path d={`M42 ${86 - lift} L42 ${56 - lift} Q42 18 80 18 Q118 18 118 ${56 - lift} L118 ${86 - lift * (closed < 1 ? 0 : 1)}`} transform={`translate(0 ${-lift * 0.2})`} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <path d={`M42 ${86 - lift} L42 ${56 - lift} Q42 18 80 18 Q118 18 118 ${56 - lift} L118 ${86 - lift * (closed < 1 ? 0 : 1)}`} transform={`translate(0 ${-lift * 0.2})`} fill="none" stroke="#B9A88F" strokeWidth={6} strokeLinecap="round" />
      <rect x={14} y={80} width={132} height={104} rx={18} fill={fill} stroke={INK} strokeWidth={SW} />
      <circle cx={80} cy={124} r={13} fill={INK} />
      <rect x={74} y={128} width={12} height={30} rx={5} fill={INK} />
    </svg>
  );
};

// 交接盘（放交接单的托盘）
export const Tray: React.FC<{w?: number; label?: string}> = ({w = 300, label = "交接"}) => (
  <div style={{position: "relative", width: w, height: w * 0.32}}>
    <svg width={w} height={w * 0.32} viewBox="0 0 300 96" style={{position: "absolute", overflow: "visible", filter: shadow}}>
      <path d="M10 20 L290 20 L270 88 L30 88 Z" fill={SOFTB} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    </svg>
    <div style={{position: "absolute", left: 0, top: w * 0.11, width: w, textAlign: "center", fontSize: w * 0.12, fontWeight: 900, color: INK}}>{label}</div>
  </div>
);

// 台灯
export const Lamp: React.FC<{w?: number}> = ({w = 150}) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 150 195" style={{overflow: "visible", filter: shadow}}>
    <path d="M30 185 L120 185" stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d="M75 185 L52 100 L100 52" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M78 30 L138 14 L146 74 Z" fill={YEL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);

// 盆栽（填空位用）
export const Plant: React.FC<{w?: number}> = ({w = 140}) => (
  <svg width={w} height={w * 1.5} viewBox="0 0 140 210" style={{overflow: "visible", filter: shadow}}>
    <path d="M70 120 Q30 90 22 40 Q60 50 70 110 Q80 30 118 20 Q120 80 70 120" fill={GRN} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M30 120 L110 120 L98 204 L42 204 Z" fill="#D9774B" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);

// 墙上的窗（背景层）
export const Window: React.FC<{w?: number}> = ({w = 300}) => (
  <div style={{width: w, height: w * 0.8, backgroundColor: SOFTB, border: `${SW}px solid ${INK}`, borderRadius: 6, position: "relative", boxShadow: `6px 8px 0 ${INK}`}}>
    <div style={{position: "absolute", left: "50%", top: 0, bottom: 0, width: SW, marginLeft: -SW / 2, backgroundColor: INK}} />
    <div style={{position: "absolute", top: "50%", left: 0, right: 0, height: SW, marginTop: -SW / 2, backgroundColor: INK}} />
  </div>
);

// 黄色虚线聚光圈（讲到哪个物件就在它身后亮起）：p 0~1 展开
export const Spot: React.FC<{w: number; h: number; p: number}> = ({w, h, p}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: "relative", width: w, height: h, scale: String(interpolate(p, [0, 1], [0.6, 1], C)), opacity: p}}>
      <div style={{position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: "rgba(247,198,74,0.55)"}} />
      <svg width={w} height={h} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="18 14" strokeDashoffset={-frame * 1.2} />
      </svg>
    </div>
  );
};
