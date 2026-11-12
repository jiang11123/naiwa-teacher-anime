import React from "react";
import {Sequence} from "remotion";
import {SceneCtx} from "./parts/Anim";
import {E, T, startOf} from "./t";
import {L} from "./voice";
import * as Demo from "./scenes/Demo";
import type {CamKey} from "./parts/fx";

// ===== 分镜表 =====
// 每一行 = 3D 展板世界里的一块展板：[名字（前三位是唯一 id，取景表 framing.ts 用）, 展板组件, 第一句配音 id, 进场方式]
// 起止帧跟着配音自动算：从第一句前 LEAD 帧开始，到下一块展板开始为止。
// 进场方式：
//   stay  镜头不动，旧组件退场、新组件出场（同一段落内默认用它）
//   keep  镜头不动，截图窗口原地换内容（不退场）
//   slide 镜头平移到右边一块（同一话题换个角度）
//   push  镜头往前推进到更深处一块
//   fly   镜头转身飞到走廊下一个拐角——只在大段落之间用，一期 4~6 次
// 第 5 列（可选）只在 2D 平面模式（mode.ts = "flat2d"）生效：这个分镜在纸上的镜头 [全片帧, 缩放, 焦点x, 焦点y]，第一帧居中
// 3D 实景模式（"room3d"）不用这张表，整片写在一个世界里（见 scenes/DemoRoom.tsx）
export type Trans = "stay" | "keep" | "slide" | "push" | "fly";
export type S = {s0: number; s1: number}; // 这块展板开始 / 结束的全片帧

const table: [string, React.FC<S>, string, Trans, CamKey[]?][] = [
  ["001 开场-一本正经胡说", Demo.Hook, "001", "stay", [[0, 1, 960, 540], [T("002", 0, 2), 1.06, 1180, 600]]],
  ["003 AI幻觉-爱面子的实习生", Demo.Intern, "003", "fly"],
  ["006 三招", Demo.Tips, "006", "fly", [[startOf("006"), 1, 960, 540], [T("009", 0), 1.05, 1300, 640]]],
  ["010 结尾", Demo.Ending, "010", "stay"],
];

const lastId = Object.keys(L).sort().pop() as string;
export const END = E(lastId, 50); // 全片总帧数：最后一句说完再留 50 帧

// 展板里统一用全片帧：把 Sequence 的本地帧换回全片帧，退场时间也跟着换算
export const Abs: React.FC<{f0: number; children: React.ReactNode}> = ({f0, children}) => {
  const ctx = React.useContext(SceneCtx);
  const v = {...ctx, exitAt: ctx.exitAt === undefined ? undefined : ctx.exitAt + f0, handoffAt: ctx.handoffAt === undefined ? undefined : ctx.handoffAt + f0, place: ctx.place ? {...ctx.place, f0: 0} : undefined};
  return (
    <SceneCtx.Provider value={v}>
      <Sequence from={-f0} layout="none">
        {children}
      </Sequence>
    </SceneCtx.Provider>
  );
};

const starts = table.map(([, , id], i) => (i === 0 ? 0 : startOf(id)));
export const scenes: [string, React.FC, number, number][] = table.map(([n, C], i) => {
  const s0 = starts[i];
  const s1 = i + 1 < table.length ? starts[i + 1] : END;
  const W: React.FC = () => (
    <Abs f0={s0}>
      <C s0={s0} s1={s1} />
    </Abs>
  );
  return [n, W, s0, s1];
});
export const sceneTrans: Trans[] = table.map(([, , , ty], i) => (i === 0 ? "stay" : ty));
export const sceneIds: string[] = table.map(([n]) => n.slice(0, 3));
export const sceneFirstLine: string[] = table.map(([, , id]) => id);

// 2D 平面模式用：每个分镜的名字、组件、起止帧、镜头
export const rows = table.map(([name, C, , , cam], i) => ({name, C, s0: starts[i], s1: i + 1 < table.length ? starts[i + 1] : END, cam}));
