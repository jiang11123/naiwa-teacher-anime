import React from "react";
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from "remotion";
import {SceneCtx} from "./parts/Anim";
import {Cam} from "./parts/fx";
import {BgPattern} from "./Stage";
import {Abs, rows} from "./timeline";

// 2D 平面模式：一整张波点纸铺满，分镜一个接一个放在纸上（和 3D 展板用同一张分镜表、同一批展板组件）
// - 每个分镜结束前 8 帧，里面的 <A> 自动缩回退场（和 3D 展板的 stay 一样），下一个分镜马上接上
// - 每个分镜可以在分镜表第 5 列写镜头 [全片帧, 缩放, 焦点x, 焦点y]：第一帧必须 [起点, 1, 960, 540] 居中，推近多用 1.04~1.06
// - 大段落之间用全屏转场（transitions.tsx）
const FADE = 10;
const Fade: React.FC<{len: number; first: boolean; children: React.ReactNode}> = ({len, first, children}) => {
  const f = useCurrentFrame();
  const fin = first ? 1 : interpolate(f, [0, 6], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const fout = interpolate(f, [len, len + FADE], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <AbsoluteFill style={{opacity: Math.min(fin, fout)}}>{children}</AbsoluteFill>;
};

export const Flat2D: React.FC = () => (
  <>
    <BgPattern />
    {rows.map(({name, C, s0, s1, cam}, i) => (
      <Sequence key={name} name={name} from={s0} durationInFrames={s1 - s0 + FADE} premountFor={30}>
        <Fade len={s1 - s0} first={i === 0}>
          <SceneCtx.Provider value={{flat2d: true, exitAt: i + 1 < rows.length ? s1 - s0 - 8 : undefined}}>
            <Abs f0={s0}>
              <Cam keys={cam ?? [[s0, 1, 960, 540]]}>
                <C s0={s0} s1={s1} />
              </Cam>
            </Abs>
          </SceneCtx.Provider>
        </Fade>
      </Sequence>
    ))}
  </>
);
