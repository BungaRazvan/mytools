const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Get the path to the Documents folder
const documentFolder =
  process.env.NODE_ENV == "production" ? "MyTools" : "MyToolsDev";
const documentsPath = path.join(app.getPath("documents"), documentFolder);

export const checkFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

// Read the file
export const readFile = (fileName, folderPath = documentsPath) => {
  // Define the file path
  checkFolder(folderPath);
  const filePath = path.join(folderPath, fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File does not exist: ${filePath}`);
      return;
    }
  });

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    return data;
  });
};

export const updateFile = (fileName, data, folderPath = documentsPath) => {
  checkFolder(folderPath);

  const filePath = path.join(folderPath, fileName);
  let newData = data;

  if (fileName.includes(".csv")) {
    newData = Object.values(data).join(";") + "; \n";
  }

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File does not exist: ${filePath}`);
      newData = Object.keys(data).join(";") + "; \n" + newData;

      fs.writeFile(filePath, newData, (err) => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          return;
        }

        console.log("File updated successfully");
      });

      return;
    }

    fs.appendFile(filePath, newData, (err) => {
      if (err) {
        console.error(`Error writing file: ${err}`);
        return;
      }

      console.log("File updated successfully");
      return;
    });
  });
};
