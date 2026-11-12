import React from "react";
import {AbsoluteFill, Img, Interactive, staticFile} from "remotion";
import {HandFilters} from "./hand";
import {INK, PAPER, YEL} from "./parts/palette";

// 封面（4:3 和 3:4），导出成片、用户说“做封面”之后才做（references/export-cover.md）
// ⚠️ 这个文件是**起点示例，不是固定模板**。每期封面要按这期的钩子类型重新设计版面：
//    先定钩子（数字损失 / 价格反差 / 认知反转 / 概念对比 / 纯疑问 / 结果承诺），
//    再从 references/cover-refs/ 的六种构式里挑（数字压字、价签居中、界面即封面、对话气泡、实物比喻、对比双物），
//    或者自己发明；然后改下面这些 JSX 重排，不复用上一期的布局。连着两期长一样就算失败。
// 共同基因不能丢：米黄波点纸底、粗墨线、硬投影、≤3 色（纸墨不算）、钩子缩到 300px 宽还能读、一张封面只讲一件事。
// 下面这套“主题签 + 大字钩子 + 黄条利益点 + 人物”只是其中一种写法，4:3 和 3:4 是两种构图、分别排，不是缩放。
// 每块是单独一层 Interactive.Div，用户会在 Studio 里拖动定稿，以他拖好的位置为准导出
const COVER = {
  theme: "AI 幻觉",
  hook: ["AI 一本正经", "胡说八道"], // 第二行的 mark 部分会被黄色马克笔高亮
  mark: "胡说八道",
  benefit: "3 招治好它",
  person: "img/c/stick.png", // 人物图；不放人物就设为 ""
};

const Layer: React.FC<{name: string; x: number; y: number; rot?: number; children: React.ReactNode}> = ({name, x, y, rot = 0, children}) => (
  <Interactive.Div name={name} style={{position: "absolute", left: x, top: y, rotate: `${rot}deg`}}>
    {children}
  </Interactive.Div>
);
const Bg: React.FC<{W: number; H: number}> = ({W, H}) => (
  <>
    <HandFilters />
    <Img src={staticFile("img/paper.png")} style={{position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover"}} />
  </>
);
// 装饰带：墨黑条 + 黄色斜纹（每期换一种：虚线马路、警戒带、票据锯齿、胶带……）
const Band: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{width: w, height: h, backgroundColor: INK, backgroundImage: `repeating-linear-gradient(-45deg, ${YEL} 0 26px, transparent 26px 60px)`, border: `6px solid ${INK}`}} />
);
const Theme: React.FC<{size: number}> = ({size}) => (
  <div style={{padding: `${size * 0.16}px ${size * 0.5}px ${size * 0.22}px`, borderRadius: size * 0.3, backgroundColor: INK, color: PAPER, fontSize: size, fontWeight: 900, boxShadow: `7px 8px 0 ${YEL}`, whiteSpace: "nowrap"}}>{COVER.theme}</div>
);
const Hook: React.FC<{sizes: [number, number]}> = ({sizes}) => {
  const [a, b] = COVER.hook;
  const i = b.indexOf(COVER.mark);
  const line2 =
    i < 0 ? (
      b
    ) : (
      <>
        {b.slice(0, i)}
        <span style={{background: `linear-gradient(transparent 54%, ${YEL} 54%, ${YEL} 92%, transparent 92%)`}}>{COVER.mark}</span>
        {b.slice(i + COVER.mark.length)}
      </>
    );
  return (
    <div style={{fontWeight: 900, color: INK, lineHeight: 1.14, whiteSpace: "nowrap", letterSpacing: -3}}>
      <div style={{fontSize: sizes[0]}}>{a}</div>
      <div style={{fontSize: sizes[1]}}>{line2}</div>
    </div>
  );
};
const Benefit: React.FC<{size: number}> = ({size}) => (
  <div style={{padding: `${size * 0.2}px ${size * 0.5}px ${size * 0.28}px`, backgroundColor: YEL, color: INK, fontSize: size, fontWeight: 900, border: `8px solid ${INK}`, borderRadius: size * 0.3, boxShadow: `9px 10px 0 ${INK}`, whiteSpace: "nowrap"}}>{COVER.benefit}</div>
);
const Person: React.FC<{h: number}> = ({h}) => (COVER.person ? <Img className="ink-line" src={staticFile(COVER.person)} style={{height: h, display: "block"}} /> : null);

export const Cover43: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PAPER, overflow: "hidden"}}>
    <Bg W={1440} H={1080} />
    <Layer name="装饰带-上" x={-40} y={24} rot={-2}>
      <Band w={1560} h={50} />
    </Layer>
    <Layer name="人物" x={960} y={560}>
      <Person h={520} />
    </Layer>
    <Layer name="主题" x={85} y={130} rot={-1.5}>
      <Theme size={60} />
    </Layer>
    <Layer name="钩子" x={80} y={270}>
      <Hook sizes={[150, 190]} />
    </Layer>
    <Layer name="利益点" x={90} y={800} rot={-1.5}>
      <Benefit size={76} />
    </Layer>
    <Layer name="装饰带-下" x={-40} y={1006} rot={1.5}>
      <Band w={1560} h={50} />
    </Layer>
  </AbsoluteFill>
);

export const Cover34: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: PAPER, overflow: "hidden"}}>
    <Bg W={1080} H={1440} />
    <Layer name="装饰带-上" x={-40} y={30} rot={-2.5}>
      <Band w={1200} h={50} />
    </Layer>
    <Layer name="人物" x={560} y={820}>
      <Person h={600} />
    </Layer>
    <Layer name="主题" x={60} y={150} rot={-1.5}>
      <Theme size={52} />
    </Layer>
    <Layer name="钩子" x={55} y={290}>
      <Hook sizes={[150, 160]} />
    </Layer>
    <Layer name="利益点" x={60} y={1250} rot={-1.5}>
      <Benefit size={64} />
    </Layer>
    <Layer name="装饰带-下" x={-40} y={1366} rot={2}>
      <Band w={1200} h={50} />
    </Layer>
  </AbsoluteFill>
);
