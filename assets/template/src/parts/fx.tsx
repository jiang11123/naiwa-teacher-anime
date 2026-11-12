import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {C, IO, OUT, lerp, typed} from "./Anim";

// 动效小工具：镜头推拉 + 冲击震屏、爆点、速度线、逐字跳出的大字、
// 弧线飞行、落地烟尘、数字滚动、提示词输入框、坑洞插画
const INK = "#2B211C";
const RED = "#D9362B";
const YEL = "#F7C64A";

// ---- 镜头：整个分镜的推拉摇移 + 冲击震屏 ----
// keys = [帧, 缩放, 焦点x, 焦点y]（焦点 = 画面中心对准的 1920×1080 坐标）；shakes = 震屏开始帧
export type CamKey = [number, number, number, number];
export const Cam: React.FC<{keys: CamKey[]; shakes?: number[]; drift?: boolean; children: React.ReactNode}> = ({keys, shakes = [], drift = true, children}) => {
  const frame = useCurrentFrame();
  // 每个关键帧 = "到这一帧时镜头就位"：只在它前 20 帧推过去，其余时间停住（不再整段慢慢漂）
  const ks: CamKey[] = [];
  keys.forEach((k, i) => {
    if (i > 0) ks.push([Math.max(keys[i - 1][0] + 1, k[0] - 20), ...(keys[i - 1].slice(1) as [number, number, number])]);
    ks.push(k);
  });
  const fs = ks.map((k) => k[0]);
  const pick = (i: number) =>
    ks.length === 1 ? ks[0][i] : interpolate(frame, fs, ks.map((k) => k[i]), {...C, easing: IO});
  const s = pick(1);
  // 焦点限制在画面能铺满的范围内：小幅推近时焦点写偏也不会把内容推出屏幕
  const fx = Math.min(1920 - 960 / Math.max(s, 1), Math.max(960 / Math.max(s, 1), pick(2)));
  const fy = Math.min(1080 - 540 / Math.max(s, 1), Math.max(540 / Math.max(s, 1), pick(3)));
  // 缓慢呼吸漂移，画面不会完全静止
  const dx = drift ? Math.sin(frame / 47) * 6 : 0;
  const dy = drift ? Math.cos(frame / 59) * 4 : 0;
  let sx = 0;
  let sy = 0;
  let sr = 0;
  for (const at of shakes) {
    const t = frame - at;
    if (t >= 0 && t < 14) {
      const k = (1 - t / 14) * 18;
      const st = Math.floor(t / 2);
      sx += Math.sin(st * 2.3 + at) * k;
      sy += Math.cos(st * 3.1 + at) * k * 0.7;
      sr += Math.sin(st * 1.7) * k * 0.04;
    }
  }
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(${960 - fx * s + dx + sx}px, ${540 - fy * s + dy + sy}px) scale(${s}) rotate(${sr}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---- 爆点：一圈墨线 + 黄点向外炸开（冲击、点题时用） ----
export const Burst: React.FC<{x: number; y: number; at: number; r?: number; color?: string; n?: number}> = ({x, y, at, r = 160, color = YEL, n = 12}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 18) return null;
  const p = interpolate(t, [0, 16], [0, 1], {...C, easing: OUT});
  const fade = interpolate(t, [8, 18], [1, 0], C);
  return (
    <svg width={r * 3} height={r * 3} viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 3}`} style={{position: "absolute", left: x - r * 1.5, top: y - r * 1.5, overflow: "visible", opacity: fade, pointerEvents: "none"}}>
      {Array.from({length: n}).map((_, i) => {
        const a = (Math.PI * 2 * i) / n + 0.2;
        const r1 = r * (0.35 + p * 0.55);
        const r2 = r * (0.55 + p * 0.85);
        return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={INK} strokeWidth={9 - p * 5} strokeLinecap="round" />;
      })}
      {Array.from({length: n}).map((_, i) => {
        const a = (Math.PI * 2 * (i + 0.5)) / n;
        const rr = r * (0.3 + p * 1.05);
        return <circle key={`d${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={11 * (1 - p * 0.6)} fill={i % 2 ? color : RED} stroke={INK} strokeWidth={3} />;
      })}
    </svg>
  );
};

// ---- 速度线：漫画里的放射线，逐两帧抖动 ----
export const SpeedLines: React.FC<{at: number; out: number; cx?: number; cy?: number; color?: string}> = ({at, out, cx = 960, cy = 480, color = INK}) => {
  const frame = useCurrentFrame();
  const o = Math.min(interpolate(frame, [at, at + 6], [0, 1], C), interpolate(frame, [out, out + 6], [1, 0], C));
  if (o <= 0) return null;
  const st = Math.floor(frame / 2);
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0, opacity: o * 0.5, pointerEvents: "none"}}>
      {Array.from({length: 34}).map((_, i) => {
        const a = (Math.PI * 2 * i) / 34 + ((st * 7 + i * 13) % 10) * 0.012;
        const r1 = 520 + ((st * 31 + i * 17) % 90);
        return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * 1400} y2={cy + Math.sin(a) * 1400} stroke={color} strokeWidth={6 + (i % 3) * 4} strokeLinecap="round" />;
      })}
    </svg>
  );
};

// ---- 逐字跳出的漫画大字：每个字依次从下面弹起、带一点旋转 ----
export const Chars: React.FC<{text: string; at: number; size: number; color?: string; gap?: number; step?: number; small?: boolean; wave?: boolean}> = ({text, at, size, color = YEL, gap = 0, step = 3, small = false, wave = true}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: "flex", gap, whiteSpace: "nowrap"}}>
      {[...text].map((ch, i) => {
        const t = frame - at - i * step;
        const y = interpolate(t, [0, 10], [80, 0], {...C, easing: Easing.bezier(0.34, 1.7, 0.64, 1)});
        const s = interpolate(t, [0, 10], [0.2, 1], {...C, easing: Easing.bezier(0.34, 1.7, 0.64, 1)});
        const w = wave ? Math.sin((Math.floor(frame / 2) * 2) / 7 + i * 0.9) * size * 0.04 : 0;
        return (
          <div
            key={i}
            className={small ? "comic-text-s" : "comic-text"}
            style={{fontSize: size, fontWeight: 900, color, lineHeight: 1.1, opacity: t < 0 ? 0 : 1, translate: `0px ${y + w}px`, scale: `${s}`, rotate: `${interpolate(t, [0, 10], [i % 2 ? 14 : -14, 0], C)}deg`}}
          >
            {ch === " " ? " " : ch}
          </div>
        );
      })}
    </div>
  );
};

// ---- 弧线飞行：从 (x0,y0) 沿抛物线飞到 (x1,y1)，边飞边转 ----
export const Fly: React.FC<{from: [number, number]; to: [number, number]; at: number; dur?: number; arc?: number; spin?: number; hide?: number; children: React.ReactNode}> = ({from, to, at, dur = 18, arc = 200, spin = 0, hide, children}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {...C, easing: IO});
  if (frame < at) return null;
  if (hide !== undefined && frame > hide) return null;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p - Math.sin(Math.PI * p) * arc;
  return <div style={{position: "absolute", left: x, top: y, rotate: `${spin * p}deg`, translate: "-50% -50%"}}>{children}</div>;
};

// ---- 落地烟尘：左右各冒几团小云 ----
export const Dust: React.FC<{x: number; y: number; at: number; w?: number}> = ({x, y, at, w = 300}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 20) return null;
  const p = interpolate(t, [0, 20], [0, 1], {...C, easing: OUT});
  return (
    <div style={{position: "absolute", left: x, top: y, pointerEvents: "none"}}>
      {[-1, 1].map((d) =>
        [0, 1, 2].map((k) => (
          <div
            key={`${d}${k}`}
            style={{
              position: "absolute",
              left: d * (w * 0.2 + p * w * (0.35 + k * 0.18)) - 30,
              top: -30 - p * (20 + k * 16),
              width: 60 - k * 12,
              height: 60 - k * 12,
              borderRadius: "50%",
              backgroundColor: "#FFFDF6",
              border: `5px solid ${INK}`,
              opacity: 1 - p,
              scale: `${0.6 + p * 0.6}`,
            }}
          />
        )),
      )}
    </div>
  );
};

// ---- 数字滚动 ----
export const Count: React.FC<{from: number; to: number; at: number; dur?: number; suffix?: string; style?: React.CSSProperties}> = ({from, to, at, dur = 20, suffix = "", style}) => {
  const frame = useCurrentFrame();
  const v = Math.round(lerp(frame, at, at + dur, from, to, OUT));
  return <span style={style}>{`${v}${suffix}`}</span>;
};

// ---- 提示词输入框：「直接照着用的话」逐字打进对话框 → 发送键按下 ----
// segs = [文字, 是否高亮]；高亮的词打完后刷上黄色荧光笔
export const PromptBox: React.FC<{w: number; segs: [string, boolean][]; at: number; cps?: number; send?: number; size?: number; label?: string}> = ({w, segs, at, cps = 16, send, size = 50, label = "直接复制这句"}) => {
  const frame = useCurrentFrame();
  const full = segs.map((s) => s[0]).join("");
  const n = [...typed(full, frame, at, cps)].length;
  let used = 0;
  const pressed = send !== undefined && frame >= send && frame < send + 8;
  const sent = send !== undefined && frame >= send;
  return (
    <div style={{position: "relative", width: w, borderRadius: "30px 36px 26px 34px", backgroundColor: "#FFFDF6", border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, padding: "70px 56px 120px"}}>
      <div style={{position: "absolute", left: 40, top: -34, rotate: "-2deg"}}>
        <div style={{display: "inline-block", padding: "6px 26px 10px", borderRadius: 999, backgroundColor: INK, color: "#FFF6E6", fontSize: 40, fontWeight: 900, boxShadow: `inset 0 -7px 0 ${YEL}`, whiteSpace: "nowrap"}}>📋 {label}</div>
      </div>
      <div style={{fontSize: size, fontWeight: 800, color: INK, lineHeight: 1.55, wordBreak: "break-all"}}>
        “
        {segs.map(([t, hi], i) => {
          const chars = [...t];
          const shown = Math.max(0, Math.min(chars.length, n - used));
          used += chars.length;
          if (shown === 0) return null;
          const done = n >= used;
          const hp = hi && done ? interpolate(frame, [at + (used / cps) * 30, at + (used / cps) * 30 + 8], [0, 100], C) : 0;
          return (
            <span key={i} style={{color: hi ? RED : INK, backgroundImage: hi ? `linear-gradient(transparent 58%, rgba(247,198,74,0.85) 58%)` : undefined, backgroundSize: `${hp}% 100%`, backgroundRepeat: "no-repeat"}}>
              {chars.slice(0, shown).join("")}
            </span>
          );
        })}
        {n >= [...full].length ? "”" : <span style={{color: RED, opacity: Math.floor(frame / 5) % 2 ? 1 : 0.15}}>▌</span>}
      </div>
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 30,
          width: 84,
          height: 84,
          borderRadius: "50%",
          backgroundColor: sent ? GRN_ : RED,
          border: `6px solid ${INK}`,
          boxShadow: pressed ? `1px 2px 0 ${INK}` : `6px 7px 0 ${INK}`,
          translate: pressed ? "5px 5px" : "0px 0px",
          color: "#fff",
          fontSize: 48,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: "70px",
        }}
      >
        {sent ? "✓" : "↑"}
      </div>
      <div style={{position: "absolute", left: 56, bottom: 46, fontSize: 30, fontWeight: 800, color: "#9A8C7A"}}>发给 AI · Enter</div>
    </div>
  );
};
const GRN_ = "#4E8A4A";

// ---- 坑洞插画：椭圆黑洞 + 土色坑沿 + 小石子；open = 0~1 张开程度 ----
export const Pit: React.FC<{w: number; open?: number; label?: string}> = ({w, open = 1, label}) => {
  const h = w * 0.36;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: "visible"}}>
      <ellipse cx={w / 2} cy={h / 2} rx={(w / 2) * open} ry={(h / 2) * open} fill="#A07850" stroke={INK} strokeWidth={7} />
      <ellipse cx={w / 2} cy={h / 2 + h * 0.06 * open} rx={(w / 2 - 34) * open} ry={(h / 2 - 22) * open} fill="#1B1410" stroke={INK} strokeWidth={5} />
      {open > 0.5
        ? [0.12, 0.3, 0.72, 0.88].map((k, i) => <circle key={i} cx={w * k} cy={i % 2 ? h * 0.12 : h * 0.86} r={9} fill="#C9A77E" stroke={INK} strokeWidth={4} />)
        : null}
      {label && open > 0.8 ? (
        <text x={w / 2} y={h / 2 + 22} textAnchor="middle" fontSize={56} fontWeight={900} fill={YEL} style={{paintOrder: "stroke"}} stroke={INK} strokeWidth={8}>
          {label}
        </text>
      ) : null}
    </svg>
  );
};

// ---- 一直在摇摆的包裹层（逐两帧，手绘节奏） ----
export const Wobble: React.FC<{deg?: number; speed?: number; children: React.ReactNode; origin?: string}> = ({deg = 3, speed = 8, children, origin = "50% 100%"}) => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2) * 2;
  return <div style={{rotate: `${Math.sin(f / speed) * deg}deg`, transformOrigin: origin}}>{children}</div>;
};

// ---- 鼓一下：在指定帧做一次放大回弹 ----
export const usePulse = (ats: number[], amt = 0.12) => {
  const frame = useCurrentFrame();
  let s = 1;
  for (const a of ats) s += interpolate(frame - a, [0, 4, 12], [0, amt, 0], C);
  return s;
};

// ---- 开场居中再让位：先出来的一组元素一开始整体居中，等后面的元素要出场时（at）再滑到它自己的位置 ----
// 用法：const sx = slideX(frame, 某帧, 偏移)；元素写 x={原位置 + sx}
export const slideX = (frame: number, at: number, dx: number, dur = 16) => interpolate(frame, [at, at + dur], [dx, 0], {...C, easing: IO});

// ---- 整组平移：一开始只有这一组时把它挪到画面正中，后面的元素出来时再滑回原位（3D 层次不受影响）----
export const Shift: React.FC<{x: number; children: React.ReactNode}> = ({x, children}) => (
  <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformStyle: "preserve-3d", transform: `translateX(${x}px)`}}>{children}</div>
);
