import {Easing, interpolate} from "remotion";

// ===== 3D 实景的镜头引擎 =====
// 世界坐标：x 从左到右（一个场景可以很长，比如 0~12000，按区域分段）；y 往下为正，地面 y = FLOOR；
// z 朝镜头为正：道具站在 z≈0 一排（往里摆用负数，-150 ~ -400），后墙在 z = WALL，地板一直铺到镜头脚下
// 镜头和 CSS 完全一致：透视 PERSP，镜头对着焦点，离焦点 D = PERSP / 缩放；带一点俯视（rx）和左右转身（ry）
export const FLOOR = 820;
export const WALL = -700;
export const PERSP = 1600;
export const ON_WALL = WALL + 8; // 贴在后墙上的东西（守则、门牌、窗）用这个 z

const IO = Easing.bezier(0.65, 0, 0.35, 1);
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// 镜头关键帧：[从这一帧开始动, 缩放, 焦点 x, 焦点 y, 用几帧走到位, 停住时的转身角度, 焦点 z]；走到位就停住
//   缩放：1.1 正常看一个区域；1.25 推近一点；2.7~3.4 推进电脑屏幕（正对、不俯视，屏幕占画面一半以上）；0.35~0.4 结尾拉远看全景
//   转身角度：±6~9，停住时略侧着看，有空间感；平移时会自动顺着方向再转一点
//   用几帧：同区域内 16~20，换区域 26~34，结尾拉远 40~46
// 第一帧必须是开场区域居中（[0, 1.1, 区域中心 x, 470, 1, 0~8]）
export type Key = [number, number, number, number, number, number?, number?];
export type CamState = {s: number; x: number; y: number; z: number; ry: number; rx: number; D: number};

export const makeCam = (CAM: Key[]) => {
  const base = (f: number) => {
    const k0 = CAM[0];
    let cur = {s: k0[1], x: k0[2], y: k0[3], z: k0[6] ?? 0, ry: k0[5] ?? 0};
    for (let i = 1; i < CAM.length; i++) {
      const [at, s, x, y, d, ry = 0, z = 0] = CAM[i];
      if (f < at) break;
      const p = interpolate(f, [at, at + d], [0, 1], {...CL, easing: IO});
      cur = {s: cur.s + (s - cur.s) * p, x: cur.x + (x - cur.x) * p, y: cur.y + (y - cur.y) * p, z: cur.z + (z - cur.z) * p, ry: cur.ry + (ry - cur.ry) * p};
    }
    return cur;
  };
  // 完整镜头：加上顺着平移方向的转身、轻轻环视、俯视角（推近电脑时俯视收掉，正对屏幕）
  const at = (f: number): CamState => {
    const c = base(f);
    const v = (base(f + 1).x - base(f - 1).x) / 2;
    const near = interpolate(c.s, [1.3, 2.7], [1, 0], CL);
    const ry = c.ry + Math.max(-14, Math.min(14, -v * 0.3)) + Math.sin(f / 110) * 1.6 * near;
    const rx = -11 * near + Math.cos(f / 130) * 0.6 * near; // 负数 = 镜头在上面往下看
    return {...c, ry, rx, D: PERSP / c.s};
  };
  // 平移速度（像素 / 帧），给运动模糊用
  const speed = (f: number) => Math.abs(base(f).x - base(f - 1).x);
  return {at, speed};
};

const rad = (d: number) => (d * Math.PI) / 180;
// 世界坐标 → 屏幕坐标（和 CSS 的 transform 一模一样）；d < 0 表示在镜头后面
export const project = (c: CamState, X: number, Y: number, Z = 0) => {
  let x = X - c.x;
  let y = Y - c.y;
  let z = Z - c.z;
  const a = rad(c.ry);
  [x, z] = [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
  const b = rad(c.rx);
  [y, z] = [y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)];
  z += PERSP - c.D;
  const d = PERSP - z;
  const s = PERSP / Math.max(1, d);
  return {x: 960 + x * s, y: 540 + y * s, s, d};
};
export const camCSS = (c: CamState) => `translateZ(${PERSP - c.D}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) translate3d(${-c.x}px, ${-c.y}px, ${-c.z}px)`;
