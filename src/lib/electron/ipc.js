import path from "path";

import { BrowserWindow, ipcMain, shell, app, safeStorage } from "electron";
import { map, groupBy, sumBy, isArray } from "lodash";

import { autoUpdater } from "electron-updater";

import { isDevelopment, downloadingState } from "@/lib/vue/constants";

import { registerExternalHandlers } from "./handlers/external";

import {
  writeCSVFile,
  writeJsonFile,
  readCSVFile,
  readFolder,
  readJsonFile,
} from "./files";
import { isProgramRunning, checkForTesseract } from "./running";
import electronStore, { getDecryptedKey } from "./store";
import { registerFileHandlers } from "./handlers/files";
import { registerWindowHandlers } from "./handlers/window";

export function setupIpcHandlers() {
  ipcMain.on("logRunningGame", (event, args) => {
    const { app, time } = args;

    if (!time) {
      return;
    }

    writeCSVFile("runningTime.csv", {
      app,
      time,
      timestamp: new Date().toISOString(),
    });
  });

  // ipcMain.on("saveItems", (event, args) => {
  //   const { items, time } = args;

  //   writeJsonFile("gameResourceTracking.json", {
  //     game: "StarRail",
  //     time: time,
  //     items: items,
  //     date: new Date().toISOString(),
  //   });
  // });

  ipcMain.on("setSetting", (event, args) => {
    const { setting, data, isSecure } = args;

    if (isSecure && safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(data);
      electronStore.set(setting, encrypted.toString("hex"));
      return;
    }

    electronStore.set(setting, data);
  });

  ipcMain.on("checkForUpdate", (event, args) => {
    const channel = "checkForUpdate";

    autoUpdater.checkForUpdates();

    autoUpdater.on("update-available", () => {
      event.reply(channel, downloadingState.DOWNLOADING);
    });

    autoUpdater.on("update-downloaded", () => {
      autoUpdater.quitAndInstall(true, true);
    });

    autoUpdater.on("update-not-available", () => {
      event.reply("checkForUpdate", downloadingState.NOT_AVAIL);
    });
  });

  // receive
  ipcMain.handle("getSetting", (event, args) => {
    if (typeof args == "string") {
      return electronStore.get(args);
    } else if (Array.isArray(args)) {
      const settings = {};

      args.map((key) => {
        if (typeof key == "string") {
          settings[key] = electronStore.get(key);
        } else if (key && key.isSecure) {
          const value = getDecryptedKey(key.name);
          settings[key.name] = value;
        }
      });

      return settings;
    }

    return null;
  });

  ipcMain.handle("isGameRunning", async (event, args) => {
    const isGameRunning = await isProgramRunning(`${args}.exe`);

    return { [args]: isGameRunning };
  });

  ipcMain.handle("getGamesData", (event, args) => {
    const data = readCSVFile("runningTime.csv", ["app", "time", "date"]) || [];

    const transformedData = map(groupBy(data, "app"), (group) => {
      const total = sumBy(group, (item) => parseInt(item.time));
      const lastGroup = group[group.length - 1];

      return {
        app: group[0].app,
        time: total,
        played: new Date(lastGroup.date),
        lastSession: parseInt(lastGroup.time),
      };
    });

    return transformedData;
  });

  ipcMain.handle("checkForTesseract", (event, args) => {
    return checkForTesseract();
  });

  ipcMain.handle("appVersion", (event, args) => {
    return app.getVersion();
  });

  registerExternalHandlers();
  registerFileHandlers();
  registerWindowHandlers();
}
