import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from "remotion";
import {A, Tag} from "./parts/Anim";

// 接入用户自己用 AI 生成的动画段（比喻段落：吃饭、店面、爆炸……）
// 1. 用户生成原片后，node scripts/ai.mjs <原片> <编号> <开始帧> <结束帧> 转成 public/ai/c<编号>.mp4（去声音、30fps、1280×720、均匀变速正好铺满这段配音）
// 2. 在 CLIPS 里登记：from / to 用 startOf("句子id")，贴纸写名字 / 价格（AI 视频里不要有字，字用贴纸叠上去）
// 整屏盖在 3D 展板世界上，放大 1.1 倍防露底；硬切进硬切出（淡入淡出会和底下的展板叠出重影）
// 用户随时可能删掉某段：删 CLIPS 里那一行，Sfx.tsx 里对着它打的音效、贴纸一起清掉
type Lab = {at: number; x: number; y: number; text: string; bg: string; size?: number; rot?: number};
export type Clip = {k: number; from: number; to: number; labels: Lab[]};

export const CLIPS: Clip[] = [
  // {k: 1, from: startOf("008"), to: startOf("010"), labels: [{at: 40, x: 90, y: 60, text: "模型 = 后厨的大厨", bg: "#FFFDF6"}]},
];

const Clip1: React.FC<{c: Clip}> = ({c}) => {
  const n = c.to - c.from;
  return (
    <AbsoluteFill style={{zIndex: 5}}>
      <div style={{position: "absolute", left: -96, top: -54, width: 2112, height: 1188, overflow: "hidden", backgroundColor: "#E9DCC0"}}>
        <OffthreadVideo src={staticFile(`ai/c${c.k}.mp4`)} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </div>
      {c.labels.map((l, i) => (
        <A key={i} name={`AI动画-${c.k}-贴纸${i + 1}`} x={l.x} y={l.y} at={l.at} out={n - 8} kind="pop" rot={l.rot ?? -1.5} flat boil="">
          <Tag bg={l.bg} size={l.size ?? 50}>
            {l.text}
          </Tag>
        </A>
      ))}
    </AbsoluteFill>
  );
};

export const AiClips: React.FC = () => (
  <>
    {CLIPS.map((c) => (
      <Sequence key={c.k} name={`AI动画-${c.k}`} from={c.from} durationInFrames={c.to - c.from} layout="none">
        <Clip1 c={c} />
      </Sequence>
    ))}
  </>
);

// 这些帧区间里画面是 AI 动画（Sfx.tsx 用来去掉对着手绘画面打的音效）
export const inAi = (f: number) => CLIPS.some((c) => f >= c.from && f < c.to);
