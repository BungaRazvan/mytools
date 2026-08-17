import electronStore, { getDecryptedKey } from "./store";
import { net } from "electron";
import { pickBy } from "lodash";

export async function apiCall(method, endpoint, body, options = {}) {
  const { path = "mytools", headers = {} } = options;

  const APP_API_TOKEN = getDecryptedKey("APP_API_TOKEN");
  const APP_API_URL = electronStore.get("APP_API_URL");

  if (!APP_API_URL) {
    throw new Error("Missing API URL");
  }

  let url = `${APP_API_URL}/${path}/${endpoint}`;
  let requestBody = body;

  if (
    !headers["Content-Type"] &&
    method.toUpperCase() === "GET" &&
    body != null
  ) {
    let queryString = new URLSearchParams(body).toString();

    if (options.strip) {
      const cleanBody = pickBy(
        body,
        (value) => value !== null && value !== undefined && value !== "",
      );
      queryString = new URLSearchParams(cleanBody).toString();
    }

    url += `?${queryString}`;
    requestBody = null;
  }

  if (options.useAPIKey) {
    if (!APP_API_TOKEN) {
      throw new Error("Missing API TOKEN");
    }

    headers["X-API-KEY"] = APP_API_TOKEN;
  }

  if (headers["Content-Type"] == "application/json") {
    requestBody = JSON.stringify(body);
  }

  const params = {
    method: method.toUpperCase(),
    body: requestBody,
    headers: new Headers(headers),
    credentials: "include",
  };

  return await net.fetch(url, params);
}
