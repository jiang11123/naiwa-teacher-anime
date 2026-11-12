import React from "react";
import {Img, staticFile} from "remotion";

// 横屏画面框架 1920×1080：一整张纸铺满（没有线圈、章节标签等固定装饰）
// 分镜直接用 1920×1080 坐标；内容排在 y 40~930，960~1060 是字幕
export const W = 1920;
export const H = 1080;

// 背景波点：单一颜色的小圆点，按错位网格排满整张纸；颜色很浅、不动，不抢主画面
export const BgPattern: React.FC = () => (
  <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0}}>
    <defs>
      <pattern id="bg-dots" width={56} height={56} patternUnits="userSpaceOnUse">
        <circle cx={14} cy={14} r={5} fill="#D8C6A2" />
        <circle cx={42} cy={42} r={5} fill="#D8C6A2" />
      </pattern>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#bg-dots)" opacity={0.55} />
  </svg>
);

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden", backgroundColor: "#F4ECDA"}}>
    <Img src={staticFile("img/paper.png")} style={{position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"}} />
    {/* 静止的纸面波点换成 World3D 地面里会和组件互动的波点墙 */}
    <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(60,40,20,0.22) 100%)"}} />
    {children}
  </div>
);
