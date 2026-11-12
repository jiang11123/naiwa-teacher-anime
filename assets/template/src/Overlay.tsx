import React from "react";
import {Big, BigSay, FocusDim, TermNote} from "./parts/focus";
import {T, E} from "./t";

// 屏幕层：不跟 3D 镜头走的东西
// - FOCUS：重点组件出来的时间段，后面整个画面盖一层半透明纸色（相邻几段首尾接上，中间不闪）
// - Big：放大居中的重点组件
// - TermNote：术语便签，讲到时贴在物件旁边，再飞到右上角排成一列
const FOCUS: [number, number][] = [[T("005", 0, 2), E("005", 4)]];

export const Overlay: React.FC = () => (
  <>
    <FocusDim windows={FOCUS} />
    <Big name="重点-不好意思说不会" x={1400} y={540} at={T("005", 0, 2)} out={E("005", 4)} rot={-1.5}>
      <BigSay text="这题……我会！" size={110} />
    </Big>
    <TermNote name="便签-AI幻觉" top="今天的词" bottom="AI 幻觉" at={T("003", 0, 6)} from={[1560, 330]} slot={0} out={T("006", 0, -4)} />
  </>
);
