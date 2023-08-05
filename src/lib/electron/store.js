import Store from "electron-store";

import { documentsPath } from "./files";

const storeOptions = {
  // Set the store location in the env document file
  cwd: documentsPath,
};

// Create an instance of electron-store with the options
const store = new Store(storeOptions);

export default store;
