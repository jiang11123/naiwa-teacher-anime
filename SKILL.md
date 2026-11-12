---
name: naiwa-teacher-anime
description: 给一个主题，做一条“纸张手绘风”的中文讲解动画视频（米黄波点纸、粗墨线、硬投影、Q 弹出场；画面可选 3D 展板、2D 平面、3D 实景三种）：先写口播稿，停下等用户确认；确认后对齐配音，再用现成的组件库（3D 展板空间、Q 弹出场、人物、图标、菜单牌、流程图、截图窗口、聚焦放大、术语便签、音效）自由搭出每句台词的动画，抽帧自查后开 Remotion Studio 给用户预览，用户说导出才导出，导出后做封面并给发布标题。只要用户想做讲解 / 科普 / 教程 / 知识类动画视频、给了一个选题想要视频、有口播稿或录音想配动画、说“纸张手绘风”“手绘讲解风”，或者抱怨 AI 做的视频像 PPT，都用这个 skill，即使没提 Remotion。
---

# 纸张手绘风讲解视频

一句话认出这个风格：米黄纸 + 单色浅波点底，墨色粗线手绘插画，红黄绿蓝四色，漫画描边大字，线条微微“沸腾”抖动，元素 Q 弹出场；画面空间有三种：3D 展板（镜头在悬空展板之间推进、平移、转身飞，默认）、2D 平面（一张纸上推拉镜头 + 全屏转场）、3D 实景（一个办公室 / 街道贯穿全片，镜头一路走）；每句台词都有动作；底部黑底黄边字幕；没有任何固定装饰。

整个流程有**三道停下来等用户的关**，不能跳：

1. **稿子写完 → 停**，等用户说稿子可以了
2. **预览做好 → 停**，等用户说“导出”
3. **导出后的总结 → 停**，等用户确认再写回偏好记录

## 文件地图

| 文件 | 什么时候读 |
|---|---|
| [references/script.md](references/script.md) | 第 1 步写稿前，必读 |
| [references/voice.md](references/voice.md) | 第 2 步配音和对齐 |
| [references/modes.md](references/modes.md) | 第 3 步，必读：三种画面模式怎么选、各自怎么写 |
| [references/storyboard.md](references/storyboard.md) | 第 3 步写分镜表前，必读 |
| [references/style.md](references/style.md) | 第 3、4 步，必读：颜色、构图、字、形状 |
| [references/motion.md](references/motion.md) | 第 4 步，必读：动效、镜头、转场、节奏 |
| [references/components.md](references/components.md) | 第 4 步，必读：组件目录，每个组件演什么台词 |
| [references/audio.md](references/audio.md) | 配音效时 |
| [references/review.md](references/review.md) | 第 5 步审片，必读；用户说“丑 / 呆 / 乱”时 |
| [references/export-cover.md](references/export-cover.md) | 第 7、8 步 |
| [references/pitfalls.md](references/pitfalls.md) | 遇到报错或画面异常 |
| `assets/template/` | 可运行的 Remotion 工程：三种画面模式的引擎 + 组件库 + 同一段 28 秒示例的三种做法 |
| `assets/taste-log.md` | 偏好记录模板，每期复制进工程 |

**开始前先找偏好记录**：工程目录或 skill 目录里有 `taste-log.md` 就先读。用户本人说过的话优先于本 skill 的任何默认规则。用户自己有知识库 / 记忆里写了视频偏好，也先读。

---

## 第 0 步：弄清要做什么

用户给的可能只是一个主题，也可能带了稿子、录音、截图、录屏、AI 生成的动画片段。缺的只问必要的，其余用默认：

| 问题 | 默认 |
|---|---|
| 横屏还是竖屏 | 横屏 16:9（竖屏见 style.md 末尾） |
| 配音谁来录 | 用户自己录（真人）；也可以 TTS；都没有就先按字数估时做画面 |
| 讲解人设 | 先看 `taste-log.md` 的“人设”；没有就问一次：怎么自称、怎么称呼观众、账号名、固定结尾、有没有自己的角色形象。用户不想定就用“我 / 你 / 关注我，下期见”，角色用模板自带的通用角色。答案记进 `taste-log.md`，以后不再问 |
| 放不放人物 | 放不放按内容：讲数据、讲账单可以不放；放了就要有事做 |
| 时长 | 不卡字数，内容优先，最多约 2500 字（8 分钟左右） |

用户已经给了定稿或录音：跳过第 1 步，直接第 2 步。

## 第 1 步：写口播稿 → 停

按 [references/script.md](references/script.md) 写：先查清事实（不确定的去查，查不到就标【待核实】），定一个贯穿全片的主比喻，开头三句内给钩子，大白话、像在跟朋友讲，结尾固定收尾。

稿子格式：推荐标题 / 备选标题 / 主比喻 / 事实来源 / 字数估计 / 口播稿正文 / 屏幕上要放的素材清单 / 需要用户核实或补充的地方。

**写完就停。** 把稿子发给用户，明确说“稿子确认后我再做动画”。用户改稿就一轮轮改，直到用户说可以。不要在确认前起工程、写分镜。

## 第 2 步：起工程，配音，对齐时间

```bash
mkdir -p <工程目录>
cp -r <skill目录>/assets/template/. <工程目录>/   # 结尾的 /. 表示“把模板里的东西拷进去”，不是再套一层 template/
cp <skill目录>/assets/taste-log.md <工程目录>/   # 已有偏好记录就沿用旧的
```

```bash
cd <工程目录> && npm install
```

第一次渲染要下载 Remotion 自带浏览器（约 100 MB），国内网络常下到一半损坏（表现是卡住不动，或解压报 `Z_DATA_ERROR`）：渲染时加 `--browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"`，Node 脚本（`check.mjs`）设环境变量 `REMOTION_BROWSER`。`remotion render` 默认占 3000 端口，Studio 开着时会报 `not a valid Remotion project`，加 `--port=3010`。细节见 [references/pitfalls.md](references/pitfalls.md)。

1. 把定稿拆成 `scripts/lines.json`：每句一个 id（三位数 `"001"` 起），`caps` 是字幕段（每段 ≤ 20 字，按说话的自然停顿拆），要卡重音的词写进 `marks`
2. 配音（[references/voice.md](references/voice.md)）：
   - 有录音：放 `public/voice.mp3` → `python scripts/asr.py` → `node scripts/align.mjs`。**以录音为准**：录音漏念、改说、新加的，先把 `lines.json` 改成和录音一致
   - 还没录：`node scripts/estimate-align.mjs` 按字数估，先做画面，录完再换真对齐（画面全部按句子 id 取时间，换配音后自动跟着走）
3. 有素材：`node scripts/prep-img.cjs <素材文件夹>`；截图里的 Key、邮箱、手机号、别人头像昵称先用 `scripts/blur.cjs` 打码

## 第 3 步：分镜表（不能跳过）

写代码前，在工程根目录写 `storyboard.md`，方法见 [references/storyboard.md](references/storyboard.md)。核心三张表：

0. **选画面模式**（[references/modes.md](references/modes.md)）：3D 展板 / 2D 平面 / 3D 实景，改 `src/mode.ts`，在分镜表开头写一句为什么选它
1. **段落表**：全片分几个大段落、每段用什么空间（展板 / 实景里的哪个区 / 截图窗口 / AI 动画），段落之间镜头怎么走
2. **重点表**：自己读稿找出 3~5 个爆点（最华丽）、若干重音（中等）、其余平句（克制）
3. **逐句表**：每段字幕 → 加什么东西 / 它做什么动作（写得出动词）/ 屏上留什么字 / 用哪个组件 / 音效

这一步最便宜，也最决定成片好不好看。长视频（> 3 分钟）可以把前两个段落的分镜表先给用户看一眼方向，但不必停下等。

## 第 4 步：搭画面

按模式写（modes.md）：3D 展板和 2D 平面在 `src/scenes/` 写展板组件、在 `src/timeline.tsx` 的分镜表里登记；3D 实景在 `src/scenes/` 写一个世界组件和镜头表 `CAM`，接到 `Main.tsx` 的 `RoomStage` 上。屏幕层（聚焦放大、术语便签）写 `src/Overlay.tsx`，音效写 `src/Sfx.tsx`。组件从 [references/components.md](references/components.md) 里挑，自由组合；库里没有的道具就按同一套画法新画一个放进 `src/parts/`。

硬约束：

- 每个元素用 `<A name="中文名">` 单独一层（用户要在 Studio 里直接拖、改）
- 时间一律 `T("句", 段, 偏移)`，**不写死帧号**
- 每段字幕都有动作；分镜一开场就有主画面；先居中，后来的元素进场时前一组再让位
- 颜色只用 `parts/palette.ts`，字号按手机算，字绝不出框（用 `fit()`）
- 互相重叠的元素用 `lift` 显式分层；整组平移用 `dx`，不改 `x`
- 内容在 y 40~930，字幕区 960~1060 不放东西

然后：

```bash
npx tsc --noEmit
```

## 第 5 步：抽帧审片（不能跳过）

```bash
node scripts/check.mjs --out chk/r1
```

**真的打开 `chk/r1/sheet*.jpg` 去看**，按 [references/review.md](references/review.md) 逐格挑问题：主角是谁、有没有出框遮挡、有没有白板加一个字、有没有一闪而过、有没有超过 3 秒不动。改完换新目录（`chk/r2`）再抽一遍。

没有看图能力的环境：明确告诉用户“这一步没做，画面没验证”，不能假装看过。

## 第 6 步：开预览 → 停

```bash
npx remotion studio
```

把 Studio 地址给用户（能开预览面板就直接打开）。同时列出：听不清靠猜的词、稿子里还没核实的事实、你自己不确定的画面。然后**停下等反馈**。

改的时候：用户指哪修哪，说好看的部分别动；用户说“丑 / 呆 / 乱 / 单调”先按 review.md 定位是哪类问题再改；每条反馈记进工程里的 `taste-log.md`（原话、当时的版本、以后怎么做）。

## 第 7 步：导出

用户说“导出”才导出，步骤见 [references/export-cover.md](references/export-cover.md)：`--muted` 渲染画面 → `mix-audio.mjs` 混配音和音效 → ffprobe 确认 `yuv420p / tv / bt709` → 从成片抽几帧看一眼。成片放到素材 / 配音所在的文件夹。

## 第 8 步：封面、标题、总结 → 停

导出后不等提醒：

1. 做封面（4:3 + 3:4）：**每期重新设计版面，不套模板**。先定这期的钩子类型，再从 `references/cover-refs/` 的六种构式里挑一个（或自己发明），改 `src/Cover.tsx` 的 JSX 重排；两个尺寸分别构图。规则见 export-cover.md
2. 给**发布标题**：一个推荐 + 3~4 个不同方向的备选，只用稿子里真有的钩子
3. 发**这期总结**：用户这期新提的要求、可复用的新组件 / 动效、踩的坑。用户确认后写进 `taste-log.md`（以及用户自己的知识库，如果有）；新组件挪进组件库

---

## 换哪个 agent 都能用

本文件是标准 Agent Skill（frontmatter 只有 `name` 和 `description`）。全篇只说“读文件、跑命令、看图”，不点任何工具名，所以 WorkBuddy、Claude Code、Cursor、Codex、自己接的 agent loop 都能执行。

能力不全时按这个降级，并在汇报里说清降了什么：

| 缺什么 | 怎么办 |
|---|---|
| 没有 skill 机制 | 把本文件当说明书直接读，按八步做，一样成立 |
| 开不了浏览器预览（第 6 步） | 多抽几个帧的图给用户看，明说“没开 Studio” |
| 没有看图能力（第 5 步） | 明说画面没验证，不许假装审过 |
| 不能执行命令 | 做不了，直说——这个 skill 要装依赖、渲染、抽帧 |

## 汇报要诚实

没抽帧就说没抽，没导出就说没导出，事实没核实就说没核实。“做好了”只能在看过画面之后说。
