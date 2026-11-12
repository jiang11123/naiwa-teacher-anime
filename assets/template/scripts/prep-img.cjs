// 素材整理：把用户给的截图 / GIF / 录屏放进工程，并登记尺寸
// 用法：node scripts/prep-img.cjs <素材文件夹>
//   - png/jpg/webp → public/img/s/<文件名>.png（文件名就是组件里用的 id，按台词起名，例如 “价格表”）
//   - gif → public/frames/<文件名>/01.png、02.png ...（逐帧，gif.tsx 的 Gif 组件按帧号播放）
//   - mp4/mov → public/rec/<文件名>.mp4（30fps、去声音）
// 生成 src/shotSizes.ts（每张图的宽高）和 src/frameCounts.ts（GIF 帧数、每帧毫秒）
// 截图里的隐私（API Key、邮箱、手机号、别人的头像昵称）必须先打码：node scripts/blur.cjs <图> x,y,w,h
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error("用法：node scripts/prep-img.cjs <素材文件夹>");
  process.exit(1);
}
const FF = process.env.FFMPEG || "ffmpeg";
for (const d of ["public/img/s", "public/frames", "public/rec"]) fs.mkdirSync(d, {recursive: true});
const sizesFile = "src/shotSizes.ts";
const framesFile = "src/frameCounts.ts";
const readRec = (file) => {
  if (!fs.existsSync(file)) return {};
  const m = fs.readFileSync(file, "utf8").match(/= (\{.*\});/);
  return m ? JSON.parse(m[1]) : {};
};
const SIZES = readRec(sizesFile);
const FRAMES = readRec(framesFile);

(async () => {
  for (const f of fs.readdirSync(dir)) {
    const ext = path.extname(f).toLowerCase();
    const id = path.basename(f, path.extname(f));
    const src = path.join(dir, f);
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      const out = `public/img/s/${id}.png`;
      const img = sharp(src).trim({threshold: 8}); // 裁掉四周纯色空白（截图别带一大片白底）
      await img.png().toFile(out);
      const m = await sharp(out).metadata();
      SIZES[id] = [m.width, m.height];
      console.log("截图", id, m.width, "×", m.height);
    } else if (ext === ".gif") {
      const meta = await sharp(src, {animated: true}).metadata();
      const n = meta.pages || 1;
      const h = meta.pageHeight || meta.height;
      fs.mkdirSync(`public/frames/${id}`, {recursive: true});
      for (let i = 0; i < n; i++) await sharp(src, {page: i}).png().toFile(`public/frames/${id}/${String(i + 1).padStart(2, "0")}.png`);
      const ms = Array.isArray(meta.delay) && meta.delay.length ? Math.round(meta.delay.reduce((a, b) => a + b, 0) / meta.delay.length) : 100;
      FRAMES[id] = {n, ms, w: meta.width, h};
      SIZES[id] = [meta.width, h];
      console.log("GIF", id, n, "帧", ms, "ms/帧");
    } else if ([".mp4", ".mov", ".webm", ".mkv"].includes(ext)) {
      const r = spawnSync(FF, ["-v", "error", "-y", "-i", src, "-an", "-vf", "fps=30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", `public/rec/${id}.mp4`]);
      if (r.status !== 0) console.error("录屏转码失败（设置 FFMPEG 环境变量指向 ffmpeg）", id);
      else console.log("录屏", id);
    }
  }
  fs.writeFileSync(sizesFile, `// 自动生成（node scripts/prep-img.cjs <素材文件夹>）：public/img/s 里每张截图的尺寸，截图窗口 Shot / Pic 按它算比例\nexport const SIZES: Record<string, [number, number]> = ${JSON.stringify(SIZES)};\n`);
  fs.writeFileSync(framesFile, `// 自动生成（node scripts/prep-img.cjs <素材文件夹>）：GIF 拆帧后的帧数、每帧毫秒、尺寸（gif.tsx 的 Gif 组件用）\nexport const FRAMES: Record<string, {n: number; ms: number; w: number; h: number}> = ${JSON.stringify(FRAMES)};\n`);
})();
