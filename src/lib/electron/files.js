const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Get the path to the Documents folder
const documentFolder =
  process.env.NODE_ENV == "production" ? "MyTools" : "MyToolsDev";

export const documentsPath = path.join(
  app.getPath("documents"),
  documentFolder
);

export const checkFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

export const readCSVFile = (
  fileName,
  retrieveHeaders = [],
  delimiter = null,
  folderPath = documentsPath
) => {
  checkFolder(folderPath);

  // Define the file path
  const filePath = path.join(folderPath, fileName);
  const separator = delimiter ? delimiter : ";";

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    console.error(`File does not exist: ${filePath}`);
    return false;
  }

  try {
    const fileData = fs.readFileSync(filePath, "utf8");

    const lines = fileData.split("\n");
    const headers = lines
      .shift()
      .split(separator)
      .filter((line) => retrieveHeaders.includes(line));

    const data = [];

    lines.forEach((line) => {
      const values = line.split(separator);
      const item = {};

      headers.forEach((header, index) => {
        item[header] = values[index];
      });

      data.push(item);
    });

    return data;
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return;
  }
};

// Read the file
export const readJsonFile = (fileName, folderPath = documentsPath) => {
  checkFolder(folderPath);

  // Define the file path
  const filePath = path.join(folderPath, fileName);

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    console.error(`File does not exist: ${filePath}`);
    return false;
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return;
  }
};

export const updateFile = (fileName, data, folderPath = documentsPath) => {
  checkFolder(folderPath);

  const filePath = path.join(folderPath, fileName);
  const isCSV = fileName.includes(".csv");
  const isJSON = fileName.includes(".json");

  let newData = data;
  let hasWriteFile = false;

  if (isCSV) {
    newData = Object.values(data).join(";") + ";";
  }

  if (isJSON) {
    newData = JSON.stringify(data);
  }

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    console.error(`File does not exist: ${filePath}`);
    hasWriteFile = true;

    if (isCSV) {
      newData = Object.keys(data).join(";") + ";" + newData;
    }
  }

  if (hasWriteFile) {
    try {
      fs.writeFileSync(filePath, newData);
      console.log("File written successfully");
      return;
    } catch (error) {
      console.error(`Error writing file: ${error}`);
      return;
    }
  }

  try {
    fs.appendFileSync(filePath, "\n" + newData);
    console.log("File updated successfully");
    return;
  } catch (error) {
    console.error(`Error writing file: ${error}`);
    return;
  }
};

export const readFolder = (folderPath) => {
  return fs.readdirSync(folderPath);
};
