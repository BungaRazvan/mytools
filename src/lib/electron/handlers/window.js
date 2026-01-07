import * as windowConfigs from "../windows";
import { calculateCenterBounds } from "../utils";
import { BrowserWindow, ipcMain } from "electron";
import { isDevelopment } from "@/lib/vue/constants";
import electronStore from "../store";

export function registerWindowHandlers() {
  ipcMain.on("openWindow", (event, args) => {
    const { route, configName, centerOfMainWindow } = args;
    const config = windowConfigs[configName];

    const newWin = new BrowserWindow(config);

    const url = isDevelopment
      ? `${process.env.WEBPACK_DEV_SERVER_URL}#/${route}`
      : `file://${path.join(__dirname, "index.html")}#/${route}`;

    newWin.once("ready-to-show", () => {
      const mainWindowBounds = electronStore.get("mainWindowBounds");

      if (mainWindowBounds && centerOfMainWindow) {
        const bounds = calculateCenterBounds(mainWindowBounds, config);

        newWin.setBounds({
          ...bounds,
          height: config.height,
          width: config.width,
        });
      }
    });

    newWin.loadURL(url);
  });

  ipcMain.on("windowAction", (event, args) => {
    const { action } = args;

    const focusedWindow = BrowserWindow.getFocusedWindow();

    switch (action) {
      case "close":
        if (focusedWindow.isMaximized()) {
          electronStore.set("wasMaximized", true);
        }

        focusedWindow.close();
        break;

      case "minimize":
        if (focusedWindow.isMaximized()) {
          electronStore.set("wasMaximized", true);
        }

        focusedWindow.minimize();
        break;

      case "maximize":
        if (focusedWindow.isMaximized()) {
          electronStore.set("wasMaximized", false);

          focusedWindow.unmaximize();
          break;
        }

        focusedWindow.maximize();
        break;

      default:
        break;
    }
  });
}
