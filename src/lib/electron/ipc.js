import { BrowserWindow, ipcMain } from "electron";
import { isProgramRunning } from "./running";
import { updateFile } from "./files";

ipcMain.on("isGameRunning", async (event, args) => {
  const isGenshinRunning = await isProgramRunning(`${args}.exe`);

  BrowserWindow.getAllWindows()[0].webContents.send("isGameRunning", {
    [args]: isGenshinRunning,
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
