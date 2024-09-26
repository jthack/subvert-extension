import { createApp, ref } from 'vue';
import CommandPalette from './CommandPalette.vue';
import type { Caido } from "@caido/sdk-frontend";
import type { PluginStorage } from "./types";
import "./styles/script.css";

const Page = "/httpql" as const;
const API_ENDPOINT = "http://137.184.207.84:8000/api/httpql";
const TEST_API_KEY = "";

const getApiKey = (caido: Caido): string => {
  // Use the hardcoded API key for testing
  return TEST_API_KEY;
};

const setApiKey = (caido: Caido, apiKey: string) => {
  caido.storage.set({ apiKey });
};

const fetchHttpQLResponse = async (apiKey: string, query: string): Promise<string> => {
  console.log(`Fetching HTTPQL response for query: ${query}`);
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

  const text = await response.text();
  console.log(`Received response: ${text}`);
  return text;
};

const spawnCommandPaletteUI = (caido: Caido) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const closePalette = () => {
    console.log("Closing palette");
    app.unmount();
    document.body.removeChild(container);
  };

  const app = createApp(CommandPalette, { caido, fetchHttpQLResponse, getApiKey, setApiKey, closePalette });
  app.mount(container);

  // Listen for the Escape key to close the palette
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePalette();
      document.removeEventListener('keydown', handleKeydown);
    }
  };

  document.addEventListener('keydown', handleKeydown);
};

export const init = (caido: Caido) => {
  caido.commands.register("httpql-command", {
    name: "HTTPQL Command Palette",
    run: () => spawnCommandPaletteUI(caido),
    group: "Custom Commands",
  });

  caido.sidebar.registerItem("HTTPQL", Page, {
    icon: "fas fa-terminal",
  });
};
