import React from "react";
import {Easing, Sequence, interpolate, useCurrentFrame} from "remotion";
import {SceneCtx, floorReg, type SceneInfo} from "./parts/Anim";
import {FRAMING} from "./framing";
import {cues} from "./Sfx";

// 真 3D 空间（参考桌子那种“画面摆在一个房间里、镜头在里面飞”）：
// - 每个分镜 = 空间里的一块“展板”（透明的，上面的元素前后错开悬在空中），按顺序摆在一条弯弯的走廊上，各自有朝向
// - 下面有一整片波点地面，展板在地上有投影；空中飘着纸屑小点，镜头一动就有前后视差
// - 镜头：停住时只很轻地环视 + 慢推；换分镜分 5 种（见 timeline.ts 的 transIn）：镜头不动只换组件 / 截图窗口原地换内容 / 平移 / 直推 / 大章节才转身飞
// 地面 / 投影 / 纸屑不用 3D 的 DOM 大平面（Studio 预览用显卡画会花），而是自己按镜头算好投影位置，画成平面 SVG：预览和导出一模一样
const FLY = 24; // 换分镜飞行帧数
const PERSP = 1700;
const OX = 960;
const OY = 1080 * 0.46;
const FLOOR_Y = 520; // 地面高度（展板中心往下）
const CUT_BEFORE = new Set<string>(); // 这些分镜是整屏视频，前一块展板不留退场尾巴（模板里默认为空，按需加展板 id）

type Pose = {x: number; y: number; z: number; ry: number};
import type {Trans} from "./timeline";
const ANG = [-18, 16, -14, 20, -16];
// 按每个分镜的进场方式，依次算出每块展板摆在哪：stay/keep 跟上一块重合（镜头不动）、slide 摆在正右边、push 摆在正前方更深处、fly 换到走廊下一个拐角
const posesFor = (types: Trans[]): Pose[] => {
  const out: Pose[] = [];
  let flyN = 0;
  types.forEach((ty, i) => {
    if (i === 0) {
      out.push({x: 0, y: 0, z: 0, ry: 0});
      return;
    }
    const p = out[i - 1];
    const r = rad(p.ry);
    if (ty === "stay" || ty === "keep") {
      out.push({...p});
    } else if (ty === "slide") {
      out.push({x: p.x + Math.cos(r) * 3300, y: p.y, z: p.z - Math.sin(r) * 3300, ry: p.ry});
    } else if (ty === "push") {
      out.push({x: p.x - Math.sin(r) * 2600, y: p.y, z: p.z - Math.cos(r) * 2600, ry: p.ry});
    } else {
      flyN += 1;
      out.push({x: p.x + 3400, y: p.y, z: p.z - 1400, ry: ANG[flyN % ANG.length]});
    }
  });
  return out;
};
let cache: {key: string; poses: Pose[]} | null = null;
const getPoses = (types: Trans[]) => {
  const key = types.join(",");
  if (!cache || cache.key !== key) cache = {key, poses: posesFor(types)};
  return cache.poses;
};

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const rad = (d: number) => (d * Math.PI) / 180;

export type SceneDef = [string, React.FC, number, number];

type Cam = {x: number; y: number; z: number; ry: number; oy: number; ox: number; tz: number};
// 世界坐标 → 屏幕坐标（和 CSS 里 camT + perspective 的算法一致）；返回 null = 在镜头后面
const project = (c: Cam, X: number, Y: number, Z: number): {x: number; y: number; s: number; d: number} | null => {
  let x = X - c.x;
  let y = Y - c.y;
  let z = Z - c.z;
  // rotateY(-ry) 再 rotateY(oy) = rotateY(oy - ry)
  const a = rad(c.oy - c.ry);
  const x1 = x * Math.cos(a) + z * Math.sin(a);
  const z1 = -x * Math.sin(a) + z * Math.cos(a);
  x = x1;
  z = z1;
  const b = rad(c.ox);
  const y2 = y * Math.cos(b) - z * Math.sin(b);
  const z2 = y * Math.sin(b) + z * Math.cos(b);
  y = y2;
  z = z2 + c.tz;
  if (z > PERSP - 80) return null;
  const s = PERSP / (PERSP - z);
  return {x: OX + (960 + x - OX) * s, y: OY + (540 + y - OY) * s, s, d: PERSP - z};
};

export const World3D: React.FC<{scenes: SceneDef[]; types: Trans[]; ids: string[]}> = ({scenes, types, ids}) => {
  const frame = useCurrentFrame();
  const poses = getPoses(types);
  // 当前在哪一段：idx = 镜头要去的展板，t = 转场进度
  let idx = 0;
  scenes.forEach(([, , from], i) => {
    if (frame >= from) idx = i;
  });
  const from = scenes[idx][2];
  const ty = idx === 0 ? "stay" : types[idx];
  const moving = ty === "slide" || ty === "push" || ty === "fly";
  const dur = ty === "fly" ? FLY : 18;
  const t = !moving ? 1 : interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const e = ease(t);
  const a = poses[Math.max(0, idx - 1)];
  const b = poses[idx];
  const arc = Math.sin(Math.PI * t);
  // 不再先往后拉远（先缩小）再转：镜头直接转身平滑飞到下一块，无缝衔接
  // 停住时：很轻的左右环视（±2.5°）+ 很慢地推近，不再大幅绕圈
  // 同一段落内镜头连续（不随分镜重置，否则不动镜时会跳）
  let g = idx;
  while (g > 0 && !["slide", "push", "fly"].includes(types[g])) g--;
  const local = frame - scenes[g][2];
  const orbitY = Math.sin((local + g * 50) / 110) * 2.5;
  const orbitX = -3 + Math.cos((local + g * 30) / 130) * 0.8;
  const push = interpolate(local, [FLY, FLY + 300], [0, 70], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const speed = moving ? arc * (ty === "fly" ? 1 : 0.6) : 0;
  const cam: Cam = {x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, z: a.z + (b.z - a.z) * e, ry: a.ry + (b.ry - a.ry) * e, oy: orbitY, ox: orbitX, tz: push - 40};
  const camT = `translateZ(${cam.tz}px) rotateX(${cam.ox}deg) rotateY(${cam.oy}deg) rotateY(${-cam.ry}deg) translate3d(${-cam.x}px, ${-cam.y}px, ${-cam.z}px)`;
  const blur = speed > 0.05 ? `blur(${speed * 3.5}px)` : undefined;
  // 这一帧重新登记：展板里的元素渲染时把自己的位置写进 floorReg，地面在它们之后渲染
  floorReg.frame = frame;
  floorReg.items = [];

  return (
    <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, filter: blur}}>
      <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, zIndex: 1, perspective: PERSP, perspectiveOrigin: `${OX}px ${OY}px`}}>
        <div style={{position: "absolute", left: 960, top: 540, width: 0, height: 0, transformStyle: "preserve-3d", transform: camT}}>
          {scenes.map(([name, C, f0, f1], i) => {
            const p = poses[i];
            const nextTy = types[i + 1];
            const stayNext = nextTy === "stay" || nextTy === "keep";
            const fr0 = FRAMING[ids[i]] ?? [1, 0, 0];
            const info: SceneInfo = {exitAt: nextTy === undefined || nextTy === "keep" ? undefined : f1 - f0 - 8, handoffAt: stayNext ? f1 - f0 : undefined, keepShot: nextTy === "keep", enterKeep: types[i] === "keep" && i > 0, place: {x: p.x, y: p.y, z: p.z, ry: p.ry, k: fr0[0], fx: fr0[1], fy: fr0[2], f0}};
            // 景深：镜头移走时旧展板变虚；镜头不动的换法不虚
            let dof = 0;
            if (i === idx - 1 && moving) dof = 1.5 + e * 7;
            else if (i === idx && moving) dof = speed * 4;
            // push：旧展板在镜头穿过它之前就淡掉并卸下（避免穿到镜头后面）
            const fadeOld = i === idx - 1 && ty === "push" ? interpolate(t, [0, 0.45], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 1;
            const fr = FRAMING[ids[i]] ?? [1, 0, 0];
            // 下一块是整屏的 AI 动画（餐盖转场盖着切）：旧展板到点直接卸掉，不留退场尾巴压在动画上
            const len = CUT_BEFORE.has(ids[i + 1]) ? f1 - f0 : stayNext ? f1 - f0 + 20 : f1 - f0 + dur + 6;
            return (
              <Sequence key={name} name={name} from={f0} durationInFrames={Math.max(1, len)} layout="none">
                {fadeOld <= 0 ? null : (
                  <SceneCtx.Provider value={info}>
                    <div
                      className={dof > 0.4 || fadeOld < 1 ? "" : "board"}
                      style={{position: "absolute", left: -960, top: -540, width: 1920, height: 1080, transformStyle: dof > 0.4 || fadeOld < 1 ? "flat" : "preserve-3d", transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateY(${p.ry}deg) scale(${fr[0]}) translate(${fr[1]}px, ${fr[2]}px)`, filter: dof > 0.4 ? `blur(${dof}px)` : undefined, opacity: fadeOld < 1 ? fadeOld : undefined}}
                    >
                      <C />
                    </div>
                  </SceneCtx.Provider>
                )}
              </Sequence>
            );
          })}
        </div>
      </div>
      <Ground cam={cam} frame={frame} scenes={scenes} poses={poses} />
    </div>
  );
};

// 两个颜色按 t 混合（地面波点被波纹扫到时从土色变成黄色）
const mix = (c1: string, c2: string, t: number) => {
  const h = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(h(c1, i) + (h(c2, i) - h(c1, i)) * t)).join(",")})`;
};

// 纸屑点：固定撒在空间里（2026-11-07 用户嫌画面边上飘着黄点蓝点，关掉）
const SHOW_DUST = false;
const DOTS = Array.from({length: 160}).map((_, i) => {
  const r = (n: number) => {
    const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return {x: -3000 + r(1) * 40000, y: -900 + r(2) * 1300, z: -9000 + r(3) * 9500, s: 5 + r(4) * 9, c: ["#F7C64A", "#C9B28C", "#9FC7E8", "#E9A99B"][i % 4]};
});

// 波纹时间表：取盖章类音效的时刻，全片按间隔筛一遍（约 10 秒最多一次）
const WAVE_GAP = 300;
export let WT: number[] | null = null;
export const waveTimes = () => {
  if (WT) return WT;
  const ts = cues.filter(([, file]) => /stamp|boom/.test(file)).map(([f]) => Math.round(f)).sort((a, b) => a - b);
  const out: number[] = [];
  for (const t of ts) if (!out.length || t - out[out.length - 1] >= WAVE_GAP) out.push(t);
  WT = out;
  return out;
};

// 背景贴纸：放在画面四周（上沿、左右两边），中间留给展板；depth = 视差强度
type DK = "folder" | "md" | "hash" | "drawer" | "pen" | "smile" | "film" | "bubble" | "play" | "gif" | "heart" | "frog" | "card" | "cat" | "pages" | "speed" | "check" | "phone" | "note";
// 每个分镜换一套贴纸（2026-11-07 用户：转场的时候后面的组件也换一下）：8 个位置轮流取不同的贴纸，相邻分镜每个位置都不一样
// 每期按主题换这张表（只用和主题沾边的几种）；BUBBLE_TEXT = 气泡贴纸上的字；SHOW_DOODLES = false 整个关掉
export const SHOW_DOODLES = true;
const BUBBLE_TEXT = "？";
const ALLK: DK[] = ["card", "smile", "note", "bubble", "heart", "check", "phone", "pen", "card", "cat", "note", "heart", "check", "smile"];
const kindOf = (scene: number, slot: number) => ALLK[(slot * 3 + scene * 5) % ALLK.length];
type Slot = {x: number; y: number; s: number; rot: number; depth: number};
// 2026-11-07 用户：新的组件不要一样的布局。5 套布局（都只在画面四周），分镜按 0,2,4,1,3… 轮换，相邻分镜一定不同
const LAYOUTS: Slot[][] = [
  [{x: 150, y: 80, s: 1.1, rot: -6, depth: 1}, {x: 400, y: 120, s: 1.05, rot: -10, depth: 0.7}, {x: 90, y: 360, s: 1, rot: 12, depth: 1.2}, {x: 120, y: 640, s: 1, rot: 6, depth: 0.9}, {x: 1640, y: 80, s: 1.1, rot: -6, depth: 0.8}, {x: 1830, y: 230, s: 1.05, rot: 8, depth: 1.1}, {x: 1840, y: 470, s: 1, rot: -8, depth: 1}, {x: 1780, y: 690, s: 1, rot: -12, depth: 0.9}],
  [{x: 260, y: 70, s: 1, rot: 8, depth: 0.8}, {x: 90, y: 250, s: 1.15, rot: -8, depth: 1.1}, {x: 210, y: 480, s: 0.95, rot: 10, depth: 1}, {x: 110, y: 740, s: 1.05, rot: -6, depth: 0.9}, {x: 1700, y: 150, s: 0.95, rot: -10, depth: 1}, {x: 1860, y: 340, s: 1.1, rot: 6, depth: 1.2}, {x: 1740, y: 570, s: 1, rot: -4, depth: 0.8}, {x: 1860, y: 770, s: 0.95, rot: 10, depth: 1}],
  [{x: 100, y: 90, s: 1.05, rot: -12, depth: 1}, {x: 300, y: 60, s: 0.9, rot: 6, depth: 0.7}, {x: 470, y: 140, s: 1, rot: -4, depth: 0.9}, {x: 80, y: 600, s: 1.1, rot: 8, depth: 1.1}, {x: 1600, y: 60, s: 0.95, rot: 8, depth: 0.8}, {x: 1810, y: 120, s: 1.1, rot: -8, depth: 1}, {x: 1870, y: 340, s: 0.95, rot: 4, depth: 1.2}, {x: 1830, y: 680, s: 1.05, rot: -10, depth: 0.9}],
  [{x: 80, y: 180, s: 1, rot: 10, depth: 1.1}, {x: 230, y: 400, s: 1.1, rot: -6, depth: 0.9}, {x: 90, y: 620, s: 0.95, rot: 4, depth: 1}, {x: 250, y: 800, s: 1, rot: -10, depth: 0.8}, {x: 1840, y: 100, s: 1.05, rot: -6, depth: 1}, {x: 1690, y: 320, s: 0.95, rot: 8, depth: 0.9}, {x: 1850, y: 540, s: 1.1, rot: -4, depth: 1.2}, {x: 1690, y: 780, s: 1, rot: 6, depth: 0.8}],
  [{x: 90, y: 60, s: 0.95, rot: -4, depth: 0.8}, {x: 260, y: 170, s: 1.1, rot: 8, depth: 1}, {x: 440, y: 60, s: 0.9, rot: -8, depth: 0.7}, {x: 70, y: 430, s: 1, rot: 6, depth: 1.1}, {x: 1660, y: 170, s: 1.05, rot: -6, depth: 1}, {x: 1850, y: 60, s: 0.95, rot: 8, depth: 0.9}, {x: 1860, y: 430, s: 1.1, rot: -10, depth: 1.2}, {x: 1760, y: 700, s: 1, rot: 4, depth: 0.9}],
];
const layoutOf = (scene: number) => LAYOUTS[(scene * 2) % LAYOUTS.length];
const INKC = "#3B2A1A";
const Doodle: React.FC<{kind: DK}> = ({kind}) => {
  const st = {stroke: INKC, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
  switch (kind) {
    case "folder":
      return (
        <g>
          <path d="M-60 -36 H-14 L0 -20 H60 V40 H-60 Z" fill="#F7C64A" {...st} />
        </g>
      );
    case "md":
      return (
        <g>
          <rect x={-42} y={-52} width={84} height={104} rx={8} fill="#FFF6E3" {...st} />
          <text x={0} y={14} textAnchor="middle" fontSize={36} fontWeight={900} fill={INKC}>
            .md
          </text>
        </g>
      );
    case "hash":
      return (
        <g>
          <rect x={-42} y={-42} width={84} height={84} rx={14} fill="#9FC7E8" {...st} />
          <text x={0} y={20} textAnchor="middle" fontSize={58} fontWeight={900} fill={INKC}>
            #
          </text>
        </g>
      );
    case "drawer":
      return (
        <g>
          <rect x={-60} y={-40} width={120} height={80} rx={8} fill="#C99A67" {...st} />
          <rect x={-18} y={-8} width={36} height={12} rx={6} fill={INKC} />
        </g>
      );
    case "pen":
      return (
        <g transform="rotate(35)">
          <rect x={-12} y={-56} width={24} height={86} fill="#E9A99B" {...st} />
          <path d="M-12 30 L0 56 L12 30 Z" fill="#FFF6E3" {...st} />
        </g>
      );
    case "smile":
      return (
        <g>
          <circle r={46} fill="#F7C64A" {...st} />
          <circle cx={-15} cy={-10} r={6} fill={INKC} />
          <circle cx={15} cy={-10} r={6} fill={INKC} />
          <path d="M-22 10 Q0 32 22 10" fill="none" {...st} />
        </g>
      );
    case "film":
      return (
        <g>
          <rect x={-90} y={-36} width={180} height={72} rx={8} fill="#5A4632" {...st} />
          {[-56, 0, 56].map((cx) => (
            <rect key={cx} x={cx - 22} y={-20} width={44} height={40} rx={4} fill={cx === 0 ? "#F7C64A" : "#FFF6E3"} />
          ))}
          {[-75, -45, -15, 15, 45, 75].map((cx) => (
            <g key={cx}>
              <rect x={cx - 5} y={-31} width={10} height={6} rx={2} fill="#FFF6E3" />
              <rect x={cx - 5} y={25} width={10} height={6} rx={2} fill="#FFF6E3" />
            </g>
          ))}
        </g>
      );
    case "bubble":
      return (
        <g>
          <path d="M-62 -38 H62 Q74 -38 74 -26 V18 Q74 30 62 30 H-10 L-34 52 L-28 30 H-62 Q-74 30 -74 18 V-26 Q-74 -38 -62 -38 Z" fill="#FFF6E3" {...st} />
          <text x={0} y={8} textAnchor="middle" fontSize={36} fontWeight={900} fill={INKC}>
            {BUBBLE_TEXT}
          </text>
        </g>
      );
    case "play":
      return (
        <g>
          <circle r={44} fill="#9FC7E8" {...st} />
          <path d="M-12 -20 L22 0 L-12 20 Z" fill="#FFF6E3" {...st} strokeWidth={4} />
        </g>
      );
    case "gif":
      return (
        <g>
          <rect x={-62} y={-32} width={124} height={64} rx={14} fill="#E9A99B" {...st} />
          <text x={0} y={14} textAnchor="middle" fontSize={40} fontWeight={900} fill="#FFF6E3" stroke={INKC} strokeWidth={2}>
            GIF
          </text>
        </g>
      );
    case "heart":
      return <path d="M0 34 C-50 4 -50 -36 -22 -36 C-8 -36 0 -24 0 -16 C0 -24 8 -36 22 -36 C50 -36 50 4 0 34 Z" fill="#E9A99B" {...st} />;
    case "frog":
      return (
        <g>
          <ellipse cy={10} rx={52} ry={34} fill="#9CCB6B" {...st} />
          <circle cx={-24} cy={-20} r={16} fill="#FFF6E3" {...st} />
          <circle cx={24} cy={-20} r={16} fill="#FFF6E3" {...st} />
          <circle cx={-22} cy={-18} r={6} fill={INKC} />
          <circle cx={26} cy={-18} r={6} fill={INKC} />
          <path d="M-16 18 Q0 28 16 18" fill="none" {...st} />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M-46 -14 L-40 -52 L-14 -32 H14 L40 -52 L46 -14 Q50 40 0 40 Q-50 40 -46 -14 Z" fill="#E8B97A" {...st} />
          <circle cx={-16} cy={-4} r={6} fill={INKC} />
          <circle cx={16} cy={-4} r={6} fill={INKC} />
          <path d="M-6 12 L0 17 L6 12" fill="none" {...st} strokeWidth={4} />
          <circle cx={10} cy={26} r={8} fill="#BFE3F2" stroke={INKC} strokeWidth={3} />
        </g>
      );
    case "pages":
      return (
        <g>
          <rect x={-40} y={-44} width={84} height={96} rx={8} fill="#E2D3B4" {...st} />
          <rect x={-48} y={-52} width={84} height={96} rx={8} fill="#FFF6E3" {...st} />
          <circle cx={-20} cy={-14} r={7} fill={INKC} />
          <path d="M4 -14 H20" {...st} />
          <path d="M-28 16 Q-6 30 16 16" fill="none" {...st} />
        </g>
      );
    case "speed":
      return (
        <g>
          <rect x={-50} y={-34} width={100} height={68} rx={34} fill="#9CCB6B" {...st} />
          <text x={0} y={14} textAnchor="middle" fontSize={40} fontWeight={900} fill="#FFF6E3" stroke={INKC} strokeWidth={2}>
            2x
          </text>
        </g>
      );
    case "check":
      return (
        <g>
          <circle r={40} fill="#9CCB6B" {...st} />
          <path d="M-18 0 L-4 14 L20 -14" fill="none" stroke="#FFF6E3" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x={-34} y={-58} width={68} height={116} rx={14} fill="#5A4632" {...st} />
          <rect x={-24} y={-44} width={48} height={80} rx={6} fill="#FFF6E3" />
          <circle cx={0} cy={-6} r={12} fill="#F7C64A" />
          <circle cx={0} cy={47} r={4} fill="#FFF6E3" />
        </g>
      );
    case "note":
      return (
        <g>
          <path d="M-8 26 V-34 L34 -44 V14" fill="none" {...st} strokeWidth={7} />
          <ellipse cx={-20} cy={28} rx={16} ry={12} fill="#9FC7E8" {...st} />
          <ellipse cx={22} cy={16} rx={16} ry={12} fill="#9FC7E8" {...st} />
        </g>
      );
    case "card":
      return (
        <g>
          <rect x={-46} y={-56} width={92} height={112} rx={8} fill="#FFF6E3" {...st} />
          <rect x={-34} y={-44} width={68} height={62} rx={4} fill="#9FC7E8" />
          <circle cx={-12} cy={-22} r={9} fill="#F7C64A" />
          <path d="M-34 18 L-8 -6 L10 10 L22 0 L34 12 V18 Z" fill="#9CCB6B" />
        </g>
      );
  }
};

// 地面（波点 + 底色渐变）、展板投影、纸屑：全部按镜头算投影后画成 SVG
const Ground: React.FC<{cam: Cam; frame: number; scenes: SceneDef[]; poses: Pose[]}> = ({cam, frame, scenes, poses}) => {
  const G = 210;
  const dots: React.ReactNode[] = [];
  // 组件登记的位置（floorReg）：落地 / 出场后 45 帧内从它脚下荡开一圈波纹
  const items = floorReg.frame === frame ? floorReg.items : [];
  void scenes;
  // 互动不要太频繁（2026-11-07 用户反馈）：只有盖章 / 掉落这类重点出场才荡波纹，两次之间至少隔 75 帧（2.5 秒）
  // 第二次反馈“还是有点频繁”：全片统一排一张时间表（盖章音效的时刻，两次之间至少隔 WAVE_GAP 帧），
  // 只有正好在表上的那个盖章 / 掉落组件才荡波纹
  const times = waveTimes();
  const waves: typeof items = [];
  for (const T of times) {
    if (frame - T < 0 || frame - T >= 45) continue;
    const near = items.filter((it) => it.big && it.o > 0.05 && Math.abs(it.at - T) <= 8).sort((p, q) => Math.abs(p.at - T) - Math.abs(q.at - T))[0];
    if (near) waves.push(near);
  }
  // 地面波点：在镜头附近的一块区域里按世界网格取点（点固定在地上，镜头动才有透视）
  const a = rad(cam.ry);
  const fx = -Math.sin(a);
  const fz = -Math.cos(a); // 镜头朝向 = 展板法线的反方向
  const rx = Math.cos(a);
  const rz = -Math.sin(a);
  const gx0 = Math.round(cam.x / G) * G;
  const gz0 = Math.round(cam.z / G) * G;
  const R = 6600;
  for (let gx = gx0 - R; gx <= gx0 + R; gx += G) {
    for (let gz = gz0 - R; gz <= gz0 + R; gz += G) {
      const dx = gx - cam.x;
      const dz = gz - cam.z;
      const fwd = dx * fx + dz * fz;
      const side = dx * rx + dz * rz;
      if (fwd < -1500 || fwd > 6500 || Math.abs(side) > 1200 + fwd * 1.1) continue;
      const p = project(cam, gx, FLOOR_Y, gz);
      if (!p || p.x < -40 || p.x > 1960 || p.y < -40 || p.y > 1120) continue;
      const fade = Math.max(0, Math.min(1, (6500 - fwd) / 4500));
      // 波纹：波前以每帧 26 的速度往外走，扫过的点往上跳、变成黄色
      let lift = 0;
      for (const w of waves) {
        const age = frame - w.at;
        const d = Math.hypot(gx - w.X, gz - w.Z);
        const front = 60 + age * 26;
        const amp = (w.big ? 46 : 30) * Math.exp(-(((d - front) / 110) ** 2)) * (1 - age / 45) * Math.min(1, w.o * 1.5);
        lift = Math.max(lift, amp);
      }
      const hot = Math.min(1, lift / 26);
      const q = lift > 0.5 ? project(cam, gx, FLOOR_Y - lift, gz) ?? p : p;
      if (hot > 0.05) dots.push(<ellipse key={`s${gx}_${gz}`} cx={p.x} cy={p.y} rx={11 * p.s} ry={11 * p.s * 0.38} fill="#46321E" opacity={0.18 * fade * hot} />);
      dots.push(<ellipse key={`${gx}_${gz}`} cx={q.x} cy={q.y} rx={(12 + hot * 5) * p.s} ry={(12 + hot * 5) * p.s * (0.38 + hot * 0.25)} fill={hot > 0.05 ? mix("#96764F", "#F7C64A", hot) : "#96764F"} opacity={(0.42 + hot * 0.5) * fade} />);
    }
  }
  // 地平线：远处地面的屏幕高度，往下铺一层地面底色
  const far = project(cam, cam.x + fx * 6500, FLOOR_Y, cam.z + fz * 6500);
  const near = project(cam, cam.x - fx * 300, FLOOR_Y, cam.z - fz * 300);
  const hy = far ? far.y : 600;
  const ny = near ? Math.max(near.y, hy + 50) : 1200;
  // 投影
  const shadows = scenes.map(([name, , f0, f1], i) => {
    if (frame < f0 || frame >= f1 + FLY + 6) return null;
    if (i > 0 && poses[i - 1].x === poses[i].x && poses[i - 1].z === poses[i].z && frame < f0 + 1) return null;
    const bp = poses[i];
    const p = project(cam, bp.x, FLOOR_Y, bp.z);
    if (!p) return null;
    const pr = project(cam, bp.x, FLOOR_Y, bp.z + 260);
    const ryy = pr ? Math.max(6, Math.abs(pr.y - p.y)) : 30;
    return <ellipse key={name} cx={p.x} cy={p.y} rx={980 * p.s} ry={ryy} fill="url(#gshadow)" />;
  });
  // 每个组件脚下一团软影子（跟着组件左右滑动、淡入淡出）+ 出场时一圈扩散的波纹线
  const contact = items.map((it, i) => {
    const p = project(cam, it.X, FLOOR_Y, it.Z);
    if (!p) return null;
    const age = frame - it.at;
    const pop = age >= 0 && age < 12 ? 1 + (1 - age / 12) * 0.4 : 1;
    const rx = (it.w * 0.42 * p.s) * pop;
    return <ellipse key={`c${i}`} cx={p.x} cy={p.y} rx={rx} ry={Math.max(4, rx * 0.12)} fill="url(#gshadow)" opacity={Math.min(1, it.o) * 0.9} />;
  });
  const rings = waves.map((w, i) => {
    const age = frame - w.at;
    const p = project(cam, w.X, FLOOR_Y, w.Z);
    if (!p) return null;
    const R = (60 + age * 26) * p.s;
    return <ellipse key={`r${i}`} cx={p.x} cy={p.y} rx={R} ry={R * 0.3} fill="none" stroke="#F7C64A" strokeWidth={Math.max(1.5, 5 * p.s * (1 - age / 45))} opacity={0.55 * (1 - age / 45) * Math.min(1, w.o)} />;
  });
  // 背景波点墙（替换原来静止的纸面波点）：组件出场时从它身后荡开一圈，扫到的点被推开、放大、变黄；组件停着时把身边的点轻轻挤开
  const scr = waves.map((it) => ({it, p: project(cam, it.X, it.Y, it.Z)})).filter((o) => o.p) as {it: (typeof items)[number]; p: {x: number; y: number; s: number}}[];
  const field: React.ReactNode[] = [];
  const GS = 52;
  const drift = (frame * 0.35) % GS; // 整面墙很慢地往左飘，静止镜头时也有一点生气
  for (let gy2 = 0; gy2 < 1080 + GS; gy2 += GS) {
    for (let gx2 = -GS; gx2 < 1920 + GS; gx2 += GS) {
      const bx = gx2 + ((gy2 / GS) % 2 ? GS / 2 : 0) - drift;
      const by = gy2;
      let ox = 0;
      let oy = 0;
      let hot = 0;
      for (const {it, p} of scr) {
        const dx = bx - p.x;
        const dy = by - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const age = frame - it.at;
        if (age >= 0 && age < 40) {
          const front = 40 + age * 34;
          const g = Math.exp(-(((d - front) / 46) ** 2)) * (1 - age / 40) * Math.min(1, it.o * 1.4) * (it.big ? 1.3 : 1);
          ox += (dx / d) * g * 20;
          oy += (dy / d) * g * 20;
          hot = Math.max(hot, g);
        }
      }
      const h1 = Math.min(1, hot);
      field.push(<circle key={`f${gx2}_${gy2}`} cx={bx + ox} cy={by + oy} r={5 + h1 * 5} fill={h1 > 0.04 ? mix("#D8C6A2", "#F7C64A", h1) : "#D8C6A2"} opacity={0.6 + h1 * 0.4} />);
    }
  }
  // 背景小组件（GIF / 表情包主题的手绘贴纸）：贴在画面四周慢慢浮动，镜头移动时有一点视差；
  // 波纹扫到时跳一下、歪一下头（和组件互动）
  // 视差只做小幅摆动（不让贴纸跑到画面中间去）
  const par = Math.sin((cam.x + cam.z) / 5000) * 36;
  // 当前分镜：决定用哪套贴纸；贴纸是展板的子级，和大组件一起退场；进场时贴纸先快速出来，大组件随后跟上，镜头飞时跟展板一起走
  const si = Math.max(0, scenes.findIndex(([, , a0, a1]) => frame - 2 >= a0 && frame - 2 < a1)); // 旧贴纸多留 2 帧，等退场动作做完才换
  const [, , sf0, sf1] = scenes[si] ?? [null, null, 0, 1e9];
  const pose = poses[si] ?? poses[0];
  const nextP = poses[si + 1];
  const exitF = nextP ? sf1 - 8 : 1e9;
  const gEx = interpolate(frame, [exitF, exitF + 9], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.5, 0, 0.75, 0)});
  const gEn = si > 0 ? interpolate(frame, [sf0 + 2, sf0 + 9], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6))}) : 1;
  const bp = project(cam, pose.x, pose.y, pose.z);
  const gS = (bp ? bp.s : 1) * (1 - gEx * 0.45) * (0.55 + 0.45 * gEn);
  const gX = bp ? bp.x : 960;
  const gY = (bp ? bp.y : 540) + gEx * 70;
  const gO = Math.max(0, Math.min(1, gEn)) * (1 - gEx);
  const doodles = layoutOf(si).map((dd, i) => {
    const kind = kindOf(si, i);
    let x = dd.x + par * dd.depth;
    const y = dd.y + Math.sin(frame / 46 + i * 1.7) * 8;
    let hop = 0;
    let tilt = 0;
    for (const {it, p} of scr) {
      const d = Math.hypot(x - p.x, y - p.y);
      const hitAt = (d - 40) / 34; // 波前走到这里的时刻
      if (hitAt > 40) continue;
      const k = frame - it.at - Math.max(0, hitAt);
      if (k >= 0 && k < 18) {
        hop = Math.max(hop, Math.sin((Math.PI * k) / 18) * 26);
        tilt = Math.sin((Math.PI * k) / 9) * 9 * (x < p.x ? -1 : 1);
      }
    }
    x = Math.round(x * 10) / 10;
    return (
      <g key={`d${i}`} transform={`translate(${x} ${y - hop}) rotate(${dd.rot + (((si * 7 + i * 3) % 5) - 2) * 4 + Math.sin(frame / 60 + i) * 3 + tilt}) scale(${dd.s})`} opacity={0.72}>
        <Doodle kind={kind} />
      </g>
    );
  });
  const dust = DOTS.map((d, i) => {
    const p = project(cam, d.x, d.y + Math.sin(frame / 40 + i) * 14, d.z);
    if (!p || p.x < -50 || p.x > 1970 || p.y < -50 || p.y > 1130) return null;
    return <circle key={i} cx={p.x} cy={p.y} r={d.s * p.s} fill={d.c} opacity={Math.min(0.6, 0.6 * (9000 / p.d))} />;
  });
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0, zIndex: 0}}>
      <defs>
        <linearGradient id="gfloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E2D3B4" stopOpacity="0" />
          <stop offset="0.35" stopColor="#DECDAA" stopOpacity="0.55" />
          <stop offset="1" stopColor="#D6C29C" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="gshadow">
          <stop offset="0" stopColor="#46321E" stopOpacity="0.32" />
          <stop offset="0.45" stopColor="#46321E" stopOpacity="0.12" />
          <stop offset="1" stopColor="#46321E" stopOpacity="0" />
        </radialGradient>
      </defs>
      {field}
      {SHOW_DOODLES && gO > 0.01 ? <g opacity={gO} transform={`translate(${gX} ${gY}) scale(${gS}) translate(-960 -540)`}>{doodles}</g> : null}
      <rect x={0} y={hy - 40} width={1920} height={Math.max(0, Math.max(ny, 1080) - hy + 40)} fill="url(#gfloor)" />
      {shadows}
      {rings}
      {dots}
      {contact}
      {SHOW_DUST ? dust : null}
    </svg>
  );
};
