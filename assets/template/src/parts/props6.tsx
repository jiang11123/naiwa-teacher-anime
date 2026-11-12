import React from "react";
import {Img, staticFile} from "remotion";
import {BLU, CREAM, GRN, INK, RED, YEL} from "./kit";

// 价签、商店、小摊、token 格子板、天平、服务器、钥匙、收藏清单卡

// 价签：左尖角 + 小孔，上面一行小字标题、下面大价格；strike = 价格被红线划掉
export const PriceLabel: React.FC<{w: number; title: string; price: string; unit?: string; color?: string; strike?: boolean}> = ({w, title, price, unit = "", color = YEL, strike = false}) => (
  <div style={{position: "relative", width: w, height: w * 0.5}}>
    <svg width={w} height={w * 0.5} viewBox="0 0 400 200" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <path d="M70 10 L386 10 Q394 10 394 18 L394 182 Q394 190 386 190 L70 190 L8 100 Z" fill={color} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <circle cx={70} cy={100} r={16} fill={CREAM} stroke={INK} strokeWidth={8} />
      <path d="M70 84 Q30 20 -30 30" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    </svg>
    <div style={{position: "absolute", left: w * 0.27, top: w * 0.06, right: w * 0.03, textAlign: "center"}}>
      <div style={{fontSize: w * 0.075, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
      <div style={{position: "relative", display: "inline-block", fontSize: w * 0.16 * Math.min(1, 4 / Math.max(1, [...price].length + [...unit].length * 0.4)), fontWeight: 900, color: INK, whiteSpace: "nowrap", lineHeight: 1.15}}>
        {price}
        <span style={{fontSize: w * 0.065}}>{unit}</span>
        {strike ? <div style={{position: "absolute", left: -8, right: -8, top: "48%", height: w * 0.025, backgroundColor: RED, borderRadius: 8, rotate: "-6deg"}} /> : null}
      </div>
    </div>
  </div>
);

// 官方直营店：条纹遮阳棚 + 招牌 + 橱窗里一排 token 方块
export const Store: React.FC<{w: number; sign?: string}> = ({w, sign = "官方直营"}) => (
  <svg width={w} height={w * 0.86} viewBox="0 0 400 344" style={{overflow: "visible"}}>
    <rect x={30} y={110} width={340} height={220} fill={CREAM} stroke={INK} strokeWidth={9} />
    <path d="M14 70 L386 70 L370 128 L30 128 Z" fill={RED} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${46 + i * 68} 70 L${80 + i * 68} 70 L${76 + i * 68} 128 L${42 + i * 68} 128 Z`} fill={CREAM} />
    ))}
    <rect x={70} y={12} width={260} height={60} rx={10} fill={INK} />
    <text x={200} y={54} textAnchor="middle" fontSize={34} fontWeight={900} fill={YEL}>
      {sign}
    </text>
    <rect x={56} y={160} width={180} height={130} fill="#CFE3F5" stroke={INK} strokeWidth={7} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={72 + i * 54} y={226} width={40} height={40} rx={6} fill={[YEL, GRN, "#FFD3C9"][i]} stroke={INK} strokeWidth={5} />
    ))}
    <rect x={262} y={170} width={84} height={160} fill="#9A6440" stroke={INK} strokeWidth={7} />
    <circle cx={328} cy={256} r={7} fill={YEL} stroke={INK} strokeWidth={4} />
  </svg>
);

// 代购小摊：一张折叠桌 + 纸箱 + 手写牌；牌子是 HTML 自动撑宽，字不会出框；sway = 牌子摆动角度
export const Stall: React.FC<{w: number; sign?: string; sway?: number}> = ({w, sign = "代购", sway = 0}) => (
  <div style={{position: "relative", width: w, height: w * 0.86}}>
    <svg width={w} height={w * 0.86} viewBox="0 0 400 344" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <line x1={70} y1={250} x2={40} y2={334} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <line x1={330} y1={250} x2={360} y2={334} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <rect x={30} y={226} width={340} height={34} rx={6} fill="#C9A46A" stroke={INK} strokeWidth={8} />
      <rect x={90} y={128} width={160} height={100} fill="#D9A867" stroke={INK} strokeWidth={8} />
      <path d="M90 128 L130 100 L290 100 L250 128 Z" fill="#E8C18A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M250 128 L290 100 L290 200 L250 228 Z" fill="#B98848" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={150} y={128} width={40} height={100} fill={YEL} opacity={0.6} />
      <line x1={310} y1={226} x2={310} y2={60} stroke={INK} strokeWidth={9} strokeLinecap="round" />
    </svg>
    <div style={{position: "absolute", left: (310 / 400) * w, top: (64 / 344) * w * 0.86, translate: "-50% -100%", rotate: `${sway}deg`, transformOrigin: "50% 100%"}}>
      <div style={{padding: `${w * 0.012}px ${w * 0.04}px ${w * 0.022}px`, borderRadius: 10, backgroundColor: CREAM, border: `${Math.max(4, w * 0.014)}px solid ${INK}`, boxShadow: `4px 5px 0 ${INK}`, fontSize: w * 0.085, fontWeight: 900, color: RED, whiteSpace: "nowrap"}}>{sign}</div>
    </div>
  </div>
);

// 额度格子板（10×10）：按顺序前 hit 格绿（命中）、接着 miss 格黄（没命中）、最后 out 格蓝（输出），颜色和 billkit 的三色账单一致；show = 已经点亮几格
export const TokenGrid: React.FC<{cell: number; hit: number; miss: number; out: number; show: number}> = ({cell, hit, miss, out, show}) => {
  const color = (i: number) => (i < hit ? GRN : i < hit + miss ? YEL : i < hit + miss + out ? BLU : CREAM);
  return (
    <div style={{display: "grid", gridTemplateColumns: `repeat(10, ${cell}px)`, gap: cell * 0.12, padding: cell * 0.3, borderRadius: "22px 28px 20px 26px", backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`}}>
      {Array.from({length: 100}, (_, i) => {
        // 倒着排：从右下角开始点亮，输出、没命中落在左上角第一行，方便圈出来
        const k = 99 - i;
        return <div key={i} style={{width: cell, height: cell, borderRadius: cell * 0.18, border: `${Math.max(3, cell * 0.08)}px solid ${INK}`, backgroundColor: k < show ? color(k) : CREAM, opacity: k < show ? 1 : 0.35}} />;
      })}
    </div>
  );
};

// 天平：tilt = 倾斜角度（正数 = 右边重、往右下沉），左右托盘上放 children
export const Scale: React.FC<{w: number; tilt: number; left: React.ReactNode; right: React.ReactNode}> = ({w, tilt, left, right}) => {
  const arm = w * 0.42;
  const rad = (tilt * Math.PI) / 180;
  const ly = -Math.sin(rad) * arm;
  const ry = Math.sin(rad) * arm;
  return (
    <div style={{position: "relative", width: w, height: w * 0.62}}>
      <svg width={w} height={w * 0.62} viewBox={`0 0 ${w} ${w * 0.62}`} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <path d={`M${w / 2 - 90} ${w * 0.6} L${w / 2 + 90} ${w * 0.6} L${w / 2 + 30} ${w * 0.54} L${w / 2 - 30} ${w * 0.54} Z`} fill="#9A6440" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <rect x={w / 2 - 14} y={w * 0.16} width={28} height={w * 0.4} fill="#C9A46A" stroke={INK} strokeWidth={8} />
        <g transform={`rotate(${tilt} ${w / 2} ${w * 0.16})`}>
          <rect x={w / 2 - arm} y={w * 0.16 - 12} width={arm * 2} height={24} rx={12} fill="#C9A46A" stroke={INK} strokeWidth={8} />
        </g>
        <circle cx={w / 2} cy={w * 0.16} r={22} fill={YEL} stroke={INK} strokeWidth={8} />
        {[
          [w / 2 - arm, ly],
          [w / 2 + arm, ry],
        ].map(([x, dy], i) => (
          <g key={i}>
            <line x1={x} y1={w * 0.16 + dy} x2={x - 70} y2={w * 0.36 + dy} stroke={INK} strokeWidth={5} />
            <line x1={x} y1={w * 0.16 + dy} x2={x + 70} y2={w * 0.36 + dy} stroke={INK} strokeWidth={5} />
            <path d={`M${x - 110} ${w * 0.36 + dy} L${x + 110} ${w * 0.36 + dy} Q${x} ${w * 0.43 + dy} ${x - 110} ${w * 0.36 + dy} Z`} fill={CREAM} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      <div style={{position: "absolute", left: w / 2 - arm - 160, width: 320, top: w * 0.36 + ly, translate: "0px -100%", display: "flex", justifyContent: "center"}}>{left}</div>
      <div style={{position: "absolute", left: w / 2 + arm - 160, width: 320, top: w * 0.36 + ry, translate: "0px -100%", display: "flex", justifyContent: "center"}}>{right}</div>
    </div>
  );
};

// 陌生人的服务器：机柜 + 闪灯，顶上一只"眼睛"（watch = 0~1 眼睛睁开）
export const ServerBox: React.FC<{w: number; watch?: number; blink?: number}> = ({w, watch = 0, blink = 0}) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 200 260" style={{overflow: "visible"}}>
    <rect x={20} y={40} width={160} height={210} rx={14} fill="#4A403A" stroke={INK} strokeWidth={8} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={38} y={62 + i * 62} width={124} height={46} rx={8} fill="#6B5F57" stroke={INK} strokeWidth={6} />
        <circle cx={60} cy={85 + i * 62} r={8} fill={(blink + i) % 2 ? GRN : YEL} stroke={INK} strokeWidth={4} />
        <rect x={80} y={80 + i * 62} width={66} height={10} rx={5} fill={INK} />
      </g>
    ))}
    <g opacity={watch}>
      <path d="M40 28 Q100 -26 160 28 Q100 70 40 28 Z" fill={CREAM} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={100} cy={26} r={18 * watch} fill={INK} />
      <circle cx={106} cy={20} r={5 * watch} fill={CREAM} />
    </g>
  </svg>
);

// 钥匙（API Key）
export const KeyIcon: React.FC<{w: number; color?: string}> = ({w, color = YEL}) => (
  <svg width={w} height={w * 0.45} viewBox="0 0 220 100" style={{overflow: "visible"}}>
    <circle cx={50} cy={50} r={38} fill={color} stroke={INK} strokeWidth={8} />
    <circle cx={50} cy={50} r={13} fill={CREAM} stroke={INK} strokeWidth={6} />
    <path d="M86 40 L210 40 L210 60 L190 60 L190 78 L170 78 L170 60 L150 60 L150 72 L132 72 L132 60 L86 60 Z" fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

// 收藏清单卡：标题 + 编号行；lit = 已出现几行（可小数，最后一行渐入），hi = 高亮第几行（-1 不高亮）
export const CheckCard: React.FC<{w: number; title: string; items: [string, string][]; lit: number; hi?: number}> = ({w, title, items, lit, hi = -1}) => (
  <div style={{position: "relative", width: w, padding: "70px 56px 44px", borderRadius: "30px 36px 26px 34px", backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `14px 16px 0 ${INK}`, backgroundImage: "repeating-linear-gradient(0deg, transparent 0 96px, rgba(63,111,181,0.16) 96px 100px)"}}>
    <div style={{position: "absolute", left: 44, top: -38, rotate: "-2deg", padding: "8px 30px 12px", borderRadius: 999, backgroundColor: INK, color: "#FFF6E6", fontSize: 44, fontWeight: 900, whiteSpace: "nowrap", boxShadow: `inset 0 -8px 0 ${YEL}`}}>{title}</div>
    {items.map(([big, small], i) => {
      const o = Math.max(0, Math.min(1, lit - i));
      const on = hi === i;
      return (
        <div key={i} style={{display: "flex", alignItems: "center", gap: 26, height: 100, opacity: o, translate: `${(1 - o) * 40}px 0px`, scale: on ? "1.03" : "1", transformOrigin: "0% 50%"}}>
          <div style={{width: 70, height: 70, flex: "none", borderRadius: "50%", backgroundColor: on ? RED : YEL, border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: on ? CREAM : INK}}>{i + 1}</div>
          <div style={{fontSize: 52, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{big}</div>
          <div style={{fontSize: 36, fontWeight: 800, color: "#6B5F57", whiteSpace: "nowrap"}}>{small}</div>
        </div>
      );
    })}
  </div>
);

// 截图卡 + 红框：src = public 下的图，iw×ih = 原图像素；rings = [x, y, w, h, 显示 0~1]（原图像素坐标）
export const Snap: React.FC<{src: string; w: number; iw: number; ih: number; rings?: [number, number, number, number, number][]; rot?: number}> = ({src, w, iw, ih, rings = [], rot = 0}) => {
  const k = w / iw;
  return (
    <div style={{position: "relative", width: w + 28, padding: 14, borderRadius: "22px 28px 20px 26px", backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, rotate: `${rot}deg`}}>
      <Img src={staticFile(src)} style={{display: "block", width: w, height: ih * k, borderRadius: 8}} />
      {rings.map(([x, y, rw, rh, p], i) => (
        <div key={i} style={{position: "absolute", left: 14 + x * k - 8, top: 14 + y * k - 8, width: rw * k + 16, height: rh * k + 16, border: `8px solid ${RED}`, borderRadius: 16, opacity: p, scale: `${1.25 - p * 0.25}`, boxShadow: "0 0 0 6px rgba(217,54,43,0.18)"}} />
      ))}
    </div>
  );
};
