import { map, groupBy, sumBy } from "lodash";

// TODO Check if these work now
export const getSettings = async () => {
  let fileData = null;

  window.ipc.send("getFile", {
    file: "settings.json",
    defaultData: { gamesToCheck: [] },
    writeFile: true,
  });
  window.ipc.receive("getFile", ({ data }) => {
    console.log(data);
    fileData = data;
  });

  return fileData;
};

export const getGamesData = () => {
  let data = null;

  window.ipc.send("getFile", {
    file: "runningTime.csv",
    headers: ["app", "time"],
  });
  window.ipc.receive("getFile", ({ data }) => {
    const transformedData = map(groupBy(data, "app"), (group) => {
      const total = sumBy(group, (item) => parseInt(item.time));

      return {
        app: group[0].app,
        time: total,
      };
    });

    data = transformedData;
  });

  return data;
};
