import { ipcMain } from "electron";
import { BrowserWindow } from "electron";
import { isProgramRunning } from "./running";

ipcMain.on("toMain", async (event, args) => {
  const isGenshinRunning = await isProgramRunning("GenshinImpact.exe");

  BrowserWindow.getAllWindows()[0].webContents.send(
    "fromMain",
    isGenshinRunning
  );
});
