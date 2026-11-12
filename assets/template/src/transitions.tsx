import React from "react";
import {Sequence} from "remotion";
import {MODE} from "./mode";
import {startOf} from "./t";
import {Stairs} from "./parts/wipes";

// 全屏转场表：[开始帧, 名字, 组件, 音效]——第 14~18 帧盖满，下一个分镜就在这几帧里切换，所以开始帧 = 段落第一句的 startOf − 16
// 主要给 2D 平面模式用：只放在大段落开头，一期 3~5 个，每种只用一次，每期按内容新做（parts/wipes.tsx 里是示例）
// 3D 展板 / 3D 实景模式靠镜头飞和走，一般留空
export const wipes: [number, string, React.FC, string][] =
  MODE === "flat2d"
    ? [
        [startOf("006") - 16, "三级台阶-三招", Stairs, "bl_stairs"],
      ]
    : [];

// 盖满画面的帧（字幕在盖满的那十几帧里隐藏）
export const transitions: [number][] = wipes.map(([at]) => [at]);

export const Wipes: React.FC = () => (
  <>
    {wipes.map(([at, name, C]) => (
      <Sequence key={at} name={`转场-${name}`} from={at} durationInFrames={40}>
        <C />
      </Sequence>
    ))}
  </>
);
