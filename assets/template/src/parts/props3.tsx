import React from "react";
import {Img, staticFile} from "remotion";
import {BLU, CREAM, GRN, INK, RED, YEL} from "./kit";

// 价格、课程、平台类的道具（全部墨线手绘风，尺寸按宽 w 等比）

// 课程价签：一张挂绳价签，写课程名 + 价格
export const PriceTag: React.FC<{w: number; title: string; price: string; strike?: boolean}> = ({w, title, price, strike = false}) => (
  <div style={{position: "relative", width: w, height: w * 0.62}}>
    <div style={{position: "absolute", left: 0, top: 0, width: w, height: w * 0.62, clipPath: "polygon(16% 0, 100% 0, 100% 100%, 16% 100%, 0 50%)", backgroundColor: INK}} />
    <div style={{position: "absolute", left: 7, top: 7, width: w - 14, height: w * 0.62 - 14, clipPath: "polygon(16% 0, 100% 0, 100% 100%, 16% 100%, 0 50%)", backgroundColor: YEL}} />
    <div style={{position: "absolute", left: w * 0.08, top: w * 0.27, width: w * 0.07, height: w * 0.07, borderRadius: 99, backgroundColor: CREAM, border: `5px solid ${INK}`}} />
    <div style={{position: "absolute", left: w * 0.22, top: w * 0.07, right: w * 0.04, fontSize: w * 0.085, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
    <div style={{position: "absolute", left: w * 0.22, top: w * 0.22, fontSize: w * 0.2, fontWeight: 900, color: RED, whiteSpace: "nowrap", textDecoration: strike ? "line-through 10px" : undefined}}>{price}</div>
  </div>
);

// 说明书：一本小册子，封面写标题，可贴"已过期"
export const Manual: React.FC<{w: number; title: string; ver?: string; old?: boolean}> = ({w, title, ver = "v1.0", old = false}) => (
  <div style={{position: "relative", width: w, height: w * 1.3, borderRadius: "14px 22px 18px 12px", backgroundColor: old ? "#E8DCC0" : "#CFE3F5", border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, filter: old ? "sepia(0.35)" : undefined}}>
    <div style={{position: "absolute", left: w * 0.08, top: 0, bottom: 0, width: 7, backgroundColor: INK}} />
    <div style={{position: "absolute", left: w * 0.18, top: w * 0.16, right: w * 0.08, fontSize: w * 0.13, fontWeight: 900, color: INK, lineHeight: 1.2}}>{title}</div>
    <div style={{position: "absolute", left: w * 0.18, top: w * 0.62, width: w * 0.6, height: 10, borderRadius: 9, backgroundColor: INK, opacity: 0.35}} />
    <div style={{position: "absolute", left: w * 0.18, top: w * 0.74, width: w * 0.45, height: 10, borderRadius: 9, backgroundColor: INK, opacity: 0.35}} />
    <div className="mono" style={{position: "absolute", right: w * 0.08, bottom: w * 0.08, fontSize: w * 0.1, fontWeight: 900, color: INK}}>{ver}</div>
  </div>
);

// 收藏夹：文件夹里插着一沓教程，灰尘 dust 0~1 越大越灰
export const Favs: React.FC<{w: number; n?: number; dust?: number; count?: string}> = ({w, n = 5, dust = 0, count}) => (
  <div style={{position: "relative", width: w, height: w * 0.8}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{position: "absolute", left: w * (0.06 + (n > 1 ? (i * 0.56) / (n - 1) : 0.28)), top: w * (0.02 + (i % 2) * 0.05), width: w * 0.36, height: w * 0.42, borderRadius: 10, backgroundColor: [CREAM, "#FFD3C9", "#CFE3F5", "#D9EFC8", "#FCE38A"][i % 5], border: `5px solid ${INK}`, rotate: `${(i - n / 2) * 4}deg`}}>
        <div style={{margin: "18% 14% 0", height: 8, borderRadius: 8, backgroundColor: INK, opacity: 0.4}} />
        <div style={{margin: "12% 14% 0", height: 8, width: "50%", borderRadius: 8, backgroundColor: INK, opacity: 0.4}} />
      </div>
    ))}
    <div style={{position: "absolute", left: 0, top: w * 0.26, width: w, height: w * 0.54, borderRadius: "10px 18px 22px 16px", backgroundColor: YEL, border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: w * 0.01}}>
      <div style={{fontSize: w * 0.12, fontWeight: 900, color: INK, whiteSpace: "nowrap", lineHeight: 1.1}}>⭐ 收藏夹</div>
      {count ? <div style={{fontSize: w * 0.09, lineHeight: 1.1, fontWeight: 900, color: RED, whiteSpace: "nowrap"}}>{count}</div> : null}
    </div>
    {/* 灰尘：一层灰 + 几团灰点 */}
    <div style={{position: "absolute", left: -6, top: w * 0.02, width: w + 12, height: w * 0.8, borderRadius: 20, backgroundColor: "#8C8478", opacity: dust * 0.45, mixBlendMode: "multiply"}} />
    {Array.from({length: 9}, (_, i) => (
      <div key={`d${i}`} style={{position: "absolute", left: w * (0.04 + ((i * 0.37) % 0.86)), top: w * (0.1 + ((i * 0.53) % 0.65)), width: w * 0.06, height: w * 0.03, borderRadius: 99, backgroundColor: "#6E675C", opacity: dust * 0.7}} />
    ))}
  </div>
);

// 泳池：一块蓝色水面 + 泳道线 + 跳台
export const Pool: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{position: "relative", width: w, height: h, borderRadius: "22px 28px 20px 26px", backgroundColor: BLU, border: `7px solid ${INK}`, boxShadow: `10px 12px 0 ${INK}`, overflow: "hidden"}}>
    {[0.33, 0.66].map((p) => (
      <div key={p} style={{position: "absolute", left: 0, top: h * p, width: w, height: 0, borderTop: `10px dashed ${YEL}`}} />
    ))}
    {[0.18, 0.5, 0.82].map((p, i) => (
      <div key={i} style={{position: "absolute", left: w * (0.15 + i * 0.25), top: h * p - 6, width: w * 0.16, height: 12, borderRadius: 99, backgroundColor: "#9CC6EA", opacity: 0.8}} />
    ))}
  </div>
);

// 网站卡片：浏览器窗口，地址栏 + 页面内容；show 0~1 页面"搭"出来的进度
export const SiteCard: React.FC<{w: number; url: string; title: string; show?: number; extra?: number}> = ({w, url, title, show = 1, extra = 0}) => {
  const h = w * 0.66;
  const blk = (i: number) => (show * 5 > i ? 1 : 0);
  return (
    <div style={{position: "relative", width: w, height: h, borderRadius: "22px 28px 20px 26px", backgroundColor: CREAM, border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, overflow: "hidden"}}>
      <div style={{height: w * 0.085, backgroundColor: "#EADFC8", borderBottom: `6px solid ${INK}`, display: "flex", alignItems: "center", gap: w * 0.012, padding: `0 ${w * 0.025}px`}}>
        {[RED, YEL, GRN].map((c) => (
          <div key={c} style={{width: w * 0.025, height: w * 0.025, borderRadius: 99, backgroundColor: c, border: `3px solid ${INK}`}} />
        ))}
        <div className="mono" style={{marginLeft: w * 0.02, flex: 1, height: w * 0.05, borderRadius: 99, backgroundColor: CREAM, border: `4px solid ${INK}`, fontSize: w * 0.03, fontWeight: 700, color: INK, display: "flex", alignItems: "center", padding: `0 ${w * 0.02}px`, whiteSpace: "nowrap", overflow: "hidden"}}>{url}</div>
      </div>
      <div style={{padding: `${w * 0.035}px ${w * 0.05}px`}}>
        <div style={{opacity: blk(0), fontSize: w * 0.07, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{title}</div>
        <div style={{marginTop: w * 0.02, width: "70%", height: w * 0.022, borderRadius: 99, backgroundColor: INK, opacity: blk(1) * 0.35}} />
        <div style={{display: "flex", gap: w * 0.03, marginTop: w * 0.04}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{opacity: blk(2 + i), width: w * 0.26, height: w * 0.2, borderRadius: 14, backgroundColor: ["#FFD3C9", "#CFE3F5", "#D9EFC8"][i], border: `5px solid ${INK}`}} />
          ))}
        </div>
        {extra > 0 ? (
          <div style={{marginTop: w * 0.035, display: "inline-block", scale: String(extra), padding: `${w * 0.012}px ${w * 0.04}px`, borderRadius: 99, backgroundColor: RED, border: `5px solid ${INK}`, color: CREAM, fontSize: w * 0.04, fontWeight: 900}}>联系我</div>
        ) : null}
      </div>
    </div>
  );
};

// 一张截图卡（素材截图）：墨边 + 硬投影，按宽度等比
export const Shot: React.FC<{src: string; w: number; iw: number; ih: number; rot?: number}> = ({src, w, iw, ih, rot = 0}) => (
  <div style={{width: w, height: (w * ih) / iw, borderRadius: 22, overflow: "hidden", border: `7px solid ${INK}`, boxShadow: `12px 14px 0 ${INK}`, rotate: `${rot}deg`, backgroundColor: "#111"}}>
    <Img src={staticFile(src)} style={{width: "100%", height: "100%", display: "block"}} />
  </div>
);

// 茧：椭圆形的茧，里面有个小人，crack 0~1 裂开
export const Cocoon: React.FC<{w: number; crack?: number}> = ({w, crack = 0}) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 200 260" style={{overflow: "visible"}}>
    <ellipse cx={100} cy={130} rx={88} ry={120} fill="#F2E6C9" stroke={INK} strokeWidth={7} />
    {[40, 75, 110, 145, 180, 215].map((y, i) => (
      <path key={y} d={`M${30 + (i % 2) * 6} ${y} Q100 ${y + 26} ${170 - (i % 2) * 6} ${y - 4}`} fill="none" stroke={INK} strokeWidth={4} opacity={0.55} />
    ))}
    {/* 里面的小人 */}
    <circle cx={100} cy={115} r={26} fill={YEL} stroke={INK} strokeWidth={6} opacity={0.25 + crack * 0.75} />
    {crack > 0 ? <path d={`M100 12 L88 ${40 + crack * 30} L110 ${70 + crack * 40} L92 ${100 + crack * 60}`} fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" /> : null}
  </svg>
);

// 拼图块：单独一块拼图，写一个词
export const Piece: React.FC<{w: number; text: string; fill?: string; size?: number}> = ({w, text, fill = YEL, size}) => (
  <div style={{position: "relative", width: w, height: w * 0.72}}>
    <svg width={w} height={w * 0.72} viewBox="0 0 100 72" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <path d="M0 8 H38 a10 10 0 1 1 20 0 H92 V30 a10 10 0 1 1 0 20 V72 H0 Z" fill={fill} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
    </svg>
    <div style={{position: "absolute", left: 0, top: w * 0.12, width: w * 0.92, height: w * 0.6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size ?? w * 0.15, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{text}</div>
  </div>
);

// 平台图标（手绘版，不用官方 logo）：X / GitHub / 油管 / B站
export const Platform: React.FC<{kind: "x" | "gh" | "yt" | "bili"; size: number}> = ({kind, size}) => {
  const box = (bg: string, children: React.ReactNode) => (
    <div style={{width: size, height: size, borderRadius: size * 0.24, backgroundColor: bg, border: `7px solid ${INK}`, boxShadow: `8px 10px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center"}}>{children}</div>
  );
  if (kind === "x")
    return box(
      INK,
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 100 100">
        <path d="M10 8 L40 8 L92 92 L62 92 Z" fill={CREAM} />
        <path d="M84 8 L92 8 L56 50 L50 43 Z M8 92 L16 92 L47 56 L42 49 Z" fill={CREAM} />
      </svg>,
    );
  if (kind === "gh")
    return box(
      CREAM,
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 100 100">
        <circle cx={50} cy={52} r={40} fill={INK} />
        <path d="M30 32 L34 18 L44 26 H56 L66 18 L70 32 C76 40 76 58 66 64 C60 68 40 68 34 64 C24 58 24 40 30 32 Z" fill={CREAM} />
        <circle cx={41} cy={46} r={4.5} fill={INK} />
        <circle cx={59} cy={46} r={4.5} fill={INK} />
        <path d="M44 74 V90 M56 74 V90" stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
      </svg>,
    );
  if (kind === "yt")
    return box(
      RED,
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 100 100">
        <path d="M30 18 L84 50 L30 82 Z" fill={CREAM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </svg>,
    );
  return box(
    "#6FC3E8",
    <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 100 100">
      <path d="M30 10 L42 24 M70 10 L58 24" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <rect x={10} y={24} width={80} height={62} rx={14} fill={CREAM} stroke={INK} strokeWidth={7} />
      <path d="M30 46 L40 52 M70 46 L60 52" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M40 66 Q45 72 50 66 Q55 72 60 66" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </svg>,
  );
};

// 传话筒：三个人排成一排，消息越传越走样
export const Whisper: React.FC<{w: number; msgs: string[]; show: number}> = ({w, msgs, show}) => (
  <div style={{position: "relative", width: w, height: w * 0.42, display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
    {msgs.map((m, i) => (
      <div key={i} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: show > i ? 1 : 0.15}}>
        <div style={{padding: "10px 22px 14px", borderRadius: 22, backgroundColor: i === 0 ? "#D9EFC8" : i === msgs.length - 1 ? "#FFD3C9" : CREAM, border: `5px solid ${INK}`, boxShadow: `5px 6px 0 ${INK}`, fontSize: w * 0.03, fontWeight: 900, color: INK, whiteSpace: "nowrap"}}>{m}</div>
        <div style={{width: w * 0.12, height: w * 0.12, borderRadius: 99, backgroundColor: [GRN, YEL, RED][i % 3], border: `6px solid ${INK}`}} />
        <div style={{width: w * 0.16, height: w * 0.08, borderRadius: "60px 60px 10px 10px", backgroundColor: [GRN, YEL, RED][i % 3], border: `6px solid ${INK}`}} />
      </div>
    ))}
  </div>
);

// 进度台阶：一级一级往上，lit 级亮
export const Steps: React.FC<{w: number; labels: string[]; lit: number}> = ({w, labels, lit}) => {
  const n = labels.length;
  const sw = w / n;
  return (
    <div style={{position: "relative", width: w, height: sw * n * 0.5 + 120}}>
      {labels.map((l, i) => (
        <div key={i} style={{position: "absolute", left: i * sw, bottom: 0, width: sw - 10, height: 120 + i * sw * 0.5, borderRadius: "14px 18px 4px 4px", backgroundColor: lit > i ? ["#FCE38A", "#D9EFC8", "#CFE3F5", "#FFD3C9"][i % 4] : "#E6DCC6", border: `6px solid ${INK}`, boxShadow: `7px 0 0 ${INK}`, display: "flex", justifyContent: "center", paddingTop: 14}}>
          <div style={{fontSize: sw * 0.15, fontWeight: 900, color: INK, whiteSpace: "nowrap", opacity: lit > i ? 1 : 0.35}}>{l}</div>
        </div>
      ))}
    </div>
  );
};
