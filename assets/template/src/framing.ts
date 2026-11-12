// 每块展板的取景：[缩放, 横移, 纵移]。默认缩到 0.84，让整块展板的内容约占画面 2/3、四周不出画；个别展板在 OVERRIDE 里按展板 id（名字前三位）单独调
const OVERRIDE: Record<string, [number, number, number]> = {};
const DEFAULT: [number, number, number] = [0.84, 0, 24];
export const FRAMING: Record<string, [number, number, number]> = new Proxy(OVERRIDE, {get: (t, k) => t[k as string] ?? DEFAULT});
