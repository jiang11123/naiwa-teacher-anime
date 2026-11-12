// 画面模式（一期选一种，见 references/modes.md）：
//   board3d  3D 展板空间：波点走廊里一块块展板，镜头在展板之间推进 / 平移 / 转身飞（默认，最通用）
//   flat2d   2D 平面：一整张纸铺满，每个分镜在纸上推拉镜头，大段落之间用全屏转场
//   room3d   3D 实景：一个场景（办公室、街道……）贯穿全片，镜头在里面一路走、推近、俯视、最后拉远
export type Mode = "board3d" | "flat2d" | "room3d";
export const MODE: Mode = "board3d";
