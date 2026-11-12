# 组件目录

所有组件在 `assets/template/src/parts/`，是从多期实战视频里攒下来的。**先按“这句台词要演什么”找组件，再看用法**。库里没有的就照同一套画法（palette 颜色、粗墨边、硬投影、`fit()` 算字号）新画一个，放进 `parts/`，导出后在总结里告诉用户新增了什么。

组件分两类：

- **动画外壳**：`A`、`Morph`、`Actor`、`Deco`、`Big`……负责“什么时候、怎么出场、在哪”
- **道具插画**：`Robot`、`Shop`、`Receipt`……大多是纯静态的样子，动画写在外面包着的 `<A>` 上；带 `p` / `lit` / `show` / `open` 这类 0~1 参数的，由分镜按帧算好传进去

## 目录

1. 时间与外壳（每个分镜都用）
2. 按台词找组件（速查表）
3. 各文件详解
4. 写法示例

---

## 1. 时间与外壳

### 时间（`src/t.ts`）

| 写法 | 意思 |
|---|---|
| `T("013")` | 第 013 句开始（已提前 3 帧，说到时看得清） |
| `T("013", 1, 6)` | 第 013 句第 2 段字幕开始，再晚 6 帧 |
| `E("013")` | 第 013 句结束 |
| `M("013", 0)` | 第 013 句 `marks` 里第 1 个词说出来的帧 |
| `S(1.5)` | 1.5 秒 = 45 帧 |
| `seg(f, [[帧, 值], ...])` | 分段插值（路线、整组让位） |
| `win(f, a, b)` | a 淡入、b 淡出的 0~1 窗口 |

展板里一律用**全片帧**（`useCurrentFrame()` 拿到的就是全片帧，`timeline.tsx` 的 `Abs` 已经换算好）。

### `A`（`parts/Anim.tsx`）——每个元素都包一层

```tsx
<A name="中文名" x={左} y={上} w={宽} at={出场帧} kind="pop" out={退场帧} rot={角度} lift={层高} dx={整组偏移}>
  ...
</A>
```

| 参数 | 说明 |
|---|---|
| `kind` | `pop` 弹出（中）/ `drop` 从上砸下（重）/ `rise` 从下浮起（轻）/ `left` `right` 滑入 / `fade` 淡入（最轻）/ `stamp` 盖章（最重）/ `flip` 翻牌揭晓 / `squash` 压扁弹起 |
| `out` | 退场帧（6 帧淡出下沉）。换展板时 World3D 会自动让所有 `A` 缩回退场，**只有展板中途要退的才写 out** |
| `lift` | 离展板的高度（3D 前后层次）。不写就按位置自动算；**互相重叠的元素必须显式写**，层间隔 ≥ 60，越大越靠前 |
| `dx` | 整组平移：只挪位置，不影响 3D 高度和摆动。先居中再让位：`dx={slideX(f, 让位帧, 居中时的偏移)}` |
| `bob` | 上下轻浮的幅度（长时间停留的元素给一点） |
| `boil` | `"boil"`（默认）/ `"boil-strong"` / `""`（截图、文字多的卡片关掉） |
| `flat` | 关掉 3D（AI 动画上的贴纸用） |
| `handoff` / `hideAt` | 交给下一个分镜的 `Morph` 接走 |

### 其他外壳

| 组件 | 文件 | 用途 |
|---|---|---|
| `Morph` | Anim | 一个东西沿弧线搬到下一幕、或直接变成下一个东西（空盘子 → 菜谱，网站 → 书架），带压扁回弹。旧的用 `handoff` |
| `Actor` | cast | 人物：`poses=[[帧, 姿势]]` 换姿势会压一下；`path=[[帧, x]]` 走路一跳一跳并自动翻面；不说话时呼吸 |
| `Deco` + `I` | icons | 在整块展板上按时间撒一组图标（`I(名字, x, y, 尺寸, {fx, d, t, label})`），讲解段补画面 |
| `MenuPanel` | panel | 右侧讲解牌：讲一句加一行，每行配一个图标小场景 |
| `Steps` / `NodeBox` / `Arrow` | flow | 原理流程：没讲到的步骤先淡淡占位，讲到哪步亮哪步 |
| `FocusDim` / `Big` / `BigSay` | focus | 屏幕层重点组件：后面变淡，组件放大到中间（写在 `Overlay.tsx`） |
| `TermNote` | focus | 术语便签：先贴在物件旁，再飞到右上角排成一列 |
| `Shot` + `K` + `R` | Shot | 截图窗口：一个窗口贯穿一整段，新截图推进来，`K` 窗口内推镜头，`R` 红框 |
| `Cam` | fx | 2D 推拉摇 + 震屏（3D 展板里一般不用，镜头交给 World3D；2D 平面模式由分镜表第 5 列自动套上） |
| `RoomStage` / `P` / `Flat` / `Shadow` / `ZWalk` / `Desk3D` / `Laptop` | room/kit | 3D 实景模式的舞台和零件（modes.md 第 3 节） |
| `CashDrawer` / `Stairs` / `BubbleFill` / `BigLens` | wipes | 2D 平面模式的全屏转场示例（每期按内容新做） |
| `Shift` / `slideX` | fx | 整组平移（先居中再让位） |
| `Wobble` / `usePulse` / `Float` | fx / gh | 停留元素的小动作：摇摆、鼓一下、上下浮 |

## 2. 按台词找组件

| 台词在说 | 推荐组件 |
|---|---|
| 一个概念 / 术语登场 | `Comic` 漫画大字 drop/stamp + `TermNote` 便签；`Pill` 黑底胶囊标题 |
| 反转、结论、判决 | `Tag` 红底 stamp + `Burst` 爆炸星；`props2.Stamp` 印章；`FocusDim` + `Big` 聚焦 |
| 有人问 / 有人说 | `kit.Say` 气泡、`focus.BigSay`、`press.Bub`；对话一来一回用 `props.ChatWin` + `Msg` |
| AI / Agent / 机器人 | `ui.Robot`（mood: calm/smug/dizzy/happy/sweat）、`props.Me`（用户小人） |
| 人物反应、提问、举手 | `Actor`（小同学 kid/q/shock/sad/hand；讲解员 stick/chin/shrug/thumb/tea；boss） |
| 价格、多少钱 | `props3.PriceTag` 挂绳价签、`props6.PriceLabel`、`mg.PriceCard`（数字滚动）、`billkit.Roll2` / `press.Digits` / `fx.Count` 数字滚动、`icons` coin/jar |
| 算账 | `props2.Formula` 算式卡、`billkit.Calc` 计算器、`props2.Receipt` / `street.Receipt` 小票打印 |
| 对比多少 | `props2.Bar` 柱子、`billkit.Stack3` 三色堆叠条、`props6.Scale` 天平、`props2.Gauge` 仪表 |
| 趋势、曲线 | `props2.Axes` + `Line`（p 控制画出进度） |
| 进度、容量 | `gh.Progress`、`props2.CtxBar`、`props2.Slider` |
| 步骤、流程、原理 | `flow.Steps`、`flow.NodeBox` + `Arrow`、`sk.Path`、`props3.Steps` |
| 清单、要点逐条 | `MenuPanel`、`kit.Row`、`sk.Pad` / `Poster`、`props6.CheckCard`（逐条打勾） |
| 文件、文件夹、规则文档 | `ui.FileIcon` / `FolderIcon`、`props.Folder` / `Doc`、`office.Folder` / `Rules` / `Slip`、`street.ModelFile`、`sk.Dossier` / `Cabinet` |
| 网站、软件界面 | `props3.SiteCard`、`gh.TiltWin` 倾斜窗口、`gh.AddrBar` 地址栏、`props.Term` 终端、`fx.PromptBox` 逐字打字的输入框、`gh.Cursor` 光标 |
| 真实截图 | `Shot`（窗口贯穿）、`press.Pic` / `billkit.Real` / `gif.Shot`（单张卡片 + 红框） |
| GIF、录屏 | `gif.Gif`（逐帧、可变速）、`gif.Rec` |
| 开源、GitHub、仓库 | `GhLogo`（带出场特效）、`props.Repo`、`gh.Shelf` 书架逐本落书、`gh.ZipBox` |
| 安全、权限、禁止 | `office.Lock` / `Door` / `Light`（红绿灯）、`gh.Barrier` 栏杆、`icons` lock/shield/warn |
| 服务器、模型、云 | `props6.ServerBox`、`street.Tower`、`ui.Database`、`icons` server/cloud/chip |
| 商店、几种选择、几条路 | `street.Shop` + `Awning` 店面、`Stall` 小摊、`Board` 路牌、`props6.Store` / `Stall` |
| 吃饭、做菜类比喻 | `gh.Diner` / `Plate` / `Recipe`、`street.Bowl` / `Stove` / `Smoke` / `Plate` |
| 办公室、实习生、公司 | `office.Desk` / `Chair` / `Door` / `Window` / `Lamp` / `Plant` / `Tray` + `Actor` |
| 时间、日期 | `props.CalPage` 撕台历、`ui.Stopwatch`、`icons` cal/clock |
| 坏了、报错、翻车 | `props.ErrPop`、`fx.Pit` 坑、`props.Wall` 裂墙 + `Hammer`、`fx.Dust` 落地烟尘 |
| 开场 MG 冲击 | `mg.Sunburst` 放射光、`mg.Shine` 扫光、`mg.Popup` / `PopIn` 弹窗刷屏、`mg.Chevrons` |
| 飞走 / 拿走 / 搬过去 | `fx.Fly`（弧线飞，飞出屏幕要算够距离）、`Morph` |
| 速度、冲过去 | `fx.SpeedLines` |
| 来源、出处 | `press.Source`、`billkit.Src` |
| 平台 | `props3.Platform`（X / GitHub / 油管 / B 站手绘版） |

## 3. 各文件详解

| 文件 | 内容 |
|---|---|
| `Anim.tsx` | `A` `Morph` `SceneOut` `typed`（逐字打出）`wipe`（从左往右擦出）`Box`（墨线纸卡）`Pill`（黑底胶囊）`Comic`（漫画描边大字）`Tag`（彩色贴纸） |
| `kit.tsx` | `Mid`（水平居中一行）`Row`（图标 + 文字横条）`Say`（气泡） |
| `palette.ts` | 全部颜色、`em()` 估字宽、`fit()` 算装得下的字号 |
| `fx.tsx` | `Cam` `Burst` `SpeedLines` `Chars`（逐字跳出的大字）`Fly` `Dust` `Count` `PromptBox` `Pit` `Wobble` `usePulse` `slideX` `Shift` |
| `icons.tsx` | 31 个手绘图标：coin cal check cross lock unlock wifi plug eye cloud chip receipt jar bars shutter swap bowl star battery clock calc app doc server pc mag warn shield scale zzz arrow；出场 / 持续动作 fx：pop drop rise left right stream pulse shake spin vanish float grow fly；`Deco` `VigScene` |
| `panel.tsx` | `MenuPanel`（RowKind：money good bad fit tip） |
| `flow.tsx` | `Arrow` `NodeBox` `Steps` |
| `focus.tsx` | `FocusDim` `Big` `BigSay` `Note` `TermNote` |
| `cast.tsx` | `Actor` |
| `ui.tsx` | 红云、墨线箭头 / 圈 / 下划线、胶带、机器人、文件 / 文件夹图标、放大镜、数据库、书、齿轮、气泡、闪光、勾叉、硬币、蜗牛、显示器、扫把、垃圾桶、扳手、手机壳、秒表、大脑 |
| `props.tsx` | 聊天窗口 + 消息、用户小人、草稿、网站、蓝图、墙 + 锤子、仓库卡、文件夹、终端、开关、台历、保存旗、文档、报错弹窗 |
| `props2.tsx` | 仪表、小票、token 方块条、叫号屏、柜台、纸堆、复印机、价格表截图、柱子、上下文条、折线、坐标轴、滑杆、硬币堆、缓存柜、印章、算式 |
| `props3.tsx` | 价签、说明书、收藏夹、泳池、网站卡、截图卡、茧、拼图、平台图标、传话筒、步骤条 |
| `props6.tsx` | 价格标签、商店、小摊、token 格子、天平、服务器、钥匙、勾选卡、截图快照 |
| `press.tsx` | 截图卡 + 红框、纸卡、气泡、梯队轨道、成绩单、剪刀、压块、数字滚动、文档条、来源标签、对错点 |
| `billkit.tsx` | 账单三色（命中 / 没命中 / 输出）、真实截图 + 圈、堆叠条、计算器、数字滚动、分币、问号、步骤钉、出处 |
| `gh.tsx` | 章节条、标签框、盘子、小饭馆、菜谱、应用盒、书架、倾斜窗口、光标、压缩包、人头、栏杆、进度条、地址栏、浮动、箭头 |
| `gif.tsx` | GIF 逐帧、相框、截图 + 红框、录屏、翻页小本、对错标、动作卡 |
| `sk.tsx` | 档案袋、文件柜、海报、便利贴、记事本、编号卡槽、路径、便签 |
| `wipes.tsx` | 全屏转场示例：收银抽屉、三级台阶、气泡撑满、放大镜 |
| `../room/` | 3D 实景引擎：`cam.ts`（镜头、投影、世界常量）`kit.tsx`（舞台和零件） |
| `office.tsx` | 3D 办公室道具：桌、椅、文件夹、守则、任务单、门（平面开法）、红绿灯、锁、托盘、台灯、植物、窗、聚光 |
| `street.tsx` | 美食街道具：店面、雨棚、窗、门、柜台、路牌、立柱、盘子、月卡（可盖章）、碗、秤、小票、小摊、袋子、灶台、塔、模型文件、菜谱、烟、卷帘门 |
| `GhLogo.tsx` | GitHub 标志 + 出场特效 |
| `Shot.tsx` | 截图窗口 |

带 `p` / `lit` / `show` / `open` / `crack` / `fire` 等参数的道具，在分镜里用 `seg()` 或 `interpolate()` 按帧算好再传。

## 4. 写法示例

**先居中再让位 + 菜单牌**（例：四种付费方式画成一条街上的四家店）：

```tsx
export const Sub: React.FC<S> = () => {
  const f = useCurrentFrame();
  const side = T("012", 0, -6); // 讲细节时让位
  // x 写让位后的位置；slideX(f, side, 400)：side 之前整组往右偏 400（正好居中），side 起 16 帧滑回原位
  return (
    <>
      <A name="自助餐厅" x={160} y={150} at={T("011", 0)} kind="rise" lift={20} dx={slideX(f, side, 400)}>
        <Shop sign="自助餐厅" color={BLU} soft={SOFTB} />
      </A>
      <A name="月卡" x={300} y={560} at={T("011", 1)} kind="drop" lift={300} dx={slideX(f, side, 400)}>
        <MonthCard />
      </A>
      <MenuPanel name="菜单牌-订阅" at={side} title="订阅" tag="办月卡吃自助" color={BLU} soft={SOFTB} rows={[
        {at: T("012", 0, 6), kind: "money", text: "每月交一笔固定的钱", vig: {items: [I("cal", 190, 150, 170, {t: "每月"}), I("coin", 460, 40, 62, {fx: "stream"})]}},
        {at: T("015", 0), kind: "good", text: "省心，不用算账"},
        {at: T("016", 0), kind: "bad", text: "限量，吃完了就得等"},
      ]} />
    </>
  );
};
```

**重点聚焦**（写在 `Overlay.tsx`）：

```tsx
const FOCUS: [number, number][] = [[T("005", 0), E("005", 4)]];
<FocusDim windows={FOCUS} />
<Big name="重点-三步" x={960} y={420} at={T("005", 0)} out={E("005", 4)}><Comic size={250}>3 步</Comic></Big>
```

**截图窗口**：

```tsx
<Shot name="设置窗口" title="设置" shots={[
  {at: T("024", 0), id: "设置页", cam: [K(T("024", 0), 1, 50, 50), K(T("025", 0), 1.8, 30, 40)], rings: [R(T("025", 0), 20, 32, 46, 40)]},
  {at: T("026", 0), id: "Key页"},
]} />
```

示例工程 `src/scenes/Demo.tsx` 里有完整可运行的四块展板。
