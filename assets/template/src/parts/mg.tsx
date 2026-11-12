import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {C} from "./Anim";
import {CREAM, INK, RED, YEL} from "./kit";

// 开场 MG 动效：放射光背景、滚动数字、扫光、弹窗广告、往前冲的箭头条
const SPRING = Easing.bezier(0.34, 1.56, 0.64, 1);

// 放射光背景：一圈彩色光条绕中心慢慢转（cx, cy 是中心），color 可以随时换（比如变红）
export const Sunburst: React.FC<{cx?: number; cy?: number; color?: string; opacity?: number; speed?: number; n?: number}> = ({cx = 960, cy = 480, color = YEL, opacity = 0.35, speed = 0.25, n = 24}) => {
  const frame = useCurrentFrame();
  const R = 2200;
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0, opacity}}>
      <g transform={`translate(${cx} ${cy}) rotate(${frame * speed})`}>
        {Array.from({length: n}, (_, i) => {
          const a0 = (Math.PI * 2 * i) / n;
          const a1 = a0 + Math.PI / n;
          return <path key={i} d={`M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} L${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={color} />;
        })}
      </g>
    </svg>
  );
};

// 滚动数字：steps = [[帧, 文字], ...]，到点时旧文字往上滚走、新文字从下面弹上来（老虎机式）
export const Roll: React.FC<{steps: [number, string][]; size: number; color?: string; dur?: number; className?: string}> = ({steps, size, color = INK, dur = 10, className}) => {
  const frame = useCurrentFrame();
  let i = 0;
  while (i + 1 < steps.length && frame >= steps[i + 1][0]) i++;
  const at = steps[i][0];
  const p = i === 0 ? 1 : interpolate(frame, [at, at + dur], [0, 1], {...C, easing: SPRING});
  const prev = i > 0 ? steps[i - 1][1] : "";
  const h = size * 1.2;
  return (
    <div style={{position: "relative", height: h, overflow: "hidden", display: "inline-block"}}>
      <div style={{visibility: "hidden", fontSize: size, fontWeight: 900, lineHeight: `${h}px`, whiteSpace: "nowrap"}} className={className}>
        {steps.reduce((a, s) => (s[1].length > a.length ? s[1] : a), "")}
      </div>
      {i > 0 ? (
        <div className={className} style={{position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", fontSize: size, fontWeight: 900, color, lineHeight: `${h}px`, whiteSpace: "nowrap", translate: `0px ${-p * h}px`, opacity: 1 - p}}>
          {prev}
        </div>
      ) : null}
      <div className={className} style={{position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", fontSize: size, fontWeight: 900, color, lineHeight: `${h}px`, whiteSpace: "nowrap", translate: `0px ${(1 - p) * h}px`}}>
        {steps[i][1]}
      </div>
    </div>
  );
};

// 扫光：一道斜白光从左扫到右（放在 overflow:hidden 的卡片里），ats = 每次扫光开始的帧
export const Shine: React.FC<{ats: number[]; w: number; h: number; dur?: number}> = ({ats, w, h, dur = 14}) => {
  const frame = useCurrentFrame();
  const at = [...ats].reverse().find((a) => frame >= a);
  if (at === undefined || frame > at + dur) return null;
  const x = interpolate(frame, [at, at + dur], [-w * 0.4, w * 1.2], {...C, easing: Easing.bezier(0.45, 0, 0.55, 1)});
  return <div style={{position: "absolute", left: x, top: -h * 0.2, width: w * 0.16, height: h * 1.4, background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)", rotate: "18deg", pointerEvents: "none"}} />;
};

// 大价格卡：圆角厚卡片 + 顶部小标签 + 中间滚动大数字，卡片自带扫光
export const PriceCard: React.FC<{w: number; label: string; steps: [number, string][]; fill?: string; size?: number; shine?: number[]; numColor?: string}> = ({w, label, steps, fill = YEL, size = 220, shine = [], numColor = INK}) => {
  const h = size * 1.75;
  return (
    <div style={{position: "relative", width: w, height: h, borderRadius: 48, backgroundColor: fill, border: `10px solid ${INK}`, boxShadow: `16px 18px 0 ${INK}`, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: size * 0.14, textAlign: "center", fontSize: size * 0.26, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{label}</div>
      <div style={{position: "absolute", left: 0, right: 0, top: size * 0.46, display: "flex", justifyContent: "center"}}>
        <Roll steps={steps} size={size} color={numColor} />
      </div>
      <Shine ats={shine} w={w} h={h} />
    </div>
  );
};

// 弹窗广告：浏览器小窗（标题栏三个点 + 关闭叉）+ 大字口号 + 小字，按 at 弹出（先拉高再回弹）
export const Popup: React.FC<{w: number; title: string; big: string; small?: string; bar?: string; fill?: string}> = ({w, title, big, small, bar = RED, fill = CREAM}) => (
  <div style={{width: w, borderRadius: 22, backgroundColor: fill, border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, overflow: "hidden"}}>
    <div style={{height: w * 0.11, backgroundColor: bar, borderBottom: `6px solid ${INK}`, display: "flex", alignItems: "center", padding: `0 ${w * 0.04}px`, gap: w * 0.02}}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{width: w * 0.035, height: w * 0.035, borderRadius: "50%", backgroundColor: CREAM, border: `4px solid ${INK}`}} />
      ))}
      <div style={{flex: 1, marginLeft: w * 0.02, fontSize: w * 0.05, fontWeight: 900, color: CREAM, whiteSpace: "nowrap", overflow: "hidden"}}>{title}</div>
      <div style={{fontSize: w * 0.06, fontWeight: 900, color: CREAM}}>✕</div>
    </div>
    <div style={{padding: `${w * 0.05}px ${w * 0.05}px ${w * 0.06}px`, textAlign: "center"}}>
      <div style={{fontSize: w * 0.12, fontWeight: 900, color: RED, whiteSpace: "nowrap", lineHeight: 1.15}}>{big}</div>
      {small ? <div style={{marginTop: w * 0.02, fontSize: w * 0.055, fontWeight: 800, color: INK, whiteSpace: "nowrap"}}>{small}</div> : null}
    </div>
  </div>
);

// 弹出动画包裹：at 帧从 0 弹到 1（先拉高再回弹），之后轻轻上下浮
export const PopIn: React.FC<{at: number; x: number; y: number; rot?: number; float?: number; children: React.ReactNode}> = ({at, x, y, rot = 0, float = 6, children}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const s = interpolate(t, [0, 5, 9, 13], [0.2, 1.12, 0.96, 1], C);
  const sy = interpolate(t, [0, 5, 9, 13], [0.2, 0.92, 1.05, 1], C);
  const fl = Math.sin((frame + at * 3) / 11) * float;
  return <div style={{position: "absolute", left: x, top: y, scale: `${s} ${sy}`, rotate: `${rot}deg`, translate: `0px ${fl}px`, transformOrigin: "50% 100%"}}>{children}</div>;
};

// 往前冲的箭头条：一排 V 形箭头一直向右流动（"便宜好几倍"那种方向感），w×h 区域
export const Chevrons: React.FC<{w: number; h: number; color?: string; speed?: number}> = ({w, h, color = RED, speed = 6}) => {
  const frame = useCurrentFrame();
  const step = h * 0.9;
  const off = (frame * speed) % step;
  const n = Math.ceil(w / step) + 2;
  return (
    <div style={{position: "relative", width: w, height: h, overflow: "hidden"}}>
      {Array.from({length: n}, (_, i) => (
        <svg key={i} width={h * 0.7} height={h} viewBox="0 0 70 100" style={{position: "absolute", left: i * step - step + off, top: 0, opacity: 0.35 + 0.65 * ((i + 1) / n)}}>
          <path d="M8 6 L58 50 L8 94" fill="none" stroke={color} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
};

// 放大镜：圆镜片 + 手柄（镜片里有一点高光）
export const Lens: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: "visible"}}>
    <line x1={130} y1={130} x2={190} y2={190} stroke={INK} strokeWidth={26} strokeLinecap="round" />
    <line x1={130} y1={130} x2={190} y2={190} stroke="#9A6440" strokeWidth={14} strokeLinecap="round" />
    <circle cx={82} cy={82} r={70} fill="rgba(207,227,245,0.55)" stroke={INK} strokeWidth={14} />
    <path d="M45 62 Q55 40 80 36" fill="none" stroke={CREAM} strokeWidth={10} strokeLinecap="round" />
  </svg>
);
