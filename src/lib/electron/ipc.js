import { BrowserWindow, ipcMain } from "electron";
import { map, groupBy, sumBy } from "lodash";

import { isProgramRunning } from "./running";
import { updateFile, readJsonFile, readCSVFile } from "./files";

const sendToMain = (name, data) => {
  BrowserWindow.getAllWindows()[0].webContents.send(name, data);
};

ipcMain.on("isGameRunning", async (event, args) => {
  const isGameRunning = await isProgramRunning(`${args}.exe`);

  sendToMain("isGameRunning", {
    [args]: isGameRunning,
  });
});

ipcMain.on("logRunningGame", (event, args) => {
  const { app, time } = args;

  updateFile("runningTime.csv", {
    app,
    time,
    timestamp: new Date().toISOString(),
  });
});

ipcMain.on("getSettingsFile", (event, args) => {
  let data = readJsonFile("settings.json");

  if (data == false) {
    data = { gamesToCheck: [] };
    updateFile("settings.json", data);
  }

  sendToMain("getSettingsFile", data);
});

ipcMain.on("getGamesDataCSV", (event, args) => {
  const name = "getGamesDataCSV";
  const data = readCSVFile("runningTime.csv", ["app", "time", "date"]);

  if (!data) {
    sendToMain(name, []);
    return;
  }

  const transformedData = map(groupBy(data, "app"), (group) => {
    const total = sumBy(group, (item) => parseInt(item.time));

    return {
      app: group[0].app,
      time: Math.floor(total / 3600),
      played: new Date(group[group.length - 1].date),
    };
  });

  sendToMain(name, transformedData);
});
