import React from "react";
import {AbsoluteFill, Sequence, staticFile} from "remotion";
import {Audio} from "@remotion/media";
import {HandFilters} from "./hand";
import {Stage} from "./Stage";
import {World3D} from "./World3D";
import {Overlay} from "./Overlay";
import {Sfx} from "./Sfx";
import {AiClips} from "./Ai";
import {Subtitles} from "./Subtitles";
import {sceneIds, sceneTrans, scenes} from "./timeline";
import {HAS_VOICE} from "./voice";
import {MODE} from "./mode";
import {Flat2D} from "./Flat2D";
import {Wipes} from "./transitions";
import {RoomStage} from "./room/kit";
import * as Room from "./scenes/DemoRoom";

// 横屏 1920×1080，30fps。层次从下到上：
// 纸张底 → 画面（mode.ts 选：3D 展板 / 2D 平面 / 3D 实景）→ 屏幕层（重点组件聚焦、术语便签）→ AI 动画段 → 音效 → 配音 → 字幕
// 没有章节条、没有固定装饰
export const Main: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: "#2A211C"}}>
    <HandFilters />
    <Stage>
      {MODE === "board3d" ? <World3D scenes={scenes} types={sceneTrans} ids={sceneIds} /> : null}
      {MODE === "flat2d" ? <Flat2D /> : null}
      {MODE === "room3d" ? (
        <RoomStage cam={Room.CAM} pillars={Room.PILLARS}>
          <Room.World />
        </RoomStage>
      ) : null}
    </Stage>
    <Sequence name="屏幕层" style={{zIndex: 3}}>
      <Overlay />
    </Sequence>
    <Sequence name="全屏转场" style={{zIndex: 4}}>
      <Wipes />
    </Sequence>
    <Sequence name="AI动画">
      <AiClips />
    </Sequence>
    <Sequence name="音效">
      <Sfx />
    </Sequence>
    {HAS_VOICE ? (
      <Sequence name="配音">
        <Audio src={staticFile("voice.mp3")} />
      </Sequence>
    ) : null}
    <Sequence name="字幕">
      <Subtitles />
    </Sequence>
  </AbsoluteFill>
);
