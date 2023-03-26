import { exec } from "child_process";

const programs = [
  { name: "GenshinImpact.exe", displayName: "Genshin Impact" },
  { name: "chrome.exe", displayName: "Google Chrome" },
  { name: "notepad.exe", displayName: "Notepad" },
];

export const isProgramRunning = async (programName) => {
  return new Promise((resolve, reject) => {
    exec(
      `tasklist /FO CSV /NH /FI "IMAGENAME eq ${programName}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
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
