import { BrowserWindow, ipcMain } from "electron";
import { map, groupBy, sumBy } from "lodash";

import { isProgramRunning } from "./running";
import { updateFile, readCSVFile, readFolder, readJsonFile } from "./files";
import electronStore from "./store";

const sendToMain = (name, data) => {
  BrowserWindow.getAllWindows()[0].webContents.send(name, data);
};

// send
ipcMain.on("logRunningGame", (event, args) => {
  const { app, time } = args;

  updateFile("runningTime.csv", {
    app,
    time,
    timestamp: new Date().toISOString(),
  });
});

ipcMain.on("setSetting", (event, args) => {
  const { setting, data } = args;

  electronStore.set(setting, data);
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
