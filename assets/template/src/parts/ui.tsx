import React from "react";

// 手绘小插画（纯静态 SVG，不带动画；动画写在分镜里包着它们的 Interactive.Div 上）
// 统一：墨色粗线 #2B211C、红 #D9362B、黄 #F7C64A、米白 #FFF8E8、绿 #4E8A4A、蓝 #3F6FB5
const INK = "#2B211C";

// 红色"云朵"贴纸底（参考视频"手作"的红色云）
export const RedCloud: React.FC<{w: number; h: number; color?: string}> = ({w, h, color = "#D9362B"}) => {
  const n = 14;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const x = w / 2 + Math.cos(a) * (w / 2 - 26);
    const y = h / 2 + Math.sin(a) * (h / 2 - 26);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  let d = `M${pts[0]}`;
  for (let i = 1; i <= n; i++) {
    const a = (Math.PI * 2 * (i - 0.5)) / n;
    const cx = w / 2 + Math.cos(a) * (w / 2 + 4);
    const cy = h / 2 + Math.sin(a) * (h / 2 + 4);
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${pts[i]}`;
  }
  return (
    <svg width={w} height={h} viewBox={`-12 -12 ${w + 24} ${h + 24}`} style={{overflow: "visible"}}>
      <path d={d + " Z"} fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={w * 0.22} cy={h * 0.3} rx={w * 0.05} ry={h * 0.06} fill="#fff" opacity={0.18} />
      <circle cx={w * 0.8} cy={h * 0.72} r={10} fill="#F7C64A" opacity={0.9} />
      <circle cx={w * 0.15} cy={h * 0.7} r={7} fill="#F7C64A" opacity={0.9} />
    </svg>
  );
};

// 手绘箭头：p = 0~1 画出的进度
export const InkArrow: React.FC<{d: string; p: number; w: number; h: number; color?: string; head?: boolean; dash?: boolean}> = ({d, p, w, h, color = INK, head = true, dash = false}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: "visible"}}>
    <defs>
      <marker id={`ah-${color.slice(1)}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" fill={color} />
      </marker>
    </defs>
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={dash ? undefined : "1 1"}
      strokeDashoffset={dash ? undefined : 1 - p}
      opacity={dash ? p : 1}
      markerEnd={head && p > 0.92 ? `url(#ah-${color.slice(1)})` : undefined}
    />
  </svg>
);

// 手绘圈（红笔圈重点）：p = 0~1
export const InkCircle: React.FC<{w: number; h: number; p: number; color?: string}> = ({w, h, p, color = "#D9362B"}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: "visible"}}>
    <path
      d={`M${w * 0.55} ${h * 0.04} C${w * 1.02} ${h * 0.02} ${w * 1.04} ${h * 0.96} ${w * 0.5} ${h * 0.97} C${-w * 0.04} ${h * 0.98} ${-w * 0.02} ${h * 0.05} ${w * 0.6} ${h * 0.1}`}
      fill="none"
      stroke={color}
      strokeWidth={8}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
    />
  </svg>
);

// 手绘下划线（荧光笔）：p = 0~1
export const InkUnderline: React.FC<{w: number; p: number; color?: string}> = ({w, p, color = "#F7C64A"}) => (
  <svg width={w} height={40} viewBox={`0 0 ${w} 40`} style={{overflow: "visible"}}>
    <path d={`M6 26 C${w * 0.3} 16 ${w * 0.6} 30 ${w - 6} 18`} fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={0.85} />
  </svg>
);

// 胶带
export const Tape: React.FC<{w?: number}> = ({w = 120}) => (
  <svg width={w} height={40} viewBox={`0 0 ${w} 40`}>
    <path d={`M4 6 L${w - 6} 2 L${w - 2} 34 L8 38 Z`} fill="#EDE2C4" opacity={0.85} stroke="#B9A57A" strokeWidth={1.5} />
  </svg>
);

// AI 机器人（手绘）：mood = calm 平静 / smug 一本正经 / dizzy 晕 / happy 开心 / sweat 流汗
export const Robot: React.FC<{size: number; mood?: "calm" | "smug" | "dizzy" | "happy" | "sweat"; tie?: boolean}> = ({size, mood = "calm", tie = false}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: "visible"}}>
    <line x1="100" y1="34" x2="100" y2="12" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <circle cx="100" cy="10" r="9" fill="#D9362B" stroke={INK} strokeWidth={5} />
    <rect x="30" y="34" width="140" height="112" rx="34" fill="#FFF8E8" stroke={INK} strokeWidth={7} />
    <rect x="16" y="72" width="16" height="36" rx="7" fill="#F7C64A" stroke={INK} strokeWidth={5} />
    <rect x="168" y="72" width="16" height="36" rx="7" fill="#F7C64A" stroke={INK} strokeWidth={5} />
    {mood === "dizzy" ? (
      <>
        <path d="M58 78 l22 22 M80 78 l-22 22 M120 78 l22 22 M142 78 l-22 22" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </>
    ) : mood === "happy" ? (
      <>
        <path d="M56 94 Q70 74 84 94 M116 94 Q130 74 144 94" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      </>
    ) : mood === "smug" ? (
      <>
        <path d="M54 84 L86 84" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <path d="M114 84 L146 84" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <circle cx="72" cy="94" r="7" fill={INK} />
        <circle cx="130" cy="94" r="7" fill={INK} />
      </>
    ) : (
      <>
        <circle cx="70" cy="88" r="12" fill={INK} />
        <circle cx="130" cy="88" r="12" fill={INK} />
        <circle cx="74" cy="84" r="4" fill="#fff" />
        <circle cx="134" cy="84" r="4" fill="#fff" />
      </>
    )}
    {mood === "happy" ? (
      <path d="M78 116 Q100 136 122 116" fill="#D9362B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    ) : mood === "smug" ? (
      <path d="M84 122 Q104 128 120 116" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    ) : mood === "dizzy" ? (
      <path d="M80 124 q10 -10 20 0 q10 10 20 0" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    ) : (
      <path d="M84 120 L116 120" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    )}
    <circle cx="52" cy="112" r="9" fill="#F2A0A0" opacity={0.7} />
    <circle cx="148" cy="112" r="9" fill="#F2A0A0" opacity={0.7} />
    {mood === "sweat" ? <path d="M160 46 q10 16 0 24 q-10 -8 0 -24z" fill="#8EC5F0" stroke={INK} strokeWidth={4} /> : null}
    <rect x="62" y="146" width="76" height="40" rx="14" fill="#F7C64A" stroke={INK} strokeWidth={7} />
    {tie ? <path d="M92 146 L108 146 L104 160 L112 186 L100 196 L88 186 L96 160 Z" fill="#2B211C" /> : null}
  </svg>
);

// 文本文件图标（带折角），label 写在纸上
export const FileIcon: React.FC<{w: number; h: number; ext: string; color?: string}> = ({w, h, ext, color = "#3F6FB5"}) => (
  <svg width={w} height={h} viewBox="0 0 120 150" style={{overflow: "visible"}}>
    <path d="M10 6 L82 6 L112 36 L112 144 L10 144 Z" fill="#FFFDF6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M82 6 L82 36 L112 36" fill="#E9DFC6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M26 62 L94 62 M26 80 L94 80 M26 98 L74 98" stroke="#B9A893" strokeWidth={5} strokeLinecap="round" />
    <rect x="18" y="110" width="70" height="26" rx="6" fill={color} stroke={INK} strokeWidth={4} />
    <text x="53" y="130" textAnchor="middle" fontSize="19" fontWeight="900" fill="#fff" fontFamily="Consolas, monospace">
      {ext}
    </text>
  </svg>
);

// 文件夹
export const FolderIcon: React.FC<{w: number; color?: string}> = ({w, color = "#F7C64A"}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 150 120" style={{overflow: "visible"}}>
    <path d="M8 22 Q8 12 18 12 L56 12 L68 26 L132 26 Q142 26 142 36 L142 104 Q142 112 132 112 L18 112 Q8 112 8 104 Z" fill="#E4A93A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M8 44 Q8 36 18 36 L132 36 Q142 36 142 46 L142 104 Q142 112 132 112 L18 112 Q8 112 8 104 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M22 54 L60 54" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.6} />
  </svg>
);

// 放大镜
export const Magnifier: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <circle cx="50" cy="50" r="34" fill="#DDEFFA" fillOpacity={0.6} stroke={INK} strokeWidth={8} />
    <path d="M32 40 Q38 28 52 26" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
    <path d="M76 76 L108 108" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <path d="M76 76 L108 108" stroke="#D9362B" strokeWidth={8} strokeLinecap="round" />
  </svg>
);

// 资料库（圆柱）
export const Database: React.FC<{w: number; color?: string}> = ({w, color = "#FFF8E8"}) => (
  <svg width={w} height={w * 1.1} viewBox="0 0 120 132" style={{overflow: "visible"}}>
    <path d="M10 22 L10 108 Q60 136 110 108 L110 22" fill={color} stroke={INK} strokeWidth={6} />
    <ellipse cx="60" cy="22" rx="50" ry="16" fill="#F7C64A" stroke={INK} strokeWidth={6} />
    <path d="M10 52 Q60 78 110 52 M10 80 Q60 106 110 80" fill="none" stroke={INK} strokeWidth={5} />
  </svg>
);

// 书 / 字典（带书签目录）
export const Book: React.FC<{w: number; tabs?: boolean}> = ({w, tabs = true}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 200 160" style={{overflow: "visible"}}>
    {tabs ? (
      <>
        <rect x="176" y="24" width="22" height="22" rx="4" fill="#D9362B" stroke={INK} strokeWidth={4} />
        <rect x="176" y="52" width="22" height="22" rx="4" fill="#F7C64A" stroke={INK} strokeWidth={4} />
        <rect x="176" y="80" width="22" height="22" rx="4" fill="#4E8A4A" stroke={INK} strokeWidth={4} />
        <rect x="176" y="108" width="22" height="22" rx="4" fill="#3F6FB5" stroke={INK} strokeWidth={4} />
      </>
    ) : null}
    <rect x="14" y="10" width="170" height="140" rx="12" fill="#D9362B" stroke={INK} strokeWidth={7} />
    <rect x="34" y="10" width="150" height="128" rx="8" fill="#FFF8E8" stroke={INK} strokeWidth={6} />
    <path d="M60 46 L156 46 M60 70 L156 70 M60 94 L130 94" stroke="#B9A893" strokeWidth={7} strokeLinecap="round" />
  </svg>
);

// 齿轮
export const Gear: React.FC<{size: number; color?: string}> = ({size, color = "#F7C64A"}) => {
  const teeth: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    teeth.push(`M${60 + Math.cos(a) * 40} ${60 + Math.sin(a) * 40} L${60 + Math.cos(a) * 56} ${60 + Math.sin(a) * 56}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
      <path d={teeth.join(" ")} stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d={teeth.join(" ")} stroke={color} strokeWidth={10} strokeLinecap="round" />
      <circle cx="60" cy="60" r="40" fill={color} stroke={INK} strokeWidth={7} />
      <circle cx="60" cy="60" r="15" fill="#FFF8E8" stroke={INK} strokeWidth={6} />
    </svg>
  );
};

// 对话气泡（白底墨线，尾巴在左下）
export const Bubble: React.FC<{w: number; h: number; fill?: string; tail?: "left" | "right"}> = ({w, h, fill = "#FFFDF6", tail = "left"}) => (
  <svg width={w} height={h + 34} viewBox={`0 0 ${w} ${h + 34}`} style={{overflow: "visible"}}>
    <path
      d={
        tail === "left"
          ? `M28 4 L${w - 28} 4 Q${w - 4} 4 ${w - 4} 28 L${w - 4} ${h - 28} Q${w - 4} ${h - 4} ${w - 28} ${h - 4} L96 ${h - 4} L44 ${h + 30} L60 ${h - 4} L28 ${h - 4} Q4 ${h - 4} 4 ${h - 28} L4 28 Q4 4 28 4 Z`
          : `M28 4 L${w - 28} 4 Q${w - 4} 4 ${w - 4} 28 L${w - 4} ${h - 28} Q${w - 4} ${h - 4} ${w - 28} ${h - 4} L${w - 60} ${h - 4} L${w - 44} ${h + 30} L${w - 96} ${h - 4} L28 ${h - 4} Q4 ${h - 4} 4 ${h - 28} L4 28 Q4 4 28 4 Z`
      }
      fill={fill}
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
  </svg>
);

// 星星闪光（四角星）
export const Sparkle: React.FC<{size: number; color?: string}> = ({size, color = "#F7C64A"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{overflow: "visible"}}>
    <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5z" fill={color} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

// 对勾 / 叉（手绘粗笔）
export const Check: React.FC<{size: number; p?: number; color?: string}> = ({size, p = 1, color = "#4E8A4A"}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: "visible"}}>
    <path d="M14 54 L40 80 L88 20" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
  </svg>
);
export const Cross: React.FC<{size: number; p?: number; color?: string}> = ({size, p = 1, color = "#D9362B"}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: "visible"}}>
    <path d="M18 18 L82 82" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, p * 2)} />
    <path d="M82 18 L18 82" fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, p * 2 - 1)} />
  </svg>
);

// 硬币（token）
export const Coin: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: "visible"}}>
    <circle cx="50" cy="50" r="42" fill="#F7C64A" stroke={INK} strokeWidth={7} />
    <circle cx="50" cy="50" r="28" fill="none" stroke={INK} strokeWidth={4} strokeDasharray="6 6" />
    <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill={INK} fontFamily="Consolas, monospace">T</text>
  </svg>
);

// 蜗牛（慢）
export const Snail: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.7} viewBox="0 0 160 112" style={{overflow: "visible"}}>
    <path d="M10 96 Q20 70 60 78 L140 80 Q156 82 150 96 Z" fill="#B7D88C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx="86" cy="54" r="40" fill="#E4A93A" stroke={INK} strokeWidth={6} />
    <path d="M86 54 m-6 0 a6 6 0 1 1 12 0 a14 14 0 1 1 -28 0 a22 22 0 1 1 44 0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <path d="M24 82 L14 50 M34 80 L32 48" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <circle cx="14" cy="48" r="6" fill={INK} />
    <circle cx="32" cy="46" r="6" fill={INK} />
  </svg>
);

// 电脑（显示器）
export const Monitor: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.86} viewBox="0 0 200 172" style={{overflow: "visible"}}>
    <rect x="8" y="8" width="184" height="124" rx="14" fill="#FFF8E8" stroke={INK} strokeWidth={7} />
    <rect x="22" y="22" width="156" height="96" rx="6" fill="#CFE3F5" stroke={INK} strokeWidth={4} />
    <path d="M86 132 L80 158 L120 158 L114 132" fill="#E9DFC6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M58 162 L142 162" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </svg>
);

// 扫帚
export const Broom: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <path d="M96 6 L58 66" stroke="#9A6B3F" strokeWidth={10} strokeLinecap="round" />
    <path d="M96 6 L58 66" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    <path d="M44 58 L74 76 L56 114 Q30 112 14 96 Z" fill="#F7C64A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M30 86 L22 100 M42 92 L36 108 M54 96 L50 112" stroke={INK} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

// 垃圾桶
export const Trash: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <path d="M22 30 L98 30 L90 112 L30 112 Z" fill="#CDBFAE" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M14 30 L106 30" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <path d="M46 14 L74 14 L74 30 L46 30 Z" fill="#CDBFAE" stroke={INK} strokeWidth={5} />
    <path d="M44 48 L48 96 M60 48 L60 96 M76 48 L72 96" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

// 扳手
export const Wrench: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <path d="M78 10 a28 28 0 0 0 -26 38 L12 88 a12 12 0 0 0 18 18 L70 66 a28 28 0 0 0 38 -26 L92 56 L74 50 L68 32 Z" fill="#CDD6DE" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

// 手机（通讯录用）外壳
export const PhoneShell: React.FC<{w: number; h: number}> = ({w, h}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: "visible"}}>
    <rect x="4" y="4" width={w - 8} height={h - 8} rx="46" fill="#2B211C" />
    <rect x="18" y="18" width={w - 36} height={h - 36} rx="34" fill="#FFFDF6" />
    <rect x={w / 2 - 50} y="26" width="100" height="22" rx="11" fill="#2B211C" />
  </svg>
);

// 秒表
export const Stopwatch: React.FC<{size: number; p: number}> = ({size, p}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <rect x="50" y="2" width="20" height="14" rx="4" fill={INK} />
    <circle cx="60" cy="66" r="46" fill="#FFF8E8" stroke={INK} strokeWidth={7} />
    <path d={`M60 66 L60 26 A40 40 0 ${p > 0.5 ? 1 : 0} 1 ${60 + Math.sin(p * Math.PI * 2) * 40} ${66 - Math.cos(p * Math.PI * 2) * 40} Z`} fill="#F7C64A" opacity={0.9} />
    <path d={`M60 66 L${60 + Math.sin(p * Math.PI * 2) * 34} ${66 - Math.cos(p * Math.PI * 2) * 34}`} stroke="#D9362B" strokeWidth={6} strokeLinecap="round" />
    <circle cx="60" cy="66" r="6" fill={INK} />
  </svg>
);

// 大脑
export const Brain: React.FC<{size: number; color?: string}> = ({size, color = "#F2A7B5"}) => (
  <svg width={size} height={size * 0.84} viewBox="0 0 140 118" style={{overflow: "visible"}}>
    <path d="M70 12 C56 0 30 6 30 26 C10 28 6 52 18 62 C6 76 18 100 40 96 C48 112 66 112 70 100 C74 112 92 112 100 96 C122 100 134 76 122 62 C134 52 130 28 110 26 C110 6 84 0 70 12 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M70 14 L70 100 M44 40 Q56 46 52 60 M96 40 Q84 46 88 60 M38 76 Q50 70 58 80 M102 76 Q90 70 82 80" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
