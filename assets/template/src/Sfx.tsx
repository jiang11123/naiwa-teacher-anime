import React from "react";
import {Sequence, staticFile} from "remotion";
import {Audio} from "@remotion/media";
import {T} from "./t";
import {END} from "./timeline";
import {inAi} from "./Ai";
import {wipes} from "./transitions";

// 音效表：[全片帧, 文件名（public/sfx 里，不带 .wav）, 音量, 说明]
// 规则（references/audio.md）：只做点缀、不抢配音；只给画面重点（盖章 / 硬币 / 落地 / 爆点 / 揭晓）配；相邻音效至少隔 1.5 秒；
// 同一个声音别连着重复，列表逐条出现用音阶上行（hd_dot1→3、mar1→4）；冲击类最多 0.45 音量，点缀 0.25~0.35
type Cue = [number, string, number, string];
const raw: Cue[] = [
  [T("001", 1), "sp_pop", 0.35, "答案气泡"],
  [T("002", 0, 4), "hd_stamp", 0.45, "盖章-编的"],
  [T("004", 1), "hd_bounce", 0.3, "实习生出场"],
  [T("006", 0), "sp_reveal", 0.35, "三招"],
  [T("007", 0), "hd_dot1", 0.35, "第一招"],
  [T("008", 0), "hd_dot2", 0.35, "第二招"],
  [T("009", 0), "hd_dot3", 0.35, "第三招"],
  [T("010", 0), "tada", 0.3, "结尾"],
  ...wipes.map(([at, name, , sfx]): Cue => [at, sfx, 0.4, `转场-${name}`]),
];

// AI 动画盖住的区间里，对着手绘画面打的音效去掉（换成对着动画动作打的）
const GAP = 45;
export const cues: Cue[] = raw
  .filter(([f]) => !inAi(f))
  .sort((a, b) => a[0] - b[0])
  .reduce<Cue[]>((acc, c) => {
    const last = acc[acc.length - 1];
    if (last && c[0] - last[0] < GAP) {
      if (c[2] > last[2]) acc[acc.length - 1] = c;
      return acc;
    }
    acc.push(c);
    return acc;
  }, []);

export const Sfx: React.FC = () => (
  <>
    {cues
      .filter(([f]) => f >= 0 && f < END)
      .map(([f, file, vol, name], i) => (
        <Sequence key={i} name={`音效-${name}`} from={Math.round(f)} durationInFrames={60}>
          <Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} />
        </Sequence>
      ))}
  </>
);
