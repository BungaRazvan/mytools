import path from "path";

import { BrowserWindow, ipcMain, shell } from "electron";
import { map, groupBy, sumBy } from "lodash";
import { spawn } from "child_process";

import { isProgramRunning, checkForTesseract } from "./running";
import {
  writeCSVFile,
  writeJsonFile,
  readCSVFile,
  readFolder,
  readJsonFile,
} from "./files";
import electronStore from "./store";

import { isDevelopment } from "@/background";

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

  writeJsonFile("gameTracking.json", {
    game: "StarRail",
    time: time,
    items: items,
    date: new Date().toISOString(),
  });
});

ipcMain.on("setSetting", (event, args) => {
  const { setting, data } = args;

  electronStore.set(setting, data);
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

  console.log(url);

  if (!url) {
    return;
  }

  shell.openExternal(url);
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
