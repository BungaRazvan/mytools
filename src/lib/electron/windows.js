import path from "path";

import { isDevelopment } from "../vue/constants";

export const iconPath = isDevelopment
  ? "./public/img/icon310x310.ico"
  : path.join(process.resourcesPath, "img", "icon310x310.ico");

export const BASE_WINDOW = {
  frame: false,
  icon: iconPath,

  webPreferences: {
    // Use pluginOptions.nodeIntegration, leave this alone
    // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
    nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    preload: path.join(__dirname, "preload.js"),
    devTools: isDevelopment,
  },
};

export const SETTINGS_WINDOW = {
  ...BASE_WINDOW,
  height: 500,
  width: 500,
};
