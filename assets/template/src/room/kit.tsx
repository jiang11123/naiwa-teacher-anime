import React from "react";
import {useCurrentFrame} from "remotion";
import {A, Kind} from "../parts/Anim";
import {Desk} from "../parts/office";
import {INK} from "../parts/palette";
import {seg} from "../t";
import {CamState, FLOOR, Key, PERSP, WALL, camCSS, makeCam, project} from "./cam";

// ===== 3D 实景的舞台和零件 =====
// 踩坑（都真实遇到过）：
// - 不能用 0 尺寸的 div 包一组东西再 translateZ：浏览器按这个空盒子排前后，会把东西排到地板后面。纵深加在每个元素自己身上（P 的 z）
// - 横躺的平面（影子、地贴）不能和站着的东西相交
// - 墙、地这种大平面不用 3D 的 DOM（Studio 预览用显卡画大平面会花），按镜头算好投影画成一张 SVG（RoomBg）
// - 门不要 rotateY 开（会侧成一条线），用 office.Door 的 open

export const tz = (z: number): React.CSSProperties => ({transform: `translateZ(${z}px)`});

// 世界里的一个元素：出场 / 退场和 <A> 一样，再摆到纵深 z 处
export const P: React.FC<{name: string; x: number; y: number; z?: number; w?: number; h?: number; at: number; out?: number; kind?: Kind; rot?: number; boil?: "boil" | "boil-strong" | ""; children: React.ReactNode}> = ({z = 0, ...p}) => (
  <A flat boil={p.boil ?? "boil"} {...p} style={{transform: `translateZ(${z}px)`}}>
    {p.children}
  </A>
);

// 平躺在地上（或桌面上）的一块：中心 (x, z)，宽 w、进深 d；y 默认是地面
export const Flat: React.FC<{x: number; z: number; w: number; d: number; y?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({x, z, w, d, y = FLOOR, children, style}) => (
  <div style={{position: "absolute", left: x - w / 2, top: y - d / 2, width: w, height: d, transformOrigin: "50% 50%", transform: `translateZ(${z}px) rotateX(90deg)`, ...style}}>{children}</div>
);
// 脚下的软影子
export const Shadow: React.FC<{x: number; z: number; w: number; o?: number}> = ({x, z, w, o = 1}) => (
  <Flat x={x} z={z} w={w} d={w * 0.42} y={FLOOR + 4} style={{borderRadius: "50%", background: "radial-gradient(closest-side, rgba(90,62,30,0.32), rgba(90,62,30,0))", opacity: o}} />
);
// 会走的人：一边沿 x 走、一边沿 z 往前 / 往后走（脚下影子跟着）。children 一般是 <Actor>（它的 path 要和 xs 一致）
export const ZWalk: React.FC<{z: [number, number][]; xs: [number, number][]; at: number; out?: number; children: React.ReactElement<{z?: number}>}> = ({z, xs, at, out, children}) => {
  const f = useCurrentFrame();
  const zz = seg(f, z);
  const on = f >= at && (out === undefined || f < out + 8);
  return (
    <>
      <Shadow x={seg(f, xs)} z={zz} w={300} o={on ? 1 : 0} />
      {React.cloneElement(children, {z: zz})}
    </>
  );
};
// 桌子：正面是手绘桌，后面补一块桌面（俯视时看得到厚度），脚下有影子。桌面高度 = FLOOR - 236
export const DESK_TOP = FLOOR - 236;
export const Desk3D: React.FC<{name: string; x: number; w: number; z?: number; deep?: number}> = ({name, x, w, z = 0, deep = 110}) => (
  <>
    <Shadow x={x + w / 2} z={z - deep / 2} w={w * 1.1} />
    <Flat x={x + w / 2} z={z - 8 - deep / 2} w={w - 10} d={deep} y={DESK_TOP + 5} style={{backgroundColor: "#E9B949", border: `5px solid ${INK}`, borderRadius: 8, boxSizing: "border-box"}} />
    <P name={name} x={x} y={DESK_TOP} z={z} at={0}>
      <Desk w={w} h={240} />
    </P>
  </>
);
// 笔记本电脑（推镜头进屏幕用）：屏幕内容放 children
export const Laptop: React.FC<{w?: number; children?: React.ReactNode}> = ({w = 230, children}) => (
  <div style={{position: "relative", width: w, height: w * 0.72}}>
    <div style={{position: "absolute", left: w * 0.06, top: 0, width: w * 0.88, height: w * 0.58, backgroundColor: INK, borderRadius: 10, padding: 7, boxSizing: "border-box", boxShadow: `6px 7px 0 #6B5442`}}>
      <div style={{width: "100%", height: "100%", borderRadius: 5, backgroundColor: "#CFE3F5", overflow: "hidden", position: "relative"}}>{children}</div>
    </div>
    <div style={{position: "absolute", left: 0, top: w * 0.58, width: w, height: w * 0.1, backgroundColor: "#B9A88F", border: `5px solid ${INK}`, borderRadius: "4px 4px 14px 14px"}} />
  </div>
);

// ---- 房间：后墙（波点）、地板（木纹透视线）、墙边的柱子 ----
export const RoomBg: React.FC<{c: CamState; pillars: number[]}> = ({c, pillars}) => {
  const P2 = (x: number, y: number, z: number) => project(c, x, y, z);
  const pts = (arr: [number, number, number][]) =>
    arr
      .map(([x, y, z]) => {
        const p = P2(x, y, z);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");
  const span = 4200 / Math.min(1, c.s); // 拉远时墙和地铺得更宽
  const xL = c.x - span;
  const xR = c.x + span;
  const TOP = -1400;
  const zNear = Math.min(1400 / Math.min(1, c.s), c.z + c.D - 220); // 拉远时地板铺到更近
  const safe = (x: number, z: number) => {
    let zz = z;
    while (zz > WALL && P2(x, FLOOR, zz).d < 160) zz -= 40;
    return zz;
  };
  const dots: React.ReactNode[] = [];
  const G = 84;
  const dspan = 2600 / Math.min(1, c.s);
  for (let x = Math.floor((c.x - dspan) / G) * G; x < c.x + dspan; x += G)
    for (let y = -1300 + (Math.abs(Math.round(x / G)) % 2 ? G / 2 : 0); y < FLOOR - 60; y += G) {
      const p = P2(x, y, WALL);
      if (p.x < -40 || p.x > 1960 || p.y < -40 || p.y > 1120) continue;
      dots.push(<circle key={`${x}_${y}`} cx={p.x} cy={p.y} r={5.5 * p.s} fill="#D8C6A2" />);
    }
  const lines: React.ReactNode[] = [];
  for (let z = WALL + 130; z < zNear; z += 130) {
    const a = P2(c.x - dspan, FLOOR, z);
    const b = P2(c.x + dspan, FLOOR, z);
    if (a.d < 120 || b.d < 120) continue;
    lines.push(<line key={`z${z}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#CDB78C" strokeWidth={4} />);
  }
  for (let x = Math.floor((c.x - dspan - 400) / 260) * 260; x < c.x + dspan + 400; x += 260) {
    const a = P2(x, FLOOR, WALL);
    const b = P2(x, FLOOR, safe(x, zNear));
    lines.push(<line key={`x${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C4AC7E" strokeWidth={4.5} />);
  }
  const cols = pillars
    .filter((x) => Math.abs(x - c.x) < span * 0.8)
    .map((x) => {
      const w = 46;
      const z1 = WALL + 170;
      const side = c.x > x ? x + w : x - w;
      return (
        <g key={x}>
          <polygon points={pts([[side, TOP, WALL], [side, TOP, z1], [side, FLOOR, z1], [side, FLOOR, WALL]])} fill="#C9B184" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <polygon points={pts([[x - w, TOP, z1], [x + w, TOP, z1], [x + w, FLOOR, z1], [x - w, FLOOR, z1]])} fill="#E2CFA8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      );
    });
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0}}>
      <rect width={1920} height={1080} fill="#E6D6B6" />
      {lines}
      <polygon points={pts([[xL, TOP, WALL], [xR, TOP, WALL], [xR, FLOOR, WALL], [xL, FLOOR, WALL]])} fill="#F1E6CF" />
      <g opacity={0.6}>{dots}</g>
      <polygon points={pts([[xL, FLOOR - 46, WALL], [xR, FLOOR - 46, WALL], [xR, FLOOR, WALL], [xL, FLOOR, WALL]])} fill="#DCC49A" />
      <polyline points={pts([[xL, FLOOR - 46, WALL], [xR, FLOOR - 46, WALL]])} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
      <polyline points={pts([[xL, FLOOR, WALL], [xR, FLOOR, WALL]])} fill="none" stroke={INK} strokeWidth={6} />
      {cols}
    </svg>
  );
};

// 舞台：房间背景 + 3D 世界（镜头）+ 平移太快时的横向运动模糊。children 里所有坐标都是世界坐标，帧都是全片帧
export const RoomStage: React.FC<{cam: Key[]; pillars?: number[]; children: React.ReactNode}> = ({cam, pillars = [], children}) => {
  const f = useCurrentFrame();
  const C = React.useMemo(() => makeCam(cam), [cam]);
  const c = C.at(f);
  const blur = Math.min(6, C.speed(f) / 22);
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, overflow: "hidden", filter: blur > 0.6 ? `blur(${blur.toFixed(1)}px)` : undefined}}>
      <RoomBg c={c} pillars={pillars} />
      <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, perspective: PERSP, perspectiveOrigin: "960px 540px"}}>
        <div style={{position: "absolute", left: 960, top: 540, width: 0, height: 0, transformStyle: "preserve-3d", transform: camCSS(c)}}>{children}</div>
      </div>
    </div>
  );
};
