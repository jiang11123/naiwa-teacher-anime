import React from "react";
import {Easing, Interactive, interpolate, useCurrentFrame} from "remotion";
import {FRAMING} from "../framing";

// 动画小工具：分镜里大部分元素都是"某一帧出场 → 停住 → （可选）某一帧退场"，统一用 <A> 包一层
// 出场方式 kind：pop 弹出 / drop 从上砸下 / rise 从下浮起 / left 从左滑入 / right 从右滑入 / fade 淡入 / stamp 盖章 / flip 翻牌 / squash 压扁弹起
export const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IO = Easing.bezier(0.65, 0, 0.35, 1);
export const lerp = (f: number, a: number, b: number, from: number, to: number, easing = IO) => interpolate(f, [a, b], [from, to], {...C, easing});

export type Kind = "pop" | "drop" | "rise" | "left" | "right" | "fade" | "stamp" | "flip" | "squash";

const enter = (kind: Kind, t: number) => {
  // t = 出场后的帧数
  const o = interpolate(t, [0, 4], [0, 1], C);
  switch (kind) {
    case "pop":
      return {o, s: interpolate(t, [0, 14], [0.5, 1], {...C, easing: BACK}), x: 0, y: 0, r: 0, ry: 0};
    case "drop":
      return {o, s: 1, x: 0, y: interpolate(t, [0, 12], [-260, 0], {...C, easing: Easing.bezier(0.34, 1.4, 0.64, 1)}), r: interpolate(t, [0, 12], [-8, 0], C), ry: 0};
    case "rise":
      return {o, s: 1, x: 0, y: interpolate(t, [0, 14], [70, 0], {...C, easing: OUT}), r: 0, ry: 0};
    case "left":
      return {o, s: 1, x: interpolate(t, [0, 14], [-320, 0], {...C, easing: Easing.bezier(0.34, 1.3, 0.64, 1)}), y: 0, r: 0, ry: 0};
    case "right":
      return {o, s: 1, x: interpolate(t, [0, 14], [320, 0], {...C, easing: Easing.bezier(0.34, 1.3, 0.64, 1)}), y: 0, r: 0, ry: 0};
    case "stamp":
      return {o: interpolate(t, [0, 2], [0, 1], C), s: interpolate(t, [0, 6, 11], [2.6, 0.92, 1], C), x: 0, y: 0, r: 0, ry: 0};
    case "flip":
      return {o, s: 1, x: 0, y: 0, r: 0, ry: interpolate(t, [0, 16], [90, 0], {...C, easing: BACK})};
    case "squash":
      return {o, s: 1, x: 0, y: 0, r: 0, ry: 0};
    default:
      return {o: interpolate(t, [0, 8], [0, 1], C), s: 1, x: 0, y: 0, r: 0, ry: 0};
  }
};

const SIDE = "#6B5442";
// 元素离展板的高度：各不相同，镜头一转就有前后层次
export const liftOf = (x: number, y: number) => 40 + ((((x * 7 + y * 13) % 5) + 5) % 5) * 45;

// 分镜退场信息（World3D 给每个分镜提供）：exitAt = 这一帧起元素依次缩回退场（下一个分镜“镜头不动、组件换”时用）
// keepShot = 下一个分镜接着用同一个截图窗口（旧窗口在 exitAt 直接让位）；enterKeep = 本分镜的截图窗口不做进场
// place = 这块展板在 3D 世界里的位置（World3D 给）：元素把自己登记到地面上，地面画影子、落地波纹、跳动的光点（背景和组件互动）
export type SceneInfo = {flat2d?: boolean; exitAt?: number; handoffAt?: number; keepShot?: boolean; enterKeep?: boolean; place?: {x: number; y: number; z: number; ry: number; k: number; fx: number; fy: number; f0: number}};
export type FloorItem = {X: number; Y: number; Z: number; w: number; at: number; o: number; big: boolean};
// 每一帧 World3D 先清空，展板里的元素渲染时往里登记，地面（在元素之后渲染、但画在最底层）再读出来
export const floorReg: {frame: number; items: FloorItem[]} = {frame: -1, items: []};
export const SceneCtx = React.createContext<SceneInfo>({});

export const A: React.FC<{
  name: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  at: number;
  kind?: Kind;
  out?: number;
  rot?: number;
  origin?: string;
  bob?: number;
  boil?: "boil" | "boil-strong" | "";
  flat?: boolean;
  hideAt?: number; // 这一帧起直接消失（交给 Morph 变形接走）
  handoff?: boolean; // 换分镜时不退场，直接交给下一个分镜的 Morph 接走
  lift?: number; // 离展板的高度（不给就按位置算）：互相重叠的元素要显式分层，不然摆动时会穿模
  dx?: number; // 整组滑动的偏移：只挪位置，不参与算高度/摆动（不然滑动时坐标一直变，元素会一上一下地跳）
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({name, x, y, w, h, at, kind = "pop", out, rot = 0, origin = "50% 50%", bob = 0, boil = "boil", flat: flatProp = false, hideAt, handoff = false, lift: liftProp, dx = 0, style, children}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const e = enter(kind, t);
  const oo = out === undefined ? 1 : interpolate(frame, [out, out + 6], [1, 0], C);
  // 组件退场：镜头不动换分镜时，旧分镜的元素按各自的小延迟缩小、往下沉、淡掉
  const {exitAt, handoffAt, place, flat2d} = React.useContext(SceneCtx);
  const flat = flatProp || !!flat2d; // 2D 平面模式下所有元素自动变平（不做 3D 翻出、摆动、侧面厚度）
  const xd = 0; // 同一批组件一起退场，不错开
  const gone = (hideAt !== undefined && frame >= hideAt) || (handoff && handoffAt !== undefined && frame >= handoffAt);
  const ex = exitAt === undefined || handoff ? 0 : interpolate(frame, [exitAt + xd, exitAt + xd + 9], [0, 1], {...C, easing: Easing.bezier(0.5, 0, 0.75, 0)});
  const oy = out === undefined ? 0 : interpolate(frame, [out, out + 6], [0, 24], {...C, easing: Easing.bezier(0.55, 0, 1, 0.45)});
  const sq = kind === "squash" ? interpolate(t, [0, 5, 10, 16], [0, 1, 2, 3], C) : -1;
  const sx = sq < 0 ? e.s : interpolate(sq, [0, 1, 2, 3], [1.3, 0.85, 1.05, 1]);
  const sy = sq < 0 ? e.s : interpolate(sq, [0, 1, 2, 3], [0.5, 1.15, 0.96, 1]);
  const b = bob ? Math.sin((Math.floor(frame / 2) * 2) / 9) * bob : 0;
  // 立体：从纵深里仰着翻出来（translateZ + rotateX），停住后按各自位置轻轻空间摆动；墨色叠影 = 侧面厚度
  const d3 = flat ? 0 : interpolate(t, [0, 16], [1, 0], {...C, easing: OUT});
  const seed = (x * 7 + y * 13) % 360;
  const swayY = flat ? 0 : Math.sin(frame / 80 + seed) * 2 + (x + (w ?? 0) / 2 - 960) / 960 * -7;
  const swayX = flat ? 0 : Math.cos(frame / 95 + seed) * 1.2 + 4;
  const lift = flat ? 0 : liftProp ?? liftOf(x, y); // 元素离展板的高度：各不相同，镜头一转就有前后层次
  const tf = flat ? (e.ry ? `perspective(900px) rotateY(${e.ry}deg)` : undefined) : `translateZ(${lift - d3 * 120 - ex * 260}px) rotateX(${swayX + d3 * 10}deg) rotateY(${swayY + e.ry}deg)`;
  // 登记到地面：元素中心在展板上的横坐标 → 世界坐标（和 World3D 里展板的 transform 一致）
  const vis = t < 0 || gone ? 0 : e.o * oo * (1 - ex);
  if (place && !flat && vis > 0.05) {
    const ww = Math.min(w ?? 360, 760);
    const lx = (x + dx + e.x + (w ?? 360) / 2 - 960 + place.fx) * place.k;
    const r0 = (place.ry * Math.PI) / 180;
    const ly = (y + e.y + (h ?? ww * 0.55) / 2 - 540 + place.fy) * place.k;
    floorReg.items.push({X: place.x + lx * Math.cos(r0), Y: place.y + ly, Z: place.z - lx * Math.sin(r0), w: ww * place.k * sx, at: place.f0 + at, o: vis, big: kind === "drop" || kind === "stamp" || kind === "squash"});
  }
  const ext = flat ? "" : ` drop-shadow(2px 3px 0 ${SIDE}) drop-shadow(2px 3px 0 ${SIDE}) drop-shadow(2px 3px 0 #2B211C)`;
  return (
    <Interactive.Div
      name={name}
      className={boil}
      style={{
        position: "absolute",
        left: x + dx,
        top: y,
        width: w,
        height: h,
        transformOrigin: kind === "squash" ? "50% 100%" : origin,
        opacity: t < 0 || gone ? 0 : e.o * oo * (1 - ex),
        scale: `${sx * (1 - ex * 0.45)} ${sy * (1 - ex * 0.45)}`,
        translate: `${e.x}px ${e.y + oy + b + ex * 70}px`,
        rotate: `${rot + e.r}deg`,
        transform: tf,
        filter: `${boil ? `url(#${boil})` : ""}${ext}` || undefined,
        ...style,
      }}
    >
      {children}
    </Interactive.Div>
  );
};

// 整个分镜的退场：最后几帧向左淡出（下一个分镜接在转场里时可以不用）
export const SceneOut: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1300,
        height: 860,
        opacity: interpolate(frame, [at, at + 8], [1, 0], C),
        translate: `${interpolate(frame, [at, at + 8], [0, -110], {...C, easing: Easing.bezier(0.55, 0, 1, 0.45)})}px 0px`,
      }}
    >
      {children}
    </div>
  );
};

// 逐字打出：返回 at 之后按每秒 cps 个字显示的前缀
export const typed = (text: string, frame: number, at: number, cps = 14) => {
  const n = Math.max(0, Math.floor(((frame - at) / 30) * cps));
  return [...text].slice(0, n).join("");
};

// 手写式擦出（从左往右露出）：p = 0~1
export const wipe = (frame: number, at: number, dur = 12): React.CSSProperties => ({
  clipPath: `inset(-20px ${100 - interpolate(frame, [at, at + dur], [0, 100], {...C, easing: Easing.bezier(0.33, 1, 0.68, 1)})}% -20px -20px)`,
});

// ---- 常用小版式 ----
const INK = "#2B211C";

// 墨线纸卡：米白底 + 粗墨边 + 硬投影
export const Box: React.FC<{w: number; h: number; fill?: string; radius?: string; shadow?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w, h, fill = "#FFFDF6", radius = "24px 30px 20px 28px", shadow = 9, children, style}) => (
  <div style={{position: "relative", width: w, height: h, borderRadius: radius, backgroundColor: fill, border: `6px solid ${INK}`, boxShadow: `${shadow}px ${shadow + 2}px 0 ${INK}`, ...style}}>{children}</div>
);

// 黑底胶囊标签（带黄色内阴影）
export const Pill: React.FC<{children: React.ReactNode; size?: number; bg?: string; color?: string; line?: string}> = ({children, size = 44, bg = INK, color = "#FFF6E6", line = "#F7C64A"}) => (
  <div style={{display: "inline-block", padding: `${size * 0.2}px ${size * 0.7}px ${size * 0.3}px`, borderRadius: 999, backgroundColor: bg, color, fontSize: size, fontWeight: 900, whiteSpace: "nowrap", boxShadow: `inset 0 -${size * 0.16}px 0 ${line}`}}>{children}</div>
);

// 漫画描边大字
export const Comic: React.FC<{children: React.ReactNode; size: number; color?: string; small?: boolean; style?: React.CSSProperties}> = ({children, size, color = "#F7C64A", small = false, style}) => (
  <div className={small ? "comic-text-s" : "comic-text"} style={{fontSize: size, fontWeight: 900, color, whiteSpace: "nowrap", lineHeight: 1.1, ...style}}>
    {children}
  </div>
);

// 贴纸标签（彩色底 + 墨边，微微倾斜）
export const Tag: React.FC<{children: React.ReactNode; bg?: string; color?: string; size?: number}> = ({children, bg = "#FCE38A", color = INK, size = 40}) => (
  <div style={{display: "inline-block", padding: `${size * 0.22}px ${size * 0.55}px ${size * 0.3}px`, borderRadius: 14, backgroundColor: bg, color, border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, fontSize: size, fontWeight: 900, whiteSpace: "nowrap"}}>{children}</div>
);

// 变形衔接：一个东西直接“变成”下一个东西（或者同一个东西从上一个分镜搬过来），不再“旧的退场、新的出场”
// from = 起点（id = 起点所在分镜，坐标是那个分镜里的坐标；node = 起点的样子，不给就当是同一个东西直接搬过来）
// to = 终点（本分镜坐标，w = 终点宽度）；at = 本分镜第几帧开始变（换分镜接过来时就是 0）
// 两个分镜可能取景缩放不同（framing.ts），这里先把起点换算到本分镜坐标，保证接得上不跳
export const Morph: React.FC<{
  name: string;
  from: {id: string; x: number; y: number; w: number; node?: React.ReactNode};
  to: {id: string; x: number; y: number; w: number};
  at?: number;
  dur?: number;
  boil?: "boil" | "boil-strong" | "";
  out?: number;
  handoff?: boolean;
  children: React.ReactNode;
}> = ({name, from, to, at = 0, dur = 20, boil = "boil", out, handoff = false, children}) => {
  const frame = useCurrentFrame();
  const {exitAt, handoffAt} = React.useContext(SceneCtx);
  if (frame < at) return null;
  if (handoff && handoffAt !== undefined && frame >= handoffAt) return null;
  const oo = out === undefined ? 1 : interpolate(frame, [out, out + 6], [1, 0], C);
  const t = interpolate(frame, [at, at + dur], [0, 1], {...C, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  const [k1, dx1, dy1] = FRAMING[from.id] ?? [1, 0, 0];
  const [k2, dx2, dy2] = FRAMING[to.id] ?? [1, 0, 0];
  const r = k1 / k2;
  const fx = 960 - dx2 + r * (from.x - 960 + dx1);
  const fy = 540 - dy2 + r * (from.y - 540 + dy1);
  const arc = Math.sin(Math.PI * t);
  const X = fx + (to.x - fx) * t;
  const Y = fy + (to.y - fy) * t - arc * 70;
  const W = from.w * r + (to.w - from.w * r) * t;
  const lift = liftOf(from.x, from.y) + (liftOf(to.x, to.y) - liftOf(from.x, from.y)) * t;
  const oldO = from.node ? 1 - interpolate(t, [0.2, 0.65], [0, 1], C) : 0;
  const newO = from.node ? interpolate(t, [0.3, 0.75], [0, 1], C) : 1;
  // 中途压扁拉长一下（像橡皮一样变过去），落地回弹
  const sq = 1 + arc * 0.08;
  const ex = exitAt === undefined || handoff ? 0 : interpolate(frame, [exitAt, exitAt + 9], [0, 1], {...C, easing: Easing.bezier(0.5, 0, 0.75, 0)});
  const swayY = Math.sin(frame / 80 + ((to.x * 7 + to.y * 13) % 360)) * 2 + ((to.x + to.w / 2 - 960) / 960) * -7;
  return (
    <Interactive.Div
      name={name}
      className={boil}
      style={{
        position: "absolute",
        left: X,
        top: Y,
        transformOrigin: "0% 0%",
        opacity: (1 - ex) * oo,
        scale: `${(1 / sq) * (1 - ex * 0.45)} ${sq * (1 - ex * 0.45)}`,
        translate: `0px ${ex * 70}px`,
        rotate: `${arc * 7}deg`,
        transform: `translateZ(${lift - ex * 260}px) rotateX(4deg) rotateY(${swayY}deg)`,
        filter: `${boil ? `url(#${boil})` : ""} drop-shadow(2px 3px 0 ${SIDE}) drop-shadow(2px 3px 0 ${SIDE}) drop-shadow(2px 3px 0 #2B211C)`,
      }}
    >
      {oldO > 0 ? (
        <div style={{position: "absolute", left: 0, top: 0, scale: String(W / from.w), transformOrigin: "0% 0%", opacity: oldO}}>{from.node}</div>
      ) : null}
      <div style={{scale: String(W / to.w), transformOrigin: "0% 0%", opacity: newO}}>{children}</div>
    </Interactive.Div>
  );
};
