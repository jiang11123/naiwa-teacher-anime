# 借鉴来源与取舍

> 这份是来源记录，不用在制作时读。判断内容在 `README.md` 和各篇文件里。

2026-11-04 读了 GitHub 上的几个审美和动效 skill，这里记录用了什么、没用什么、为什么。没有复制原文，都是重新写的。

**判断标准：** 换一种风格还成立吗？换到视频还成立吗？在手机上看还成立吗？三个都成立才写成通用规则。只在某种风格里成立的，放进风格选项。

**阅读范围：** 下面都读了主文件，大多没读它们引用的子文件，也没有实际运行。

## 用了的

| 来源 | 用了什么 | 写在哪里 | 为什么通用 |
|---|---|---|---|
| [taste-skill](https://github.com/Leonxlnx/taste-skill)（MIT） | 想法从题材来，先列题材清单；从多个方向里选，不用第一个想到的 | `README.md` 第 2 步、style-systems.md | 平庸来自默认值，这和外观无关 |
| taste-skill | 只做减法会显得单薄，要补实质 | style-systems.md | 正好解释了第一轮主体太小的问题 |
| [explainer-video](https://github.com/iart-ai/explainer-video-skills)（MIT） | 一句话核心；讲解是论证；比喻要是还得再解释就换掉 | `README.md` 第 1 步、第 6 步 | 和讲解视频的本质有关 |
| explainer-video | 字幕和分镜共用一份时间表；先渲染单帧再导出 | `README.md` 第 8、9 步 | 省时间，防止不同步 |
| [motion-art-direction](https://github.com/iart-ai/motion-design-skills)（MIT） | 先定动效语言再动手；全片一套；主角和配角分级；什么不该动 | `README.md` 第 7 步、motion.md | 不同风格的值不同，但方法一样 |
| [animation-principles](https://github.com/iart-ai/motion-design-skills)（MIT） | 主动作、跟随、环境三层；预备和余势；弧线；分量写在时长里；同时动的不超过三分之一 | motion.md | 动画基本原理，任何风格都用得上 |
| [motion-design](https://github.com/LottieFiles/motion-design-skill)（MIT） | 动势档案的思路；按材质判断回弹 | motion.md | 把"手感"变成可以选择的东西 |
| [claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill)（MIT） | 入场至少两种属性；打击、停、铺垫的节奏；不超过 90 帧没变化 | motion.md | 和第一轮暴露的问题直接相关 |
| [impeccable](https://github.com/pbakaus/impeccable)（Apache-2.0） | 用户的要求优先于自己的品味；微调要保留原有的，重做才整个换 | `README.md`、review.md | 防止模型把用户的风格改成自己喜欢的 |
| [design-taste](https://github.com/madebymustafa/design-taste)（MIT） | 动手前说一句自己的理解；问"不用这个 skill 也能做出来吗" | `README.md`、review.md | 简单，能逼模型说实话 |
| [explainroo](https://github.com/vincentsch/explainroo)（MIT） | 联系表加自动检查的审片方式 | scripts/review.mjs | Agent 不能看视频，只能看帧 |

## 没用的

| 内容 | 来源 | 为什么不用 |
|---|---|---|
| 禁用渐变、毛玻璃、Inter、紫色等清单，当作通用规则 | taste-skill、design-taste | 这是网页的默认样式，不适用于所有风格。改成：没写进风格规格才算错 |
| 用细线、编号、小标签显得高级 | design-taste | 和 taste-skill 的看法相反，说明只是一种风格 |
| 每个画面都加噪点、暗角、调色、网格背景 | claude-remotion-skill | 这是一种电影感外观，放到手绘或极简里就错了 |
| 每张图都慢推，所有元素都呼吸 | claude-remotion-skill | 一直动会抢注意力，也和"动完要停"冲突 |
| 三分法，主体不放中间 | [shot-composition](https://github.com/iart-ai/motion-design-skills)（MIT） | 手机讲解画面小，居中更容易看清。只作为可选构图 |
| 大量留白显得高级 | shot-composition、design-taste | 在手机上会让主体变小，第一轮两版主体都偏小 |
| 一条片子只能有一个亮点 | motion-art-direction | 短片可以，几分钟的讲解太少。这里允许 1~3 个 |
| 按钮 100~300 毫秒的时长表 | motion-design、animation-principles | 这是给网页交互的，视频太快 |
| 每秒 2.3 个词、每行 42 字符 | explainer-video | 这是英文标准。中文按字幕段实际时间 |
| 问题占 20%、方案占 15% 的固定比例 | explainer-video | 更适合产品介绍，不适合榜单、清单、教程 |
| 字幕之间留空隙 | explainer-video | 在连续讲解里会一闪一闪，第一轮就是这个问题 |
| 频率门槛（用户经常触发的动画要少） | [design-motion-principles](https://github.com/kylezantos/design-motion-principles)（MIT） | 针对可交互的界面，视频里观众不触发动画 |
| 随机发牌的脚本和设计方向库 | taste-skill | 依赖网页模板，不适合视频。只保留"多选一"的方法 |
| 风格、配色、字体的大资料库 | [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)（MIT，只读了开头） | 主要是网页和品牌素材。模型缺的是判断，不是选项 |
| 下载运行的二进制工具、PRODUCT.md 体系 | impeccable | 太重，而且安装陌生的可执行文件有风险 |
| 可用性和转化率检查 | taste-design-review | 针对网页，视频里没有按钮和表单 |

## 还没验证

这些借鉴来的内容，在视频里有没有效果，要看下一轮测试。如果某条没起作用，就把它删掉。
