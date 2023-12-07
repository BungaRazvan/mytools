"use strict";

import path from "path";
import AutoLaunch from "auto-launch";
import installExtension from "electron-devtools-installer";

import {
  app,
  protocol,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { autoUpdater } from "electron-updater";

import { BASE_WINDOW, SETTINGS_WINDOW, iconPath } from "./lib/electron/windows";
import { isDevelopment } from "./lib/vue/constants";
import { calculateCenterBounds } from "./lib/electron/utils";

import electronStore from "./lib/electron/store";

import "./lib/electron/ipc";

const testUpdate = false;

let appName = app.getName();

if (isDevelopment) {
  appName += "dev";
}

app.setAppUserModelId(appName);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let mainWindow = null;
let tray = null;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...BASE_WINDOW,
    width: 1800,
    height: 1600,
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

    if (!process.env.IS_TEST) {
      mainWindow.webContents.openDevTools();
    }
  } else {
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

// Create a function to focus the existing instance (if any)
function focusMainWindow() {
  if (mainWindow.isMinimized()) {
    mainWindow.show();
  }

  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }

  mainWindow.focus();
}

if (isDevelopment && testUpdate) {
  autoUpdater.updateConfigPath = path.join(
    __dirname,
    "..",
    "src",
    "tests",
    "dev-app-update.yml"
  );

  autoUpdater.forceDevUpdateConfig = isDevelopment;
}

autoUpdater.checkForUpdates();

autoUpdater.on("download-progress", (progressObj) => {
  const normalizedProgress = progressObj.transferred / progressObj.total;

  mainWindow.setProgressBar(normalizedProgress);
});

autoUpdater.on("update-downloaded", (info) => {
  const updateNotification = new Notification({
    icon: iconPath,
    title: "A new update is ready to install.",
    body: `${apfpName} version ${info.version} has been downloaded and will be automatically installed on exit.
    `,
  });

  updateNotification.show();

  updateNotification.on("click", () => {
    autoUpdater.quitAndInstall({ isSilent: true, isForceRunAfter: true });
  });
});

// Ensure only one instance of the app is running
const lock = app.requestSingleInstanceLock();

// Quit when all windows are closed.
// app.on("window-all-closed", (event) => {
//   event.preventDefault();
//   // On macOS it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

app.on("second-instance", (event, argv, cwd) => {
  focusMainWindow();
});

if (!lock && !isDevelopment) {
  app.quit();
}

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on("before-quit", () => {
  if (lock) {
    app.releaseSingleInstanceLock();
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
      mainWindow.setBounds(mainWindowBounds);
    }
  });

  // this is in the even of moving the window, clicking X and then brinkging it back
  // no idea why ready-to-show needs to be scaled and this doesn't
  mainWindow.on("show", () => {
    const mainWindowBounds = electronStore.get("mainWindowBounds");
    const wasMaximized = electronStore.get("wasMaximized");

    if (wasMaximized) {
      mainWindow.maximize();
      electronStore.set("wasMaximazed", false);
    }

    mainWindow.setBounds(mainWindowBounds);
  });

  mainWindow.on("unmaximize", () => {
    const mainWindowBounds = electronStore.get("mainWindowBounds");

    mainWindow.setBounds(mainWindowBounds);
  });

  mainWindow.on("minimize", () => {
    electronStore.set("mainWindowBounds", mainWindow.getBounds());
  });

  mainWindow.on("moved", () => {
    electronStore.set("mainWindowBounds", mainWindow.getBounds());
  });

  mainWindow.on("resized", () => {
    if (mainWindow.isMaximized() || mainWindow.isMinimized()) {
      return;
    }

    electronStore.set("mainWindowBounds", mainWindow.getBounds());
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("settings")) {
      const bounds = calculateCenterBounds(
        SETTINGS_WINDOW.height,
        SETTINGS_WINDOW.width,
        mainWindow
      );

      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          ...bounds,
          ...SETTINGS_WINDOW,
        },
      };
    }

    return { action: "deny" };
  });

  // Hide the window instead of closing it when the user clicks the close button
  mainWindow.on("close", (event) => {
    if (app.isQuiting) {
      mainWindow = null;
    } else {
      event.preventDefault();

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
