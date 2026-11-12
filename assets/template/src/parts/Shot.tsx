import React from "react";
import {Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame} from "remotion";
import {SIZES} from "../shotSizes";
import {C, IO, SceneCtx} from "./Anim";

// 截图窗口：一个窗口贯穿一整段，新截图从右边推进来、旧图往左推走
// 坐标全部用截图百分比：镜头 K(到位帧, 缩放, 焦点x%, 焦点y%)、红框 R(帧, x1%, y1%, x2%, y2%, 选项)；缩放 1 = 整张图放进窗口
// 镜头到点前 18 帧推过去，其余时间停住
const INK = "#2B211C";

export type Key = [number, number, number, number];
export type Ring = {at: number; x1: number; y1: number; x2: number; y2: number; tap?: boolean; out?: number; color?: string};
export type ShotImg = {at: number; id: string; cam?: Key[]; rings?: Ring[]; bg?: string};
export const K = (f: number, z: number, x: number, y: number): Key => [f, z, x, y];
export const R = (at: number, x1: number, y1: number, x2: number, y2: number, o: {tap?: boolean; out?: number; color?: string} = {}): Ring => ({at, x1, y1, x2, y2, ...o});

const camAt = (cam: Key[], frame: number): [number, number, number] => {
  const ks: Key[] = [];
  cam.forEach((k, i) => {
    if (i === 0) {
      ks.push(k);
      return;
    }
    const last = ks[ks.length - 1];
    const f = Math.max(last[0] + 2, k[0]);
    ks.push([Math.max(last[0] + 1, f - 18), last[1], last[2], last[3]]);
    ks.push([f, k[1], k[2], k[3]]);
  });
  if (ks.length === 1) {
    return [ks[0][1], ks[0][2], ks[0][3]];
  }
  const fs = ks.map((k) => k[0]);
  const pick = (i: number) => interpolate(frame, fs, ks.map((k) => k[i]), {...C, easing: IO});
  return [pick(1), pick(2), pick(3)];
};

const RingMark: React.FC<{r: Ring; sw: number; sh: number; k: number}> = ({r, sw: SW, sh: SH, k}) => {
  const frame = useCurrentFrame();
  const t = frame - r.at;
  if (t < 0) {
    return null;
  }
  const x = (r.x1 / 100) * SW;
  const y = (r.y1 / 100) * SH;
  const w = ((r.x2 - r.x1) / 100) * SW;
  const h = ((r.y2 - r.y1) / 100) * SH;
  const p = interpolate(t, [0, 10], [0, 1], {...C, easing: Easing.bezier(0.33, 1, 0.68, 1)});
  const o = r.out === undefined ? 1 : interpolate(frame, [r.out, r.out + 6], [1, 0], C);
  const pad = 9 / k;
  const sw = 7 / k;
  const color = r.color ?? "#D9362B";
  const tp = interpolate(t, [6, 24], [0, 1], C);
  return (
    <div className="boil" style={{position: "absolute", left: x - pad, top: y - pad, width: w + pad * 2, height: h + pad * 2, opacity: o, scale: String(1 + Math.sin(t / 5) * 0.008)}}>
      <svg width={w + pad * 2} height={h + pad * 2} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <rect x={sw / 2} y={sw / 2} width={w + pad * 2 - sw} height={h + pad * 2 - sw} rx={14 / k} fill="rgba(247,198,74,0.14)" stroke={color} strokeWidth={sw} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
      </svg>
      {r.tap && tp < 1 ? <div style={{position: "absolute", left: (w + pad * 2) / 2 - 50 / k, top: (h + pad * 2) / 2 - 50 / k, width: 100 / k, height: 100 / k, borderRadius: "50%", border: `${7 / k}px solid ${color}`, opacity: 1 - tp, scale: String(0.3 + tp * 1.4)}} /> : null}
    </div>
  );
};

const Layer: React.FC<{s: ShotImg; w: number; h: number}> = ({s, w, h}) => {
  const frame = useCurrentFrame();
  const [SW, SH] = SIZES[s.id];
  const [z, fx, fy] = camAt(s.cam ?? [[s.at, 1, 50, 50]], frame);
  const k = Math.min(w / SW, h / SH) * z;
  const iw = SW * k;
  const ih = SH * k;
  const left = iw <= w ? (w - iw) / 2 : Math.min(0, Math.max(w - iw, w / 2 - (fx / 100) * iw));
  const top = ih <= h ? (h - ih) / 2 : Math.min(0, Math.max(h - ih, h / 2 - (fy / 100) * ih));
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: w, height: h, backgroundColor: s.bg ?? "#F3F1EC", overflow: "hidden"}}>
      <div style={{position: "absolute", left, top, width: SW, height: SH, transformOrigin: "0 0", scale: String(k)}}>
        <Img src={staticFile(`img/s/${s.id}.png`)} style={{position: "absolute", left: 0, top: 0, width: SW, height: SH}} />
        {(s.rings ?? []).map((r, i) => (
          <RingMark key={i} r={r} sw={SW} sh={SH} k={k} />
        ))}
      </div>
    </div>
  );
};

// 截图窗口：黄色标题栏 + 左上三个点 + 地址/名字；box = 窗口在画面里的位置和大小（截图区域，不含标题栏）
// 多张截图依次换（新图从右边推进来、旧图往左推走）；extra = 叠在窗口上面的东西（便签、箭头）
export const WIN = {x: 94, y: 80, w: 1720, h: 800};
// 3D：窗口有厚度（背后叠几层墨色板当侧边）+ 透视倾斜（朝画面中间转）+ 进场从纵深里翻转出来 + 停住后缓慢轻摆
// tilt = 侧转角度（默认按窗口在左/右自动定），enter = 进场帧（默认 0 = 分镜开头），flat = 关掉 3D
export const Shot: React.FC<{name: string; shots: ShotImg[]; title?: string; box?: {x: number; y: number; w: number; h: number}; extra?: React.ReactNode; tilt?: number; enter?: number; flat?: boolean}> = ({name, shots, title = "", box = WIN, extra, tilt, enter = 0, flat = false}) => {
  const frame = useCurrentFrame();
  const {w, h} = box;
  const cx = box.x + w / 2;
  const ry0 = tilt ?? (cx < 900 ? 9 : cx > 1020 ? -9 : 0);
  const info = React.useContext(SceneCtx);
  const pin = info.enterKeep ? 1 : interpolate(frame, [enter, enter + 20], [0, 1], {...C, easing: Easing.bezier(0.22, 1.25, 0.36, 1)});
  // 退场：下一个分镜接着用同一个窗口 → 到点直接让位；镜头不动换分镜 → 窗口往下沉、缩小淡掉
  const ex = info.exitAt === undefined ? 0 : info.keepShot ? (frame >= info.exitAt ? 1 : 0) : interpolate(frame, [info.exitAt, info.exitAt + 10], [0, 1], {...C, easing: Easing.bezier(0.5, 0, 0.75, 0)});
  const ry = flat ? 0 : ry0 + (1 - pin) * (ry0 >= 0 ? 55 : -55) + Math.sin(frame / 70) * 2.2;
  const rx = flat ? 0 : 5 + (1 - pin) * 18 + Math.cos(frame / 83) * 1.4;
  const tz = flat ? 0 : (1 - pin) * -700;
  const depth = flat ? 0 : 26;
  const W2 = w + 12;
  const H2 = h + 62;
  return (
    <Interactive.Div name={name} style={{position: "absolute", left: box.x, top: box.y, width: W2, height: H2, perspective: 2200, perspectiveOrigin: `${960 - box.x}px ${480 - box.y}px`}}>
      {/* 地面投影 */}
      <div style={{position: "absolute", left: W2 * 0.06, top: H2 - 10, width: W2 * 0.88, height: 70, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(43,33,28,0.35), rgba(43,33,28,0) 70%)", opacity: pin * (1 - ex), scale: `${0.6 + pin * 0.4} 1`}} />
      <div style={{position: "absolute", left: 0, top: 0, width: W2, height: H2, transformStyle: "preserve-3d", transformOrigin: "50% 50%", transform: `translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`, opacity: (info.enterKeep ? 1 : interpolate(frame, [enter, enter + 6], [0, 1], C)) * (1 - ex), scale: String(1 - (info.keepShot ? 0 : ex * 0.3)), translate: `0px ${info.keepShot ? 0 : ex * 90}px`}}>
        {/* 厚度：背后几层墨色板 */}
        {depth
          ? [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{position: "absolute", left: 0, top: 0, width: W2, height: H2, borderRadius: 26, backgroundColor: i === 6 ? INK : "#5A4636", border: `6px solid ${INK}`, boxSizing: "border-box", transform: `translateZ(${(-depth * i) / 6}px)`}} />
            ))
          : null}
        <div style={{position: "absolute", left: 0, top: 0, width: W2, height: H2, borderRadius: 26, backgroundColor: "#FFFDF6", border: `6px solid ${INK}`, boxSizing: "border-box", boxShadow: flat ? `10px 12px 0 ${INK}` : "none", overflow: "hidden", transform: "translateZ(1px)"}}>
          <div style={{position: "absolute", left: 0, top: 0, width: w + 12, height: 50, backgroundColor: "#F7C64A", borderBottom: `5px solid ${INK}`}}>
            {["#D9362B", "#FFF6E6", "#4E8A4A"].map((c, i) => (
              <div key={c} style={{position: "absolute", left: 22 + i * 36, top: 13, width: 22, height: 22, borderRadius: "50%", backgroundColor: c, border: `4px solid ${INK}`}} />
            ))}
            <div style={{position: "absolute", left: 150, top: 3, fontSize: 30, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
          </div>
          <div style={{position: "absolute", left: 0, top: 50, width: w, height: h, overflow: "hidden", backgroundColor: "#FFFFFF"}}>
            {shots.map((s, i) => {
              const next = shots[i + 1];
              if (frame < s.at && i > 0) {
                return null;
              }
              if (next && frame > next.at + 14) {
                return null;
              }
              const sin = i === 0 ? 1 : interpolate(frame, [s.at, s.at + 14], [0, 1], {...C, easing: IO});
              const pout = next ? interpolate(frame, [next.at, next.at + 14], [0, 1], {...C, easing: IO}) : 0;
              return (
                <div key={s.id + s.at} style={{position: "absolute", left: 0, top: 0, width: w, height: h, translate: `${(1 - sin) * w - pout * w * 0.35}px 0px`}}>
                  <Layer s={s} w={w} h={h} />
                </div>
              );
            })}
          </div>
          {/* 扫过的高光，表现玻璃面 */}
          {flat ? null : <div style={{position: "absolute", left: 0, top: 0, width: W2, height: H2, background: `linear-gradient(${115 + ry * 2}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.16) 48%, rgba(255,255,255,0) 60%)`, pointerEvents: "none"}} />}
        </div>
      </div>
      {extra}
    </Interactive.Div>
  );
};
