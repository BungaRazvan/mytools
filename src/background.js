"use strict";

import path from "path";

import { app, protocol, BrowserWindow, Tray, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import AutoLaunch from "auto-launch";

import "./lib/electron/ipc";

const isDevelopment = process.env.NODE_ENV !== "production";
const iconPath = isDevelopment
  ? "./public/img/icon310x310.ico"
  : path.join(__dirname.replace("app.asar", ""), "img", "icon310x310.ico");

let tray = null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    icon: iconPath,
    width: 1800,
    height: 1600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

function createTray() {
  tray = new Tray(iconPath);

  tray.on("double-click", () => {
    win.show();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open MyTools",
      click: () => {
        win.restore();
      },
    },
    {
      label: "Close",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("MyTools");
  tray.setContextMenu(contextMenu);
}

// Quit when all windows are closed.
// app.on("window-all-closed", (event) => {
//   event.preventDefault();
//   // On macOS it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    win.show();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
  createTray();

  // Hide the window instead of closing it when the user clicks the close button
  win.on("close", (event) => {
    if (app.isQuiting) {
      win = null;
    } else {
      event.preventDefault();
      win.hide();
    }
  });

  // Set the app to start on login
  const appLauncher = new AutoLaunch({
    name: app.getName(),
    path: app.getPath("exe"),
  });
  appLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled && !isDevelopment) {
      appLauncher.enable();
    }
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
