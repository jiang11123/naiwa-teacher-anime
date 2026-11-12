import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {CREAM, GRN, INK, RED, YEL} from "./palette";

// 全屏转场（2D 平面模式用；3D 模式一般靠镜头飞，不用）。这 4 个是示例：每期按内容新做，一期 3~5 个、每种只用一次，中间只有图形不出字
// 每个转场都要“有具体形象、和内容有关、真的盖满”：抽屉（拆账单）、台阶（三步）、气泡（评论区）、放大镜（再看一眼）
// 节奏：0~14 帧盖满，14~18 帧切分镜，18~35 帧揭开
const C = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);

// 1 收银抽屉（开始拆账单）：抽屉从下面弹上来盖满，格子里是硬币和钞票，再继续往上滑走
export const CashDrawer: React.FC = () => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 14], [1120, -30], {...C, easing: IO}) + interpolate(frame, [19, 34], [0, -1200], {...C, easing: IO});
  const cols = [0, 1, 2, 3];
  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      <div style={{position: "absolute", left: -20, top: y, width: 1960, height: 1140, backgroundColor: "#4A3B32", border: `14px solid ${INK}`}}>
        {cols.map((c) => (
          <div key={c} style={{position: "absolute", left: 40 + c * 470, top: 40, width: 440, height: 520, backgroundColor: "#6A584A", border: `10px solid ${INK}`, borderRadius: 24, overflow: "hidden"}}>
            {Array.from({length: 7}, (_, i) => (
              <div key={i} style={{position: "absolute", left: 40 + ((i * 113 + c * 37) % 240), top: 30 + i * 62, width: 120, height: 120, borderRadius: "50%", backgroundColor: i % 2 ? YEL : "#E8B33A", border: `7px solid ${INK}`}} />
            ))}
          </div>
        ))}
        {[0, 1, 2].map((c) => (
          <div key={c} style={{position: "absolute", left: 40 + c * 627, top: 590, width: 590, height: 470, backgroundColor: "#6A584A", border: `10px solid ${INK}`, borderRadius: 24, overflow: "hidden"}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{position: "absolute", left: 40 + i * 12, top: 40 + i * 120, width: 490, height: 180, backgroundColor: [GRN, "#7DBA6F", RED][(c + i) % 3], border: `7px solid ${INK}`, borderRadius: 10, rotate: `${(i - 1) * 2}deg`}}>
                <div style={{position: "absolute", left: 195, top: 40, width: 90, height: 90, borderRadius: "50%", border: `7px solid ${INK}`, backgroundColor: CREAM}} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 2 三级台阶（三步）：三级大台阶从下往上依次升起盖满，再依次落下
export const Stairs: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 660;
  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      {[0, 1, 2].map((i) => {
        const up = interpolate(frame, [i * 2.5, i * 2.5 + 9], [1160, -20], {...C, easing: IO});
        const down = interpolate(frame, [19 + (2 - i) * 2.5, 28 + (2 - i) * 2.5], [0, 1200], {...C, easing: IO});
        return (
          <div key={i} style={{position: "absolute", left: i * 640 - 10, top: up + down, width: W, height: 1140, backgroundColor: [YEL, "#FCE38A", CREAM][i], border: `12px solid ${INK}`}}>
            {[0, 1, 2, 3, 4].map((r) => (
              <div key={r} style={{position: "absolute", left: 0, top: 120 + r * 210, width: W, height: 12, backgroundColor: INK, opacity: 0.16}} />
            ))}
            <div style={{position: "absolute", left: 230, top: 400, width: 180, height: 180, borderRadius: "50%", backgroundColor: RED, border: `10px solid ${INK}`, opacity: 0.9}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 3 气泡撑满（评论区）：一串评论气泡从下面冒出来越变越大盖满，再噗地缩走
export const BubbleFill: React.FC = () => {
  const frame = useCurrentFrame();
  const spots = [
    [300, 760, 620, CREAM],
    [1600, 760, 620, "#FCE38A"],
    [960, 880, 780, "#D9EFC8"],
    [400, 240, 660, "#FFD3C9"],
    [1560, 220, 680, CREAM],
    [960, 300, 780, "#FCE38A"],
  ] as const;
  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      {spots.map(([x, y, r, fill], i) => {
        const a = interpolate(frame, [i * 1.6, i * 1.6 + 9], [0, 1.25], {...C, easing: Easing.bezier(0.34, 1.4, 0.64, 1)});
        const b = interpolate(frame, [19 + (5 - i) * 1.6, 28 + (5 - i) * 1.6], [1, 0], {...C, easing: IO});
        const s = a * b;
        return (
          <div key={i} style={{position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", backgroundColor: fill, border: `14px solid ${INK}`, scale: String(s)}}>
            {[-1, 0, 1].map((d) => (
              <div key={d} style={{position: "absolute", left: r + d * 130 - 40, top: r - 40, width: 80, height: 80, borderRadius: "50%", backgroundColor: INK, opacity: 0.2}} />
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 4 放大镜（再看一眼）：放大镜从右下冲过来，镜片越来越大盖满全屏，再缩小从左上飞走
export const BigLens: React.FC = () => {
  const frame = useCurrentFrame();
  const pIn = interpolate(frame, [0, 14], [0, 1], {...C, easing: IO});
  const pOut = interpolate(frame, [19, 34], [0, 1], {...C, easing: IO});
  const r = 120 + pIn * 1320 - pOut * 1320;
  const x = 2000 - pIn * 1040 - pOut * 1140;
  const y = 1040 - pIn * 500 - pOut * 640;
  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      <div style={{position: "absolute", left: x + r * 0.62, top: y + r * 0.62, width: r * 1.1, height: r * 0.28, backgroundColor: "#8A5A36", border: `12px solid ${INK}`, borderRadius: 40, transformOrigin: "0 50%", rotate: "45deg"}} />
      <div style={{position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", backgroundColor: "#FCE38A", border: `${Math.max(16, r * 0.05)}px solid ${INK}`}}>
        <div style={{position: "absolute", left: "16%", top: "14%", width: "26%", height: "14%", borderRadius: "50%", backgroundColor: CREAM, opacity: 0.8, rotate: "-30deg"}} />
      </div>
    </AbsoluteFill>
  );
};
