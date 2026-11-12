// 生成模板自带的通用角色（代码画的豆豆人），输出到 public/img/c/<姿势>.png，并更新 src/charSizes.ts
// 运行：node scripts/make-cast.mjs          重新画全部角色
//      node scripts/make-cast.mjs --sizes  不画，只按 public/img/c 里现有的图（比如换成你自己的角色）更新尺寸表
// 想换颜色 / 配件，改下面的 LOOK
import fs from "fs";
import sharp from "sharp";

const INK = "#2B211C";
const LW = 12; // 墨线粗细
const LOOK = {
  host: {body: "#FFFDF6", cheek: "#FFB9A8", scarf: "#3F6FB5", glasses: true}, // 讲解员
  kid: {body: "#F7C64A", cheek: "#F28C6A", sprout: "#4E8A4A"}, // 小同学 / 新人
  boss: {body: "#CFE3F5", cheek: "#F5A9A0", tie: "#D9362B"}, // 老板
};

const W = 860;
const H = 760;
const CX = 430;

// ---------- 零件 ----------
const line = (d, w = LW, fill = "none") => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x, y, r, fill = INK) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const ring = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${LW}"/>`;
// 手臂：从肩到手画一条粗墨线（底下垫一条身体色的线，看起来是实心胳膊）
const arm = (pts, color) => {
  const path = pts.length === 3 ? `M${pts[0][0]} ${pts[0][1]} Q${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}` : `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`;
  return `<path d="${path}" fill="none" stroke="${INK}" stroke-width="${LW + 22}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round"/>`;
};
const hand = (x, y, color) => ring(x, y, 22, color);

// 身体：豆子形，top 是头顶 y，bw 是半宽
const body = (top, bw, color) => {
  const bot = 690;
  const d = `M${CX - bw} ${bot - 40} C${CX - bw - 12} ${top + 150} ${CX - bw * 0.8} ${top} ${CX} ${top} C${CX + bw * 0.8} ${top} ${CX + bw + 12} ${top + 150} ${CX + bw} ${bot - 40} C${CX + bw - 6} ${bot + 8} ${CX - bw + 6} ${bot + 8} ${CX - bw} ${bot - 40} Z`;
  return `<path d="${d}" fill="${color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
};
const feet = (color) => `<ellipse cx="${CX - 62}" cy="722" rx="52" ry="26" fill="${color}" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="${CX + 62}" cy="722" rx="52" ry="26" fill="${color}" stroke="${INK}" stroke-width="${LW}"/>`;

// 脸：ey 是眼睛高度
const eyes = (ey, kind = "dot", gap = 62) => {
  const L = CX - gap;
  const R = CX + gap;
  if (kind === "dot") return dot(L, ey, 15) + dot(R, ey, 15) + dot(L + 5, ey - 5, 5, "#fff") + dot(R + 5, ey - 5, 5, "#fff");
  if (kind === "happy") return line(`M${L - 18} ${ey + 6} Q${L} ${ey - 16} ${L + 18} ${ey + 6}`) + line(`M${R - 18} ${ey + 6} Q${R} ${ey - 16} ${R + 18} ${ey + 6}`);
  if (kind === "closed") return line(`M${L - 18} ${ey} Q${L} ${ey + 14} ${L + 18} ${ey}`) + line(`M${R - 18} ${ey} Q${R} ${ey + 14} ${R + 18} ${ey}`);
  if (kind === "wink") return line(`M${L - 18} ${ey + 6} Q${L} ${ey - 16} ${L + 18} ${ey + 6}`) + dot(R, ey, 15) + dot(R + 5, ey - 5, 5, "#fff");
  if (kind === "big") return ring(L, ey, 26, "#fff") + ring(R, ey, 26, "#fff") + dot(L, ey + 2, 9) + dot(R, ey + 2, 9);
  if (kind === "up") return dot(L + 6, ey - 8, 15) + dot(R + 6, ey - 8, 15) + dot(L + 10, ey - 13, 5, "#fff") + dot(R + 10, ey - 13, 5, "#fff");
  return "";
};
const brows = (ey, kind, gap = 62) => {
  const L = CX - gap;
  const R = CX + gap;
  if (kind === "up") return line(`M${L - 22} ${ey - 46} Q${L} ${ey - 62} ${L + 22} ${ey - 48}`, 9) + line(`M${R - 22} ${ey - 48} Q${R} ${ey - 62} ${R + 22} ${ey - 46}`, 9);
  if (kind === "sad") return line(`M${L - 22} ${ey - 34} L${L + 20} ${ey - 50}`, 9) + line(`M${R - 20} ${ey - 50} L${R + 22} ${ey - 34}`, 9);
  if (kind === "stern") return line(`M${L - 24} ${ey - 52} L${L + 22} ${ey - 36}`, 10) + line(`M${R - 22} ${ey - 36} L${R + 24} ${ey - 52}`, 10);
  return "";
};
const cheeks = (ey, color, gap = 100) => `<ellipse cx="${CX - gap}" cy="${ey + 44}" rx="26" ry="15" fill="${color}" opacity="0.85"/><ellipse cx="${CX + gap}" cy="${ey + 44}" rx="26" ry="15" fill="${color}" opacity="0.85"/>`;
const mouth = (my, kind) => {
  if (kind === "smile") return line(`M${CX - 34} ${my} Q${CX} ${my + 34} ${CX + 34} ${my}`);
  if (kind === "grin") return `<path d="M${CX - 46} ${my - 6} Q${CX} ${my + 62} ${CX + 46} ${my - 6} Z" fill="#B8423A" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  if (kind === "o") return `<ellipse cx="${CX}" cy="${my + 12}" rx="22" ry="28" fill="#B8423A" stroke="${INK}" stroke-width="${LW}"/>`;
  if (kind === "small-o") return `<ellipse cx="${CX + 6}" cy="${my + 8}" rx="12" ry="14" fill="#B8423A" stroke="${INK}" stroke-width="10"/>`;
  if (kind === "flat") return line(`M${CX - 30} ${my + 8} Q${CX - 10} ${my} ${CX + 6} ${my + 10} Q${CX + 20} ${my + 18} ${CX + 32} ${my + 6}`, 10);
  if (kind === "frown") return line(`M${CX - 32} ${my + 22} Q${CX} ${my - 4} ${CX + 32} ${my + 22}`);
  if (kind === "hmm") return line(`M${CX - 8} ${my + 10} L${CX + 30} ${my + 4}`, 10);
  if (kind === "line") return line(`M${CX - 30} ${my + 10} L${CX + 30} ${my + 10}`, 11);
  return "";
};

// 配件
const glasses = (ey, gap = 62) => `<circle cx="${CX - gap}" cy="${ey}" r="40" fill="none" stroke="${INK}" stroke-width="9"/><circle cx="${CX + gap}" cy="${ey}" r="40" fill="none" stroke="${INK}" stroke-width="9"/>` + line(`M${CX - gap + 40} ${ey - 4} Q${CX} ${ey - 16} ${CX + gap - 40} ${ey - 4}`, 8);
const scarf = (y, color) =>
  `<path d="M${CX - 150} ${y} Q${CX} ${y + 46} ${CX + 150} ${y} L${CX + 146} ${y + 40} Q${CX} ${y + 86} ${CX - 146} ${y + 40} Z" fill="${color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` +
  `<path d="M${CX + 70} ${y + 50} L${CX + 104} ${y + 150} L${CX + 140} ${y + 136} L${CX + 116} ${y + 40} Z" fill="${color}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
const tie = (y, color) => `<path d="M${CX - 22} ${y} L${CX + 22} ${y} L${CX + 12} ${y + 26} L${CX + 34} ${y + 150} L${CX} ${y + 186} L${CX - 34} ${y + 150} L${CX - 12} ${y + 26} Z" fill="${color}" stroke="${INK}" stroke-width="${LW - 2}" stroke-linejoin="round"/>` + line(`M${CX - 70} ${y - 24} L${CX} ${y + 4} L${CX + 70} ${y - 24}`, 10);
const sprout = (top, color) => line(`M${CX} ${top + 4} Q${CX - 4} ${top - 36} ${CX + 6} ${top - 60}`, 10) + `<path d="M${CX + 6} ${top - 56} Q${CX + 60} ${top - 96} ${CX + 92} ${top - 60} Q${CX + 52} ${top - 30} ${CX + 6} ${top - 56} Z" fill="${color}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>` + `<path d="M${CX + 2} ${top - 40} Q${CX - 44} ${top - 76} ${CX - 72} ${top - 44} Q${CX - 38} ${top - 18} ${CX + 2} ${top - 40} Z" fill="${color}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`;
const sweat = (x, y) => `<path d="M${x} ${y - 30} Q${x + 22} ${y} ${x} ${y + 14} Q${x - 22} ${y} ${x} ${y - 30} Z" fill="#CFE3F5" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
const qmark = (x, y) => `<text x="${x}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="150" fill="#F7C64A" stroke="${INK}" stroke-width="10" paint-order="stroke" text-anchor="middle">?</text>`;
const shockLines = (x, y, flip = 1) => [0, 1, 2].map((i) => line(`M${x + flip * i * 6} ${y + i * 44} L${x + flip * (46 + i * 4)} ${y - 24 + i * 40}`, 9)).join("");

// ---------- 姿势 ----------
// 每个姿势：角色 + 画法。手臂肩点大约在 (CX±128, 470)
const SH = 470;
const L0 = CX - 128;
const R0 = CX + 128;
const P = {};
// 讲解员
{
  const c = LOOK.host;
  const top = 160;
  const ey = 320;
  const my = ey + 60;
  const base = (face, front, extra = "", back = "") => back + body(top, 175, c.body) + feet(c.body) + face + (c.glasses ? glasses(ey) : "") + cheeks(ey, c.cheek, 108) + scarf(468, c.scarf) + front + extra;
  P.stick = base(eyes(ey) + mouth(my, "grin"), arm([[L0, SH + 30], [L0 - 40, SH + 120], [L0 - 10, SH + 170]], c.body) + hand(L0 - 10, SH + 170, c.body) + arm([[R0, SH + 20], [R0 + 110, SH - 20], [R0 + 150, SH - 120]], c.body) + line(`M${R0 + 120} ${SH - 70} L${R0 + 230} ${SH - 330}`, 14) + dot(R0 + 232, SH - 334, 14, "#D9362B") + hand(R0 + 150, SH - 120, c.body), brows(ey, "up"));
  P.chin = base(eyes(ey, "up") + mouth(my, "hmm"), arm([[L0, SH + 30], [L0 - 30, SH + 130], [L0 + 10, SH + 180]], c.body) + hand(L0 + 10, SH + 180, c.body) + arm([[R0, SH + 40], [R0 + 30, SH + 120], [CX + 30, my + 64]], c.body) + hand(CX + 30, my + 64, c.body), dot(CX + 200, top + 10, 12) + dot(CX + 236, top - 34, 16) + dot(CX + 280, top - 86, 21));
  P.shrug = base(eyes(ey) + brows(ey, "up") + mouth(my, "flat"), arm([[L0, SH + 30], [L0 - 100, SH + 40], [L0 - 120, SH - 60]], c.body) + hand(L0 - 120, SH - 60, c.body) + arm([[R0, SH + 30], [R0 + 100, SH + 40], [R0 + 120, SH - 60]], c.body) + hand(R0 + 120, SH - 60, c.body));
  P.thumb = base(eyes(ey, "wink") + mouth(my, "grin"), arm([[L0, SH + 30], [L0 - 30, SH + 130], [L0 + 10, SH + 180]], c.body) + hand(L0 + 10, SH + 180, c.body) + arm([[R0, SH + 30], [R0 + 110, SH + 40], [R0 + 140, SH - 30]], c.body) + `<rect x="${R0 + 112}" y="${SH - 64}" width="56" height="62" rx="20" fill="${c.body}" stroke="${INK}" stroke-width="${LW}"/>` + `<rect x="${R0 + 124}" y="${SH - 128}" width="28" height="74" rx="14" fill="${c.body}" stroke="${INK}" stroke-width="${LW}"/>`, `<path d="M${R0 + 210} ${SH - 150} l12 30 32 2 -25 20 9 31 -28 -18 -28 18 9 -31 -25 -20 32 -2 z" fill="#F7C64A" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`);
  P.tea = base(eyes(ey, "closed") + mouth(my, "smile"), arm([[L0, SH + 30], [L0 + 10, SH + 120], [CX - 70, SH + 120]], c.body) + arm([[R0, SH + 30], [R0 - 10, SH + 120], [CX + 70, SH + 120]], c.body) + `<path d="M${CX - 56} ${SH + 60} L${CX + 56} ${SH + 60} L${CX + 44} ${SH + 160} Q${CX} ${SH + 176} ${CX - 44} ${SH + 160} Z" fill="#FFD3C9" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` + line(`M${CX + 54} ${SH + 84} Q${CX + 96} ${SH + 92} ${CX + 50} ${SH + 132}`, 10) + hand(CX - 66, SH + 118, c.body) + hand(CX + 66, SH + 118, c.body), line(`M${CX - 20} ${SH + 40} Q${CX - 40} ${SH + 10} ${CX - 18} ${SH - 16}`, 7) + line(`M${CX + 18} ${SH + 40} Q${CX - 2} ${SH + 10} ${CX + 20} ${SH - 16}`, 7));
}
// 小同学
{
  const c = LOOK.kid;
  const top = 250;
  const ey = 410;
  const my = ey + 52;
  const sh = 520;
  const l0 = CX - 128;
  const r0 = CX + 128;
  const base = (face, front, extra = "") => body(top, 168, c.body) + feet(c.body) + sprout(top, c.sprout) + face + cheeks(ey, c.cheek, 100) + front + extra;
  const down = (side) => (side < 0 ? arm([[l0, sh + 20], [l0 - 40, sh + 100], [l0 - 20, sh + 150]], c.body) + hand(l0 - 20, sh + 150, c.body) : arm([[r0, sh + 20], [r0 + 40, sh + 100], [r0 + 20, sh + 150]], c.body) + hand(r0 + 20, sh + 150, c.body));
  P.kid = base(eyes(ey, "happy") + mouth(my, "grin"), arm([[l0, sh + 10], [l0 - 90, sh - 10], [l0 - 120, sh - 110]], c.body) + hand(l0 - 120, sh - 110, c.body) + arm([[r0, sh + 10], [r0 + 90, sh - 10], [r0 + 120, sh - 110]], c.body) + hand(r0 + 120, sh - 110, c.body));
  P.q = base(eyes(ey) + mouth(my, "small-o"), down(-1) + arm([[r0, sh + 10], [r0 + 70, sh - 40], [CX + 140, top + 30]], c.body) + hand(CX + 140, top + 30, c.body), qmark(CX - 190, top + 20));
  P.shock = base(eyes(ey, "big") + mouth(my, "o"), arm([[l0, sh + 10], [l0 - 110, sh - 30], [l0 - 130, sh - 140]], c.body) + hand(l0 - 130, sh - 140, c.body) + arm([[r0, sh + 10], [r0 + 110, sh - 30], [r0 + 130, sh - 140]], c.body) + hand(r0 + 130, sh - 140, c.body), sweat(CX + 150, top + 70) + shockLines(CX - 250, top - 10, -1) + shockLines(CX + 250, top - 10, 1));
  P.sad = base(eyes(ey, "closed") + brows(ey, "sad") + mouth(my, "frown"), down(-1) + down(1), `<path d="M${CX - 66} ${ey + 22} Q${CX - 54} ${ey + 50} ${CX - 66} ${ey + 62} Q${CX - 78} ${ey + 50} ${CX - 66} ${ey + 22} Z" fill="#CFE3F5" stroke="${INK}" stroke-width="7"/>` + line(`M${CX - 160} ${top - 20} Q${CX - 120} ${top - 70} ${CX - 80} ${top - 20} Q${CX - 40} ${top - 70} ${CX} ${top - 20}`, 8));
  P.hand = base(eyes(ey, "happy") + mouth(my, "smile"), down(-1) + arm([[r0, sh + 10], [r0 + 40, sh - 120], [r0 + 30, sh - 260]], c.body) + hand(r0 + 30, sh - 260, c.body));
}
// 老板
{
  const c = LOOK.boss;
  const top = 150;
  const ey = 310;
  const my = ey + 64;
  const front = arm([[L0, SH + 30], [L0 + 30, SH + 120], [CX + 60, SH + 110]], c.body) + arm([[R0, SH + 30], [R0 - 30, SH + 120], [CX - 60, SH + 100]], c.body) + hand(CX + 60, SH + 110, c.body) + hand(CX - 60, SH + 100, c.body);
  P.boss = body(top, 182, c.body) + feet(c.body) + eyes(ey) + brows(ey, "stern") + mouth(my, "line") + cheeks(ey, c.cheek, 110) + tie(450, c.tie) + front;
}

// ---------- 输出 ----------
const DIR = "public/img/c";
fs.mkdirSync(DIR, {recursive: true});
if (!process.argv.includes("--sizes")) {
  for (const [name, inner] of Object.entries(P)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 120}" viewBox="0 -120 ${W} ${H + 120}">${inner}</svg>`;
    // 只裁左右空白，上下保持同一画布高度：同一个角色换姿势时大小不跳
    const full = await sharp(Buffer.from(svg)).png().toBuffer();
    const {info} = await sharp(full).trim({threshold: 1}).toBuffer({resolveWithObject: true});
    const left = Math.max(0, -(info.trimOffsetLeft ?? 0) - 6);
    const width = Math.min(W - left, info.width + 12);
    await sharp(full).extract({left, top: 0, width, height: H + 120}).resize({height: 760}).png().toFile(`${DIR}/${name}.png`);
  }
  console.log("画好", Object.keys(P).length, "个姿势 →", DIR);
}
const sizes = {};
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const m = await sharp(`${DIR}/${f}`).metadata();
  sizes[f.replace(/\.png$/, "")] = [m.width, m.height];
}
fs.writeFileSync("src/charSizes.ts", `export const CH: Record<string, [number, number]> = ${JSON.stringify(sizes)};\n`);
console.log("尺寸表 → src/charSizes.ts");
