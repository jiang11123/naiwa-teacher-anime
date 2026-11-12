import "./style.css";
import React from "react";
import {Composition, Still} from "remotion";
import {Main} from "./Main";
import {END} from "./timeline";
import {Cover34, Cover43} from "./Cover";

// 合成名固定叫 Main（scripts 里的抽帧 / 导出脚本都按这个名字找）
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={END} fps={30} width={1920} height={1080} />
    <Still id="Cover43" component={Cover43} width={1440} height={1080} />
    <Still id="Cover34" component={Cover34} width={1080} height={1440} />
  </>
);
