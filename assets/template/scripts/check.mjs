// 抽帧审片：一次打包，按分镜表和字幕自动挑检查帧，渲染成小图，再拼成联系表（每格 640×360，接近手机上的观感）
// 用法：
//   node scripts/check.mjs                 自动挑帧：每块展板开头 +12、每段字幕中间、每块展板 90% 处
//   node scripts/check.mjs 120 455 900     只看这几帧
//   node scripts/check.mjs --out chk/r2    换一个输出目录（改完一轮换一个，方便对比）
//   REMOTION_BROWSER="C:/Program Files/Google/Chrome/Application/chrome.exe" node scripts/check.mjs
//                                          国内下载 Remotion 自带浏览器经常中途损坏时，指到本机 Chrome
// 输出：<out>/v<帧>.jpg、<out>/sheet0.jpg、sheet1.jpg ...（每张 12 格，按时间顺序，左上角标帧号和秒数）
import fs from "fs";
import path from "path";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import sharp from "sharp";
import net from "net";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const out = oi >= 0 ? args[oi + 1] : "chk/r1";
const picked = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== "--out").map(Number);
fs.mkdirSync(out, {recursive: true});

// 用哪个浏览器：环境变量优先。这里是 Node API，不认 CLI 的 --browser-executable 参数，
// 所以国内网络下自带浏览器下不下来（zip 损坏 / Z_DATA_ERROR）时，只能靠这个变量指本机 Chrome
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
if (browserExecutable) console.log(`浏览器：${browserExecutable}`);

// 缺 voice.ts 时给一句人话，别甩 ENOENT 堆栈（新用户最容易踩这个）
if (!fs.existsSync("src/voice.ts")) {
  console.error(
    "缺 src/voice.ts —— 台词、字幕和每句时长都在这个文件里。\n" +
      "先跑：node scripts/estimate-align.mjs（没有配音，按字数估时长）\n" +
      "或　：node scripts/align.mjs（已有配音，按识别结果对齐）\n" +
      "生成 voice.ts 之后再跑这个脚本。",
  );
  process.exit(1);
}
const voice = fs.readFileSync("src/voice.ts", "utf8");
const L = JSON.parse(voice.match(/export const L[^=]*= (\{.*?\});/)[1]);
const caps = JSON.parse(voice.split("export const captions: CaptionLine[] = ")[1].replace(/;\s*$/, ""));
const total = Number(voice.match(/VOICE_FRAMES = (\d+)/)[1]);
const tl = fs.readFileSync("src/timeline.tsx", "utf8");
const firsts = [...tl.matchAll(/\["\d{3}[^"]*", [\w.]+, "(\d+)", "\w+"\]/g)].map((m) => m[1]);
const starts = firsts.map((id, i) => (i === 0 ? 0 : Math.max(0, L[id][0] - 12)));

let frames = picked;
if (!frames.length) {
  const set = new Set();
  starts.forEach((a, i) => {
    const b = i + 1 < starts.length ? starts[i + 1] : total;
    set.add(a + 12);
    set.add(Math.round(a + (b - a) * 0.9));
  });
  for (const c of caps) set.add(Math.round(((c.start + c.end) / 2) * 30));
  frames = [...set].filter((f) => f >= 0 && f < total).sort((a, b) => a - b);
}
console.log(`渲染 ${frames.length} 帧 → ${out}`);

const serveUrl = await bundle({entryPoint: path.resolve("src/index.ts")});
// 自己找一个空端口：Studio 开着时默认的 3000 被占，渲染会连到 Studio 上报错
const port = await new Promise((ok) => { const sv = net.createServer().listen(0, "127.0.0.1", () => { const p = sv.address().port; sv.close(() => ok(p)); }); });
const composition = await selectComposition({serveUrl, id: "Main", port, browserExecutable});
for (const f of frames) {
  await renderStill({serveUrl, composition, port, frame: f, output: path.join(out, `v${f}.jpg`), imageFormat: "jpeg", scale: 0.5, browserExecutable});
  process.stdout.write(`${f} `);
}
console.log("");

const W = 640;
const H = 360;
const cols = 3;
const rows = 4;
for (let p = 0; p * rows * cols < frames.length; p++) {
  const part = frames.slice(p * rows * cols, (p + 1) * rows * cols);
  const comp = await Promise.all(
    part.map(async (f, i) => {
      const label = Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="170" height="34" fill="#000" opacity="0.6"/><text x="8" y="25" font-size="22" fill="#fff" font-family="Consolas">${f} · ${(f / 30).toFixed(1)}s</text></svg>`);
      const img = await sharp(path.join(out, `v${f}.jpg`)).resize(W, H).composite([{input: label, left: 0, top: 0}]).toBuffer();
      return {input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H};
    }),
  );
  await sharp({create: {width: W * cols, height: H * rows, channels: 3, background: "#fff"}}).composite(comp).jpeg({quality: 82}).toFile(path.join(out, `sheet${p}.jpg`));
  console.log("联系表", path.join(out, `sheet${p}.jpg`));
}
