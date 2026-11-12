# 踩坑表

按症状查。都是真实遇到过的。

## 配音与对齐

| 症状 | 处理 |
|---|---|
| 长音频逐字时间戳越往后越漂 | 用 `scripts/asr.py` 按波形停顿切句（短段识别），别用整段逐字时间戳 |
| 声画对不上 | 先把那一句的音频切出来重听，再改 `lines.json`；别拿同一份识别结果“自证”对齐正确 |
| 录音和稿子不一样 | **以录音为准**改 `lines.json`，画面跟着改；漏念的句子删掉 |
| 英文专名听错（json→Jason） | 人工核对，拿不准问用户 |
| `align.mjs` 报某句太短 / 太长 | 多半是切句错位。看前后两句的边界，手工修 `lines.json` 再跑 |
| funasr 第一次运行很慢 | 在下载模型，等它下完；国内网络可设 `MODELSCOPE_CACHE` 指向已有模型 |

## 导出

| 症状 | 处理 |
|---|---|
| 画面发白、过曝 | `remotion.config.ts` 已设 bt709 + yuv420p，导出后 ffprobe 确认 `yuv420p / tv / bt709` |
| 带音轨导出崩溃（`write EOF`） | `--muted` 导出画面，再 `mix-audio.mjs` 混音合并 |
| `--muted` 也崩，GPU 进程退出 | 导出 PNG 序列（`--sequence --image-format=png`），再用 ffmpeg 编码 |
| 短录屏导致卡死 | `prep-img.cjs` 拆成图片序列按帧号显示，导出时不解码视频；HEVC 10bit 也这样处理 |
| 判断是否卡死 | 日志一直重复同一个 "Rendered N/总数"。结束进程时别误杀 Studio |
| 结尾被截掉 | 合并别用 `-shortest`，配音加 `apad=whole_dur=画面秒数`（脚本已处理） |
| 新装后第一次渲染卡住不动，或解压报 `Z_DATA_ERROR` / `unzip` 失败 | Remotion 在下载自带浏览器，国内网络下经常**下到一半损坏**（`node_modules/.remotion` 里的包大小不对）。能配代理就删掉该目录重下；不能就指向本机 Chrome：CLI 加 `--browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"`，Node API 脚本（`check.mjs`）设环境变量 `REMOTION_BROWSER`（CLI 那个参数对 Node 脚本无效） |
| 渲染报 `ERR_ABORTED` | 端口被占，加 `--port=` 换一个 |
| Remotion 自带 ffmpeg 缺滤镜 | 装完整版 ffmpeg，设环境变量 `FFMPEG` / `FFPROBE` 或放进 PATH（`scripts/ff.mjs` 按这个顺序找） |

## 3D 展板

| 症状 | 处理 |
|---|---|
| 重叠的组件互相穿插、闪烁 | 用 `lift` 显式分层，两层至少差 60 |
| 整组让位时组件抽搐 | 移动整组用 `dx`，不要改 `x` |
| 某个元素在 3D 里消失 | 0 尺寸的 div 加 `translateZ` 会被裁掉，给它宽高 |
| Studio 预览里大平面花屏 | 墙、地这类大 3D 平面改成按镜头投影画的屏幕 SVG（导出一般正常，以渲染为准） |
| 门开了变成一条白线 | 门别 `rotateY`，用 `scaleX + skewY` |
| 俯视角度反了 | `rotateX` 用负数是俯视 |
| 聚焦变淡、气泡被展板压住 | 屏幕层 `Sequence` 要 `zIndex: 3`（模板已设） |
| 飞完镜头取景偏 | 改 `framing.ts` 里这块展板的 `OVERRIDE`，不要改组件坐标 |
| 铺满屏的视频展板前有退场尾巴 | 把它的 id 加进 `World3D.tsx` 的 `CUT_BEFORE` |

## 画面

| 症状 | 处理 |
|---|---|
| 全片整体偏移，压到字幕 | 平面分镜 `Cam` 焦点 y 写 540 |
| 元素刚出现就被摇走 | 切走前至少停 1.5 秒，否则整块删掉 |
| 分镜开头空白 | 主画面卡第一段字幕（`T(句, 0, 8)`），别等第二段 |
| 退场和下一个之间空屏 | `out` 和下一个的 `at` 写同一帧 |
| 下一步残留箭头 | 分步元素全部设 `out` |
| 飞走没飞出去 | 算够距离，抽飞行结束后那帧确认 |
| 转场没盖满 / 露出字幕 | 盖满帧单独抽出来看；盖满的帧登记进 `transitions.tsx` |
| 分镜被切短后音效还响 | 删画面时把对应音效一起删 |
| 排一排人时气泡一变宽人就动 | 别用 space-between，每人固定 x |
| SVG 粗线、尖角描边被切 | `style={{overflow: "visible"}}`，描边留边距 |
| 国旗 emoji 显示成字母 | 换图标（本来也不该用 emoji） |
| 字挤出便签 | `fit(文字, 最大宽, 字号)` 算字号，或缩文案 |

## 素材

| 症状 | 处理 |
|---|---|
| 截图文件名和内容对不上 | 逐张看图，再对台词 |
| 马赛克没生效 | sharp 同一条链里两次 `resize` 只有最后一次生效，分两步（`blur.cjs` 已用墨色块，不用马赛克） |
| 终端截图中文乱码 | 不修截图，贴纸写清楚 |
| 抠图后脚下有灰影 | 去掉近白且不带颜色的像素，以及底部偏灰的像素 |

## 命令行（Windows 尤其注意）

| 症状 | 处理 |
|---|---|
| 中文路径 / 反斜杠 / 反引号在 bash heredoc、`node -e` 里出错 | 先用文件工具把代码写成脚本文件，再运行 |
| Git Bash 路径传给 Node 解析错 | Node 脚本里写 `E:/xxx` 这种正斜杠路径 |
| 建 junction 失败 | PowerShell `New-Item -ItemType Junction` 或 `cmd /c mklink /J`，两个都试 |
| `python` 只是应用商店的空壳 | 装真正的 Python，或用 `py` 启动 |
| ffmpeg `select=eq(n\,N)` 解析失败 | 用 `-ss 秒数 -frames:v 1` |

## Studio

| 症状 | 处理 |
|---|---|
| 拖动后代码变了 | Studio 会写回源码。改之前重新读文件，导出前跑 `npx tsc --noEmit` |
| 封面在 Studio 和 PNG 不一样 | 以 `remotion still` 导出为准 |
| 热更新残留报错 | 刷新后正常就不用管，以渲染结果为准 |
| 预览只有几帧每秒 | 面板隐藏时被限速，数字不可信 |
| 刚启动打不开 | 等日志出现 `Server ready` |
