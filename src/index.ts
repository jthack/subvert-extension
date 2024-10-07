import { createApp, ref } from 'vue';
import SubvertUIComponent from './SubvertUIComponent.vue';
import FloatingTextArea from './FloatingTextArea.vue';
import { actionFunctions } from "./commands";
import type { Caido } from "@caido/sdk-frontend";
import { ActiveEntity } from "./types";
import "./styles/script.css";

const Page = "/subvert" as const;
const PROD_API_ENDPOINT = "http://137.184.207.84:8000/api/subvert";
const DEV_API_ENDPOINT = "https://poc.rhynorater.com/subvertQuery.php";
const API_ENDPOINT = window.name === "dev" ? DEV_API_ENDPOINT : PROD_API_ENDPOINT;

const addPage = (caido: Caido) => {
  const app = createApp(SubvertUIComponent, { caido:caido, apiEndpoint: API_ENDPOINT });
  
  const container = document.createElement('div');
  app.mount(container);
  const card = caido.ui.card({
    body: container,
  });

  // Create plugin page in left tab menu.
  caido.navigation.addPage(Page, {
    body: card,
  });
  caido.sidebar.registerItem("Subvert", Page, {
    icon: "fas fa-terminal",
  });
  console.log("Mounted app");
};


function handleServerResponse(caido: any, actions: any[]) {
  actions.forEach(action => {
    const actionFunction = actionFunctions[action.name];
    if (actionFunction) {
      actionFunction(caido, ...action.parameters);
    } else {
      console.error(`Unknown action: ${action.name}`);
    }
  });
}

const fetchSubvertResponse = async (apiKey: string, query: string, activeEntity: ActiveEntity, context: any) => {
  try {
    const serverResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query, activeEntity, context }),
    });
    if (serverResponse.ok) {
      const data = await serverResponse.json();
      return data;
    } else {
      throw new Error('Unable to process query');
    }
  } catch (error) {
    console.error('Error querying Subvert:', error);
    throw error;
  }
};

const spawnCommandInterfaceUI = (caido: Caido) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const handleSubmit = async (text: string, activeEntity: ActiveEntity, context: any) => {
    console.log("Submitted text:", text);
    const apiKey = await caido.storage.get("apiKey");
    try {
      const response = await fetchSubvertResponse(apiKey, text, activeEntity, context);
      console.log("Subvert response:", response);
      caido.window.showToast("Taking following actions: " + response.actions.map((action: any) => action.name).join(", "), { duration: 5000, variant: "success" });
      handleServerResponse(caido, response.actions);
    } catch (error) {
      caido.window.showToast(`Failed to fetch Subvert response: ${error}`, { duration: 5000, variant: "error" });
    }
    closeInterface();
  };

  const closeInterface = () => {
    console.log("Closing command interface");
    app.unmount();
    document.body.removeChild(container);
  };

  const app = createApp(FloatingTextArea, {
    onSubmit: handleSubmit,
    onClose: closeInterface,
    caido: caido,
  });
  app.mount(container);
};

export const init = (caido: Caido) => {
  caido.storage.set("apiKey", "test");
  caido.commands.register("subvert-floating-command", {
    name: "Subvert Floating Command",
    run: () => spawnCommandInterfaceUI(caido),
    group: "Custom Commands",
  });
  caido.commandPalette.register("subvert-floating-command", "Subvert Floating Command");
  addPage(caido);
};
