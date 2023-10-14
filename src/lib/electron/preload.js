import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = ["logRunningGame", "setSetting"];

    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: async (channel, data) => {
    // whitelist channels
    const validChannels = [
      "getSetting",
      "isGameRunning",
      "getGamesData",
      "readFolder",
      "readJsonFile",
    ];

    if (validChannels.includes(channel)) {
      const result = await ipcRenderer.invoke(channel, data);
      return result;
    }
  },
});
