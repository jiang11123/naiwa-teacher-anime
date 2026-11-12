import React from "react";
import {useCurrentFrame} from "remotion";
import {A, Comic, Tag} from "../parts/Anim";
import {Say} from "../parts/kit";
import {Actor} from "../parts/cast";
import {Burst, slideX} from "../parts/fx";
import {Robot} from "../parts/ui";
import {Deco, I} from "../parts/icons";
import {Steps} from "../parts/flow";
import {RED, SOFTB, SOFTG, SOFTR, SOFTY} from "../parts/palette";
import {T, seg} from "../t";
import type {S} from "../timeline";

// 示例分镜（换成这期的分镜）。每块展板是 1920×1080 坐标，帧一律用全片帧 T("句", 段)。
// 每段字幕都有一个动作；开场先居中，后来的元素进场时前一组再让位；同一批元素按 4~8 帧错开。
// 互相重叠的元素要用 lift 显式分层（越大越靠前，层间隔 ≥ 60），不然 3D 摆动时会穿模、被挡住。
// 展板结束前 8 帧，World3D 会让所有 <A> 自动缩回退场（换到下一块展板时），所以一般不用手写 out。

// 001~002：你问 AI → 它答得头头是道 → 一查全是编的
export const Hook: React.FC<S> = () => {
  const f = useCurrentFrame();
  const ans = T("001", 1);
  return (
    <>
      <A name="提问气泡" x={0} y={120} w={1920} at={T("001", 0)} kind="pop">
        <div style={{display: "flex", justifyContent: "center"}}>
          <Say text="地球到月亮有多远？" fill={SOFTB} tail="right" size={64} />
        </div>
      </A>
      {/* 机器人先在正中，答案出来时滑到左边让位 */}
      <A name="AI机器人" x={300} y={360} w={420} at={T("001", 0, 8)} kind="drop" dx={slideX(f, ans, 450)}>
        <Robot size={420} mood={f >= T("002", 0) ? "sweat" : f >= ans ? "smug" : "calm"} tie />
      </A>
      <A name="答案卡" x={860} y={360} w={760} at={ans} kind="right" lift={120}>
        <div style={{padding: "34px 44px", backgroundColor: "#FFFDF6", border: "6px solid #2B211C", borderRadius: "24px 30px 20px 28px", boxShadow: "9px 11px 0 #2B211C", fontSize: 54, fontWeight: 900, lineHeight: 1.45}}>
          <div>约 38.4 万公里</div>
          <div>由 1969 年张教授首次测出</div>
          <div style={{fontSize: 40, color: "#6B5442"}}>——《月球大百科》第 7 版</div>
        </div>
      </A>
      <A name="盖章-编的" x={1180} y={600} at={T("002", 0, 4)} kind="stamp" rot={-10} boil="boil-strong" lift={360}>
        <Tag bg={RED} color="#FFFDF6" size={96}>
          编的！
        </Tag>
      </A>
      <Burst x={1330} y={670} at={T("002", 0, 6)} color={RED} />
    </>
  );
};

// 003~005：这就叫 AI 幻觉 → AI 像爱面子的实习生 → 不会也不好意思说不会（屏幕层 Overlay 里有聚焦气泡）
export const Intern: React.FC<S> = () => {
  const f = useCurrentFrame();
  const kidAt = T("004", 1);
  return (
    <>
      <A name="大字-AI幻觉" x={0} y={200} w={1920} at={T("003", 0)} kind="drop">
        <div style={{display: "flex", justifyContent: "center", translate: `0px ${seg(f, [[kidAt - 2, 0], [kidAt + 12, -110]])}px`}}>
          <Comic size={210}>AI 幻觉</Comic>
        </div>
      </A>
      <Actor
        name="实习生"
        poses={[
          [kidAt, "kid"],
          [T("005", 0), "shock"],
          [T("005", 0, 30), "hand"],
        ]}
        path={[
          [kidAt, 1500],
          [kidAt + 26, 960],
        ]}
        y={900}
        h={430}
        at={kidAt}
        z={60}
      />
      <A name="贴纸-实习生" x={1110} y={520} at={kidAt + 26} kind="pop" rot={6}>
        <Tag bg={SOFTY} size={56}>
          爱面子的实习生
        </Tag>
      </A>
      <Deco
        name="四周小图标"
        base={kidAt + 10}
        items={[I("doc", 520, 640, 150, {fx: "float"}), I("warn", 380, 430, 110, {fx: "shake", d: 6}), I("star", 1500, 700, 100, {fx: "pulse", d: 12})]}
      />
    </>
  );
};

// 006~009：那怎么办？三招 → 三步逐条亮
export const Tips: React.FC<S> = () => {
  const f = useCurrentFrame();
  const list = T("007", 0, -6);
  return (
    <>
      <A name="大字-三招" x={180} y={300} w={600} at={T("006", 0)} kind="stamp" dx={slideX(f, list, 480)}>
        <div style={{textAlign: "center"}}>
          <Comic size={240}>3 招</Comic>
          <div style={{marginTop: 10}}>
            <Tag bg={SOFTG} size={54}>
              治 AI 幻觉
            </Tag>
          </div>
        </div>
      </A>
      <A name="三步清单" x={880} y={180} w={860} at={list} kind="right">
        <Steps
          w={860}
          h={170}
          steps={[
            {title: "让它给出处", lit: T("007", 0), subs: [[T("007", 0, 14), "链接 / 原文"]]},
            {title: "不确定就说不知道", lit: T("008", 0), subs: [[T("008", 0, 14), "提前跟它说好"]]},
            {title: "关键数字自己查", lit: T("009", 0), subs: [[T("009", 0, 14), "去官网对一遍"]]},
          ]}
        />
      </A>
      <Deco name="三招-小图标" base={T("009", 0, 10)} items={[I("mag", 1790, 820, 120, {fx: "pop"}), I("check", 1660, 860, 90, {fx: "pop", d: 8})]} />
    </>
  );
};

// 010：结尾
export const Ending: React.FC<S> = () => (
  <>
    <A name="结尾大字" x={0} y={170} w={1920} at={T("010", 0)} kind="drop">
      <div style={{display: "flex", justifyContent: "center"}}>
        <Comic size={170}>关注我</Comic>
      </div>
    </A>
    <Actor name="讲解员-点赞" poses={[[T("010", 0, 6), "thumb"]]} path={[[0, 960]]} y={920} h={460} at={T("010", 0, 6)} />
    <A name="贴纸-下期见" x={1240} y={560} at={T("010", 0, 16)} kind="pop" rot={-6}>
      <Tag bg={SOFTR} size={60}>
        下期见
      </Tag>
    </A>
  </>
);
