import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {C, IO, OUT} from "./Anim";
import {BLU, CREAM, GRN, INK, RED, YEL} from "./kit";

// GitHub / 开源类小道具（纸张手绘风：墨线 + 红黄绿蓝 + 硬投影）
// 参考对标：阿柠的章节条、斜放窗口、带名字的光标；七也的手绘标签框；桌子的漂浮卡片

// ---- 顶部章节条（参考阿柠）：当前章节绿色进度慢慢填满，其余灰着 ----
export const CHAPTERS = ["开源是啥", "GitHub 是啥", "项目首页", "Code 按钮", "README", "丢给 AI", "安全吗"];
export const ChapterBar: React.FC<{idx: number; p: number; show: number}> = ({idx, p, show}) => (
  <div style={{position: "absolute", left: 0, top: 14, width: 1920, display: "flex", justifyContent: "center", gap: 10, opacity: show, translate: `0px ${(1 - show) * -70}px`}}>
    {CHAPTERS.map((c, i) => {
      const on = i === idx;
      const done = i < idx;
      return (
        <div key={c} style={{position: "relative", height: 46, padding: "0 22px", borderRadius: 12, backgroundColor: on ? CREAM : done ? "#E9DDC3" : "rgba(255,253,246,0.55)", border: `4px solid ${on ? INK : "rgba(43,33,28,0.35)"}`, boxShadow: on ? `4px 5px 0 ${INK}` : "none", overflow: "hidden", display: "flex", alignItems: "center"}}>
          {on ? <div style={{position: "absolute", left: 0, top: 0, width: `${p * 100}%`, height: "100%", backgroundColor: "#BFE0A8"}} /> : null}
          <div style={{position: "relative", fontSize: 26, fontWeight: 900, color: on ? INK : "rgba(43,33,28,0.5)", whiteSpace: "nowrap", letterSpacing: 2}}>
            {done ? "✓ " : ""}
            {c}
          </div>
        </div>
      );
    })}
  </div>
);

// ---- 手绘标签框（参考七也）：白底方框 + 粗墨边 + 微斜 ----
export const LabelBox: React.FC<{text: string; size?: number; fill?: string; rot?: number}> = ({text, size = 64, fill = "#FFFDF6", rot = -3}) => (
  <div style={{display: "inline-block", padding: `${size * 0.12}px ${size * 0.35}px ${size * 0.18}px`, backgroundColor: fill, border: `6px solid ${INK}`, boxShadow: `7px 8px 0 ${INK}`, fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap", rotate: `${rot}deg`, letterSpacing: 4}}>{text}</div>
);

// ---- 一盘饭：盘子 + 米饭 + 菜；eaten = 0~1 吃掉多少 ----
export const Plate: React.FC<{w: number; eaten?: number}> = ({w, eaten = 0}) => {
  const h = w * 0.62;
  const left = 1 - eaten;
  return (
    <svg width={w} height={h} viewBox="0 0 300 186" style={{overflow: "visible"}}>
      <ellipse cx={150} cy={120} rx={146} ry={58} fill="#FFFDF6" stroke={INK} strokeWidth={6} />
      <ellipse cx={150} cy={114} rx={110} ry={40} fill="#F1E7D3" stroke={INK} strokeWidth={4} />
      {left > 0 ? (
        <g style={{transformOrigin: "150px 110px", transform: `scale(${0.25 + left * 0.75})`}}>
          <path d="M60 112 Q70 50 150 46 Q230 50 240 112 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <path d="M150 50 Q200 52 226 100 L150 106 Z" fill="#E06A3B" stroke={INK} strokeWidth={5} />
          <circle cx={110} cy={80} r={10} fill={GRN} stroke={INK} strokeWidth={4} />
          <circle cx={190} cy={78} r={8} fill={GRN} stroke={INK} strokeWidth={4} />
          <circle cx={168} cy={92} r={7} fill={YEL} stroke={INK} strokeWidth={3} />
        </g>
      ) : null}
      {eaten > 0.6 ? (
        <g opacity={interpolate(eaten, [0.6, 1], [0, 1], C)}>
          <circle cx={118} cy={108} r={4} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
          <circle cx={176} cy={114} r={4} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
          <circle cx={150} cy={100} r={3} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
        </g>
      ) : null}
    </svg>
  );
};

// ---- 餐厅小门面 ----
export const Diner: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.8} viewBox="0 0 300 240" style={{overflow: "visible"}}>
    <rect x={20} y={70} width={260} height={160} fill="#FFFDF6" stroke={INK} strokeWidth={6} />
    <path d="M10 70 L40 20 L260 20 L290 70 Z" fill={RED} stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${10 + i * 56} 70 q28 26 56 0`} fill={i % 2 ? RED : "#FFFDF6"} stroke={INK} strokeWidth={5} />
    ))}
    <rect x={40} y={120} width={110} height={80} fill="#CFE3F5" stroke={INK} strokeWidth={5} />
    <rect x={180} y={110} width={70} height={120} fill={YEL} stroke={INK} strokeWidth={5} />
    <circle cx={238} cy={172} r={5} fill={INK} />
    <text x={150} y={56} textAnchor="middle" fontSize={34} fontWeight={900} fill="#FFF6E6">餐 厅</text>
  </svg>
);

// ---- 菜谱卷轴：p = 0~1 展开程度；steps 一行一步 ----
export const Recipe: React.FC<{w: number; p: number; steps: string[]; title?: string; size?: number}> = ({w, p, steps, title = "菜谱", size = 40}) => {
  const rowH = size * 1.55;
  const full = 110 + steps.length * rowH + 30;
  const h = 70 + (full - 70) * p;
  return (
    <div style={{position: "relative", width: w, height: h + 40}}>
      <div style={{position: "absolute", left: 18, top: 20, width: w - 36, height: h, backgroundColor: "#FFF8E3", border: `6px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`, overflow: "hidden"}}>
        <div style={{position: "absolute", left: 0, top: 18, width: "100%", textAlign: "center", fontSize: size * 1.25, fontWeight: 900, color: RED, letterSpacing: 8}}>{title}</div>
        {steps.map((s, i) => (
          <div key={i} style={{position: "absolute", left: 34, top: 100 + i * rowH, display: "flex", alignItems: "center", gap: 16, fontSize: size, fontWeight: 800, color: INK, whiteSpace: "nowrap", opacity: interpolate(p, [i / steps.length, (i + 1) / steps.length], [0, 1], C)}}>
            <div style={{width: size * 1.1, height: size * 1.1, borderRadius: "50%", backgroundColor: YEL, border: `4px solid ${INK}`, fontSize: size * 0.7, display: "flex", alignItems: "center", justifyContent: "center"}}>{i + 1}</div>
            {s}
          </div>
        ))}
      </div>
      <div style={{position: "absolute", left: 0, top: 0, width: w, height: 40, borderRadius: 20, backgroundColor: "#C9A77E", border: `6px solid ${INK}`}} />
      <div style={{position: "absolute", left: 0, top: h + 4, width: w, height: 40, borderRadius: 20, backgroundColor: "#C9A77E", border: `6px solid ${INK}`}} />
    </div>
  );
};

// ---- 软件盒子：lock = 闭源（黑盒 + 锁）；否则盖子打开、露出代码行 ----
export const AppBox: React.FC<{w: number; lock: boolean; open?: number; label: string; color?: string}> = ({w, lock, open = 1, label, color = BLU}) => {
  const h = w * 0.9;
  return (
    <div style={{position: "relative", width: w, height: h}}>
      <div style={{position: "absolute", left: 0, top: h * 0.3, width: w, height: h * 0.7, backgroundColor: lock ? "#3A2F28" : color, border: `6px solid ${INK}`, borderRadius: 18, boxShadow: `9px 11px 0 ${INK}`}}>
        <div style={{position: "absolute", left: 0, top: h * 0.22, width: "100%", textAlign: "center", fontSize: w * 0.13, fontWeight: 900, color: "#FFF6E6", whiteSpace: "nowrap"}}>{label}</div>
      </div>
      {lock ? (
        <svg width={w * 0.36} height={w * 0.4} viewBox="0 0 90 100" style={{position: "absolute", left: w * 0.32, top: h * 0.02, overflow: "visible"}}>
          <path d="M22 46 V30 a23 23 0 0 1 46 0 V46" fill="none" stroke={INK} strokeWidth={10} />
          <rect x={8} y={44} width={74} height={54} rx={10} fill={YEL} stroke={INK} strokeWidth={6} />
          <circle cx={45} cy={68} r={8} fill={INK} />
        </svg>
      ) : (
        <div style={{position: "absolute", left: w * 0.08, top: h * 0.3 - h * 0.62 * open, width: w * 0.84, height: h * 0.62, backgroundColor: "#FFFDF6", border: `5px solid ${INK}`, borderRadius: 12, padding: 14, opacity: open}}>
          {["<div>", "  menu()", "  cook()", "</div>"].map((l, i) => (
            <div key={i} style={{fontFamily: "Consolas, monospace", fontSize: w * 0.075, fontWeight: 800, color: i % 3 ? GRN : RED, whiteSpace: "pre", lineHeight: 1.3}}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- 书架：n 本书，lit = 前几本已经放上去；每本书有颜色和小名字 ----
const BOOKC = [RED, BLU, GRN, YEL, "#E06A3B", "#8A6BBE"];
// pops = 每本书的出现进度 0~1（给了就按它一本本落下来，不给就按 lit 直接亮）
export const Shelf: React.FC<{w: number; rows?: number; per?: number; lit: number; names?: string[]; bug?: number[]; pops?: number[]}> = ({w, rows = 3, per = 7, lit, names = [], bug = [], pops}) => {
  const rowH = 150;
  const bw = (w - 60) / per;
  return (
    <div style={{position: "relative", width: w, height: rows * rowH + 40, backgroundColor: "#C9A77E", border: `7px solid ${INK}`, borderRadius: 14, boxShadow: `10px 12px 0 ${INK}`}}>
      {Array.from({length: rows}).map((_, r) => (
        <div key={r} style={{position: "absolute", left: 16, top: 16 + r * rowH, width: w - 46, height: rowH - 16, backgroundColor: "#8B6A48", border: `5px solid ${INK}`}}>
          {Array.from({length: per}).map((__, k) => {
            const i = r * per + k;
            const pp = pops ? Math.max(0, Math.min(1, pops[i] ?? 0)) : i < lit ? 1 : 0;
            const on = pp > 0;
            const dropY = pops ? (1 - pp) * -60 + Math.sin(pp * Math.PI) * 6 : on ? 0 : -40;
            const tall = 0.72 + ((i * 37) % 23) / 100;
            return (
              <div key={k} style={{position: "absolute", left: 6 + k * bw, bottom: 0, width: bw - 10, height: (rowH - 26) * tall, backgroundColor: BOOKC[i % BOOKC.length], border: `5px solid ${INK}`, borderRadius: "6px 6px 0 0", opacity: pops ? Math.min(1, pp * 2.5) : on ? 1 : 0, translate: `0px ${dropY}px`}}>
                <div style={{position: "absolute", left: 0, top: 14, width: "100%", height: 8, backgroundColor: "rgba(255,246,230,0.8)"}} />
                {names[i] ? <div style={{position: "absolute", left: "50%", top: 30, translate: "-50% 0", writingMode: "vertical-rl", fontSize: 22, fontWeight: 900, color: "#FFF6E6", whiteSpace: "nowrap"}}>{names[i]}</div> : null}
                {bug.includes(i) ? <div style={{position: "absolute", left: "50%", top: -26, translate: "-50% 0", fontSize: 40}}>🐞</div> : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---- 斜放的窗口卡（参考阿柠开场）：红黄绿三点 + 标题 + 内容，带透视 ----
export const TiltWin: React.FC<{w: number; h: number; title: string; ry?: number; rx?: number; children?: React.ReactNode; fill?: string}> = ({w, h, title, ry = 0, rx = 0, children, fill = "#FFFDF6"}) => (
  <div style={{width: w, height: h, transform: `perspective(1400px) rotateY(${ry}deg) rotateX(${rx}deg)`}}>
    <div style={{position: "relative", width: w, height: h, backgroundColor: fill, border: `6px solid ${INK}`, borderRadius: 18, boxShadow: `10px 12px 0 ${INK}`, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: "100%", height: 44, backgroundColor: YEL, borderBottom: `5px solid ${INK}`}}>
        {[RED, "#FFF6E6", GRN].map((c, i) => (
          <div key={c} style={{position: "absolute", left: 16 + i * 30, top: 11, width: 18, height: 18, borderRadius: "50%", backgroundColor: c, border: `3px solid ${INK}`}} />
        ))}
        <div style={{position: "absolute", left: 120, top: 2, fontSize: 26, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
      </div>
      <div style={{position: "absolute", left: 0, top: 44, width: "100%", height: h - 44}}>{children}</div>
    </div>
  </div>
);

// ---- 鼠标光标 + 名字标签（参考阿柠："AI 在操作"） ----
export const Cursor: React.FC<{size?: number; label?: string; color?: string}> = ({size = 70, label, color = BLU}) => (
  <div style={{position: "relative", width: size, height: size}}>
    <svg width={size} height={size} viewBox="0 0 40 40" style={{overflow: "visible"}}>
      <path d="M4 2 L4 32 L12 25 L18 38 L24 35 L18 23 L29 23 Z" fill="#FFFFFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </svg>
    {label ? <div style={{position: "absolute", left: size * 0.7, top: size * 0.75, padding: "4px 14px 6px", borderRadius: 8, backgroundColor: color, color: "#FFF6E6", fontSize: size * 0.42, fontWeight: 900, border: `4px solid ${INK}`, whiteSpace: "nowrap"}}>{label}</div> : null}
  </div>
);

// ---- 压缩包：拉链盒子，open = 0~1 拉开 ----
export const ZipBox: React.FC<{w: number; open?: number}> = ({w, open = 0}) => {
  const h = w * 0.78;
  return (
    <svg width={w} height={h} viewBox="0 0 200 156" style={{overflow: "visible"}}>
      <rect x={10} y={30} width={180} height={120} rx={14} fill={YEL} stroke={INK} strokeWidth={6} />
      <g style={{transformOrigin: "100px 30px", transform: `rotateX(${open * 70}deg)`}}>
        <rect x={10} y={4} width={180} height={34} rx={10} fill="#E9B23A" stroke={INK} strokeWidth={6} />
      </g>
      <rect x={86} y={30} width={28} height={120} fill="#FFFDF6" stroke={INK} strokeWidth={4} />
      {Array.from({length: 7}).map((_, i) => (
        <line key={i} x1={86} x2={114} y1={42 + i * 15} y2={42 + i * 15} stroke={INK} strokeWidth={4} />
      ))}
      <text x={100} y={105} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK} style={{paintOrder: "stroke"}} stroke="#FFFDF6" strokeWidth={8}>
        ZIP
      </text>
    </svg>
  );
};

// ---- 小人头像（贡献者）：一排排小圆脸 ----
export const Heads: React.FC<{n: number; show: number; cols?: number; size?: number}> = ({n, show, cols = 10, size = 64}) => (
  <div style={{position: "relative", width: cols * (size + 12), height: Math.ceil(n / cols) * (size + 12)}}>
    {Array.from({length: n}).map((_, i) => {
      const on = i < show;
      return (
        <div key={i} style={{position: "absolute", left: (i % cols) * (size + 12), top: Math.floor(i / cols) * (size + 12), width: size, height: size, borderRadius: "50%", backgroundColor: BOOKC[(i * 7) % BOOKC.length], border: `4px solid ${INK}`, opacity: on ? 1 : 0, scale: on ? "1" : "0.3"}}>
          <div style={{position: "absolute", left: size * 0.26, top: size * 0.36, width: size * 0.1, height: size * 0.14, borderRadius: "50%", backgroundColor: INK}} />
          <div style={{position: "absolute", left: size * 0.58, top: size * 0.36, width: size * 0.1, height: size * 0.14, borderRadius: "50%", backgroundColor: INK}} />
          <div style={{position: "absolute", left: size * 0.33, top: size * 0.6, width: size * 0.3, height: size * 0.12, borderBottom: `3px solid ${INK}`, borderRadius: "0 0 50% 50%"}} />
        </div>
      );
    })}
  </div>
);

// ---- 施工路障（还在快速改） ----
export const Barrier: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 200 120" style={{overflow: "visible"}}>
    <rect x={10} y={20} width={180} height={44} rx={6} fill="#FFFDF6" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${22 + i * 44} 22 l26 0 l-22 40 l-26 0 Z`} fill={RED} />
    ))}
    <rect x={10} y={20} width={180} height={44} rx={6} fill="none" stroke={INK} strokeWidth={6} />
    <rect x={30} y={64} width={14} height={54} fill="#C9A77E" stroke={INK} strokeWidth={5} />
    <rect x={156} y={64} width={14} height={54} fill="#C9A77E" stroke={INK} strokeWidth={5} />
  </svg>
);

// ---- 进度条（下载 / 安装） ----
export const Progress: React.FC<{w: number; p: number; label: string; color?: string}> = ({w, p, label, color = GRN}) => (
  <div style={{display: "flex", alignItems: "center", gap: 20}}>
    <div style={{width: 210, fontSize: 40, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
    <div style={{position: "relative", width: w, height: 46, backgroundColor: "#FFFDF6", border: `5px solid ${INK}`, borderRadius: 999, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: `${p * 100}%`, height: "100%", backgroundColor: color, borderRight: p > 0 && p < 1 ? `4px solid ${INK}` : undefined}} />
    </div>
    <div style={{width: 60, fontSize: 44, fontWeight: 900, color: p >= 1 ? GRN : "rgba(43,33,28,0.4)"}}>{p >= 1 ? "✓" : ""}</div>
  </div>
);

// ---- 浏览器地址栏：url 逐字被选中（sel = 0~1），copied 显示“已复制” ----
export const AddrBar: React.FC<{w: number; url: string; sel?: number; copied?: boolean}> = ({w, url, sel = 0, copied = false}) => (
  <div style={{position: "relative", width: w, height: 96, backgroundColor: "#FFFDF6", border: `6px solid ${INK}`, borderRadius: 48, boxShadow: `8px 10px 0 ${INK}`, display: "flex", alignItems: "center", padding: "0 34px", gap: 18}}>
    <div style={{fontSize: 40}}>🔒</div>
    <div style={{position: "relative", fontSize: 44, fontWeight: 800, color: INK, whiteSpace: "nowrap", fontFamily: "Consolas, monospace"}}>
      <div style={{position: "absolute", left: -6, top: 2, width: `calc(${sel * 100}% + 12px)`, height: "100%", backgroundColor: "rgba(63,111,181,0.35)", borderRadius: 8}} />
      <span style={{position: "relative"}}>{url}</span>
    </div>
    {copied ? <div style={{position: "absolute", right: 24, top: -34, padding: "4px 18px 8px", borderRadius: 999, backgroundColor: GRN, color: "#FFF6E6", fontSize: 34, fontWeight: 900, border: `4px solid ${INK}`}}>已复制 ✓</div> : null}
  </div>
);

// ---- 浮动：缓慢上下漂（漂浮卡片用） ----
export const Float: React.FC<{amp?: number; speed?: number; phase?: number; children: React.ReactNode}> = ({amp = 10, speed = 40, phase = 0, children}) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2) * 2;
  return <div style={{translate: `0px ${Math.sin(f / speed + phase) * amp}px`}}>{children}</div>;
};

// ---- 画出来的箭头（直线 + 箭头），p = 0~1 ----
export const Arrow: React.FC<{len: number; p: number; color?: string; rot?: number; width?: number}> = ({len, p, color = RED, rot = 0, width = 12}) => (
  <svg width={len + 40} height={60} style={{overflow: "visible", rotate: `${rot}deg`, transformOrigin: "0 30px"}}>
    <line x1={0} y1={30} x2={len * p} y2={30} stroke={color} strokeWidth={width} strokeLinecap="round" />
    {p > 0.85 ? <path d={`M${len * p - 30} 6 L${len * p + 6} 30 L${len * p - 30} 54`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" /> : null}
  </svg>
);

// 0~1 的进度（按帧）
export const prog = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], {...C, easing: IO});
export const progOut = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], {...C, easing: OUT});
export const bounce = (frame: number, at: number) => interpolate(frame - at, [0, 6, 14], [0, 1.12, 1], {...C, easing: Easing.bezier(0.34, 1.56, 0.64, 1)});
