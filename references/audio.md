# 音效

`public/sfx/` 里有 100 多个代码合成的音效（`.wav`），在 `src/Sfx.tsx` 的音效表里按帧登记：

```ts
[T("002", 0, 4), "hd_stamp", 0.45, "盖章-编的"],
```

## 规则

- **只做点缀，不抢配音**：配音音量 1；点缀 0.25~0.35；冲击类最多 0.45
- **只给画面重点配**：盖章、硬币、爆点、落地、揭晓、秤读数、小票打印、吃掉盘子……点缀类小音（每个元素出场都“啵”一下）去掉
- **相邻音效至少隔 1.5 秒**（`Sfx.tsx` 里 `GAP = 45` 会自动筛，留音量大的）
- **同一个声音别连着重复**：列表逐条出现用音阶上行（`hd_dot1→2→3`、`mar1→4`、`sp_bell1→4`），把重复变成旋律
- **声音和动作的分量一致**：落地 `thud` / `hd_bounce`，盖章 `hd_stamp` / `sp_stamp`，飞过 `whoosh` / `swoosh_*`，揭晓 `sp_reveal`，爆炸 `hd_boom`，钱 `bl_coin` / `bl_kaching`，打印 `bl_print`，问号 `bl_q`
- **按画面含义配专属音效**，别几种通用声音反复用；库里没有合适的，可以用代码合成新的放进 `public/sfx/`
- **产品更新类**视频用 `sp_*` 系列，有惊喜感
- **AI 动画段**：原来对着手绘画面打的音效会被 `inAi()` 自动去掉；按动画里的动作重新打点
- **删掉一段画面时**，对应的音效一起删

## 常用音效速查

| 前缀 | 风格 |
|---|---|
| `hd_*` | 手绘风：stamp 盖章、boom 爆、bounce 弹、dot1~3 音阶、flip 翻、hook 钩、paper 纸、poof 噗、scribble 涂写、squeak 吱 |
| `sp_*` | 惊喜感：pop、reveal 揭晓、sparkle / glitter / twinkle 闪、riser 上扬、fanfare 号角、unlock 解锁、idea 灵感、bell1~4 |
| `bl_*` | 账单 / 钱：coin、kaching、print、drawer 抽屉、tear 撕、strike 划掉、stairs 台阶、beep、lens 放大镜 |
| `mar1~4` | 马林巴音阶，逐条出现用 |
| 其他 | whoosh、swoosh_up/down、thud、tada、tick/tock、snap、chime、ding、boing、alert |

## 背景音乐

默认不放。用户要放时：音乐要有激情、跟着内容变；说话时压低、句间空档抬起（`mix-audio.mjs` 里有 `BGM_ON` 开关的处理逻辑）；笔记本喇叭上要听得到（别全是低频）。
