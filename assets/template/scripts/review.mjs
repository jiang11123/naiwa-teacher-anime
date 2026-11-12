#!/usr/bin/env node
// 审片工具，只依赖 ffmpeg。整片联系表、关键动作逐帧条、静止时长、内容停留率、瞬间消失和空屏；给了字幕时间表，还会查每句话有没有带来变化。
// 用法：node review.mjs video.mp4 --out review --moves 12.5,30.2 --script script.json --keep 216-232 --peaks 12.3,40
// 同样的内容留超过 12 秒时退出码为 2，--keep 标出简报写明的例外。全片没有爆点、重点表的爆点不够大，退出码也是 2。
// ffmpeg 不在 PATH 时，设置环境变量 FFMPEG 指向它。
import {spawnSync} from "node:child_process";
import {mkdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

const args = process.argv.slice(2);
const video = args[0];
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

if (!video) {
  console.error("用法：node review.mjs video.mp4 --out review --moves 12.5,30.2 --script script.json");
  process.exit(1);
}

const ffmpeg = process.env.FFMPEG || "ffmpeg";
const out = option("out", "review");
const moves = option("moves", "").split(",").filter(Boolean).map(Number);
mkdirSync(out, {recursive: true});

const run = (extra) => {
  const result = spawnSync(ffmpeg, ["-hide_banner", ...extra], {encoding: "utf8", maxBuffer: 1 << 28});
  if (result.error) {
    console.error(`无法运行 ffmpeg：${result.error.message}`);
    process.exit(1);
  }
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
};

const probe = run(["-i", video]);
const match = probe.match(/Duration: (\d+):(\d+):([\d.]+)/);
if (!match) {
  console.error(`读不到视频时长：${video}`);
  process.exit(1);
}
const duration = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
const portrait = (() => {
  const size = probe.match(/, (\d{3,5})x(\d{3,5})/);
  return size ? Number(size[2]) > Number(size[1]) : false;
})();

// 联系表：一格接近手机上的观感，这个尺寸看不清的字就是太小
const cols = portrait ? 8 : 4;
const rows = portrait ? 3 : 6;
const width = portrait ? 240 : 480;
const sheet = join(out, "sheet.jpg");
run(["-y", "-loglevel", "error", "-i", video, "-vf", `fps=${(cols * rows) / duration},scale=${width}:-2,tile=${cols}x${rows}`, "-frames:v", "1", "-q:v", "3", sheet]);
console.log(`联系表：${sheet}（每格约隔 ${(duration / (cols * rows)).toFixed(1)} 秒）`);

// 逐帧条：一个动作连续 18 帧，用来看过冲、形变和落定，抽样联系表看不出这些
for (const start of moves) {
  const file = join(out, `move-${start}.jpg`);
  run(["-y", "-loglevel", "error", "-ss", String(start), "-t", "0.6", "-i", video, "-vf", "fps=30,scale=320:-2,tile=6x3", "-frames:v", "1", "-q:v", "3", file]);
  console.log(`逐帧条：${file}（从 ${start} 秒起连续 18 帧）`);
}

// 静止统计：线条抖动这类风格质感也算在动，所以这个数字只用来找空等的位置，不用来比风格好坏
const log = run(["-nostats", "-i", video, "-vf", "scale=640:-2,freezedetect=n=0.002:d=0.6", "-f", "null", "-"]);
const starts = [...log.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...log.matchAll(/freeze_end: ([\d.]+)/g)].map((m) => Number(m[1]));
const spans = starts.map((start, i) => ({start, end: ends[i] ?? duration}));
const total = spans.reduce((sum, span) => sum + span.end - span.start, 0);
console.log(`静止：共 ${total.toFixed(1)} 秒，占全片 ${((total / duration) * 100).toFixed(0)}%`);
for (const span of spans.filter((s) => s.end - s.start >= 1.5)) {
  console.log(`  ${span.start.toFixed(1)}~${span.end.toFixed(1)} 秒，${(span.end - span.start).toFixed(1)} 秒没有变化`);
}

// 停留率：字幕上方的内容，过几秒后还有多少没变。主体摆着不动、只有小件在变时，静止统计看不出来，这个数能看出来
const FPS = 2;
const W = portrait ? 90 : 160;
const H = portrait ? 160 : 90;
const AREA = W * Math.floor(H * 0.78);
const raw = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", video, "-vf", `fps=${FPS},scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], {maxBuffer: 1 << 30}).stdout;
const frames = Array.from({length: Math.floor(raw.length / (W * H))}, (_, i) => raw.subarray(i * W * H, (i + 1) * W * H));
// 和背景差得够多的算内容，背景取画面亮度的中位数
const backgrounds = frames.map((f) => Array.from(f.subarray(0, AREA)).sort((a, b) => a - b)[Math.floor(AREA / 2)]);
const compare = (i, lag) => {
  let kept = 0;
  let total = 0;
  for (let p = 0; p < AREA; p++) {
    if (Math.abs(frames[i][p] - backgrounds[i]) > 18) {
      total++;
      if (Math.abs(frames[i][p] - frames[i + lag * FPS][p]) < 14) kept++;
    }
  }
  return {kept, total};
};
const persist = (lag) => {
  let kept = 0;
  let total = 0;
  for (let i = 0; i + lag * FPS < frames.length; i++) {
    const r = compare(i, lag);
    kept += r.kept;
    total += r.total;
  }
  return total ? (kept / total) * 100 : null;
};
const report = (lag, limit) => {
  const value = persist(lag);
  if (value === null) return `${lag} 秒后：片子太短或没有内容`;
  return `${lag} 秒后 ${value.toFixed(0)}%${value > limit ? `（偏高，参考线 ${limit}%）` : ""}`;
};
console.log(`停留率：${report(3, 50)}，${report(10, 30)}。榜单、教程窗口的框架本来就要留着，数字高时看里面的内容有没有换`);

// 找出留太久的片段：内容过 6 秒后还有七成以上没变，这样连续 12 秒以上才列出来
const LAG = 6;
const stale = [];
for (let i = 0; i + LAG * FPS < frames.length; i++) {
  const {kept, total} = compare(i, LAG);
  if (total < AREA * 0.01 || kept / total < 0.7) continue;
  const last = stale[stale.length - 1];
  const start = i / FPS;
  const end = start + LAG;
  if (last && start <= last.end) last.end = end;
  else stale.push({start, end});
}
// 上限：超过 12 秒算不通过，退出码为 2。简报写明的例外用 --keep 216-232,241-255 标出来，只放过盖住的那几段
const HOLD_LIMIT = 12;
const keeps = option("keep", "").split(",").filter(Boolean).map((s) => s.split("-").map(Number));
const over = stale.filter((s) => s.end - s.start >= HOLD_LIMIT);
// 标的范围要和这一段基本对齐，--keep 0-999 这样一把全放过不算
const isKept = (s) => keeps.some(([a, b]) => Math.abs(a - s.start) <= 2 && Math.abs(b - s.end) <= 2);
const longest = stale.reduce((max, s) => Math.max(max, s.end - s.start), 0);
console.log(`最长停留：${longest.toFixed(1)} 秒，上限 ${HOLD_LIMIT} 秒`);
for (const span of over) {
  console.log(`  ${span.start.toFixed(1)}~${span.end.toFixed(1)} 秒，同样的内容留了 ${(span.end - span.start).toFixed(1)} 秒${isKept(span) ? "（简报写明的例外）" : "（超过上限）"}`);
}
const failed = over.filter((s) => !isKept(s));
if (failed.length) {
  console.log(`不通过：${failed.length} 段超过上限。换一屏、移走或换主体，同一个东西在原地长大、变形不算换。例外的条件见 SKILL.md 第 4 步`);
  process.exitCode = 2;
}

// 瞬间消失和空屏：字幕上方的内容上一帧还摆着、这一帧就没了四成以上，或者连续几帧几乎什么都没有
const EW = portrait ? 90 : 160;
const EH = portrait ? 160 : 90;
const EA = Math.floor(EH * 0.87);
const rgb = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", video, "-vf", `fps=30,scale=${EW}:${EH},crop=${EW}:${EA}:0:0`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], {maxBuffer: 2 ** 31}).stdout;
const bytes = EW * EA * 3;
const count = Math.floor(rgb.length / bytes);
const fg = [];
const tops = [];
for (let f = 0; f < count; f++) {
  // 出现最多的颜色算背景，和它差得够多的算内容
  const hist = new Map();
  for (let p = 0; p < EW * EA; p++) {
    const o = f * bytes + p * 3;
    const key = ((rgb[o] >> 3) << 10) | ((rgb[o + 1] >> 3) << 5) | (rgb[o + 2] >> 3);
    hist.set(key, (hist.get(key) ?? 0) + 1);
  }
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const [R, G, B] = [((top >> 10) & 31) * 8 + 4, ((top >> 5) & 31) * 8 + 4, (top & 31) * 8 + 4];
  tops.push([R, G, B]);
  let hits = 0;
  for (let p = 0; p < EW * EA; p++) {
    const o = f * bytes + p * 3;
    if (Math.abs(rgb[o] - R) + Math.abs(rgb[o + 1] - G) + Math.abs(rgb[o + 2] - B) > 70) hits++;
  }
  fg.push(hits / (EW * EA));
}
const drops = [];
for (let f = 1; f < count; f++) {
  // 背景色跟着变的是转场盖上来或揭开，不算
  const sameBg = Math.abs(tops[f][0] - tops[f - 1][0]) + Math.abs(tops[f][1] - tops[f - 1][1]) + Math.abs(tops[f][2] - tops[f - 1][2]) < 40;
  if (!sameBg || f < 2 || fg[f - 1] <= 0.03 || fg[f] >= fg[f - 1] * 0.6) continue;
  // 上一帧已经在动的是正在飞走，不算。上一帧还稳稳摆着、这一帧就没了，才是凭空消失
  let moving = 0;
  for (let p = 0; p < EW * EA; p++) {
    const o = p * 3;
    const u = (f - 1) * bytes + o;
    const v = (f - 2) * bytes + o;
    if (Math.abs(rgb[u] - rgb[v]) + Math.abs(rgb[u + 1] - rgb[v + 1]) + Math.abs(rgb[u + 2] - rgb[v + 2]) > 70) moving++;
  }
  if (moving / (EW * EA) < (fg[f - 1] - fg[f]) * 0.3) drops.push(f);
}
const blanks = [];
let blankStart = -1;
for (let f = 0; f <= count; f++) {
  if (f < count && fg[f] < 0.006) {
    if (blankStart < 0) blankStart = f;
  } else if (blankStart >= 0) {
    if (f - blankStart >= 3 && blankStart > 10) blanks.push({start: blankStart, len: f - blankStart});
    blankStart = -1;
  }
}
const minutes = count / 1800 || 1;
const blankFrames = blanks.reduce((sum, b) => sum + b.len, 0);
console.log(`瞬间消失：每分钟 ${(drops.length / minutes).toFixed(1)} 次。逐个去看这几帧：一大块东西是不是没有退场就没了`);
if (drops.length) console.log(`  第 ${drops.join("、")} 帧`);
console.log(`空屏：${blankFrames} 帧${blanks.length ? "。不是有意停顿的话，下一拍要在上一拍走完之前进来" : ""}`);
for (const b of blanks) console.log(`  第 ${b.start} 帧起空了 ${b.len} 帧`);

// 比 4×4 像素块的平均色：线条抖动这类风格质感会被平均掉，不算变化
const BLOCK = 4;
const bw = Math.floor(EW / BLOCK);
const bh = Math.floor(EA / BLOCK);
const blocks = (f) => {
  const sum = new Float32Array(bw * bh * 3);
  for (let y = 0; y < bh * BLOCK; y++) {
    for (let x = 0; x < bw * BLOCK; x++) {
      const k = (Math.floor(y / BLOCK) * bw + Math.floor(x / BLOCK)) * 3;
      const p = f * bytes + (y * EW + x) * 3;
      for (let c = 0; c < 3; c++) sum[k + c] += rgb[p + c];
    }
  }
  return sum.map((v) => v / (BLOCK * BLOCK));
};
const differ = (u, v, limit = 30) => {
  let hits = 0;
  for (let k = 0; k < u.length; k += 3) {
    if (Math.abs(u[k] - v[k]) + Math.abs(u[k + 1] - v[k + 1]) + Math.abs(u[k + 2] - v[k + 2]) > limit) hits++;
  }
  return hits / (bw * bh);
};

// 爆点：半秒内画面变了多少。全片一处整屏的变化都没有算不通过，--no-peak 表示简报写明了不做。--peaks 12.3,40 是重点表里的爆点，要真的够大
const STEP = 3;
const HALF = 15;
const PEAK_SIZE = 0.5;
const WHOLE = 0.75;
const swing = [];
let previous = count > HALF ? blocks(0) : null;
for (let f = 0; f + HALF < count; f += STEP) {
  const now = f === 0 ? previous : blocks(f);
  swing.push(differ(now, blocks(f + HALF), 45));
}
const bursts = [];
for (let i = 1; i + 1 < swing.length; i++) {
  if (swing[i] < PEAK_SIZE || swing[i] < swing[i - 1] || swing[i] < swing[i + 1]) continue;
  const at = (i * STEP) / 30;
  const last = bursts[bursts.length - 1];
  if (last && at - last.at < 1) {
    if (swing[i] > last.size) Object.assign(last, {at, size: swing[i]});
  } else bursts.push({at, size: swing[i]});
}
const biggest = swing.reduce((max, v) => Math.max(max, v), 0);
const wholes = bursts.filter((b) => b.size >= WHOLE);
console.log(`爆点：最大一次半秒内变了 ${(biggest * 100).toFixed(0)}%，变化过半 ${bursts.length} 处，接近整屏 ${wholes.length} 处${wholes.length ? `（${wholes.map((b) => `${b.at.toFixed(1)} 秒`).join("、")}）` : ""}。这个数只看大小，整屏一块纯色也算，要去看盖满时好不好看`);
const crowded = wholes.filter((b, i) => i > 0 && b.at - wholes[i - 1].at < 8);
for (const b of crowded) console.log(`  ${b.at.toFixed(1)} 秒离上一次整屏变化不到 8 秒，连着炸就没有对比了`);
if (!bursts.length && !args.includes("--no-peak")) {
  console.log("不通过：全片没有一处整屏参与的变化。回到重点表，给最重要的那句做爆点");
  process.exitCode = 2;
}
for (const at of option("peaks", "").split(",").filter(Boolean).map(Number)) {
  const near = swing.slice(Math.max(0, Math.floor(((at - 1) * 30) / STEP)), Math.ceil(((at + 1) * 30) / STEP)).reduce((max, v) => Math.max(max, v), 0);
  const weak = near < PEAK_SIZE;
  console.log(`  重点表 ${at} 秒：半秒内变了 ${(near * 100).toFixed(0)}%${weak ? "（不够大）" : ""}`);
  if (weak) process.exitCode = 2;
}

// 一句一变化：每句话开口后，字幕上方过多久才有东西变。script.json 里要有 captions：text、startFrame、endFrame
const scriptFile = option("script", "");
if (scriptFile) {
  const captions = JSON.parse(readFileSync(scriptFile, "utf8")).captions ?? [];
  const CHANGED = 0.02;
  const results = captions
    .filter((c) => c.startFrame >= 2 && c.endFrame < count)
    .map((c) => {
      const base = blocks(c.startFrame - 2);
      let first = null;
      for (let f = c.startFrame; f <= c.endFrame && first === null; f += 3) {
        if (differ(base, blocks(f)) >= CHANGED) first = f - c.startFrame;
      }
      return {...c, first};
    });
  const late = results.filter((c) => c.first === null || c.first > 30);
  const sorted = results.map((c) => c.first ?? c.endFrame - c.startFrame).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  console.log(`一句一变化：${results.length} 句里，${results.length - late.length} 句开口 1 秒内就有变化，中位 ${(median / 30).toFixed(1)} 秒`);
  for (const c of late) {
    const when = c.first === null ? "整句都没有明显变化" : `开口 ${(c.first / 30).toFixed(1)} 秒后才有变化`;
    console.log(`  第 ${c.startFrame} 帧「${c.text}」${when}`);
  }
}
