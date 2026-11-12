// 截图打码：把图上若干矩形区域打成墨色块（不用模糊，模糊能被还原），原图备份成 <名字>.orig.png
// 用法：node scripts/blur.cjs public/img/s/设置页.png 120,340,560,48 900,40,200,60
//   每个区域 = x,y,宽,高（按原图像素）；打完裁一小块放大看一眼，确认真的盖住了
// 要打码的：API Key、邮箱、手机号、账号 ID、域名里的私人部分、别人的头像和昵称；发现真实 Key 要提醒用户去平台作废重建
const sharp = require("sharp");
const fs = require("fs");

const [file, ...boxes] = process.argv.slice(2);
if (!file || !boxes.length) {
  console.error("用法：node scripts/blur.cjs <图片> x,y,w,h [x,y,w,h ...]");
  process.exit(1);
}
(async () => {
  const bak = file.replace(/\.png$/, ".orig.png");
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
  const rects = boxes.map((b) => b.split(",").map(Number));
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`);
  const meta = await sharp(bak).metadata();
  const over = rects.map(([x, y, w, h]) => ({input: {create: {width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)), channels: 4, background: "#2B211C"}}, left: Math.round(x), top: Math.round(y)}));
  await sharp(bak).composite(over).png().toFile(file + ".tmp.png");
  fs.renameSync(file + ".tmp.png", file);
  void svg;
  console.log("已打码", rects.length, "处", file, `${meta.width}×${meta.height}`);
})();
