import React from "react";
import {A, Kind} from "./Anim";

// 横屏小工具：Mid = 水平居中的 <A>（整行 1920 宽），大标题、居中卡片用它
export const INK = "#2B211C";
export const RED = "#D9362B";
export const YEL = "#F7C64A";
export const GRN = "#4E8A4A";
export const BLU = "#3F6FB5";
export const CREAM = "#FFFDF6";

export const Mid: React.FC<{name: string; y: number; at: number; kind?: Kind; out?: number; rot?: number; bob?: number; boil?: "boil" | "boil-strong" | ""; children: React.ReactNode}> = ({
  name,
  y,
  at,
  kind = "pop",
  out,
  rot = 0,
  bob = 0,
  boil = "boil",
  children,
}) => (
  <A name={name} x={0} y={y} w={1920} at={at} kind={kind} out={out} rot={rot} bob={bob} boil={boil}>
    <div style={{display: "flex", justifyContent: "center"}}>{children}</div>
  </A>
);

// 图标 + 文字的横条卡（流程、清单用）
export const Row: React.FC<{icon: React.ReactNode; text: string; w?: number; h?: number; fill?: string; size?: number}> = ({icon, text, w = 760, h = 150, fill = CREAM, size = 58}) => (
  <div style={{display: "flex", alignItems: "center", gap: 28, width: w, height: h, padding: "0 36px", borderRadius: "26px 32px 22px 30px", backgroundColor: fill, border: `6px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`}}>
    <div style={{width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center"}}>{icon}</div>
    <div style={{fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{text}</div>
  </div>
);

// 对话气泡（圆角 + 小尾巴）
export const Say: React.FC<{text: string; fill?: string; color?: string; tail?: "left" | "right"; size?: number}> = ({text, fill = CREAM, color = INK, tail = "left", size = 46}) => (
  <div style={{position: "relative", display: "inline-block", padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.4}px`, borderRadius: 30, backgroundColor: fill, color, border: `5px solid ${INK}`, boxShadow: `6px 7px 0 ${INK}`, fontSize: size, fontWeight: 900, whiteSpace: "nowrap"}}>
    {text}
    <div style={{position: "absolute", [tail]: 34, bottom: -22, width: 34, height: 34, backgroundColor: fill, borderRight: `5px solid ${INK}`, borderBottom: `5px solid ${INK}`, rotate: tail === "left" ? "45deg" : "45deg"}} />
  </div>
);
