import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";

// 美食街的手绘道具（纸张手绘风：墨色粗线 + 硬投影）；四条路固定四种颜色，全片不变
export const INK = "#2B211C";
export const RED = "#D9362B";
export const YEL = "#F7C64A";
export const GRN = "#4E8A4A";
export const BLU = "#3F6FB5";
export const CREAM = "#FFFDF6";
export const SOFTY = "#FCE38A";
export const SOFTR = "#FFD3C9";
export const SOFTB = "#CFE3F5";
export const SOFTG = "#D9EFC8";
// 四条路的数据（美食街比喻）：name 招牌名、eat 怎么吃、price 计价方式。
// 这里只放中性占位，别写死真实价格——价格会过时，做视频时按当期内容换成自己的数字
export const PATHS = [
  {key: "a", name: "方案 A", eat: "办卡包月随便吃", price: "固定月费", c: BLU, soft: SOFTB},
  {key: "b", name: "方案 B", eat: "按份称重结账", price: "按用量计费", c: YEL, soft: SOFTY},
  {key: "c", name: "方案 C", eat: "找人代买带饭", price: "第三方报价", c: RED, soft: SOFTR},
  {key: "d", name: "方案 D", eat: "自己在家做", price: "只有成本", c: GRN, soft: SOFTG},
] as const;

const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
const hard = `drop-shadow(7px 9px 0 ${INK})`;
// 估算一行字的宽度（单位：字号）：中文 1，英文数字约 0.56
export const em = (s: string) => [...s].reduce((a, ch) => a + (/[⺀-￿]/.test(ch) ? 1 : ch === " " ? 0.3 : 0.58), 0);
// 给定最大宽度，算出装得下的字号
export const fit = (s: string, maxW: number, size: number) => Math.min(size, Math.floor(maxW / em(s)));

// ---- 店面（贴在后墙上）：招牌 + 条纹雨棚 + 墙身，children 画门窗 ----
export const Shop: React.FC<{w?: number; h?: number; sign: string; color: string; soft: string; roof?: boolean; children?: React.ReactNode}> = ({w = 1000, h = 720, sign, color, soft, roof = false, children}) => (
  <div style={{position: "relative", width: w, height: h}}>
    {roof ? (
      <svg width={w + 120} height={210} viewBox={`0 0 ${w + 120} 210`} style={{position: "absolute", left: -60, top: -150, overflow: "visible"}}>
        <path d={`M10 200 L${(w + 120) / 2} 14 L${w + 110} 200 Z`} fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </svg>
    ) : null}
    <div style={{position: "absolute", left: 0, top: 250, width: w, height: h - 250, backgroundColor: CREAM, border: `8px solid ${INK}`, boxShadow: `10px 0 0 ${INK}`}}>{children}</div>
    <div style={{position: "absolute", left: 60, top: 0, width: w - 120, height: 160, backgroundColor: soft, border: `8px solid ${INK}`, borderRadius: "22px 26px 0 0", boxShadow: `8px 0 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fit(sign, w - 220, 104), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>
      {sign}
    </div>
  </div>
);
// 雨棚：单独一层，摆得比墙更靠前，镜头一转就有厚度
export const Awning: React.FC<{w?: number; color: string}> = ({w = 1080, color}) => (
  <div style={{position: "relative", width: w, height: 120, filter: hard}}>
    <div style={{position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg, ${color} 0 60px, ${CREAM} 60px 120px)`, border: `8px solid ${INK}`, borderRadius: "10px 10px 30px 30px"}} />
  </div>
);
export const Win: React.FC<{w: number; h: number; fill?: string; children?: React.ReactNode}> = ({w, h, fill = SOFTB, children}) => (
  <div style={{position: "relative", width: w, height: h, backgroundColor: fill, border: `8px solid ${INK}`, borderRadius: 14, overflow: "hidden"}}>{children}</div>
);
export const DoorFlat: React.FC<{w?: number; h?: number; fill?: string}> = ({w = 210, h = 380, fill = "#D9A86C"}) => (
  <div style={{position: "relative", width: w, height: h, backgroundColor: fill, border: `8px solid ${INK}`, borderRadius: "16px 16px 0 0"}}>
    <div style={{position: "absolute", left: 22, top: 26, width: w - 60, height: h * 0.36, backgroundColor: SOFTB, border: `6px solid ${INK}`, borderRadius: 10}} />
    <div style={{position: "absolute", right: 20, top: h * 0.55, width: 24, height: 24, borderRadius: 99, backgroundColor: YEL, border: `5px solid ${INK}`}} />
  </div>
);
// 柜台正面
export const CounterFront: React.FC<{w: number; h?: number; fill?: string; label?: string}> = ({w, h = 230, fill = "#E9B949", label}) => (
  <div style={{position: "relative", width: w, height: h, backgroundColor: fill, border: `7px solid ${INK}`, borderRadius: "8px 8px 4px 4px", boxShadow: `8px 9px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center"}}>
    <div style={{position: "absolute", left: 0, right: 0, top: 30, height: 7, backgroundColor: INK, opacity: 0.25}} />
    {label ? <div style={{padding: "6px 22px", backgroundColor: CREAM, border: `5px solid ${INK}`, borderRadius: 12, fontSize: fit(label, w - 120, 44), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div> : null}
  </div>
);

// ---- 路口的路牌：一根柱子 + 四块箭头牌（名字 + 价格），一块一块弹出来 ----
export const Board: React.FC<{name: string; price: string; color: string; dir: 1 | -1; w?: number}> = ({name, price, color, dir, w = 780}) => {
  const h = 116;
  const tip = 64;
  const pts = dir > 0 ? `4,4 ${w - tip},4 ${w - 4},${h / 2} ${w - tip},${h - 4} 4,${h - 4}` : `${w - 4},4 ${tip},4 4,${h / 2} ${tip},${h - 4} ${w - 4},${h - 4}`;
  return (
    <div style={{position: "relative", width: w, height: h, filter: hard}}>
      <svg width={w} height={h} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <polygon points={pts} fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </svg>
      <div style={{position: "absolute", left: dir > 0 ? 30 : tip + 16, right: dir > 0 ? tip + 16 : 30, top: 0, height: h, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20}}>
        <div style={{fontSize: 58, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{name}</div>
        <div style={{padding: "4px 20px 8px", backgroundColor: INK, color: CREAM, borderRadius: 14, fontSize: fit(price, 360, 42), fontWeight: 900, whiteSpace: "nowrap"}}>{price}</div>
      </div>
    </div>
  );
};
export const Post: React.FC<{h?: number}> = ({h = 700}) => (
  <div style={{position: "relative", width: 40, height: h}}>
    <div style={{position: "absolute", left: 4, top: 0, width: 32, height: h, backgroundColor: "#8A6B4A", border: `7px solid ${INK}`, borderRadius: 10, boxShadow: `7px 0 0 ${INK}`}} />
    <div style={{position: "absolute", left: -12, top: -26, width: 64, height: 40, backgroundColor: YEL, border: `7px solid ${INK}`, borderRadius: 14}} />
  </div>
);

// ---- 小道具 ----
// 盘子（自助餐）：上面一坨菜
export const Plate: React.FC<{w?: number; food?: string}> = ({w = 90, food = "#F2A97E"}) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 90 56" style={{overflow: "visible"}}>
    <ellipse cx={45} cy={40} rx={42} ry={13} fill={CREAM} stroke={INK} strokeWidth={5} />
    <path d="M18 38 Q20 8 45 10 Q72 8 72 38 Z" fill={food} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);
// 月卡
export const MonthCard: React.FC<{w?: number; stamp?: string; stampAt?: number; stamp2?: string; stamp2At?: number}> = ({w = 300, stamp, stampAt = 0, stamp2, stamp2At = 0}) => {
  const f = useCurrentFrame();
  const st = (t: string, at: number, top: number, rot: number) =>
    f >= at ? (
      <div style={{position: "absolute", right: w * 0.05, top, padding: "0 12px 4px", border: `6px solid ${RED}`, borderRadius: 10, color: RED, backgroundColor: "rgba(255,253,246,0.92)", fontSize: w * 0.12, fontWeight: 900, rotate: `${rot}deg`, whiteSpace: "nowrap", scale: String(interpolate(f - at, [0, 5, 10], [2.2, 0.92, 1], CL))}}>{t}</div>
    ) : null;
  return (
    <div style={{position: "relative", width: w, height: w * 0.62, backgroundColor: SOFTB, border: `7px solid ${INK}`, borderRadius: 22, boxShadow: `8px 9px 0 ${INK}`}}>
      <div style={{position: "absolute", left: 0, right: 0, top: w * 0.1, height: w * 0.11, backgroundColor: INK}} />
      <div style={{position: "absolute", left: w * 0.08, top: w * 0.23, fontSize: w * 0.16, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>月卡</div>
      <div style={{position: "absolute", left: w * 0.08, bottom: w * 0.04, fontSize: w * 0.075, fontWeight: 800, color: "#5B4A3C", whiteSpace: "nowrap"}}>每月固定价 · 随便吃</div>
      {stamp ? st(stamp, stampAt, w * 0.24, -8) : null}
      {stamp2 ? st(stamp2, stamp2At, w * 0.4, 6) : null}
    </div>
  );
};
// 碗（麻辣烫）
export const Bowl: React.FC<{w?: number}> = ({w = 150}) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 150 108" style={{overflow: "visible"}}>
    <path d="M22 44 Q40 6 62 34 Q80 2 100 34 Q118 14 128 44 Z" fill="#F2A97E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M8 42 L142 42 Q138 100 75 102 Q12 100 8 42 Z" fill={RED} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M20 62 L130 62" stroke={CREAM} strokeWidth={7} strokeLinecap="round" />
  </svg>
);
// 电子秤：台面 + 显示屏
export const Scale: React.FC<{w?: number; text: string; unit: string}> = ({w = 330, text, unit}) => (
  <div style={{position: "relative", width: w, height: w * 0.46}}>
    <div style={{position: "absolute", left: 0, top: 0, width: w, height: w * 0.1, backgroundColor: "#D8D2C4", border: `6px solid ${INK}`, borderRadius: 10}} />
    <div style={{position: "absolute", left: w * 0.06, top: w * 0.1, width: w * 0.88, height: w * 0.34, backgroundColor: CREAM, border: `6px solid ${INK}`, borderRadius: "6px 6px 16px 16px", boxShadow: `7px 8px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div className="mono" style={{width: w * 0.76, height: w * 0.22, backgroundColor: "#1F2A1F", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${w * 0.04}px`, color: "#9BEA6B", fontSize: w * 0.13, fontWeight: 900, whiteSpace: "nowrap"}}>
        <span>{text}</span>
        <span style={{fontSize: w * 0.085, color: "#FCE38A", fontFamily: "inherit"}}>{unit}</span>
      </div>
    </div>
  </div>
);
// 小票（按 token 记账）：n 行
export const Receipt: React.FC<{w?: number; n: number; title?: string}> = ({w = 170, n, title = "记账"}) => (
  <div style={{width: w, backgroundColor: CREAM, border: `6px solid ${INK}`, borderRadius: "4px 4px 10px 10px", boxShadow: `6px 7px 0 ${INK}`, padding: "8px 12px 12px"}}>
    <div style={{fontSize: w * 0.19, fontWeight: 900, color: INK, textAlign: "center", borderBottom: `4px dashed ${INK}`, whiteSpace: "nowrap"}}>{title}</div>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 9}}>
        <div style={{width: w * 0.36, height: 8, borderRadius: 4, backgroundColor: "#B7A688"}} />
        <div className="mono" style={{fontSize: w * 0.13, fontWeight: 900, color: RED}}>+1</div>
      </div>
    ))}
  </div>
);
// 小摊：一把伞 + 小推车
export const Stall: React.FC<{w?: number; label?: string; color?: string}> = ({w = 560, label = "", color = RED}) => (
  <div style={{position: "relative", width: w, height: w * 0.98}}>
    <svg width={w} height={w * 0.98} viewBox="0 0 560 550" style={{position: "absolute", overflow: "visible", filter: hard}}>
      <rect x={270} y={110} width={18} height={300} fill={INK} />
      <path d="M40 150 Q280 -70 520 150 Q460 122 400 150 Q340 122 280 150 Q220 122 160 150 Q100 122 40 150 Z" fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M160 150 Q220 40 280 22 M400 150 Q340 40 280 22" fill="none" stroke={INK} strokeWidth={5} opacity={0.5} />
      <rect x={70} y={330} width={420} height={170} rx={12} fill="#E9B949" stroke={INK} strokeWidth={8} />
      <rect x={52} y={302} width={456} height={38} rx={10} fill={CREAM} stroke={INK} strokeWidth={8} />
      <circle cx={150} cy={512} r={34} fill={CREAM} stroke={INK} strokeWidth={8} />
      <circle cx={410} cy={512} r={34} fill={CREAM} stroke={INK} strokeWidth={8} />
      <circle cx={150} cy={512} r={8} fill={INK} />
      <circle cx={410} cy={512} r={8} fill={INK} />
    </svg>
    {label ? (
      <div style={{position: "absolute", left: w * 0.16, top: w * 0.63, width: w * 0.68, height: w * 0.2, display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div style={{padding: "2px 18px 6px", backgroundColor: CREAM, border: `5px solid ${INK}`, borderRadius: 10, fontSize: fit(label, w * 0.58, w * 0.1), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
      </div>
    ) : null}
  </div>
);
// 外卖袋
export const Bag: React.FC<{w?: number; label?: string}> = ({w = 150, label = "带饭"}) => (
  <div style={{position: "relative", width: w, height: w * 1.15}}>
    <svg width={w} height={w * 1.15} viewBox="0 0 150 172" style={{position: "absolute", overflow: "visible", filter: `drop-shadow(5px 6px 0 ${INK})`}}>
      <path d="M48 44 Q48 8 75 8 Q102 8 102 44" fill="none" stroke={INK} strokeWidth={8} />
      <path d="M14 44 L136 44 L146 166 L4 166 Z" fill="#E7C08A" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </svg>
    <div style={{position: "absolute", left: 0, top: w * 0.52, width: w, textAlign: "center", fontSize: w * 0.24, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
  </div>
);
// 灶台 + 锅
export const Stove: React.FC<{w?: number; fire?: number; tip?: number}> = ({w = 360, fire = 1, tip = 0}) => {
  const f = useCurrentFrame();
  const fl = 1 + Math.sin(f / 2.5) * 0.12;
  return (
    <div style={{position: "relative", width: w, height: w * 0.9}}>
      <svg width={w} height={w * 0.9} viewBox="0 0 360 324" style={{position: "absolute", overflow: "visible", filter: hard}}>
        <rect x={10} y={150} width={340} height={170} rx={10} fill="#D8D2C4" stroke={INK} strokeWidth={8} />
        <rect x={0} y={128} width={360} height={30} rx={8} fill={INK} />
        <circle cx={70} cy={206} r={16} fill={CREAM} stroke={INK} strokeWidth={6} />
        <circle cx={130} cy={206} r={16} fill={CREAM} stroke={INK} strokeWidth={6} />
        <rect x={200} y={196} width={120} height={96} rx={8} fill="#3A3028" stroke={INK} strokeWidth={6} />
        <g opacity={fire} transform={`translate(180 128) scale(${fl}) translate(-180 -128)`}>
          <path d="M120 128 Q130 96 150 112 Q162 84 180 108 Q198 84 210 112 Q230 96 240 128 Z" fill="#F08A3C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
        <g transform={`rotate(${tip * 24} 180 100)`}>
          <path d="M92 50 L268 50 Q262 112 180 112 Q98 112 92 50 Z" fill="#5B6B7A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <rect x={80} y={38} width={200} height={20} rx={8} fill="#7C8C9A" stroke={INK} strokeWidth={7} />
          <path d="M268 62 L330 46" stroke={INK} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
// 台式电脑主机（里面一块显卡）
export const Tower: React.FC<{w?: number; glow?: number; label?: string}> = ({w = 200, glow = 0, label = "显卡"}) => (
  <div style={{position: "relative", width: w, height: w * 1.6, backgroundColor: "#4A4038", border: `7px solid ${INK}`, borderRadius: 14, boxShadow: `8px 9px 0 ${INK}`}}>
    <div style={{position: "absolute", left: w * 0.12, top: w * 0.14, width: w * 0.76, height: w * 0.6, backgroundColor: glow ? "#FFF6D6" : "#2F2823", border: `5px solid ${INK}`, borderRadius: 8}} />
    <div style={{position: "absolute", left: w * 0.1, top: w * 0.9, width: w * 0.8, height: w * 0.34, backgroundColor: GRN, border: `5px solid ${INK}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.19, fontWeight: 900, color: CREAM, whiteSpace: "nowrap"}}>{label}</div>
    <div style={{position: "absolute", left: w * 0.4, bottom: w * 0.08, width: w * 0.2, height: w * 0.2, borderRadius: 99, backgroundColor: glow ? YEL : "#7A6655", border: `5px solid ${INK}`}} />
  </div>
);
// 模型文件（一个方块文件）
export const ModelFile: React.FC<{w?: number; label?: string; fill?: string; sub?: string}> = ({w = 170, label = "模型", fill = SOFTB, sub}) => (
  <div style={{position: "relative", width: w, height: w * 1.12, backgroundColor: fill, border: `7px solid ${INK}`, borderRadius: "10px 34px 10px 10px", boxShadow: `7px 8px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
    <div style={{fontSize: fit(label, w - 30, w * 0.26), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
    {sub ? <div style={{fontSize: fit(sub, w - 24, w * 0.15), fontWeight: 800, color: "#5B4A3C", whiteSpace: "nowrap", marginTop: 4}}>{sub}</div> : null}
  </div>
);
// 菜谱
export const Recipe: React.FC<{w?: number; title: string; n?: number; fill?: string}> = ({w = 230, title, n = 4, fill = CREAM}) => (
  <div style={{width: w, backgroundColor: fill, border: `6px solid ${INK}`, borderRadius: "8px 12px 8px 10px", boxShadow: `7px 8px 0 ${INK}`, padding: `${w * 0.06}px ${w * 0.08}px ${w * 0.09}px`}}>
    <div style={{fontSize: fit(title, w * 0.84, w * 0.16), fontWeight: 900, color: INK, whiteSpace: "nowrap", borderBottom: `4px dashed ${INK}`, paddingBottom: 4, textAlign: "center"}}>{title}</div>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{marginTop: w * 0.06, height: w * 0.035, width: `${[100, 80, 92, 60, 85, 70][i % 6]}%`, borderRadius: 9, backgroundColor: "#CDBFA6"}} />
    ))}
  </div>
);
// 一团烟（翻车）
export const Smoke: React.FC<{w?: number}> = ({w = 260}) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 260 182" style={{overflow: "visible"}}>
    <path d="M40 150 Q0 150 12 112 Q-6 70 42 66 Q50 20 100 36 Q132 2 170 36 Q224 24 222 76 Q266 90 240 130 Q244 160 200 152 Q160 186 120 156 Q80 180 40 150 Z" fill="#8A8076" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </svg>
);
// 卷帘门（没招牌的店）
export const Shutter: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{width: w, height: h, border: `8px solid ${INK}`, borderRadius: "12px 12px 0 0", background: `repeating-linear-gradient(180deg, #CFC6B4 0 26px, #B5AB98 26px 32px)`}} />
);
// 弹一下出现（世界里、屏幕层都能用）
export const usePop = (at: number, dur = 12) => {
  const f = useCurrentFrame();
  return f < at ? 0 : interpolate(f - at, [0, dur], [0.4, 1], {...CL, easing: BACK});
};
