import React from "react";
import {useCurrentFrame} from "remotion";

// 手绘滤镜：噪声种子每 3 帧换一次，线条就像逐帧重画一样"沸腾"（约 10fps 的手绘节奏）
// 在 CSS 里用 className="boil" / "boil-strong" / "ink-line" 引用
export const HandFilters: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (Math.floor(frame / 3) % 24) + 1;
  return (
    <svg width={0} height={0} style={{position: "absolute"}}>
      <defs>
        <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="boil-strong" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={8} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ink-line" x="-6%" y="-6%" width="112%" height="112%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={4} result="fat" />
          <feFlood floodColor="#2B211C" result="ink" />
          <feComposite in="ink" in2="fat" operator="in" result="outline" />
          <feMerge result="m">
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="m" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
};

// 每 2 帧才变一次的帧号（"一拍二"），用于手绘节奏的小抖动
export const useTwos = () => {
  const frame = useCurrentFrame();
  return Math.floor(frame / 2) * 2;
};
