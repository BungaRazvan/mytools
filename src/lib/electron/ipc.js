import path from "path";

import { BrowserWindow, ipcMain, shell, app } from "electron";
import { map, groupBy, sumBy } from "lodash";
import { spawn } from "child_process";
import { autoUpdater } from "electron-updater";

import { isDevelopment, downloadingState } from "@/lib/vue/constants";
import { startRailItemName } from "@/lib/vue/items";

import {
  writeCSVFile,
  writeJsonFile,
  readCSVFile,
  readFolder,
  readJsonFile,
} from "./files";
import { isProgramRunning, checkForTesseract } from "./running";
import electronStore from "./store";

const sendToMain = (name, data) => {
  BrowserWindow.getAllWindows()[0].webContents.send(name, data);
};

let childProcess = null;

// send
ipcMain.on("logRunningGame", (event, args) => {
  const { app, time } = args;

  writeCSVFile("runningTime.csv", {
    app,
    time,
    timestamp: new Date().toISOString(),
  });
});

ipcMain.on("saveItems", (event, args) => {
  const { items, time } = args;
  const correctItems = {};

  for (const item in items) {
    correctItems[startRailItemName(item)] = items[item];
  }

  writeJsonFile("gameResourceTracking.json", {
    game: "StarRail",
    time: time,
    items: correctItems,
    date: new Date().toISOString(),
  });
});

ipcMain.on("writeJsonFile", (event, args) => {
  const { fileName, data, folderPath, overwrite } = args;
  writeJsonFile(fileName, data, folderPath, overwrite);
});

ipcMain.on("setSetting", (event, args) => {
  const { setting, data } = args;

  electronStore.set(setting, data);
});

ipcMain.on("electronAction", (event, args) => {
  const { action } = args;

  const focusedWindow = BrowserWindow.getFocusedWindow();

  switch (action) {
    case "close":
      if (focusedWindow.isMaximized()) {
        electronStore.set("wasMaximized", true);
      }

      focusedWindow.destroy();
      break;

    case "minimize":
      if (focusedWindow.isMaximized()) {
        electronStore.set("wasMaximized", true);
      }

      focusedWindow.minimize();
      break;

    case "maximize":
      if (focusedWindow.isMaximized()) {
        electronStore.set("wasMaximized", false);

        focusedWindow.unmaximize();
        break;
      }

      focusedWindow.maximize();
      break;

    default:
      break;
  }
});

ipcMain.on("startPython", (event, args) => {
  const { script } = args;

  const scriptPath = isDevelopment
    ? path.join(__dirname, "..", `src/lib/python/scripts/${script}.py`)
    : path.join(process.resourcesPath, "scripts", `${script}`, `${script}.exe`);

  if (isDevelopment) {
    childProcess = spawn("python", [scriptPath]);
  } else {
    childProcess = spawn(scriptPath);
  }

  // Handle data and responses from the Python script
  childProcess.stdout.on("data", (data) => {
    const dataString = data.toString();
    event.sender.send(`python_${script}`, dataString);
  });

  childProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
    childProcess.kill();
  });
});

ipcMain.on("stopPython", (event, args) => {
  if (childProcess) {
    childProcess.kill();
  }
});

ipcMain.on("openBrowser", (event, args) => {
  const { url } = args;

  event.preventDefault();

  if (!url) {
    return;
  }

  shell.openExternal(url);
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
ipcMain.handle("isGameRunning", async (event, args) => {
  const isGameRunning = await isProgramRunning(`${args}.exe`);

  return { [args]: isGameRunning };
});

ipcMain.handle("getSetting", (event, arg) => {
  return electronStore.get(arg);
});

ipcMain.handle("getGamesData", (event, args) => {
  const data = readCSVFile("runningTime.csv", ["app", "time", "date"]) || [];

  const transformedData = map(groupBy(data, "app"), (group) => {
    const total = sumBy(group, (item) => parseInt(item.time));

    return {
      app: group[0].app,
      time: total,
      played: new Date(group[group.length - 1].date),
    };
  });

  return transformedData;
});

ipcMain.handle("readFolder", (event, args) => {
  const { folderPath } = args;
  return readFolder(folderPath);
});

ipcMain.handle("readJsonFile", (event, args) => {
  const { folderPath, fileName } = args;
  return readJsonFile(fileName, folderPath);
});

ipcMain.handle("checkForTesseract", (event, args) => {
  return checkForTesseract();
});

ipcMain.handle("appVersion", (event, args) => {
  return app.getVersion();
});
