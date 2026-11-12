# 更新记录

版本号在 `VERSION` 文件里，与 git tag 一致。别人装的是哪版，看这个文件或 `git describe --tags`。

## 1.4.0

**开工先问画面风格，不替用户选**

- `SKILL.md` 第 0 步改成「问清画面风格，其余用默认」：把「用哪种画面」列为**必须问**的第一件事，三种各一句话说明，要求先看主比喻给推荐、再让用户回数字
- 写死三条：问完就停等回复（不许一边问一边把稿子写了）；往期偏好只作推荐依据不能代替这一次的选择；「默认 3D 展板」只是没人回答时的兜底，不是替用户拍板
- 给了提问模板和效果图用法：能发图就发 `docs/board3d.jpg`、`flat2d.jpg`、`room3d.jpg`（同一份稿子的三种做法）
- `references/modes.md`「怎么选」改成先问用户，用户说「你定」才按匹配规则选；补三种效果图路径，要求把「哪种、谁定的、为什么」记进 `storyboard.md`
- `references/storyboard.md`、`AGENTS.md`、`README.md` 同步口径；`SKILL.md` 文件地图里 modes.md 改成第 0 步就读

## 1.3.0

**做完视频不许直接导出：导出改成一道硬闸**

- 新增 `assets/template/scripts/export.mjs`，是唯一允许的导出入口，必须带 `--confirm "<用户原话>"`
  - 没有确认 → 拒绝，并告诉 agent 先去开预览、等用户回话
  - 确认是「可以了 / 不错 / 继续 / 你看着办」这类评价 → 拒绝，那不是在批准出片
  - `chk/` 下没有 `sheet*.jpg`（没抽过帧审片）→ 拒绝，先回去跑 `check.mjs`
  - 只有用户自己说「不用预览」时才允许 `--allow-no-preview`，且汇报里要写明
- 一条命令接管整段导出：`tsc` → 渲染 → 混音 → ffprobe 自检（`yuv420p / tv / bt709`、时长对齐配音、有没有音轨），最后打印 `EXPORT=ok` 或 `EXPORT=warn` 加具体问题
- 顺手消掉两个新手坑：默认走 3010 端口（避开 Studio 占 3000）、自动找本机 Chrome 当渲染浏览器
- `SKILL.md` 顶部把第 2 关写成硬闸并列出「不算确认」的说法；第 6 步写明只预览不出片；第 7 步只许走脚本
- `references/export-cover.md` 导出章节重写成两道闸 + 自检表；`AGENTS.md` 三条硬规则变四条
- 修两个 Windows 坑：shell 模式下带空格的 `--browser-executable` 被 cmd 从空格切断（参数自己加引号）；ffprobe 输出带 `\r` 导致色彩检查把正确值误判成 `warn`

## 1.2.0

**开工前自动更新，拷文件夹安装的也能升**

- 新增 `scripts/self-update.mjs`：读远端 `VERSION`，比本地新才动手；clone 安装走 `git pull` 只拉增量，没有 `.git` 的直接下 tarball 覆盖
- 输出机器可读状态行 `SELF_UPDATE=updated|current|skipped|failed`，`SKILL.md` 按这个决定要不要告诉用户
- 保护：下载完再校验版本，坏包不覆盖；`.git`、`node_modules`、`no-autoupdate`、`chk/`、`out/` 一律不覆盖
- `--dry-run` 只看有没有新版，`--force` 忽略 `no-autoupdate`，环境变量 `NAIWA_SKILL_REPO` 可指向 fork
- `SKILL.md` 的同步步骤改成调这个脚本；README「更新」一节重写

## 1.1.0

**跨 agent 通用**

- 新增 `AGENTS.md`：Codex、Cursor 等自动读的入口文件
- `README.md` 安装章节重写：WorkBuddy / Claude Code / 其他 Agent Skills 产品分别给路径；没有 skill 机制的产品给三种降级用法
- `SKILL.md` 新增「换哪个 agent 都能用」：四种能力缺失时怎么降级（没 skill 机制 / 开不了预览 / 没有看图能力 / 不能执行命令）
- 改名 `paper-handdrawn-explainer` → `naiwa-teacher-anime`（frontmatter、package.json、目录、仓库同步）
- 新增「开工前同步到最新版」：clone 安装的人每次开工自动拉一次

## 1.0.0

首个公开版本。

- `SKILL.md` 主流程 + `references/` 十一篇规则（写稿、配音、分镜、三种画面模式、风格、动效、组件目录、音效、审片、导出封面、踩坑）
- `assets/template/` 可直接运行的 Remotion 工程：组件库 `src/parts/`、102 个音效、抽帧 / 对齐 / 混音脚本
- 三种画面模式：3D 展板、2D 平面、3D 实景
- 封面按内容设计：六种构式的参考图在 `references/cover-refs/`
- 在干净 clone 里跑通全流程并修掉三个阻塞：`-filter_complex_script` 在 ffmpeg 9 被删、缺 ffmpeg 时提示不清、缺 `voice.ts` 时抛 ENOENT
- MIT 许可证
