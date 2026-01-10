import path from "path";

import { ipcMain, shell } from "electron";
import { apiCall } from "../api";
import { isDevelopment } from "@/lib/vue/constants";
import { spawn } from "child_process";

let childProcess = null;

export function registerExternalHandlers() {
  ipcMain.on("startPython", (event, args) => {
    const { script } = args;

    const scriptPath = isDevelopment
      ? path.join(__dirname, "..", "..", `src/lib/python/scripts/${script}.py`)
      : path.join(
          process.resourcesPath,
          "scripts",
          `${script}`,
          `${script}.exe`
        );

    if (isDevelopment) {
      childProcess = spawn("python", [scriptPath]);
    } else {
      childProcess = spawn(scriptPath);
    }

    // Handle data and responses from the Python script
    childProcess.stdout.on("data", (data) => {
      console.log(data);
      const dataString = data.toString();
      event.sender.send(`python_${script}`, dataString);
    });

    childProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
      childProcess.kill();
    });
  });

  ipcMain.on("stopPython", (event, args) => {
    if (childProcess) {
      childProcess.kill();
    }
  });

  ipcMain.on("openBrowser", (event, args) => {
    const { url } = args;

    event.preventDefault();

    if (!url) {
      return;
    }

    shell.openExternal(url);
  });

  ipcMain.handle("api", async (event, args) => {
    const { method, endpoint, body, options = {} } = args;

    try {
      const response = await apiCall(method, endpoint, body, options);

      // Check if the response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
      }

      return { ok: response.ok, status: response.status, data: null };
    } catch (error) {
      console.error("IPC API Error:", error);
      return { ok: false, error: error.message };
    }
  });
}
