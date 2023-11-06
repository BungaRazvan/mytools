import { exec } from "child_process";

export const isProgramRunning = async (programName) => {
  return new Promise((resolve, reject) => {
    exec(
      `tasklist /FO CSV /NH /FI "IMAGENAME eq ${programName}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          resolve(false);
        }

        const processList = stdout
          .trim()
          .split("\r\n")
          .map((line) => {
            const [imageName, pid, sessionName, sessionNum, memUsage] =
              line.split('","');
            return {
              imageName: imageName.replace('"', ""),
              pid,
              sessionName,
              sessionNum,
              memUsage,
            };
          });
        const isRunning = processList.some(
          (process) =>
            process.imageName.toLowerCase() === programName.toLowerCase()
        );
        resolve(isRunning);
      }
    );
  });
};

export function checkForTesseract() {
  return new Promise((resolve, reject) => {
    exec("reg query HKLM\\SOFTWARE\\Tesseract-OCR", (error, stdout, stderr) => {
      if (stdout.toLowerCase().includes("tesseract-ocr")) {
        resolve(true); // Tesseract is installed
      } else {
        resolve(false); // Tesseract is not installed
      }
    });
  });
}
