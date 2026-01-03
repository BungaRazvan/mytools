import Store from "electron-store";

import { safeStorage } from "electron";

import { documentsPath } from "./files";

const storeOptions = {
  // Set the store location in the env document file
  cwd: documentsPath,
};

// Create an instance of electron-store with the options
const store = new Store(storeOptions);

export const getDecryptedKey = (key) => {
  const encrypted = store.get(key);
  if (!encrypted) {
    return null;
  }

  return safeStorage.decryptString(Buffer.from(encrypted, "hex"));
};

export default store;
