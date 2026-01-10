import {
  writeCSVFile,
  writeJsonFile,
  readJsonFile,
  documentsPath,
} from "../files";
import { ipcMain } from "electron";

export function registerFileHandlers() {
  ipcMain.handle("readFolder", (event, args) => {
    const { folderPath } = args;
    return readFolder(folderPath);
  });

  ipcMain.handle("readJsonFile", (event, args) => {
    const { folderPath, fileName } = args;
    return readJsonFile(fileName, folderPath);
  });

  ipcMain.on("writeFile", (event, args) => {
    const { fileName, data, folderPath, overwrite } = args;

    const extenstionName = fileName.split(".")[fileName.split(".").length];
    const fileFolderPath = folderPath || documentsPath;

    switch (extenstionName) {
      case "json":
        writeJsonFile(fileName, data, fileFolderPath, overwrite);
        break;

      case "csv":
        writeCSVFile(fileName, data, fileFolderPath);
      default:
        break;
    }
  });
}
