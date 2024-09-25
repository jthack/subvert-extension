import type { Caido } from "@caido/sdk-frontend";
import type { PluginStorage } from "./types";
import "./styles/script.css";

const Page = "/httpql" as const;
const API_ENDPOINT = "http://137.184.207.84:8000/api/httpql";

const getApiKey = (caido: Caido): string => {
  const storage = caido.storage.get() as PluginStorage | undefined;
  return storage?.apiKey || "";
};

const setApiKey = (caido: Caido, apiKey: string) => {
  caido.storage.set({ apiKey });
};

const fetchHttpQLResponse = async (apiKey: string, query: string): Promise<string> => {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
};

const addPage = (caido: Caido) => {
  const body = document.createElement("div");
  body.className = "httpql-plugin";
  body.innerHTML = `
    <div class="httpql-plugin__inputs">
      <input type="password" id="api-key" placeholder="API Key" class="c-input" />
      <textarea id="user-query" placeholder="Enter your query" class="c-input" rows="3"></textarea>
      <button id="submit-query" class="c-button">Submit</button>
    </div>
    <pre id="response-container" class="httpql-plugin__response"></pre>
  `;

  const apiKeyInput = body.querySelector("#api-key") as HTMLInputElement;
  const userQueryInput = body.querySelector("#user-query") as HTMLTextAreaElement;
  const submitButton = body.querySelector("#submit-query") as HTMLButtonElement;
  const responseContainer = body.querySelector("#response-container") as HTMLPreElement;

  apiKeyInput.value = getApiKey(caido);

  apiKeyInput.addEventListener("change", () => {
    setApiKey(caido, apiKeyInput.value);
  });

  submitButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value;
    const query = userQueryInput.value;

    if (!apiKey || !query) {
      responseContainer.textContent = "Please enter both API key and query.";
      return;
    }

    try {
      responseContainer.textContent = "Loading...";
      const response = await fetchHttpQLResponse(apiKey, query);
      responseContainer.textContent = response;
    } catch (error) {
      responseContainer.textContent = `Error: ${error.message}`;
    }
  });

  caido.navigation.addPage(Page, { body });
};

export const init = (caido: Caido) => {
  addPage(caido);

  caido.sidebar.registerItem("HTTPQL", Page, {
    icon: "fas fa-terminal",
  });
};