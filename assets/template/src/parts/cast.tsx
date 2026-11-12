import React from "react";
import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from "remotion";
import {CH} from "../charSizes";
import {seg} from "../t";

export type CN = "tea" | "thumb" | "stick" | "shrug" | "chin" | "boss" | "kid" | "q" | "shock" | "sad" | "hand";
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

// 角色图在 public/img/c（scripts/make-cast.mjs 生成，可换成自己的）：小同学 = kid 开心 / q 疑惑 / shock 惊讶 / sad 沮丧 / hand 举手；讲解员 = stick / chin / shrug / thumb / tea；boss = 老板
// poses = [这一帧起换成, 姿势]；path = [帧, 中心 x]（走路时一跳一跳）；y = 脚底所在的 y
export const Actor: React.FC<{
  name: string;
  poses: [number, CN][];
  path: [number, number][];
  y: number;
  h: number;
  at: number;
  out?: number;
  flipWhenLeft?: boolean;
  flip?: boolean;
  z?: number; // 3D 办公室里的纵深
  dx?: number; // 整体平移（跟着店面一起挪；不算“走路”，不翻面不跳步）
}> = ({name, poses, path, y, h, at, out, flipWhenLeft = true, flip = false, z = 0, dx = 0}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || (out !== undefined && f > out + 10)) return null;
  const x0 = path.length === 1 ? path[0][1] : seg(f, path);
  const x = x0 + dx;
  const xp = path.length === 1 ? x : seg(f - 1, path) + dx;
  const moving = Math.abs(x - xp) > 0.6;
  const hop = moving ? -Math.abs(Math.sin(f / 3.2)) * 18 : 0;
  let pose = poses[0][1];
  let poseAt = poses[0][0];
  for (const [pf, p] of poses) if (f >= pf) [pose, poseAt] = [p, pf];
  const [iw, ih] = CH[pose];
  const w = (h * iw) / ih;
  const t = f - at;
  const pop = interpolate(t, [0, 12], [0.55, 1], {...CL, easing: BACK});
  // 换姿势时轻轻压一下，像真的换了个动作
  const sw = interpolate(f - poseAt, [0, 4, 10], [0.94, 1.04, 1], CL);
  const o = Math.min(interpolate(t, [0, 4], [0, 1], CL), out === undefined ? 1 : interpolate(f, [out, out + 8], [1, 0], CL));
  const breathe = 1 + Math.sin(f / 16) * 0.012;
  const dir = flip || (flipWhenLeft && x < xp - 0.6) ? -1 : 1;
  return (
    <Interactive.Div
      name={name}
      className="ink-line"
      style={{position: "absolute", left: x - w / 2, top: y - h + hop, width: w, height: h, opacity: o, transformOrigin: "50% 100%", transform: `translateZ(${z}px)`, scale: `${pop * (2 - sw)} ${pop * sw * breathe}`}}
    >
      <Img src={staticFile(`img/c/${pose}.png`)} style={{width: w, height: h, display: "block", transform: dir < 0 ? "scaleX(-1)" : undefined}} />
    </Interactive.Div>
  );
};
