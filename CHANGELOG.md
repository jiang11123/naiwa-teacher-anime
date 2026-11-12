# 更新记录

版本号在 `VERSION` 文件里，与 git tag 一致。别人装的是哪版，看这个文件或 `git describe --tags`。

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
