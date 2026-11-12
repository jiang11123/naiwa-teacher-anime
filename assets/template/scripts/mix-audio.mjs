// 导出用：Remotion 带音轨渲染会崩（write EOF），所以画面用 --muted 渲染，声音由这个脚本混好再合并
// 音效时间是按配音自动算的（src/Sfx.tsx 里 T(...)），所以先用 esbuild 把音效表编译出来再读
// 运行：node scripts/mix-audio.mjs <无声画面.mp4> <输出.mp4>
import fs from "fs";
import path from "path";
import {execFileSync} from "child_process";
import {pathToFileURL} from "url";
import {build} from "esbuild";
import {duration, ff, requireFFmpeg} from "./ff.mjs";

const [video, output] = process.argv.slice(2);
const FPS = 30;
requireFFmpeg("混音");

// 1. 编译音效表（cues + 转场音效）
fs.writeFileSync("scripts/.cues-entry.ts", `import {cues} from "../src/Sfx";
export const BGM_ON = false;
export const bgmVolume = (f: number) => 0 * f;
export const all = cues.map(([f, file, v]) => [f, file, v]);
`);
await build({entryPoints: ["scripts/.cues-entry.ts"], bundle: true, platform: "node", format: "esm", outfile: "scripts/.cues.mjs", loader: {".tsx": "tsx"}, jsx: "automatic", logLevel: "error"});
const {all, BGM_ON, bgmVolume} = await import(pathToFileURL(path.resolve("scripts/.cues.mjs")).href);
console.log(all.length, "个音效");

// 1.5 背景音乐：按 src/bgmVolume.ts 的每帧音量（说话压低、空档抬起）算好，写成一条处理过的音轨（和 Studio 预览一致）；BGM_ON = false 时不放
if (BGM_ON) {
  const raw = Buffer.from(ff(["-hide_banner", "-loglevel", "error", "-i", "public/bgm.wav", "-f", "s16le", "-ac", "2", "-ar", "48000", "-"], {encoding: "buffer"}).stdout);
  const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
  const per = 48000 / FPS;
  const gv = Array.from({length: Math.ceil(pcm.length / 2 / per) + 2}, (_, f) => bgmVolume(f)); // 先按帧算好，避免每个采样都去查
  for (let i = 0; i < pcm.length / 2; i++) {
    const fr = i / per;
    const f0 = Math.floor(fr);
    const g = gv[f0] + (gv[f0 + 1] - gv[f0]) * (fr - f0);
    pcm[2 * i] = Math.round(pcm[2 * i] * g);
    pcm[2 * i + 1] = Math.round(pcm[2 * i + 1] * g);
  }
  fs.writeFileSync("scripts/.bgm.raw", Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength));
}

// 2. 配音 + 音效 + 背景音乐按时间混成一条音轨，长度以画面为准
const dur = duration(video);
const VOICE = fs.existsSync("public/voice.mp3");
const voiceIn = VOICE ? ["-i", "public/voice.mp3"] : ["-f", "lavfi", "-t", String(dur), "-i", "anullsrc=r=48000:cl=stereo"]; // 还没配音时用静音占位
const inputs = BGM_ON ? [...voiceIn, "-f", "s16le", "-ac", "2", "-ar", "48000", "-i", "scripts/.bgm.raw"] : [...voiceIn];
const OFF = BGM_ON ? 2 : 1; // 音效从第几路输入开始
const filters = [];
all.forEach(([f, file, v], i) => {
  inputs.push("-i", `public/sfx/${file}.wav`);
  filters.push(`[${i + OFF}:a]aresample=48000,adelay=${Math.max(0, Math.round((f / FPS) * 1000))}:all=1,volume=${v}[s${i}]`);
});
filters.push(`[0:a]aresample=48000,apad=whole_dur=${dur}[v]`);
filters.push(BGM_ON ? `[1:a]anull[bgm]` : `anullsrc=r=48000:cl=stereo,atrim=duration=0.01[bgm]`);
filters.push(`[v][bgm]${all.map((_, i) => `[s${i}]`).join("")}amix=inputs=${all.length + 2}:normalize=0:duration=first,aformat=channel_layouts=stereo[out]`);
// 滤镜图直接内联传：ffmpeg 9 已经删掉 -filter_complex_script，写文件反而会报 Unrecognized option
const graph = filters.join(";\n");
fs.writeFileSync("scripts/mix.filter", graph); // 留一份方便排查
ff(["-y", "-hide_banner", "-loglevel", "error", ...inputs, "-filter_complex", graph, "-map", "[out]", "-c:a", "pcm_s16le", "scripts/mix.wav"]);
ff(["-y", "-hide_banner", "-loglevel", "error", "-i", video, "-i", "scripts/mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(dur), output]);
console.log("ok", output);
