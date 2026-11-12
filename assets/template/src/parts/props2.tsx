import React from "react";
import {Img, staticFile} from "remotion";

// 账单、计费、命中率类的道具插画（纯静态，动画写在分镜里包着它们的 <A> 上）：
// 命中率仪表、账单小票、请求包裹（token 方块条）、银行叫号屏 / 柜台、复印机、价格表截图卡、柱状对比、锯齿折线、滑杆、硬币堆、缓存柜
const INK = "#2B211C";
const RED = "#D9362B";
const YEL = "#F7C64A";
const GRN = "#4E8A4A";
const BLU = "#3F6FB5";
const CREAM = "#FFFDF6";

// 命中率仪表：v = 0~1 指针位置，label 写在表盘下
export const Gauge: React.FC<{w: number; v: number; text: string; label?: string; color?: string}> = ({w, v, text, label = "缓存命中率", color = GRN}) => {
  const a = Math.PI * (1 - v);
  const nx = 200 + Math.cos(a) * 128;
  const ny = 200 - Math.sin(a) * 128;
  const arc = (from: number, to: number) => {
    const p = (t: number) => [200 + Math.cos(Math.PI * (1 - t)) * 160, 200 - Math.sin(Math.PI * (1 - t)) * 160];
    const [x0, y0] = p(from);
    const [x1, y1] = p(to);
    return `M${x0} ${y0} A160 160 0 0 1 ${x1} ${y1}`;
  };
  return (
    <svg width={w} height={w * 0.78} viewBox="0 0 400 312" style={{overflow: "visible"}}>
      <path d="M20 210 A180 180 0 0 1 380 210 L380 230 L20 230 Z" fill={CREAM} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={arc(0, 0.5)} fill="none" stroke={RED} strokeWidth={26} />
      <path d={arc(0.5, 0.8)} fill="none" stroke={YEL} strokeWidth={26} />
      <path d={arc(0.8, 1)} fill="none" stroke={GRN} strokeWidth={26} />
      <path d={arc(0, 1)} fill="none" stroke={INK} strokeWidth={5} opacity={0.4} />
      <line x1={200} y1={200} x2={nx} y2={ny} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <circle cx={200} cy={200} r={20} fill={INK} />
      <text x={200} y={290} textAnchor="middle" fontSize={64} fontWeight={900} fill={color} stroke={INK} strokeWidth={9} style={{paintOrder: "stroke"}}>
        {text}
      </text>
      <text x={200} y={150} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK}>
        {label}
      </text>
    </svg>
  );
};

// 账单小票：rows = [项目, 金额]，len = 0~1 打印出来的长度，total 写在最后
export const Receipt: React.FC<{w: number; rows: [string, string][]; len?: number; total?: string; title?: string}> = ({w, rows, len = 1, total, title = "本月账单"}) => {
  const fullH = 150 + rows.length * 66 + (total ? 110 : 30);
  return (
    <div style={{width: w, height: fullH * len, overflow: "hidden", position: "relative"}}>
      <div style={{width: w, height: fullH, backgroundColor: "#FFFFFF", borderLeft: `6px solid ${INK}`, borderRight: `6px solid ${INK}`, borderTop: `6px solid ${INK}`, padding: "24px 34px 0"}}>
        <div style={{textAlign: "center", fontSize: 46, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>🧾 {title}</div>
        <div style={{borderTop: `4px dashed ${INK}`, margin: "16px 0 10px"}} />
        {rows.map(([a, b], i) => (
          <div key={i} className="mono" style={{display: "flex", justifyContent: "space-between", fontSize: 38, fontWeight: 800, color: INK, lineHeight: "66px", whiteSpace: "nowrap"}}>
            <span>{a}</span>
            <span>{b}</span>
          </div>
        ))}
        {total ? (
          <>
            <div style={{borderTop: `4px dashed ${INK}`, margin: "10px 0"}} />
            <div style={{display: "flex", justifyContent: "space-between", fontSize: 56, fontWeight: 900, color: RED, whiteSpace: "nowrap"}}>
              <span>合计</span>
              <span>{total}</span>
            </div>
          </>
        ) : null}
      </div>
      <svg width={w} height={24} viewBox={`0 0 ${w} 24`} style={{position: "absolute", left: 0, bottom: 0}}>
        <path d={`M0 0 ${Array.from({length: Math.ceil(w / 30)}, (_, i) => `L${i * 30 + 15} 22 L${i * 30 + 30} 0`).join(" ")} L${w} 24 L0 24 Z`} fill="#F4ECDA" stroke={INK} strokeWidth={5} />
      </svg>
    </div>
  );
};

// 请求包裹：一条 token 方块条，cells = 每格颜色（old 灰绿 = 旧内容、new 黄 = 新内容、chg 红 = 改过的）
export type Cell = "hit" | "old" | "new" | "chg";
const CELL: Record<Cell, string> = {hit: "#BFDDB0", old: "#E5DCCB", new: YEL, chg: "#F2A49A"};
export const Bundle: React.FC<{cells: Cell[]; cw?: number; h?: number; label?: string; show?: number}> = ({cells, cw = 60, h = 90, label, show = cells.length}) => (
  <div style={{position: "relative", display: "flex", gap: 6, padding: 10, borderRadius: 18, border: `6px solid ${INK}`, backgroundColor: CREAM, boxShadow: `8px 10px 0 ${INK}`}}>
    {cells.map((c, i) => (
      <div key={i} style={{width: cw, height: h, borderRadius: 10, border: `4px solid ${INK}`, backgroundColor: CELL[c], opacity: i < show ? 1 : 0.08}} />
    ))}
    {label ? (
      <div style={{position: "absolute", left: 24, top: -40, padding: "2px 18px 6px", borderRadius: 999, backgroundColor: INK, color: "#FFF6E6", fontSize: 32, fontWeight: 900, whiteSpace: "nowrap", boxShadow: `inset 0 -6px 0 ${YEL}`}}>{label}</div>
    ) : null}
  </div>
);

// 银行叫号屏：红色数码管
export const CallBoard: React.FC<{w: number; num: string}> = ({w, num}) => (
  <div style={{width: w, padding: "14px 24px 18px", borderRadius: 18, backgroundColor: "#2A211C", border: `7px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`, textAlign: "center"}}>
    <div style={{fontSize: w * 0.09, fontWeight: 900, color: "#E9DFC6", whiteSpace: "nowrap"}}>请 到 窗 口 办 理</div>
    <div className="mono" style={{fontSize: w * 0.24, fontWeight: 900, color: "#FF5A3C", textShadow: "0 0 18px rgba(255,90,60,0.8)", whiteSpace: "nowrap", lineHeight: 1.1}}>{num}</div>
  </div>
);

// 柜台：台面 + "窗口"牌（柜员单独放在后面）
export const Counter: React.FC<{w: number; sign?: string}> = ({w, sign = "3 号窗口"}) => (
  <div style={{position: "relative", width: w, height: w * 0.36}}>
    <div style={{position: "absolute", left: 0, top: w * 0.06, width: w, height: w * 0.3, borderRadius: "12px 12px 6px 6px", backgroundColor: "#C9A77E", border: `7px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`}} />
    <div style={{position: "absolute", left: -20, top: 0, width: w + 40, height: w * 0.08, borderRadius: 10, backgroundColor: "#8A5A3A", border: `7px solid ${INK}`}} />
    <div style={{position: "absolute", left: w * 0.3, top: w * 0.14, width: w * 0.4, padding: "6px 0 10px", borderRadius: 12, backgroundColor: BLU, border: `5px solid ${INK}`, color: "#fff", fontSize: w * 0.06, fontWeight: 900, textAlign: "center", whiteSpace: "nowrap"}}>{sign}</div>
  </div>
);

// 一摞材料：n 张纸叠起来（错位一点），top 写字
export const PaperStack: React.FC<{w: number; n: number; top?: string; color?: string}> = ({w, n, top, color = CREAM}) => (
  <div style={{position: "relative", width: w + 30, height: w * 0.62 + n * 12}}>
    {Array.from({length: n}, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: (i % 3) * 8,
          bottom: i * 12,
          width: w,
          height: w * 0.62,
          borderRadius: 8,
          backgroundColor: color,
          border: `5px solid ${INK}`,
          rotate: `${((i * 37) % 7) - 3}deg`,
        }}
      >
        {i === n - 1 && top ? <div style={{fontSize: w * 0.14, fontWeight: 900, color: INK, textAlign: "center", marginTop: w * 0.2, whiteSpace: "nowrap"}}>{top}</div> : null}
      </div>
    ))}
  </div>
);

// 复印机：机身 + 出纸口，tag 是贴在机身上的打折标签
export const Copier: React.FC<{w: number; tag?: string}> = ({w, tag}) => (
  <div style={{position: "relative", width: w, height: w * 0.9}}>
    <div style={{position: "absolute", left: w * 0.06, top: 0, width: w * 0.88, height: w * 0.12, borderRadius: "16px 16px 4px 4px", backgroundColor: "#B9C7D6", border: `7px solid ${INK}`}} />
    <div style={{position: "absolute", left: 0, top: w * 0.1, width: w, height: w * 0.72, borderRadius: 18, backgroundColor: "#E7EEF5", border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`}}>
      <div style={{position: "absolute", left: w * 0.08, top: w * 0.08, width: w * 0.3, height: w * 0.14, borderRadius: 10, backgroundColor: "#2A211C", border: `5px solid ${INK}`, color: "#7CF08A", fontSize: w * 0.06, fontWeight: 900, textAlign: "center", lineHeight: `${w * 0.11}px`}} className="mono">
        COPY
      </div>
      <div style={{position: "absolute", left: w * 0.06, top: w * 0.4, width: w * 0.88, height: w * 0.06, borderRadius: 6, backgroundColor: INK}} />
      {tag ? (
        <div style={{position: "absolute", right: w * 0.06, top: w * 0.06, rotate: "8deg", padding: "4px 18px 8px", borderRadius: 12, backgroundColor: RED, border: `5px solid ${INK}`, color: "#fff", fontSize: w * 0.08, fontWeight: 900, whiteSpace: "nowrap"}}>{tag}</div>
      ) : null}
    </div>
    <div style={{position: "absolute", left: w * 0.1, top: w * 0.82, width: w * 0.8, height: w * 0.08, borderRadius: 6, backgroundColor: "#8A97A6", border: `6px solid ${INK}`}} />
  </div>
);

// 价格表截图卡：需要你自己先把价格表截图存成 public/img/price.png，没放这张图就别用这个组件（会渲染不出来）。
// 模板仓库里不带这张图（官方价格表属于别人，不适合随模板分发）。rings = 红框 [x, y, w, h, 显示]（图片像素坐标）
export const PRICE_W = 878;
export const PRICE_H = 362;
export const PriceShot: React.FC<{w: number; rings?: [number, number, number, number, number][]}> = ({w, rings = []}) => {
  const k = w / PRICE_W;
  return (
    <div style={{position: "relative", width: w + 28, padding: 14, borderRadius: "22px 28px 20px 26px", backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`}}>
      <Img src={staticFile("img/price.png")} style={{display: "block", width: w, height: PRICE_H * k, borderRadius: 8}} />
      {rings.map(([x, y, rw, rh, p], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 14 + x * k - 8,
            top: 14 + y * k - 8,
            width: rw * k + 16,
            height: rh * k + 16,
            border: `8px solid ${RED}`,
            borderRadius: 16,
            opacity: p,
            scale: `${1.25 - p * 0.25}`,
            boxShadow: "0 0 0 6px rgba(217,54,43,0.18)",
          }}
        />
      ))}
    </div>
  );
};

// 竖柱：h = 当前高度（像素），label 在下面，value 在顶上
export const Bar: React.FC<{w: number; h: number; max: number; color: string; label: string; value?: string; size?: number}> = ({w, h, max, color, label, value, size = 44}) => (
  <div style={{position: "relative", width: w, height: max + 80}}>
    <div style={{position: "absolute", left: 0, bottom: 80, width: w, height: h, backgroundColor: color, border: `6px solid ${INK}`, borderRadius: "14px 18px 4px 4px", boxShadow: `7px 0 0 ${INK}`}} />
    {value ? (
      <div style={{position: "absolute", left: -60, width: w + 120, bottom: 80 + h + 8, textAlign: "center", fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{value}</div>
    ) : null}
    <div style={{position: "absolute", left: -80, width: w + 160, bottom: 0, height: 70, textAlign: "center", fontSize: size * 0.85, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
  </div>
);

// 横向进度条（上下文窗口）：fill = 0~1，marks = [位置 0~1, 文字, 颜色]
export const CtxBar: React.FC<{w: number; h?: number; fill: number; color?: string; marks?: [number, string, string][]; keep?: number}> = ({w, h = 90, fill, color = BLU, marks = [], keep}) => (
  <div style={{position: "relative", width: w, height: h}}>
    <div style={{position: "absolute", inset: 0, borderRadius: 999, backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden"}}>
      <div style={{width: `${fill * 100}%`, height: "100%", backgroundColor: color}} />
      {keep !== undefined ? <div style={{position: "absolute", left: 0, top: 0, width: `${keep * 100}%`, height: "100%", backgroundColor: GRN, opacity: 0.9}} /> : null}
    </div>
    {marks.map(([p, t, c], i) => (
      <div key={i} style={{position: "absolute", left: w * p - 4, top: -30, width: 8, height: h + 60, backgroundColor: c, borderRadius: 4}}>
        <div style={{position: "absolute", left: -150, width: 308, top: h + 66, textAlign: "center", fontSize: 40, fontWeight: 900, color: c, whiteSpace: "nowrap"}}>{t}</div>
      </div>
    ))}
  </div>
);

// 折线：pts 是 [x, y]（画布坐标），p = 0~1 画出进度；fill 填色在线下
export const Line: React.FC<{w: number; h: number; pts: [number, number][]; p: number; color?: string; width?: number; dash?: boolean}> = ({w, h, pts, p, color = BLU, width = 9, dash = false}) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: "visible"}}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash ? "18 16" : `${len} ${len}`} strokeDashoffset={dash ? 0 : len * (1 - p)} opacity={dash ? p : 1} />
    </svg>
  );
};

// 坐标轴（左 + 下），带轴名
export const Axes: React.FC<{w: number; h: number; x: string; y: string}> = ({w, h, x, y}) => (
  <div style={{position: "relative", width: w, height: h}}>
    <svg width={w} height={h} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <path d={`M0 0 L0 ${h} L${w} ${h}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d={`M-16 22 L0 0 L16 22 M${w - 22} ${h - 16} L${w} ${h} L${w - 22} ${h + 16}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{position: "absolute", right: 0, top: h + 18, fontSize: 36, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{x}</div>
    <div style={{position: "absolute", left: 26, top: -12, fontSize: 36, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{y}</div>
  </div>
);

// 滑杆：v = 0~1 旋钮位置
export const Slider: React.FC<{w: number; v: number; label: string; value: string; color?: string}> = ({w, v, label, value, color = BLU}) => (
  <div style={{position: "relative", width: w, height: 170}}>
    <div style={{fontSize: 44, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
    <div style={{position: "absolute", left: 0, top: 96, width: w, height: 26, borderRadius: 999, backgroundColor: "#E5DCCB", border: `6px solid ${INK}`}}>
      <div style={{width: `${v * 100}%`, height: "100%", borderRadius: 999, backgroundColor: color}} />
    </div>
    <div style={{position: "absolute", left: w * v - 36, top: 74, width: 72, height: 72, borderRadius: "50%", backgroundColor: YEL, border: `7px solid ${INK}`, boxShadow: `4px 5px 0 ${INK}`}} />
    <div style={{position: "absolute", right: 0, top: 0, fontSize: 52, fontWeight: 900, color, whiteSpace: "nowrap"}} className="comic-text-s">
      {value}
    </div>
  </div>
);

// 硬币堆：n 枚硬币叠成一摞
export const CoinStack: React.FC<{w: number; n: number}> = ({w, n}) => (
  <div style={{position: "relative", width: w, height: w * 0.3 + n * w * 0.12}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{position: "absolute", left: ((i * 13) % 5) - 2, bottom: i * w * 0.12, width: w, height: w * 0.3, borderRadius: "50%", backgroundColor: i === n - 1 ? YEL : "#E8B33A", border: `5px solid ${INK}`}} />
    ))}
  </div>
);

// 缓存柜：服务器机柜 + 一格格抽屉，lit = 亮起的抽屉数
export const CacheBox: React.FC<{w: number; lit: number; rows?: number; label?: string}> = ({w, lit, rows = 4, label = "缓存"}) => (
  <div style={{position: "relative", width: w, padding: "70px 22px 22px", borderRadius: "22px 26px 18px 24px", backgroundColor: "#5B6B7D", border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`}}>
    <div style={{position: "absolute", left: 0, top: 10, width: w - 14, textAlign: "center", fontSize: 40, fontWeight: 900, color: YEL, whiteSpace: "nowrap"}}>🗄 {label}</div>
    {Array.from({length: rows}, (_, i) => (
      <div key={i} style={{display: "flex", alignItems: "center", gap: 14, height: 70, marginTop: i ? 12 : 0, padding: "0 18px", borderRadius: 12, backgroundColor: i < lit ? "#BFDDB0" : "#3A4552", border: `5px solid ${INK}`}}>
        <div style={{width: 18, height: 18, borderRadius: "50%", backgroundColor: i < lit ? GRN : "#222", border: `3px solid ${INK}`}} />
        <div style={{flex: 1, height: 10, borderRadius: 5, backgroundColor: i < lit ? "#7FAE70" : "#2C343E"}} />
      </div>
    ))}
  </div>
);

// 印章文字（红框）
export const Stamp: React.FC<{text: string; size?: number; color?: string}> = ({text, size = 90, color = RED}) => (
  <div style={{padding: `${size * 0.06}px ${size * 0.36}px ${size * 0.14}px`, border: `${size * 0.1}px solid ${color}`, borderRadius: size * 0.22, color, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", backgroundColor: "rgba(255,253,246,0.9)"}}>{text}</div>
);

// 计算式卡：一行大算式
export const Formula: React.FC<{children: React.ReactNode; size?: number; fill?: string}> = ({children, size = 84, fill = CREAM}) => (
  <div style={{display: "inline-flex", alignItems: "center", gap: size * 0.25, padding: `${size * 0.2}px ${size * 0.5}px ${size * 0.28}px`, borderRadius: "26px 32px 22px 30px", backgroundColor: fill, border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>
    {children}
  </div>
);

export const COL = {INK, RED, YEL, GRN, BLU, CREAM};
