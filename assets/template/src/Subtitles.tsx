import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {captions} from "./voice";
import {SUB_ADV} from "./t";
import {transitions} from "./transitions";

// 横屏字幕：画面底部 y≈966，句与句之间不留空白，轻微上浮淡入；转场盖住画面的那十几帧里不显示字幕（转场中间不出字）
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame() + SUB_ADV;
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = captions.findIndex((c, i) => {
    const next = captions[i + 1];
    const until = next ? Math.min(next.start, c.end + 0.6) : c.end + 0.6;
    return t >= c.start && t < until;
  });
  const covered = transitions.some(([at]) => frame - at >= 4 && frame - at < 28);
  if (idx === -1 || covered) {
    return null;
  }
  const line = captions[idx];
  const local = frame - Math.round(line.start * fps);
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div style={{position: "absolute", left: 0, top: 966, width: 1920, display: "flex", justifyContent: "center", zIndex: 10}}>
        <div
          style={{
            maxWidth: 1760,
            padding: "8px 38px 12px",
            borderRadius: 20,
            backgroundColor: "rgba(27,20,16,0.92)",
            border: "4px solid #F7C64A",
            color: "#FFF6E6",
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: 1,
            lineHeight: 1.25,
            textAlign: "center",
            whiteSpace: "nowrap",
            boxShadow: "6px 7px 0 rgba(0,0,0,0.45)",
            opacity: interpolate(local, [0, 4], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
            translate: interpolate(local, [0, 6], ["0px 12px", "0px 0px"], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          }}
        >
          {line.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
