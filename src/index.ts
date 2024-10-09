import { createApp, ref } from 'vue';
import SubvertUIComponent from './SubvertUIComponent.vue';
import FloatingTextArea from './FloatingTextArea.vue';
import type { Caido } from "@caido/sdk-frontend";
import { ActiveEntity, API_ENDPOINT, PAGE } from "./constants";
import { handleServerResponse, fetchSubvertResponse } from "./subvertUtils";
import "./styles/script.css";

const isSubvertOpen = ref(false);

const addPage = (caido: Caido) => {
  const app = createApp(SubvertUIComponent, { caido:caido, apiEndpoint: API_ENDPOINT });
  
  const container = document.createElement('div');
  app.mount(container);
  const card = caido.ui.card({
    body: container,
  });

  // Create plugin page in left tab menu.
  caido.navigation.addPage(PAGE, {
    body: card,
  });
  caido.sidebar.registerItem("Subvert", PAGE, {
    icon: "fas fa-terminal",
  });
  console.log("Mounted app");
};




const spawnCommandInterfaceUI = (caido: Caido) => {
  if (isSubvertOpen.value) {
    // If the interface is already open, toggle its visibility
    const existingInterface = document.querySelector('.subvert-floating-interface');
    if (existingInterface) {
      if (existingInterface.classList.contains('hidden')) {
        existingInterface.classList.remove('hidden');
        document.querySelector('.subvert-textarea')?.focus();
      } else {
        existingInterface.classList.add('hidden');
        caido.window.getActiveEditor()?.focus();
      }
      return; // Exit the function early as we've toggled visibility
    }
  }
  isSubvertOpen.value = true;
  const container = document.createElement('div');
  container.classList.add('subvert-floating-interface');
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
    isSubvertOpen.value = false;
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
  caido.commands.register("subvert.floating", {
    name: "Subvert Floating Command",
    run: () => spawnCommandInterfaceUI(caido),
    group: "Subvert",
  });
  caido.commandPalette.register("subvert.floating", "Subvert Floating Command");
  caido.shortcuts.register("subvert.floating", ["⌃", "⇧", "K"]);
  addPage(caido);
};
