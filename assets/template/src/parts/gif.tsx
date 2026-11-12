import React from "react";
import {Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from "remotion";
import {FRAMES} from "../frameCounts";
import {SIZES} from "../shotSizes";
import {C} from "./Anim";
import {CREAM, GRN, INK, RED, YEL} from "./kit";

// GIF / 录屏类小组件：GIF 逐帧播放、截图卡、录屏卡、红框、翻页小本子的眼睛页、速度表

// GIF 按自己的帧延时逐帧播放（public/frames/<name>/NN.png）；speed = 倍速；at 之前停在第一帧
export const Gif: React.FC<{name: string; w: number; at?: number; speed?: number | ((f: number) => number); still?: boolean}> = ({name, w, at = 0, speed = 1, still = false}) => {
  const frame = useCurrentFrame();
  const g = FRAMES[name];
  const h = (w * g.h) / g.w;
  // 倍速可以随时间变：按每帧的速度累加播放进度，切换倍速时不跳帧
  let k = 0;
  if (!still && frame > at) {
    if (typeof speed === "number") {
      k = Math.floor((((frame - at) / 30) * 1000 * speed) / g.ms);
    } else {
      let acc = 0;
      for (let f = at; f < frame; f++) acc += speed(f);
      k = Math.floor(((acc / 30) * 1000) / g.ms);
    }
  }
  const idx = (k % g.n) + 1;
  return (
    <div style={{position: "relative", width: w, height: h, overflow: "hidden", backgroundColor: "#FFFFFF"}}>
      {Array.from({length: g.n}).map((_, i) => (
        // 全部帧都挂上（预加载），只显示当前帧，切帧不闪
        <Img key={i} src={staticFile(`frames/${name}/${String(i + 1).padStart(2, "0")}.png`)} style={{position: "absolute", left: 0, top: 0, width: w, height: h, opacity: i + 1 === idx ? 1 : 0}} />
      ))}
    </div>
  );
};

// 相框卡：米白底 + 墨边 + 硬投影，里面放 GIF / 截图；label = 卡片上方的小标签
export const Frame: React.FC<{w: number; children: React.ReactNode; label?: string; labelBg?: string; pad?: number; fill?: string}> = ({w, children, label, labelBg = YEL, pad = 14, fill = CREAM}) => (
  <div style={{position: "relative", width: w + pad * 2, padding: pad, borderRadius: "22px 28px 20px 26px", backgroundColor: fill, border: `6px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`}}>
    <div style={{borderRadius: 12, overflow: "hidden", border: `4px solid ${INK}`}}>{children}</div>
    {label ? (
      <div style={{position: "absolute", left: 26, top: -34, rotate: "-3deg", padding: "4px 22px 8px", borderRadius: 999, backgroundColor: labelBg, border: `5px solid ${INK}`, color: INK, fontSize: 36, fontWeight: 900, whiteSpace: "nowrap", boxShadow: `4px 5px 0 ${INK}`}}>{label}</div>
    ) : null}
  </div>
);

// 截图（public/img/s/<id>.png），宽 w；rings = 红框 [出现帧, x1, y1, x2, y2]（截图原图像素坐标）
export type Ring = [number, number, number, number, number];
export const Shot: React.FC<{id: string; w: number; rings?: Ring[]; color?: string}> = ({id, w, rings = [], color = RED}) => {
  const frame = useCurrentFrame();
  const [iw, ih] = SIZES[id];
  const k = w / iw;
  return (
    <div style={{position: "relative", width: w, height: ih * k}}>
      <Img src={staticFile(`img/s/${id}.png`)} style={{width: w, height: ih * k, display: "block"}} />
      {rings.map(([at, x1, y1, x2, y2], i) => {
        const p = interpolate(frame, [at, at + 10], [0, 1], C);
        if (p <= 0) return null;
        const s = interpolate(frame, [at, at + 6, at + 12], [1.25, 0.96, 1], C);
        return (
          <div
            key={i}
            style={{position: "absolute", left: x1 * k - 10, top: y1 * k - 10, width: (x2 - x1) * k + 20, height: (y2 - y1) * k + 20, border: `7px solid ${color}`, borderRadius: 16, opacity: p, scale: String(s), boxShadow: "0 0 0 3px rgba(255,255,255,0.8)"}}
          />
        );
      })}
    </div>
  );
};

// 录屏卡（public/rec/<name>.mp4，静音循环）
export const Rec: React.FC<{name: string; w: number}> = ({name, w}) => {
  const g = FRAMES[name];
  const h = (w * g.h) / g.w;
  return (
    <div style={{width: w, height: h, overflow: "hidden", backgroundColor: "#fff"}}>
      <Loop durationInFrames={g.n}>
        <OffthreadVideo src={staticFile(`rec/${name}.mp4`)} muted style={{width: w, height: h, objectFit: "cover"}} />
      </Loop>
    </div>
  );
};

// 一只卡通眼睛页（翻页小本子的一页）：open = 0 闭眼 ~ 1 睁眼
export const EyePage: React.FC<{w: number; open: number; n?: number; fill?: string}> = ({w, open, n, fill = "#FFFDF6"}) => {
  const h = w * 0.82;
  const eye = (cx: number) => {
    const ry = 34 * Math.max(0.06, open);
    return (
      <g key={cx}>
        <ellipse cx={cx} cy={118} rx={38} ry={34} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        {/* 眼皮从上往下盖：用一块皮肤色遮住上半 */}
        <clipPath id={`eye${cx}`}>
          <ellipse cx={cx} cy={118} rx={38} ry={34} />
        </clipPath>
        <g clipPath={`url(#eye${cx})`}>
          <circle cx={cx + 4} cy={122} r={17} fill={INK} />
          <circle cx={cx + 10} cy={114} r={5} fill="#FFFFFF" />
          <rect x={cx - 40} y={84 - 2} width={80} height={2 + (1 - open) * 70} fill="#9CCB6B" />
        </g>
        <path d={`M${cx - 38} ${152 - ry * 2 + (open < 0.1 ? 34 : 0)} Q${cx} ${open < 0.1 ? 128 : 118 - ry} ${cx + 38} ${152 - ry * 2 + (open < 0.1 ? 34 : 0)}`} fill="none" stroke={INK} strokeWidth={open < 0.1 ? 6 : 0} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <svg width={w} height={h} viewBox="0 0 300 246" style={{display: "block", overflow: "visible"}}>
      <rect x={4} y={4} width={292} height={238} rx={18} fill={fill} stroke={INK} strokeWidth={7} />
      {/* 青蛙脸：绿色圆脸 + 两只眼 + 嘴 */}
      <ellipse cx={150} cy={150} rx={112} ry={74} fill="#9CCB6B" stroke={INK} strokeWidth={6} />
      {eye(102)}
      {eye(198)}
      <path d="M128 182 Q150 196 172 182" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {n ? (
        <text x={24} y={44} fontSize={30} fontWeight={900} fill={RED}>
          {n}
        </text>
      ) : null}
    </svg>
  );
};

// 大对勾 / 大叉（圆章）
export const Mark: React.FC<{ok: boolean; size?: number}> = ({ok, size = 90}) => (
  <div style={{width: size, height: size, borderRadius: "50%", backgroundColor: ok ? GRN : RED, border: `6px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, color: "#FFF6E6", fontSize: size * 0.62, fontWeight: 900, textAlign: "center", lineHeight: `${size - 12}px`}}>{ok ? "✓" : "✗"}</div>
);

// 动作卡：大表情 + 文字 + 角标对勾 / 叉
export const ActCard: React.FC<{icon: string; text: string; ok: boolean; w?: number}> = ({icon, text, ok, w = 300}) => (
  <div style={{position: "relative", width: w, height: w * 0.82, borderRadius: "24px 30px 20px 28px", backgroundColor: ok ? "#E3F1D6" : "#FBE0D8", border: `6px solid ${INK}`, boxShadow: `9px 11px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8}}>
    <div style={{fontSize: w * 0.34, lineHeight: 1}}>{icon}</div>
    <div style={{fontSize: w * 0.16, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{text}</div>
    <div style={{position: "absolute", right: -26, top: -26}}>
      <Mark ok={ok} size={78} />
    </div>
  </div>
);
