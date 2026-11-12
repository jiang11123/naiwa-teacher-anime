import React from "react";
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {A} from "./Anim";
import {CREAM, GRN, INK, RED, SOFTB, SOFTG, SOFTR, YEL} from "./palette";

// 图标库（31 个手绘图标）+ 图标小场景：
// - I(图标名, x, y, 尺寸, {fx 出场/持续动作, d 延迟帧, t 图标上的字, label 下方标签, c 颜色, v 数值, to 飞到哪})
// - Deco：在整块展板（1920×1080）上按时间撒一组图标，讲解段“不要白板加一个字”时用它补画面
// - VigScene：610×380 的小场景（菜单牌 MenuPanel 每一行配一个）
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const SHOW_KID = false;
export const VW = 610;
export const VH = 380;

export type IconName = "coin" | "cal" | "check" | "cross" | "lock" | "unlock" | "wifi" | "plug" | "eye" | "cloud" | "chip" | "receipt" | "jar" | "bars" | "shutter" | "swap" | "bowl" | "star" | "battery" | "clock" | "calc" | "app" | "doc" | "server" | "pc" | "mag" | "warn" | "shield" | "scale" | "zzz" | "arrow";
type Fx = "pop" | "drop" | "rise" | "left" | "right" | "stream" | "pulse" | "shake" | "spin" | "vanish" | "float" | "grow" | "fly";
export type Item = {ic: IconName; x: number; y: number; s: number; fx?: Fx; d?: number; label?: string; c?: string; t?: string; v?: number[]; to?: [number, number]};
export type Vig = {items: Item[]; kid?: [string, number, number, boolean?]; mark?: "check" | "cross"};

const sk = {stroke: INK, strokeWidth: 5, strokeLinejoin: "round", strokeLinecap: "round"} as const;

// 单个图标（100×100）；tt = 出场后的帧数，图标里自己会动的部分用它算
const Ic: React.FC<{n: IconName; c?: string; t?: string; v?: number[]; tt: number}> = ({n, c, t, v = [0.6], tt}) => {
  switch (n) {
    case "coin":
      return (
        <>
          <circle cx={50} cy={50} r={40} fill={c ?? YEL} {...sk} />
          <circle cx={50} cy={50} r={29} fill="none" stroke={INK} strokeWidth={3} opacity={0.35} />
          <text x={50} y={(t ?? "¥").length > 2 ? 60 : 65} textAnchor="middle" fontSize={(t ?? "¥").length > 2 ? 26 : (t ?? "¥").length > 1 ? 34 : 42} fontWeight={900} fill={INK}>{t ?? "¥"}</text>
        </>
      );
    case "cal":
      return (
        <>
          <rect x={12} y={20} width={76} height={68} rx={8} fill={CREAM} {...sk} />
          <rect x={12} y={20} width={76} height={22} rx={8} fill={c ?? RED} {...sk} />
          <path d="M32 10 V28 M68 10 V28" {...sk} />
          <text x={50} y={74} textAnchor="middle" fontSize={26} fontWeight={900} fill={INK}>{t ?? ""}</text>
        </>
      );
    case "check":
      return (
        <>
          <circle cx={50} cy={50} r={40} fill={c ?? GRN} {...sk} />
          <path d="M28 52 L44 68 L74 34" fill="none" stroke={CREAM} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "cross":
      return (
        <>
          <circle cx={50} cy={50} r={40} fill={c ?? RED} {...sk} />
          <path d="M33 33 L67 67 M67 33 L33 67" fill="none" stroke={CREAM} strokeWidth={10} strokeLinecap="round" />
        </>
      );
    case "lock":
    case "unlock":
      return (
        <>
          <path d={n === "lock" ? "M34 46 V32 a16 16 0 0 1 32 0 V46" : "M34 46 V32 a16 16 0 0 1 32 0 V38"} fill="none" {...sk} strokeWidth={8} />
          <rect x={22} y={44} width={56} height={44} rx={9} fill={c ?? YEL} {...sk} />
          <circle cx={50} cy={64} r={6} fill={INK} />
          <path d="M50 66 V78" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </>
      );
    case "wifi":
      return (
        <>
          <path d="M10 38 Q50 4 90 38 M26 54 Q50 32 74 54 M40 68 Q50 58 60 68" fill="none" stroke={c ?? INK} strokeWidth={8} strokeLinecap="round" />
          <circle cx={50} cy={82} r={6} fill={c ?? INK} />
        </>
      );
    case "plug":
      return (
        <>
          <rect x={36} y={4} width={8} height={20} rx={3} fill={INK} />
          <rect x={56} y={4} width={8} height={20} rx={3} fill={INK} />
          <rect x={26} y={22} width={48} height={36} rx={10} fill={c ?? SOFTB} {...sk} />
          <path d="M50 58 V72 Q50 92 80 92" fill="none" {...sk} strokeWidth={7} />
        </>
      );
    case "eye":
      return (
        <>
          <path d="M6 50 Q50 6 94 50 Q50 94 6 50 Z" fill={CREAM} {...sk} />
          <circle cx={50 + Math.sin(tt / 6) * 8} cy={50} r={18} fill={c ?? "#3F6FB5"} {...sk} />
          <circle cx={50 + Math.sin(tt / 6) * 8} cy={50} r={7} fill={INK} />
        </>
      );
    case "cloud":
      return <path d="M26 76 Q6 76 8 58 Q10 42 30 44 Q34 22 54 24 Q74 24 78 44 Q96 44 94 62 Q92 76 76 76 Z" fill={c ?? CREAM} {...sk} />;
    case "chip":
      return (
        <>
          <path d="M30 6 V20 M50 6 V20 M70 6 V20 M30 80 V94 M50 80 V94 M70 80 V94 M6 30 H20 M6 50 H20 M6 70 H20 M80 30 H94 M80 50 H94 M80 70 H94" {...sk} />
          <rect x={18} y={18} width={64} height={64} rx={10} fill={c ?? SOFTG} {...sk} />
          <g transform={`rotate(${tt * 14} 50 50)`}>
            <circle cx={50} cy={50} r={22} fill={CREAM} {...sk} />
            <path d="M50 50 L50 32 M50 50 L68 50 M50 50 L50 68 M50 50 L32 50" {...sk} strokeWidth={6} />
          </g>
        </>
      );
    case "receipt":
      return (
        <>
          <path d="M22 8 H78 V92 L70 86 L62 92 L54 86 L46 92 L38 86 L30 92 L22 86 Z" fill={CREAM} {...sk} />
          <path d="M32 26 H68 M32 40 H60 M32 54 H68 M32 68 H54" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          {t ? <text x={50} y={82} textAnchor="middle" fontSize={16} fontWeight={900} fill={RED}>{t}</text> : null}
        </>
      );
    case "jar": {
      const lv = v[0];
      return (
        <>
          <path d="M26 26 H74 V34 Q84 40 84 56 V80 Q84 92 72 92 H28 Q16 92 16 80 V56 Q16 40 26 34 Z" fill={SOFTB} {...sk} />
          <rect x={22} y={12} width={56} height={14} rx={5} fill={YEL} {...sk} />
          {Array.from({length: Math.round(lv * 5)}, (_, k) => (
            <circle key={k} cx={34 + (k % 3) * 16} cy={82 - Math.floor(k / 3) * 14} r={9} fill={YEL} stroke={INK} strokeWidth={3} />
          ))}
        </>
      );
    }
    case "bars":
      return (
        <>
          {v.map((h, k) => {
            const g = interpolate(tt, [k * 4, k * 4 + 16], [0, 1], {...CL, easing: OUT});
            const hh = Math.max(4, 82 * h * g);
            return <rect key={k} x={10 + k * (80 / v.length)} y={90 - hh} width={80 / v.length - 8} height={hh} rx={5} fill={c ?? (k === v.length - 1 ? RED : YEL)} {...sk} />;
          })}
        </>
      );
    case "shutter": {
      const lv = interpolate(tt, [8, 34], [0.25, 1], {...CL, easing: BACK});
      return (
        <>
          <rect x={10} y={10} width={80} height={80} rx={6} fill={SOFTR} {...sk} />
          <rect x={10} y={10} width={80} height={80 * lv} rx={6} fill="#D8D2C4" {...sk} />
          {Array.from({length: 6}, (_, k) => (k * 13 < 80 * lv ? <path key={k} d={`M12 ${10 + k * 13} H88`} stroke={INK} strokeWidth={3} opacity={0.5} /> : null))}
        </>
      );
    }
    case "swap":
      return <path d="M14 36 H78 M62 20 L80 36 L62 52 M86 66 H22 M38 50 L20 66 L38 82" fill="none" stroke={c ?? INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />;
    case "bowl":
      return (
        <>
          <circle cx={36} cy={40} r={13} fill="#E58A4E" {...sk} strokeWidth={4} />
          <circle cx={58} cy={36} r={13} fill={GRN} {...sk} strokeWidth={4} />
          <circle cx={48} cy={30} r={11} fill={YEL} {...sk} strokeWidth={4} />
          <path d="M8 46 H92 Q88 86 50 88 Q12 86 8 46 Z" fill={c ?? RED} {...sk} />
        </>
      );
    case "star":
      return <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill={c ?? YEL} {...sk} />;
    case "battery": {
      const lv = interpolate(tt, [6, 40], [0.7, v[0]], CL);
      return (
        <>
          <rect x={6} y={28} width={78} height={44} rx={9} fill={CREAM} {...sk} />
          <rect x={84} y={42} width={9} height={16} rx={3} fill={INK} />
          <rect x={12} y={34} width={Math.max(3, 66 * lv)} height={32} rx={5} fill={lv > 0.35 ? GRN : RED} stroke={INK} strokeWidth={3} />
        </>
      );
    }
    case "clock":
      return (
        <>
          <circle cx={50} cy={50} r={40} fill={CREAM} {...sk} />
          <path d={`M50 50 L50 24`} {...sk} transform={`rotate(${tt * 12} 50 50)`} />
          <path d={`M50 50 L68 50`} {...sk} transform={`rotate(${tt * 1} 50 50)`} />
          <circle cx={50} cy={50} r={4} fill={INK} />
        </>
      );
    case "calc":
      return (
        <>
          <rect x={20} y={6} width={60} height={88} rx={9} fill={c ?? SOFTB} {...sk} />
          <rect x={28} y={14} width={44} height={20} rx={4} fill={CREAM} stroke={INK} strokeWidth={3} />
          {Array.from({length: 9}, (_, k) => (
            <circle key={k} cx={34 + (k % 3) * 16} cy={48 + Math.floor(k / 3) * 15} r={5.5} fill={INK} />
          ))}
        </>
      );
    case "app":
      return (
        <>
          <rect x={6} y={14} width={88} height={72} rx={8} fill={CREAM} {...sk} />
          <rect x={6} y={14} width={88} height={20} rx={8} fill={c ?? SOFTB} {...sk} />
          <circle cx={20} cy={24} r={3} fill={INK} />
          <circle cx={30} cy={24} r={3} fill={INK} />
          <path d="M18 48 H70 M18 60 H82 M18 72 H56" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
        </>
      );
    case "doc":
      return (
        <>
          <path d="M22 6 H60 L80 26 V94 H22 Z" fill={c ?? CREAM} {...sk} />
          <path d="M60 6 V26 H80" fill="none" {...sk} />
          <path d="M32 44 H68 M32 58 H68 M32 72 H54" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
          {t ? <text x={50} y={40} textAnchor="middle" fontSize={15} fontWeight={900} fill={INK}>{t}</text> : null}
        </>
      );
    case "server":
      return (
        <>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect x={10} y={10 + k * 29} width={80} height={24} rx={6} fill={c ?? SOFTR} {...sk} />
              <circle cx={26} cy={22 + k * 29} r={4} fill={k === 1 ? RED : GRN} />
              <path d={`M44 ${22 + k * 29} H78`} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
            </g>
          ))}
        </>
      );
    case "pc":
      return (
        <>
          <rect x={8} y={12} width={84} height={56} rx={7} fill={CREAM} {...sk} />
          <rect x={16} y={20} width={68} height={40} rx={3} fill={c ?? SOFTG} stroke={INK} strokeWidth={3} />
          <path d="M50 68 V82 M32 88 H68" {...sk} />
        </>
      );
    case "mag":
      return (
        <>
          <circle cx={40} cy={40} r={26} fill="rgba(255,253,246,0.7)" {...sk} strokeWidth={7} />
          <path d="M60 60 L90 90" stroke={INK} strokeWidth={11} strokeLinecap="round" />
        </>
      );
    case "warn":
      return (
        <>
          <path d="M50 8 L94 88 H6 Z" fill={c ?? YEL} {...sk} />
          <text x={50} y={78} textAnchor="middle" fontSize={50} fontWeight={900} fill={INK}>!</text>
        </>
      );
    case "shield":
      return (
        <>
          <path d="M50 6 L88 20 V50 Q88 78 50 94 Q12 78 12 50 V20 Z" fill={c ?? SOFTB} {...sk} />
          <path d="M32 50 L46 64 L70 36" fill="none" stroke={GRN} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "scale": {
      const a = interpolate(tt, [6, 30], [-50, 38], {...CL, easing: BACK}) + Math.sin(tt / 3) * (tt > 30 ? 3 : 0);
      return (
        <>
          <path d="M22 92 L30 58 H70 L78 92 Z" fill={YEL} {...sk} />
          <circle cx={50} cy={34} r={28} fill={CREAM} {...sk} />
          <path d="M50 34 L50 14" {...sk} stroke={RED} transform={`rotate(${a} 50 34)`} />
          <circle cx={50} cy={34} r={4} fill={INK} />
        </>
      );
    }
    case "zzz":
      return (
        <>
          <text x={14} y={80} fontSize={44} fontWeight={900} fill={INK} opacity={0.75}>Z</text>
          <text x={42} y={56} fontSize={36} fontWeight={900} fill={INK} opacity={0.6}>z</text>
          <text x={66} y={34} fontSize={28} fontWeight={900} fill={INK} opacity={0.45}>z</text>
        </>
      );
    case "arrow":
      return <path d="M10 50 H78 M60 28 L86 50 L60 72" fill="none" stroke={c ?? INK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />;
  }
};

// 一个图标：按 fx 出场、一直在动
export const ItemView: React.FC<{it: Item; t: number}> = ({it, t: t0}) => {
  const t = t0 - (it.d ?? 0);
  if (t < 0) return null;
  const fx = it.fx ?? "pop";
  const o = interpolate(t, [0, 4], [0, 1], CL);
  let sc = interpolate(t, [0, 12], [0.4, 1], {...CL, easing: BACK});
  let tx = 0;
  let ty = 0;
  let rot = 0;
  let op = o;
  if (fx === "drop") [sc, ty] = [1, interpolate(t, [0, 13], [-170, 0], {...CL, easing: Easing.bezier(0.34, 1.4, 0.64, 1)})];
  if (fx === "rise") [sc, ty] = [1, interpolate(t, [0, 14], [90, 0], {...CL, easing: OUT})];
  if (fx === "left") [sc, tx] = [1, interpolate(t, [0, 14], [-260, 0], {...CL, easing: BACK})];
  if (fx === "right") [sc, tx] = [1, interpolate(t, [0, 14], [260, 0], {...CL, easing: BACK})];
  if (fx === "pulse") sc *= 1 + Math.sin(t / 4) * 0.05 * interpolate(t, [10, 16], [0, 1], CL);
  if (fx === "shake") rot = Math.sin(t * 0.9) * 7 * interpolate(t, [8, 14], [0, 1], CL);
  if (fx === "float") ty = Math.sin(t / 10) * 9;
  if (fx === "grow") sc = interpolate(t, [4, 44], [0.55, 1.35], {...CL, easing: OUT});
  if (fx === "vanish") {
    const v = interpolate(t, [26, 42], [0, 1], CL);
    [sc, ty, op] = [sc * (1 - v * 0.4), -v * 50, o * (1 - v)];
  }
  if (fx === "stream") {
    const p = (t % 34) / 34;
    [sc, ty, op] = [1, interpolate(p, [0, 1], [-30, 170]), interpolate(p, [0, 0.12, 0.8, 1], [0, 1, 1, 0], CL)];
  }
  if (fx === "fly" && it.to) {
    const k = interpolate(t, [6, 40], [0, 1], {...CL, easing: Easing.bezier(0.45, 0, 0.3, 1)});
    [sc, tx, ty] = [1, (it.to[0] - it.x) * k, (it.to[1] - it.y) * k - Math.sin(Math.PI * k) * 60];
  }
  const label = it.label;
  return (
    <div style={{position: "absolute", left: it.x - it.s / 2, top: it.y - it.s / 2, width: it.s, height: it.s, opacity: op, transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`, filter: `drop-shadow(4px 5px 0 ${INK})`}}>
      <svg width={it.s} height={it.s} viewBox="0 0 100 100" style={{overflow: "visible"}}>
        <Ic n={it.ic} c={it.c} t={it.t} v={it.v} tt={t} />
      </svg>
      {label ? (
        <div style={{position: "absolute", left: -20, right: -20, top: it.s + 2, textAlign: "center", fontSize: 30, fontWeight: 900, color: INK, whiteSpace: "nowrap", filter: "none"}}>
          <span style={{backgroundColor: CREAM, border: `4px solid ${INK}`, borderRadius: 10, padding: "0 12px 3px"}}>{label}</span>
        </div>
      ) : null}
    </div>
  );
};

// 一行的小场景：t = 这一行出现后的帧数
export const VigScene: React.FC<{v: Vig; t: number; bg: string}> = ({v, t, bg}) => {
  const kid = SHOW_KID ? v.kid : undefined; // 店里已经有小白了，小场景里不再放第二个
  const kt = kid ? t - 2 : 0;
  return (
    <div style={{position: "relative", width: VW, height: VH, backgroundColor: bg, overflow: "hidden"}}>
      <svg width={VW} height={VH} style={{position: "absolute", left: 0, top: 0, opacity: 0.4}}>
        <defs>
          <pattern id="vg-dots" width={36} height={36} patternUnits="userSpaceOnUse">
            <circle cx={9} cy={9} r={3.2} fill="#FFFFFF" />
            <circle cx={27} cy={27} r={3.2} fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width={VW} height={VH} fill="url(#vg-dots)" />
      </svg>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 26, backgroundColor: "rgba(43,33,28,0.12)"}} />
      {v.items.map((it, k) => (
        <ItemView key={k} it={it} t={t} />
      ))}
      {kid ? (
        <Img
          className="ink-line"
          src={staticFile(`img/c/${kid[0]}.png`)}
          style={{position: "absolute", left: kid[1], bottom: VH - kid[2], height: 210, transform: `${kid[3] ? "scaleX(-1) " : ""}translateY(${interpolate(kt, [0, 12], [60, 0], {...CL, easing: BACK})}px) scale(${1 + Math.sin(t / 16) * 0.015})`, transformOrigin: "50% 100%", opacity: interpolate(kt, [0, 5], [0, 1], CL)}}
        />
      ) : null}
      {v.mark ? (
        <div style={{position: "absolute", right: 22, top: 18, width: 68, height: 68, transform: `scale(${interpolate(t - 14, [0, 10], [0, 1], {...CL, easing: BACK})})`, filter: `drop-shadow(4px 5px 0 ${INK})`}}>
          <svg width={68} height={68} viewBox="0 0 100 100">
            <Ic n={v.mark} tt={t} />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

export const I = (ic: IconName, x: number, y: number, s: number, o: Partial<Item> = {}): Item => ({ic, x, y, s, ...o});
// 整块展板上的小动画层（展板坐标 1920×1080）：base = 起点帧，每个图标的 d = 相对起点的延迟帧
export const Deco: React.FC<{name: string; base: number; out?: number; items: Item[]}> = ({name, base, out, items}) => {
  const f = useCurrentFrame();
  return (
    <A name={name} x={0} y={0} w={1920} h={1080} at={base} out={out} kind="fade" boil="" lift={260}>
      <div style={{position: "relative", width: 1920, height: 1080}}>
        {items.map((it, k) => (
          <ItemView key={k} it={it} t={f - base} />
        ))}
      </div>
    </A>
  );
};
