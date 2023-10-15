"use strict";

import path from "path";

import AutoLaunch from "auto-launch";

import { app, protocol, BrowserWindow, Tray, Menu, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension from "electron-devtools-installer";
import { autoUpdater } from "electron-updater";
import electronStore from "./lib/electron/store";

import "./lib/electron/ipc";

export const isDevelopment = process.env.NODE_ENV !== "production";
const iconPath = isDevelopment
  ? "./public/img/icon310x310.ico"
  : path.join(__dirname.replace("app.asar", ""), "img", "icon310x310.ico");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let mainWindow;
let tray = null;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

    if (!process.env.IS_TEST) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    autoUpdater.checkForUpdatesAndNotify();
    createProtocol("app");
    // Load the index.html when not in development
    mainWindow.loadURL("app://./index.html");
  }
}

function createTray() {
  tray = new Tray(iconPath);

  tray.on("double-click", () => {
    mainWindow.show();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open MyTools",
      click: () => {
        mainWindow.restore();
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
    mainWindow.show();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension({
        id: "ljjemllljcmogpfapbkkighbhhppjdbg",
        electron: ">=1.2.1",
      });
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  createWindow();
  createTray();

  // all this is needed for the initial app opening
  mainWindow.once("ready-to-show", () => {
    const mainWindowBounds = electronStore.get("mainWindowBounds");

    if (mainWindowBounds) {
      const currentDisplay = screen.getDisplayMatching(mainWindow.getBounds());
      const scaleFactorX = currentDisplay.scaleFactor;
      const scaleFactorY = currentDisplay.scaleFactor;
      const bounds = {
        x: mainWindowBounds.x * scaleFactorX,
        y: mainWindowBounds.y * scaleFactorY,
        width: mainWindowBounds.width * scaleFactorX,
        height: mainWindowBounds.height * scaleFactorY,
      };

      mainWindow.setBounds(bounds);
    }
  });

  // this is in the even of moving the window, clicking X and then brinkging it back
  // no idea why ready-to-show needs to be scaled and this doesn't
  mainWindow.on("show", () => {
    const mainWindowBounds = electronStore.get("mainWindowBounds");
    mainWindow.setBounds(mainWindowBounds);
  });

  // Hide the window instead of closing it when the user clicks the close button
  mainWindow.on("close", (event) => {
    if (app.isQuiting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      // Save window position and size to store when the window
      const bounds = mainWindow.getBounds();
      electronStore.set("mainWindowBounds", bounds);

      mainWindow.hide();
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
