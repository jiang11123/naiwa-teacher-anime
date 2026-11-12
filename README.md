# naiwa-teacher-anime · 纸张手绘风讲解视频

给一个主题，agent 先写口播稿，你确认后配音、对齐，再用组件库自由搭配，生成纸张手绘风的 Remotion 讲解动画（波点纸底、粗墨线、硬投影、3D 展板空间、黑底黄边字幕），预览确认后导出成片、做封面、给标题和总结。

流程里有三道停止关，agent 不会一路跑到底：

1. 稿子写完 → 等你说“稿子没问题”
2. 预览做好 → 等你说“导出”
3. 导出后给标题和总结 → 等你确认再写回偏好记录

## 三种画面

同一套风格，画面空间可选三种（`src/mode.ts` 切换，说明见 `references/modes.md`）：

- **3D 展板**（默认）：波点走廊里悬着一块块展板，镜头在展板之间推进、平移、转身飞
- **2D 平面**：一整张纸上推拉镜头，大段落之间用有形象的全屏转场
- **3D 实景**：一个办公室 / 街道贯穿全片，镜头一路走、推进电脑屏幕、最后拉远看全景

## 效果

模板自带的 28 秒示例（同一个「AI 幻觉」稿子）三种模式各抽一遍：

| 3D 展板（默认） | 2D 平面 |
|---|---|
| ![3D 展板](docs/board3d.jpg) | ![2D 平面](docs/flat2d.jpg) |

| 3D 实景 | 封面 |
|---|---|
| ![3D 实景](docs/room3d.jpg) | ![封面](docs/cover.png) |

上面是抽帧联系表（每格一帧，按时间顺序），改成你自己的稿子后跑 `node scripts/check.mjs --out chk/r1` 会得到同样格式的图，用来审片。

## 封面

**封面不套固定模板。** 每期先定这期的钩子类型（数字损失 / 价格反差 / 认知反转 / 概念对比 / 纯疑问 / 结果承诺），再选构式重排版面。`references/cover-refs/` 收了六种构式的往期封面做骨架参考：

| 数字压字 | 价签居中 | 界面即封面 |
|---|---|---|
| <img src="references/cover-refs/01-count.png" width="280"> | <img src="references/cover-refs/02-price.png" width="280"> | <img src="references/cover-refs/03-ui.png" width="280"> |
| **对话气泡** | **实物比喻** | **对比双物** |
| <img src="references/cover-refs/04-bubble.png" width="280"> | <img src="references/cover-refs/05-metaphor.png" width="280"> | <img src="references/cover-refs/06-desk.png" width="280"> |

变的是版式，不变的是：同一张米黄波点纸、同一套粗墨线和硬投影、≤3 色、一句钩子占满画面、缩到 300px 宽还读得清。规则见 `references/export-cover.md`。

## 安装

这是一个标准 **Agent Skill**：`SKILL.md` 用 YAML frontmatter 写 `name` 和 `description`，正文和 `references/` 全是 markdown，命令都是相对路径。任何支持这套规范的产品都能直接放进去用，**不绑定 Claude**。

### 放进 skills 目录（推荐）

**建议 `git clone`，但拷文件夹也能自动更新。**

```bash
# WorkBuddy（Windows 把 ~ 换成 C:/Users/<你>）
git clone https://github.com/jiang11123/naiwa-teacher-anime.git ~/.workbuddy/skills/naiwa-teacher-anime

# Claude Code
git clone https://github.com/jiang11123/naiwa-teacher-anime.git ~/.claude/skills/naiwa-teacher-anime
```

两者的区别只在升级成本：clone 的走 `git pull` 只拉几十 KB；拷的没有 `.git`，每次有新版本会整包下 10 MB。功能上一样，都能自动升到最新。

| 产品 | skills 目录 |
|---|---|
| **WorkBuddy** | `~/.workbuddy/skills/`（Windows：`C:\Users\<你>\.workbuddy\skills\`） |
| **Claude Code** | `~/.claude/skills/` |
| 项目级（多数产品都认） | `<项目>/.workbuddy/skills/` 或 `<项目>/.claude/skills/` |
| 其他支持 Agent Skills 的产品 | 它自己的 skills 目录 |

放好后直接说「用纸张手绘风做一期讲 XX 的视频」，agent 会自动认这个 skill。

### 更新

**两种安装方式都不用管。** `SKILL.md` 第一步会跑自更新脚本，每次开始做新视频时自动检查并升级到最新版：

```bash
node ~/.workbuddy/skills/naiwa-teacher-anime/scripts/self-update.mjs
```

脚本做的事：

1. 读远端 `VERSION`（几百字节，不发整包）
2. 比本地新才动手：clone 安装走 `git pull` 只拉增量；**拷文件夹安装直接下 tarball 覆盖**，没有 `.git` 也能升级
3. 写入前再校验一次下载到的版本，坏包不覆盖
4. 打印一行 `SELF_UPDATE=...`，agent 按这个决定要不要告诉你

它只在一期开始时跑，做到一半不跑——免得你正在改的工程被换掉规则。

| 想干的事 | 怎么做 |
|---|---|
| 手动更新一次 | 跑上面那行命令；加 `--dry-run` 只看有没有新版，`--force` 忽略 `no-autoupdate` |
| 关掉自动更新 | 在 skill 目录建空文件 `no-autoupdate` |
| 锁死在某一版 | `git checkout v1.2.0`（clone 安装才有） |
| 离线 / 拉取失败 | 不影响使用，继续用本地那份，脚本会打印 `SELF_UPDATE=failed` |

升级消耗：版本没变时一次几百字节请求；有新版时 clone 安装约几十 KB，拷贝安装约 10 MB（整包）。

版本号看 `VERSION` 文件，改动记录看 [`CHANGELOG.md`](CHANGELOG.md)，历史版本看 [tags](https://github.com/jiang11123/naiwa-teacher-anime/tags)。

不想被自动更新：在 skill 目录建个空文件 `no-autoupdate`。想锁死在某一版：`git checkout v1.1.0`。

版本号看 `VERSION` 文件，改动记录看 [`CHANGELOG.md`](CHANGELOG.md)，历史版本看 [tags](https://github.com/jiang11123/naiwa-teacher-anime/tags)。

### 没有 skills 机制的产品

豆包工作、Coze、网页版对话框、IDE 插件——只要它能读文件，就能用：

| 它能做什么 | 怎么用 |
|---|---|
| 能读本地文件夹（Cursor、Codex、Cline 等） | 说「读 `<路径>/SKILL.md`，按里面的步骤做一期讲 XX 的视频」。它会顺着文件地图自己读 `references/`，仓库根的 `AGENTS.md` 也是同一个入口 |
| 只能贴长文本 | 把 `SKILL.md` 全文贴进系统提示 / 自定义指令 / 知识库，再按需贴 `references/` 里的那几篇。`assets/template/` 是 200 多个真实文件，贴不了，得让 agent 能访问仓库（clone 或给文件夹） |
| 只能聊天、不能写文件也不能跑命令 | 用不了。这个 skill 要建工程、装依赖、渲染视频 |

### agent 需要什么能力

- **必需**：读写文件、执行命令行、联网查资料（写稿要核实事实）
- **强烈建议**：看图。第 5 步抽帧审片靠它；没有的话 skill 要求 agent 明说“这一步没做”，不会假装看过
- **可选**：Remotion Studio 能开浏览器预览最好，开不了就靠抽帧图给用户看

所有路径都相对 skill 目录，不依赖某台电脑、某个用户名。

## 依赖

| 依赖 | 用途 | 必需 |
|---|---|---|
| Node.js 20.19+ / 22.13+ | Remotion 工程 | 是 |
| ffmpeg / ffprobe（**完整版**） | 混音、导出检查、素材处理 | 导出成片必需。Remotion 自带的那个是精简版（只有 `scale` 一个滤镜），混音到一半会报 `No such filter`。装法：`winget install Gyan.FFmpeg` / `brew install ffmpeg` / `sudo apt install ffmpeg` |
| Python + funasr | 真人录音识别切句（`scripts/asr.py`） | 用真人录音时，装法见 `assets/template/requirements.txt` |
| 一个 TTS | 没有真人录音时配音 | 可选；都没有就用 `estimate-align.mjs` 按字数估时长先做画面 |

第一次渲染时 Remotion 要下载一个自带的浏览器（约 100 MB）。**国内网络下这个包经常下到一半损坏**，表现是渲染卡住不动、或者解压报 `Z_DATA_ERROR`。两条解法：

```bash
# 有代理就配代理，删掉 node_modules/.remotion 重下
# 没代理就把渲染指向本机 Chrome（CLI 用这个参数）
npx remotion render Main out/video-muted.mp4 --muted --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"

# Node 脚本（check.mjs）用的是 Node API，不认上面那个参数，要设环境变量
REMOTION_BROWSER="C:/Program Files/Google/Chrome/Application/chrome.exe" node scripts/check.mjs
```

**另一个必踩的坑：端口被占。** `remotion render` 默认用 3000，如果你正好开着 `npm run dev` 的 Studio（或者别的服务占了 3000），渲染会连错地方，报一句看不懂的 `However, the function was undefined, which indicates that this is not a valid Remotion project`。加 `--port=3010` 换一个就行。`check.mjs` 自己会找空端口，不受影响。

## 文件

```
AGENTS.md                给 agent 的入口（跨工具约定，Codex / Cursor 等会自动读）
SKILL.md                 主流程（agent 从这里开始）
VERSION                  当前版本号，与 git tag 一致
CHANGELOG.md             每版改了什么
scripts/self-update.mjs  开工前自更新：克隆安装走 git pull，拷贝安装下 tarball 覆盖
references/              写稿、配音、分镜、风格、动效、组件目录、音效、审片、导出封面、踩坑
references/cover-refs/   六种封面构式的往期封面，做版面参考
assets/template/         可直接运行的 Remotion 工程模板（含组件库 src/parts、音效 public/sfx、脚本 scripts）
assets/taste-log.md      偏好记录模板，复制到每期工程里
docs/                    README 用的效果图
LICENSE                  MIT
```

模板自带同一段 28 秒示例（AI 幻觉主题）的三种做法，复制出来 `npm install` 后：

```bash
node scripts/estimate-align.mjs
npx tsc --noEmit
node scripts/check.mjs --out chk/r1
npm run dev
```

就能看到效果。把 `src/mode.ts` 改成 `"flat2d"` 或 `"room3d"` 再跑一遍抽帧，就是另外两种画面。

## 换成你自己的人设 / 角色 / 风格

- **人设**：讲解人怎么自称、怎么称呼观众、账号名、固定结尾，第一次用时 agent 会问你一次，记在工程的 `taste-log.md`“人设”里，以后不再问。不想定就用“我 / 你 / 关注我，下期见”
- **角色**：模板自带一套代码画的通用角色（讲解员、小同学、老板，共 11 个姿势），由 `scripts/make-cast.mjs` 生成，改里面的 `LOOK` 就能换颜色和配件。有自己的 IP 形象，就按同样的文件名（stick、chin、shrug、thumb、tea、kid、q、shock、sad、hand、boss）把透明底 PNG 放进 `public/img/c/`，再跑 `node scripts/make-cast.mjs --sizes`
- **颜色**：`src/parts/palette.ts`
- **偏好**：在 `taste-log.md` 里写你的要求，agent 每期开工前会先读，**你的话优先于 skill 里的默认规则**

## 许可证

代码用 MIT，见 [LICENSE](LICENSE)。

**Remotion 的授权是另一回事，不受这里的 MIT 影响。** 这个模板靠 Remotion 渲染视频，而 Remotion 不是完全免费的：按它官方的许可证，**个人、员工不超过 3 人的营利组织、非营利组织**可以免费用（商用也算），规模更大的营利组织需要买 Company License。要在公司项目里用，先确认自己的实体属于哪一档：

- 许可证页面：<https://www.remotion.dev/license>
- 原文：<https://github.com/remotion-dev/remotion/blob/main/LICENSE.md>

**素材**：`assets/template/public/img/paper.png`、`grain.png`（纸纹）、`public/img/c/`（角色）、`public/sfx/` 里 100 多个音效，都是自制或代码生成，随 MIT 一起授权，可以随便替换。

## 哪些实测过、哪些没有

2026-11-12 在**干净的 `git clone`** 里从零跑过一遍（Windows 11 / Node 22.22 / ffmpeg 9.0.2 / 本机 Chrome）。已验证：

| 步骤 | 结果 |
|---|---|
| `npm install` | 356 个包，41 秒 |
| `node scripts/estimate-align.mjs` | 28 秒示例稿估出 27.3 秒 |
| `npx tsc --noEmit` | 0 错误 |
| `node scripts/check.mjs` | 16 帧 + 2 张联系表，三种模式都出图 |
| `npx remotion render Main out/muted.mp4 --muted` | 826 帧 / 1 分 35 秒 / 20 MB |
| ffprobe 复查 | `1920×1080`、`yuv420p`、`tv`、`bt709`、`30/1`，无音轨（`--muted`） |
| `node scripts/mix-audio.mjs` | 8 个音效混成 AAC 48kHz 立体声，27.53 秒，与画面等长 |

**没有验证的部分，别当成能跑：**

- **真人录音的识别对齐**（`scripts/asr.py` + `scripts/align.mjs`）：要装 funasr + 模型，没在干净环境跑通过
- **背景音乐**（`mix-audio.mjs` 里的 `BGM_ON`）：默认关闭，这条分支没实测
- **封面**：`remotion still Cover43 / Cover34` 这套代码前几期实际出过图，但没在这次干净克隆里重新跑

遇到问题先查 `references/pitfalls.md`，里面是真实踩过的坑。

## 你做完一期，分享前检查

- `scripts/lines.json`（台词）、`src/scenes/`（分镜）、`taste-log.md`（偏好记录）里有没有你的真实姓名、公司名、客户名
- 画面里的截图有没有露出账号名、后台地址、真实价格或 token 额度
- 封面缩到手机信息流大小看一眼，钩子还认不认得出
- 角色、音效、纸纹都是代码生成的，可以随视频随意用
