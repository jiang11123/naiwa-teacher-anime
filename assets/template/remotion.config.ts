/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// 导出颜色：统一用标准 BT.709 + 有限范围（tv），否则会导出成 yuvj420p 全范围且没有色彩标记，播放器显示发白、过曝
Config.setColorSpace("bt709");
Config.setPixelFormat("yuv420p");
