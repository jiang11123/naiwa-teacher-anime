import React from "react";
import {Interactive, useCurrentFrame} from "remotion";
import {Comic, Tag} from "../parts/Anim";
import {Say} from "../parts/kit";
import {Actor} from "../parts/cast";
import {Burst} from "../parts/fx";
import {Robot} from "../parts/ui";
import {Door, Plant, Rules, Window} from "../parts/office";
import {INK, RED, SOFTB, SOFTG, SOFTR, SOFTY} from "../parts/palette";
import {E, T, seg} from "../t";
import {FLOOR, Key, ON_WALL, WALL} from "../room/cam";
import {DESK_TOP, Desk3D, Laptop, P, Shadow, ZWalk, tz} from "../room/kit";

// 3D 实景示例（mode.ts 设成 "room3d" 时用）：同一份 AI 幻觉稿子，做成一间“AI 公司”办公室，镜头一路走
// 世界分区：大厅 0~2200（提问的电脑）｜大门 2200~4200（实习生从门里出来）｜守则墙 4200~6000（三招）｜结尾拉远看全景
// 坐标是世界坐标（x 左右、y 往下、z 朝镜头为正），帧是全片帧

const ZONE = {hall: 1000, door: 3000, rules: 4950};
const LAP = {x: 900, w: 300, z: -60};
const LAP_SCREEN = {x: LAP.x + LAP.w / 2, y: DESK_TOP - LAP.w * 0.72 + (LAP.w * 0.58) / 2, z: LAP.z}; // 电脑屏幕中心（推镜头对准这里）
export const PILLARS = [2200, 4200, 6000];

// 镜头表：[从这一帧开始动, 缩放, 焦点 x, 焦点 y, 用几帧走到位, 停住时转身角度, 焦点 z]
export const CAM: Key[] = [
  [0, 1.1, ZONE.hall, 470, 1, 6], // 开场：大厅居中
  [T("001", 1, -6), 3.4, LAP_SCREEN.x, LAP_SCREEN.y, 16, 0, LAP_SCREEN.z], // 推进电脑：看它怎么答
  [T("002", 0, -6), 1.1, ZONE.hall, 470, 18, 6], // 拉出来：一查全是编的
  [T("003", 0, -8), 1.1, ZONE.door, 470, 30, -6], // 平移到大门：AI 幻觉 / 实习生
  [T("006", 0, -8), 1.1, ZONE.rules, 470, 30, -8], // 再往右：墙上的三招
  [T("010", 0, -6), 0.4, 3000, 140, 44, 0], // 结尾拉远：整间办公室
];

export const World: React.FC = () => {
  const f = useCurrentFrame();
  const kid = T("004", 1);
  const lit = Math.round(seg(f, [[T("007", 0), 0], [T("007", 0, 1), 1], [T("008", 0), 1], [T("008", 0, 1), 2], [T("009", 0), 2], [T("009", 0, 1), 3]]));
  return (
    <>
      {/* ===== 大厅：提问的电脑 ===== */}
      <Interactive.Div name="大厅-窗" style={{position: "absolute", left: 260, top: 60, ...tz(ON_WALL)}}>
        <Window w={380} />
      </Interactive.Div>
      <Shadow x={330} z={-260} w={220} />
      <Interactive.Div name="大厅-盆栽" style={{position: "absolute", left: 260, top: FLOOR - 210, ...tz(-260)}}>
        <Plant w={140} />
      </Interactive.Div>
      <Desk3D name="大厅-桌子" x={560} w={760} />
      <P name="大厅-电脑" x={LAP.x} y={DESK_TOP - LAP.w * 0.72} z={LAP.z} at={0}>
        <Laptop w={LAP.w}>
          <div style={{padding: "10px 12px", fontSize: 17, fontWeight: 900, color: INK, lineHeight: 1.45}}>
            <div style={{backgroundColor: "#FFFFFF", borderRadius: 6, padding: "2px 8px", display: "inline-block"}}>地球到月亮有多远？</div>
            <div style={{opacity: f >= T("001", 1, 4) ? 1 : 0, marginTop: 6}}>约 38.4 万公里</div>
            <div style={{opacity: f >= T("001", 1, 10) ? 1 : 0}}>1969 年张教授首次测出</div>
            <div style={{opacity: f >= T("001", 1, 16) ? 1 : 0, fontSize: 13, color: "#6B5442"}}>——《月球大百科》第 7 版</div>
          </div>
        </Laptop>
      </P>
      <Shadow x={1560} z={-220} w={320} />
      <P name="AI机器人" x={1370} y={FLOOR - 400} z={-220} at={T("001", 0, 6)} kind="drop">
        <Robot size={380} mood={f >= T("002", 0) ? "sweat" : f >= T("001", 1) ? "smug" : "calm"} tie />
      </P>
      <P name="提问气泡" x={360} y={130} z={-200} at={T("001", 0)} out={E("002", 6)} kind="pop">
        <Say text="地球到月亮有多远？" fill={SOFTB} tail="right" size={60} />
      </P>
      <P name="盖章-编的" x={840} y={250} z={60} at={T("002", 0, 4)} out={E("002", 6)} kind="stamp" rot={-10} boil="boil-strong">
        <Tag bg={RED} color="#FFFDF6" size={110}>
          编的！
        </Tag>
      </P>
      <Burst x={1000} y={330} at={T("002", 0, 6)} color={RED} />

      {/* ===== 大门：AI 就像爱面子的实习生 ===== */}
      <P name="大字-AI幻觉" x={2550} y={20} z={-460} w={1200} at={T("003", 0)} kind="drop">
        <div style={{display: "flex", justifyContent: "center"}}>
          <Comic size={190}>AI 幻觉</Comic>
        </div>
      </P>
      <Interactive.Div name="大门" style={{position: "absolute", left: 2380, top: FLOOR - 600, ...tz(ON_WALL)}} className="boil">
        <Door w={300} sign="AI 公司" open={seg(f, [[kid - 10, 0], [kid + 4, 1]])} />
      </Interactive.Div>
      <ZWalk
        z={[
          [kid, WALL + 90],
          [kid + 22, -180],
        ]}
        xs={[
          [kid, 2530],
          [kid + 22, 3000],
        ]}
        at={kid}
      >
        <Actor
          name="实习生"
          poses={[
            [kid, "kid"],
            [T("005", 0), "shock"],
            [T("005", 0, 30), "hand"],
          ]}
          path={[
            [kid, 2530],
            [kid + 22, 3000],
          ]}
          y={FLOOR}
          h={380}
          at={kid}
        />
      </ZWalk>
      <P name="贴纸-实习生" x={3170} y={420} z={-170} at={kid + 24} kind="pop" rot={6}>
        <Tag bg={SOFTY} size={54}>
          爱面子的实习生
        </Tag>
      </P>

      {/* ===== 守则墙：三招 ===== */}
      <P name="墙上守则-3招" x={4420} y={70} z={ON_WALL} at={T("006", 0)} kind="drop">
        <Rules w={420} n={lit} label="3 招" sub="治 AI 幻觉" />
      </P>
      {(
        [
          ["007", "① 让它给出处", SOFTB, 160],
          ["008", "② 不确定就说不知道", SOFTR, 340],
          ["009", "③ 关键数字自己查", SOFTG, 520],
        ] as const
      ).map(([id, text, bg, y], i) => (
        <P key={id} name={`便签-${text}`} x={4980} y={y} z={-220} at={T(id, 0)} kind="right" rot={i % 2 ? 2 : -2}>
          <Tag bg={bg} size={56}>
            {text}
          </Tag>
        </P>
      ))}

      {/* ===== 结尾：拉远看整间办公室 ===== */}
      <P name="结尾大字" x={2200} y={-560} z={0} w={1600} at={T("010", 0, 36)} kind="drop">
        <div style={{display: "flex", justifyContent: "center"}}>
          <Comic size={320}>关注我，下期见</Comic>
        </div>
      </P>
    </>
  );
};
