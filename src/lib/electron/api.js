import electronStore from "./store";
import { net } from "electron";

export async function apiCall(method, endpoint, body, options = {}) {
  const { path = "mytools", headers = {} } = options;

  //   let url = `${electronStore.API_URL}/${path}/${endpoint}`;
  let url = `http://localhost:8000/${path}/${endpoint}`;
  let requestBody = body;

  if (
    !headers["Content-Type"] &&
    method.toUpperCase() === "GET" &&
    body != null
  ) {
    const queryString = new URLSearchParams(body).toString();
    url += `?${queryString}`;
    requestBody = null;
  }

  if (options.useAPIKey) {
    // headers["X-API-KEY"] = electronStore.API_APP_TOKEN;
    headers["X-API-KEY"] =
      "3737f7ebbca481a17a9938a9d3b6c30eb63d8926b75c5bbbe9fd71393369ed70";
  }

  if (headers["Content-Type"] == "application/json") {
    requestBody = JSON.stringify(body);
  }

  const params = {
    method: method.toUpperCase(),
    body: requestBody,
    headers,
  };

  return await net.fetch(url, params);
}
