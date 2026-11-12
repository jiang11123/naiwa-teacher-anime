import React from "react";

// 道具插画（纯静态，动画写在分镜里）：聊天窗口、你（小人）、方案纸、网站样稿、房子图纸、
// 开源仓库卡、文件夹、终端、开关、游戏画面、日历、存档旗
const INK = "#2B211C";
const RED = "#D9362B";
const YEL = "#F7C64A";
const GRN = "#4E8A4A";
const BLU = "#3F6FB5";
const CREAM = "#FFFDF6";

// 聊天窗口外框（标题栏 + 内容区），children 是消息
export const ChatWin: React.FC<{w: number; h: number; title?: string; children?: React.ReactNode; tint?: string}> = ({w, h, title = "新对话", children, tint = CREAM}) => (
  <div style={{position: "relative", width: w, height: h, borderRadius: "26px 32px 22px 30px", backgroundColor: tint, border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden"}}>
    <div style={{height: 76, backgroundColor: "#EADFC8", borderBottom: `6px solid ${INK}`, display: "flex", alignItems: "center", gap: 16, paddingLeft: 26}}>
      {[RED, YEL, GRN].map((c) => (
        <div key={c} style={{width: 26, height: 26, borderRadius: "50%", backgroundColor: c, border: `4px solid ${INK}`}} />
      ))}
      <div style={{marginLeft: 18, fontSize: 36, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
    </div>
    <div style={{position: "absolute", left: 0, top: 82, width: w - 14, height: h - 96, overflow: "hidden"}}>{children}</div>
  </div>
);

// 一条消息气泡：me = 你发的（右边黄）/ AI 回的（左边米白）
export const Msg: React.FC<{text: string; me?: boolean; size?: number; strike?: boolean; fade?: boolean}> = ({text, me = false, size = 38, strike = false, fade = false}) => (
  <div style={{display: "flex", justifyContent: me ? "flex-end" : "flex-start", padding: "10px 26px", opacity: fade ? 0.45 : 1}}>
    <div style={{position: "relative", padding: "10px 24px 14px", borderRadius: 22, backgroundColor: me ? "#FCE38A" : "#fff", border: `5px solid ${INK}`, fontSize: size, fontWeight: 800, color: INK, whiteSpace: "nowrap", boxShadow: `4px 5px 0 ${INK}`}}>
      {text}
      {strike ? <div style={{position: "absolute", left: 10, right: 10, top: "52%", height: 7, backgroundColor: RED, rotate: "-3deg", borderRadius: 4}} /> : null}
    </div>
  </div>
);

// 你：圆脑袋小人（半身），mood = calm / shock 惊 / happy 开心 / cry 哭
export const Me: React.FC<{size: number; mood?: "calm" | "shock" | "happy" | "cry"; label?: boolean}> = ({size, mood = "calm", label = true}) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 200 230" style={{overflow: "visible"}}>
    <path d="M30 230 Q30 150 100 150 Q170 150 170 230 Z" fill={BLU} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M86 150 L100 176 L114 150" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx="100" cy="86" r="62" fill="#FBE3C8" stroke={INK} strokeWidth={7} />
    <path d="M40 78 Q44 18 100 20 Q160 20 162 76 Q140 50 112 56 Q96 40 70 58 Q52 60 40 78 Z" fill={INK} />
    {mood === "shock" ? (
      <>
        <circle cx="78" cy="88" r="11" fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx="122" cy="88" r="11" fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx="78" cy="88" r="4" fill={INK} />
        <circle cx="122" cy="88" r="4" fill={INK} />
        <ellipse cx="100" cy="122" rx="12" ry="16" fill={INK} />
      </>
    ) : mood === "happy" ? (
      <>
        <path d="M66 90 Q78 76 90 90 M110 90 Q122 76 134 90" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M80 112 Q100 134 120 112 Z" fill={RED} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </>
    ) : mood === "cry" ? (
      <>
        <path d="M66 84 L90 90 M134 84 L110 90" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M76 96 q-4 16 0 26 M124 96 q4 16 0 26" fill="none" stroke="#8EC5F0" strokeWidth={8} strokeLinecap="round" />
        <path d="M82 126 Q100 112 118 126" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="78" cy="90" r="8" fill={INK} />
        <circle cx="122" cy="90" r="8" fill={INK} />
        <path d="M86 118 Q100 126 114 118" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </>
    )}
    <circle cx="62" cy="108" r="9" fill="#F2A0A0" opacity={0.7} />
    <circle cx="138" cy="108" r="9" fill="#F2A0A0" opacity={0.7} />
    {label ? (
      <text x="100" y="214" textAnchor="middle" fontSize="40" fontWeight="900" fill={YEL} stroke={INK} strokeWidth={7} style={{paintOrder: "stroke"}}>
        你
      </text>
    ) : null}
  </svg>
);

// 方案纸：右上角写 v几，纸上几行线
export const Draft: React.FC<{w: number; v: string; color?: string}> = ({w, v, color = CREAM}) => (
  <div style={{position: "relative", width: w, height: w * 1.3, backgroundColor: color, border: `5px solid ${INK}`, borderRadius: 10, boxShadow: `5px 6px 0 ${INK}`}}>
    <div style={{position: "absolute", right: 10, top: 8, fontSize: w * 0.22, fontWeight: 900, color: RED}}>{v}</div>
    {[0.38, 0.52, 0.66, 0.8].map((k) => (
      <div key={k} style={{position: "absolute", left: w * 0.12, top: w * 1.3 * k, width: w * (k === 0.8 ? 0.45 : 0.76), height: 6, borderRadius: 3, backgroundColor: "#B9AE9A"}} />
    ))}
  </div>
);

// 网站样稿（浏览器框 + 横幅 + 三块内容），bad = 塞满不想要的东西
export const Site: React.FC<{w: number; bad?: boolean}> = ({w, bad = false}) => {
  const h = w * 0.66;
  return (
    <div style={{position: "relative", width: w, height: h, borderRadius: 22, backgroundColor: "#fff", border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden"}}>
      <div style={{height: h * 0.1, backgroundColor: "#EADFC8", borderBottom: `5px solid ${INK}`, display: "flex", alignItems: "center", gap: 10, paddingLeft: 18}}>
        {[RED, YEL, GRN].map((c) => (
          <div key={c} style={{width: 18, height: 18, borderRadius: "50%", backgroundColor: c, border: `3px solid ${INK}`}} />
        ))}
      </div>
      <div style={{margin: w * 0.03, height: h * 0.3, borderRadius: 14, border: `5px solid ${INK}`, backgroundColor: bad ? "#FF6FB5" : "#CFE3F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.075, fontWeight: 900, color: bad ? "#FFF35C" : INK}}>
        {bad ? "★欢迎光临★" : "我的作品"}
      </div>
      <div style={{display: "flex", gap: w * 0.03, margin: `0 ${w * 0.03}px`}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{flex: 1, height: h * 0.36, borderRadius: 12, border: `5px solid ${INK}`, backgroundColor: bad ? ["#9CFF57", "#FFB13B", "#B57CFF"][i] : "#FFFDF6"}} />
        ))}
      </div>
    </div>
  );
};

// 房子图纸（蓝图）：卷着 / 展开
export const Blueprint: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 300 216" style={{overflow: "visible"}}>
    <rect x="6" y="6" width="288" height="204" rx="10" fill="#3F6FB5" stroke={INK} strokeWidth={7} />
    <g stroke="#CFE3F5" strokeWidth={4} fill="none">
      <rect x="50" y="40" width="200" height="140" />
      <line x1="150" y1="40" x2="150" y2="120" />
      <line x1="50" y1="120" x2="250" y2="120" />
      <path d="M110 180 a26 26 0 0 1 26 -26" />
    </g>
    <path d="M20 20 l20 0 M20 20 l0 20" stroke="#CFE3F5" strokeWidth={3} />
  </svg>
);

// 墙：一面砖墙，crack = 0~1 裂开程度
export const Wall: React.FC<{w: number; h: number; crack?: number}> = ({w, h, crack = 0}) => {
  const rows = Math.ceil(h / 60);
  return (
    <div style={{position: "relative", width: w, height: h, overflow: "hidden", border: `7px solid ${INK}`, backgroundColor: "#C8553D", boxShadow: `10px 12px 0 ${INK}`}}>
      {Array.from({length: rows}).map((_, r) => (
        <div key={r} style={{position: "absolute", left: r % 2 ? -60 : 0, top: r * 60, width: w + 120, height: 60, borderBottom: `5px solid ${INK}`, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 115px, ${INK} 115px 120px)`}} />
      ))}
      {crack > 0 ? (
        <svg width={w} height={h} style={{position: "absolute", left: 0, top: 0}}>
          <path d={`M${w * 0.5} 0 L${w * 0.44} ${h * 0.25} L${w * 0.58} ${h * 0.45} L${w * 0.42} ${h * 0.7} L${w * 0.55} ${h}`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - crack} />
          <path d={`M${w * 0.58} ${h * 0.45} L${w * 0.8} ${h * 0.38} M${w * 0.44} ${h * 0.25} L${w * 0.2} ${h * 0.3}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - crack} />
        </svg>
      ) : null}
    </div>
  );
};

// 大锤
export const Hammer: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <rect x="54" y="30" width="14" height="86" rx="6" fill="#A86E46" stroke={INK} strokeWidth={6} />
    <rect x="18" y="8" width="86" height="40" rx="8" fill="#8E9AA6" stroke={INK} strokeWidth={6} />
  </svg>
);

// 开源仓库卡：名字 + 星数 + 简介
export const Repo: React.FC<{w: number; name: string; stars: string; desc: string; color?: string}> = ({w, name, stars, desc, color = "#D9EFC8"}) => (
  <div style={{width: w, padding: "20px 28px 22px", borderRadius: "22px 28px 20px 26px", backgroundColor: CREAM, border: `6px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`}}>
    <div style={{display: "flex", alignItems: "center", gap: 14}}>
      <div style={{width: 54, height: 54, borderRadius: 12, backgroundColor: color, border: `5px solid ${INK}`, fontSize: 30, textAlign: "center", lineHeight: "44px"}}>📦</div>
      <div className="mono" style={{fontSize: 40, fontWeight: 900, color: BLU, whiteSpace: "nowrap"}}>{name}</div>
      <div style={{marginLeft: "auto", fontSize: 36, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>⭐ {stars}</div>
    </div>
    <div style={{marginTop: 10, fontSize: 32, fontWeight: 700, color: "#6B5D50", whiteSpace: "nowrap"}}>{desc}</div>
  </div>
);

// 文件夹（带名字标签）
export const Folder: React.FC<{w: number; name: string; color?: string; size?: number}> = ({w, name, color = YEL, size = 40}) => (
  <div style={{position: "relative", width: w, height: w * 0.74}}>
    <div style={{position: "absolute", left: 0, top: 0, width: w * 0.42, height: w * 0.18, backgroundColor: color, border: `6px solid ${INK}`, borderRadius: "14px 14px 0 0"}} />
    <div style={{position: "absolute", left: 0, top: w * 0.12, width: w, height: w * 0.62, backgroundColor: color, border: `6px solid ${INK}`, borderRadius: "6px 18px 16px 16px", boxShadow: `8px 10px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{name}</div>
    </div>
  </div>
);

// 终端窗口：lines = 已打出的行（颜色用 [文字, 颜色]）
export const Term: React.FC<{w: number; h: number; lines: [string, string][]; title?: string}> = ({w, h, lines, title = "终端"}) => (
  <div style={{width: w, height: h, borderRadius: 20, backgroundColor: "#1F1814", border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden"}}>
    <div style={{height: 60, backgroundColor: "#4A3B32", display: "flex", alignItems: "center", gap: 14, paddingLeft: 22}}>
      {[RED, YEL, GRN].map((c) => (
        <div key={c} style={{width: 22, height: 22, borderRadius: "50%", backgroundColor: c, border: `4px solid ${INK}`}} />
      ))}
      <div style={{marginLeft: 12, fontSize: 30, fontWeight: 800, color: "#E9DFC6"}}>{title}</div>
    </div>
    <div className="mono" style={{padding: "18px 28px", fontSize: 40, fontWeight: 800, lineHeight: 1.5}}>
      {lines.map(([t, c], i) => (
        <div key={i} style={{color: c, whiteSpace: "nowrap"}}>
          {t}
        </div>
      ))}
    </div>
  </div>
);

// 开关：on = 0~1
export const Toggle: React.FC<{w: number; on: number}> = ({w, on}) => (
  <div style={{position: "relative", width: w, height: w * 0.52, borderRadius: 999, backgroundColor: on > 0.5 ? GRN : "#B9AE9A", border: `7px solid ${INK}`, boxShadow: `6px 7px 0 ${INK}`}}>
    <div style={{position: "absolute", top: w * 0.04, left: w * 0.04 + on * w * 0.44, width: w * 0.38, height: w * 0.38, borderRadius: "50%", backgroundColor: CREAM, border: `6px solid ${INK}`}} />
  </div>
);

// 日历页
export const CalPage: React.FC<{w: number; top: string; big: string; color?: string}> = ({w, top, big, color = RED}) => (
  <div style={{width: w, height: w * 1.1, borderRadius: 18, backgroundColor: CREAM, border: `6px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, overflow: "hidden", textAlign: "center"}}>
    <div style={{height: w * 0.3, backgroundColor: color, borderBottom: `6px solid ${INK}`, fontSize: w * 0.15, fontWeight: 900, color: "#fff", lineHeight: `${w * 0.28}px`, whiteSpace: "nowrap"}}>{top}</div>
    <div style={{fontSize: w * 0.34, fontWeight: 900, color: INK, lineHeight: `${w * 0.74}px`, whiteSpace: "nowrap"}}>{big}</div>
  </div>
);

// 存档旗（游戏存档点）
export const SaveFlag: React.FC<{size: number; lit?: boolean}> = ({size, lit = true}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: "visible"}}>
    <rect x="22" y="10" width="10" height="104" rx="4" fill="#8A5A3A" stroke={INK} strokeWidth={5} />
    <path d="M32 14 L100 30 L32 52 Z" fill={lit ? GRN : "#B9AE9A"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx="27" cy="114" rx="26" ry="8" fill="#A07850" stroke={INK} strokeWidth={5} />
  </svg>
);

// 一张"文档"卡（交接记录 / 方案 / 经验），rows = 勾选项
export const Doc: React.FC<{w: number; title: string; rows: [string, boolean][]; color?: string; size?: number}> = ({w, title, rows, color = BLU, size = 44}) => (
  <div style={{width: w, borderRadius: "22px 28px 20px 26px", backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, overflow: "hidden"}}>
    <div style={{padding: "12px 26px 14px", backgroundColor: color, borderBottom: `6px solid ${INK}`, fontSize: size * 1.05, fontWeight: 900, color: "#fff", whiteSpace: "nowrap"}}>📄 {title}</div>
    <div style={{padding: "14px 26px 22px"}}>
      {rows.map(([t, on], i) => (
        <div key={i} style={{display: "flex", alignItems: "center", gap: 16, marginTop: 10, opacity: on ? 1 : 0.18}}>
          <div style={{width: size * 1.05, height: size * 1.05, flex: "none", borderRadius: 10, border: `5px solid ${INK}`, backgroundColor: on ? GRN : "#fff", color: "#fff", fontSize: size * 0.8, fontWeight: 900, textAlign: "center", lineHeight: `${size * 0.85}px`}}>{on ? "✓" : ""}</div>
          <div style={{fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{t}</div>
        </div>
      ))}
    </div>
  </div>
);

// 报错弹窗
export const ErrPop: React.FC<{w: number; text: string}> = ({w, text}) => (
  <div style={{width: w, borderRadius: 16, backgroundColor: "#FFE1DC", border: `6px solid ${INK}`, boxShadow: `7px 8px 0 ${INK}`, overflow: "hidden"}}>
    <div style={{height: 44, backgroundColor: RED, borderBottom: `5px solid ${INK}`, color: "#fff", fontSize: 28, fontWeight: 900, paddingLeft: 16, lineHeight: "38px"}}>⚠ Error</div>
    <div className="mono" style={{padding: "10px 18px 14px", fontSize: 32, fontWeight: 900, color: RED, whiteSpace: "nowrap"}}>{text}</div>
  </div>
);
