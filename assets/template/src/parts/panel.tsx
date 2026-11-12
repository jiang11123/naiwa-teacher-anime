import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {A} from "./Anim";
import {CREAM, GRN, INK, PAPER, RED, SOFTB, SOFTY, YEL, fit} from "./palette";
import {VH, VW, VigScene, type Vig} from "./icons";

// 菜单牌（右侧讲解牌，做成通用版）：一块牌讲一个对象，配音讲一句加一行
// 每一行 = 上面一个图标小场景（VigScene）+ 下面一行字；底部小圆点是进度
// 常见用法：主体（店面 / 人物 / 截图）先居中，讲细节时主体往左让位（dx），菜单牌从右边滑进来
export type RowKind = "money" | "good" | "bad" | "fit" | "tip";
const ICON: Record<RowKind, [string, string, string]> = {money: ["¥", SOFTY, INK], good: ["✓", GRN, CREAM], bad: ["!", RED, CREAM], fit: ["★", YEL, INK], tip: ["→", SOFTB, INK]};
export type PanelRow = {at: number; kind: RowKind; text: string; vig?: Vig};
const CL = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

export const MenuPanel: React.FC<{name: string; at: number; out?: number; title: string; tag?: string; color: string; soft: string; rows: PanelRow[]; x?: number; y?: number}> = ({name, at, out, title, tag, color, soft, rows, x = 1262, y = 112}) => {
  const f = useCurrentFrame();
  let k = -1;
  rows.forEach((r, j) => {
    if (f >= r.at) k = j;
  });
  const kk = Math.max(0, k);
  const row = rows[kk];
  const t = k < 0 ? 0 : f - row.at;
  const [ch, bg, fg] = ICON[row.kind];
  const textW = VW - 20 * 2 - 58 - 16 - 24;
  return (
    <A name={name} x={x} y={y} w={VW} at={at} out={out} kind="right" rot={0.6} boil="">
      <div style={{backgroundColor: CREAM, border: `6px solid ${INK}`, borderRadius: "20px 26px 20px 24px", boxShadow: `10px 12px 0 ${INK}`, overflow: "hidden"}}>
        <div style={{height: 92, backgroundColor: soft, borderBottom: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px"}}>
          <div style={{fontSize: fit(title, tag ? 300 : 540, 54), fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
          {tag ? <div style={{padding: "4px 16px 8px", backgroundColor: INK, color: YEL, borderRadius: 12, fontSize: fit(tag, 250, 36), fontWeight: 900, whiteSpace: "nowrap"}}>{tag}</div> : null}
        </div>
        <div style={{width: VW, height: VH, backgroundColor: soft}}>{k >= 0 && row.vig ? <VigScene key={kk} v={row.vig} t={t} bg={soft} /> : null}</div>
        <div style={{height: 116, borderTop: `6px solid ${INK}`, display: "flex", alignItems: "center", gap: 16, padding: "0 20px"}}>
          <div style={{flex: "none", width: 58, height: 58, borderRadius: 99, backgroundColor: bg, border: `5px solid ${INK}`, color: fg, fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, scale: String(interpolate(t, [0, 10], [0.4, 1], {...CL, easing: BACK}))}}>{ch}</div>
          <div style={{fontSize: fit(row.text, textW, 50), fontWeight: 900, color: INK, whiteSpace: "nowrap", opacity: interpolate(t, [0, 6], [0, 1], CL), translate: `0px ${interpolate(t, [0, 10], [18, 0], {...CL, easing: Easing.bezier(0.16, 1, 0.3, 1)})}px`}}>{k >= 0 ? row.text : ""}</div>
        </div>
        <div style={{height: 30, borderTop: `4px solid ${INK}`, backgroundColor: PAPER, display: "flex", alignItems: "center", justifyContent: "center", gap: 10}}>
          {rows.map((_, j) => (
            <div key={j} style={{width: j === kk ? 26 : 12, height: 12, borderRadius: 99, backgroundColor: j <= k ? color : "#D8C6A2", border: `2px solid ${INK}`}} />
          ))}
        </div>
      </div>
    </A>
  );
};
