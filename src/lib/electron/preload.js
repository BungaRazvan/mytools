import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = [
      "logRunningGame",
      "setSetting",
      "startPython",
      "stopPython",
      "saveItems",
      "openBrowser",
      "writeJsonFile",
      "electronAction",
      "checkForUpdate",
    ];

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
      "checkForTesseract",
      "appVersion",
      "api",
    ];

    if (validChannels.includes(channel)) {
      const result = await ipcRenderer.invoke(channel, data);
      return result;
    }
  },
  on: (channel, callback) => {
    // whitelist channels
    const validChannels = ["python_star_rail_items", "checkForUpdate"];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => {
        // Pass the received data to the callback function
        callback(data);
      });
    }
  },
});

contextBridge.exposeInMainWorld("env", {
  isDevelopment: process.env.NODE_ENV !== "production",
});
