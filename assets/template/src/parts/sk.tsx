import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {CH} from "../charSizes";
import {BACK, C} from "./Anim";
import {Cam} from "./fx";
import {CREAM, INK, RED, YEL} from "./kit";

// 档案类专属道具：实习生 / 档案袋 / 抽屉柜 / 墙上守则 / 记事本（逐字敲 SKILL.md）/ 待补素材位
const io = Easing.bezier(0.65, 0, 0.35, 1);
export const seg = (frame: number, keys: [number, number][]) => interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), {...C, easing: io});
export const Sc: React.FC<{keys?: [number, number, number, number][]; children: React.ReactNode}> = ({keys = [[0, 1, 960, 540]], children}) => (
  <AbsoluteFill>
    <Cam keys={keys}>{children}</Cam>
  </AbsoluteFill>
);

export type CN = "tea" | "thumb" | "stick" | "shrug" | "chin" | "boss" | "kid" | "q" | "shock" | "sad" | "hand";
export const Ch: React.FC<{n: CN; h: number; flip?: boolean}> = ({n, h, flip = false}) => {
  const f = useCurrentFrame();
  const [iw, ih] = CH[n];
  const b = 1 + Math.sin(f / 16) * 0.012;
  return <Img src={staticFile(`img/c/${n}.png`)} style={{height: h, width: (h * iw) / ih, display: "block", transformOrigin: "50% 100%", transform: `${flip ? "scaleX(-1) " : ""}scaleY(${b})`}} />;
};

// 行内逐个弹出
export const Ap: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const f = useCurrentFrame();
  const t = f - at;
  return <div style={{opacity: t < 0 ? 0 : 1, scale: `${interpolate(t, [0, 10], [0.4, 1], {...C, easing: BACK})}`, ...style}}>{children}</div>;
};

export const Dossier: React.FC<{w: number; label: string; sub?: string; size?: number; fill?: string; labelBg?: string}> = ({w, label, sub, size, fill = "#DDBB80", labelBg = CREAM}) => {
  const h = w * 0.74;
  const s = size ?? w * 0.105;
  return (
    <div style={{position: "relative", width: w, height: h, backgroundColor: fill, border: `6px solid ${INK}`, borderRadius: "10px 14px 12px 12px", boxShadow: `9px 11px 0 ${INK}`}}>
      <div style={{position: "absolute", left: "-1%", top: -6, width: "102%", height: h * 0.2, backgroundColor: "#C9A365", borderBottom: `5px solid ${INK}`, borderRadius: "10px 14px 40% 40%"}} />
      <div style={{position: "absolute", left: "50%", top: h * 0.13, width: w * 0.08, height: w * 0.08, marginLeft: -w * 0.04, borderRadius: "50%", backgroundColor: RED, border: `4px solid ${INK}`}} />
      <div style={{position: "absolute", left: "9%", right: "9%", top: h * 0.36, bottom: h * 0.12, backgroundColor: labelBg, border: `4px solid ${INK}`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "0 10px"}}>
        <div style={{fontSize: s, fontWeight: 900, color: INK, whiteSpace: "nowrap", lineHeight: 1.15}}>{label}</div>
        {sub ? <div style={{fontSize: s * 0.56, fontWeight: 800, color: "#6B5442", textAlign: "center", lineHeight: 1.2}}>{sub}</div> : null}
      </div>
    </div>
  );
};

// 抽屉柜：顶层抽屉 open = 0~1 拉开，露出一排档案袋的上沿（tabs = 标签文字）
export const Cabinet: React.FC<{w: number; open?: number; tabs?: string[]; label?: string}> = ({w, open = 1, tabs = [], label = "skills"}) => {
  const h = w * 0.86;
  const rise = open * w * 0.26;
  return (
    <div style={{position: "relative", width: w, height: h}}>
      <div style={{position: "absolute", left: "6%", right: "6%", top: w * 0.26 - rise, height: rise + 30, overflow: "hidden"}}>
        <div style={{display: "flex", justifyContent: "center", gap: 6, alignItems: "flex-start"}}>
          {tabs.map((t, i) => (
            <div key={t + i} style={{flex: 1, height: w * 0.3, backgroundColor: i % 2 ? "#E8CB95" : "#DDBB80", border: `5px solid ${INK}`, borderRadius: "10px 10px 0 0", display: "flex", justifyContent: "center", paddingTop: 8, fontSize: w * 0.05, fontWeight: 900, color: INK, whiteSpace: "nowrap", overflow: "hidden"}}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{position: "absolute", left: 0, top: w * 0.26, width: w, height: h - w * 0.26, backgroundColor: "#A87B4F", border: `7px solid ${INK}`, borderRadius: 16, boxShadow: `12px 14px 0 ${INK}`}}>
        {[0, 1].map((i) => (
          <div key={i} style={{position: "absolute", left: "6%", right: "6%", top: `${6 + i * 49}%`, height: "41%", backgroundColor: i === 0 ? "#C99A67" : "#BC8D5B", border: `6px solid ${INK}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 18}}>
            <div style={{fontSize: w * 0.08, fontWeight: 900, color: INK}}>{i === 0 ? label : ""}</div>
            <div style={{width: w * 0.16, height: w * 0.035, borderRadius: 99, backgroundColor: INK}} />
          </div>
        ))}
      </div>
    </div>
  );
};

// 墙上的公司守则：rows 依次贴满
export const Poster: React.FC<{w: number; h: number; title?: string; rows: string[]; show?: number; size?: number; fill?: string}> = ({w, h, title = "公司守则", rows, show = 99, size = 38, fill = "#FFF4CF"}) => (
  <div style={{position: "relative", width: w, height: h, backgroundColor: fill, border: `6px solid ${INK}`, borderRadius: 10, boxShadow: `9px 11px 0 ${INK}`, padding: "16px 28px"}}>
    <div style={{position: "absolute", left: "50%", top: -24, marginLeft: -60, width: 120, height: 40, backgroundColor: "rgba(247,198,74,.85)", border: `3px solid ${INK}`, rotate: "-2deg"}} />
    <div style={{textAlign: "center", fontSize: size * 1.35, fontWeight: 900, color: RED, marginBottom: 8}}>{title}</div>
    {rows.slice(0, show).map((r) => (
      <div key={r} style={{fontSize: size, fontWeight: 800, color: INK, whiteSpace: "nowrap", lineHeight: 1.45}}>· {r}</div>
    ))}
  </div>
);

export const Sticky: React.FC<{text: string; w?: number; fill?: string; size?: number; rot?: number}> = ({text, w = 220, fill = "#FCE38A", size = 40, rot = 0}) => (
  <div style={{whiteSpace: "pre-line", width: w, minHeight: w * 0.62, padding: 12, rotate: `${rot}deg`, backgroundColor: fill, border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size, fontWeight: 900, color: INK, textAlign: "center", lineHeight: 1.15}}>{text}</div>
);

// 记事本：逐字敲 SKILL.md。at = 这行开始敲（不给 = 已经敲好）；hl = 高亮这行里的一段；hi = 高亮整行
export type PL = {t: string; at?: number; cps?: number; hi?: number; hl?: {s: string; at: number; c?: string}; dim?: boolean};
export const Pad: React.FC<{w: number; lines: PL[]; title?: string; size?: number; minH?: number}> = ({w, lines, title = "新建文本文档 - 记事本", size = 44, minH = 0}) => {
  const f = useCurrentFrame();
  const lh = size * 1.42;
  const num = size * 1.5;
  let cur = -1;
  lines.forEach((l, i) => {
    if (l.at !== undefined && f >= l.at) cur = i;
  });
  return (
    <div style={{width: w, minHeight: minH, borderRadius: "22px 28px 20px 26px", backgroundColor: "#FFFEFA", border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden"}}>
      <div style={{height: 68, backgroundColor: "#EADFC8", borderBottom: `6px solid ${INK}`, display: "flex", alignItems: "center", gap: 12, paddingLeft: 22, fontSize: 32, fontWeight: 900, color: INK}}>
        <div style={{width: 34, height: 40, backgroundColor: "#CFE3F5", border: `4px solid ${INK}`, borderRadius: 5}} />
        {title}
      </div>
      <div style={{padding: "14px 22px 20px 0"}}>
        {lines.map((l, i) => {
          const n = l.at === undefined ? 1e9 : Math.floor(((f - l.at) / 30) * (l.cps ?? 16));
          if (l.at !== undefined && f < l.at) return <div key={i} style={{height: 0}} />;
          const shown = [...l.t].slice(0, Math.max(0, n)).join("");
          const hiOn = l.hi !== undefined && f >= l.hi;
          const hlOn = l.hl && f >= l.hl.at && shown.includes(l.hl.s);
          const k = hlOn ? shown.indexOf(l.hl!.s) : -1;
          return (
            <div key={i} style={{display: "flex", minHeight: lh, opacity: l.dim ? 0.42 : 1}}>
              <div style={{width: num, flexShrink: 0, textAlign: "right", paddingRight: 16, fontSize: size * 0.68, lineHeight: `${lh}px`, color: "#A99A83", fontWeight: 800}}>{i + 1}</div>
              <div style={{fontFamily: "Consolas, 'Microsoft YaHei', monospace", fontSize: size, lineHeight: `${lh}px`, fontWeight: 800, color: INK, backgroundColor: hiOn ? "#FCE38A" : undefined, borderRadius: 8, padding: "0 8px", whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                {k >= 0 ? (
                  <>
                    {shown.slice(0, k)}
                    <span style={{backgroundColor: l.hl!.c ?? "#F7C64A", outline: `3px solid ${INK}`, borderRadius: 6}}>{l.hl!.s}</span>
                    {shown.slice(k + l.hl!.s.length)}
                  </>
                ) : (
                  shown
                )}
                {i === cur && Math.floor(f / 10) % 2 === 0 ? <span style={{display: "inline-block", width: 4, height: size, marginLeft: 3, verticalAlign: "-4px", backgroundColor: INK}} /> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SKILL.md 全文（屏幕上逐步敲出来的就是这一份）
export const DESC = "description: 按我的固定格式写工作周报。当我说“写周报”“这周周报”时使用。";
export const DOC = ["---", "name: weekly-report", DESC, "---", "", "# 写周报", "", "## 步骤", "1. 分成做完的、在做的、卡住的", "2. 没说下周计划，先问我", "## 格式", "本周完成 / 进行中 / 问题 / 下周计划", "## 规矩", "- 不超过 300 字", "## 范例", "（贴一份你满意的周报）"];
export const docTo = (n: number, over: Record<number, Partial<PL>> = {}): PL[] => DOC.slice(0, n).map((t, i) => ({t, ...over[i]}));

// 待补素材位：之后换成真实录屏 / 截图
export const Slot: React.FC<{w: number; h: number; no: string; text: string}> = ({w, h, no, text}) => (
  <div style={{width: w, height: h, borderRadius: 18, backgroundColor: "#F4ECDA", border: `6px dashed ${RED}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20}}>
    <div style={{padding: "4px 18px", borderRadius: 10, backgroundColor: RED, color: CREAM, fontSize: 34, fontWeight: 900}}>待补素材 {no}</div>
    <div style={{fontSize: 44, fontWeight: 900, color: INK, textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-line"}}>{text}</div>
  </div>
);

export const Path: React.FC<{items: string[]; lit: number; size?: number}> = ({items, lit, size = 46}) => (
  <div style={{display: "flex", alignItems: "center", gap: 10}}>
    {items.map((t, i) => (
      <React.Fragment key={t}>
        {i ? <div style={{fontSize: size, fontWeight: 900, color: INK, opacity: i < lit ? 1 : 0.2}}>›</div> : null}
        <div style={{padding: `${size * 0.14}px ${size * 0.4}px ${size * 0.2}px`, borderRadius: 14, border: `5px solid ${INK}`, backgroundColor: i < lit ? (i === items.length - 1 ? YEL : CREAM) : "#EADFC8", opacity: i < lit ? 1 : 0.35, boxShadow: i < lit ? `4px 5px 0 ${INK}` : undefined, fontSize: size, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{t}</div>
      </React.Fragment>
    ))}
  </div>
);

export const Note: React.FC<{sym?: string; text: string; w?: number; fill?: string; size?: number}> = ({sym, text, w = 620, fill = CREAM, size = 44}) => (
  <div style={{display: "flex", alignItems: "center", gap: 20, width: w, padding: "16px 24px 20px", borderRadius: "22px 26px 18px 24px", backgroundColor: fill, border: `6px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`}}>
    {sym ? <div style={{flexShrink: 0, padding: "2px 16px 6px", borderRadius: 12, backgroundColor: INK, color: YEL, fontFamily: "Consolas, monospace", fontSize: size * 1.1, fontWeight: 900, whiteSpace: "nowrap"}}>{sym}</div> : null}
    <div style={{fontSize: size, fontWeight: 900, color: INK, lineHeight: 1.22}}>{text}</div>
  </div>
);

// 真实截图：size = 原图 [宽, 高]；hl = 按原图像素圈重点（到 at 帧弹出红框）
export const Shot: React.FC<{src: string; w: number; size: [number, number]; hl?: {at: number; l: number; t: number; w: number; h: number}[]}> = ({src, w, size, hl = []}) => {
  const f = useCurrentFrame();
  const k = w / size[0];
  return (
    <div style={{position: "relative", width: w, height: size[1] * k, borderRadius: 20, backgroundColor: "#FFFFFF", border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden"}}>
      <Img src={staticFile(`shots/${src}`)} style={{display: "block", width: "100%", height: "100%"}} />
      {hl.map((b, i) => {
        const t = f - b.at;
        return <div key={i} style={{position: "absolute", left: b.l * k - 8, top: b.t * k - 8, width: b.w * k + 16, height: b.h * k + 16, border: `6px solid ${RED}`, borderRadius: 14, opacity: t < 0 ? 0 : 1, scale: `${interpolate(t, [0, 9], [1.35, 1], {...C, easing: BACK})}`}} />;
      })}
    </div>
  );
};
