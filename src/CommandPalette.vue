<template>
  <div class="c-command-palette">
    <Command.Dialog :visible="isPaletteOpen" theme="custom">
      <template #header>
        <div class="c-command-palette__header">
          <Command.Input v-model:value="queryInput" placeholder="Type a command or search..." />
        </div>
      </template>

      <template #body>
        <div class="c-command-palette__body">
          <Command.List>
            <Command.Group heading="Subvert Commands">
              <Command.Item
                v-for="command in commands"
                :key="command.id"
                :commandId="command.id"
                :data-value="command.name"
                :auto-complete="command.autoComplete"
                @select="onSelect"
              >
                {{ command.name }}
              </Command.Item>
            </Command.Group>
            <Command.Empty>No results found.</Command.Empty>
          </Command.List>
          <Command.Separator />
          {{ queryResult }}
        </div>
      </template>

      <template #footer>
        <div class="c-command-palette__footer">
          <div class="c-command-palette__footer-text"><span>↩</span> to run</div>
          <div class="c-command-palette__footer-text"><span>↑↓</span> to navigate</div>
          <div class="c-command-palette__footer-text"><span>esc</span> to close</div>
        </div>
      </template>
    </Command.Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { onKeyStroke } from "@vueuse/core";
import { Command } from 'vue-command-palette';

interface Props {
  caido: object;
  closePalette: () => void;
  getApiKey: (caido: object) => string;
}

const props = defineProps<Props>();

const queryInput = ref('');
const queryResult = ref('');
const isPaletteOpen = ref(true);
var command = null

const fetchSubvertResponse = async (apiKey: string, query: string, request: string, response: string, requestSelectedText: string, responseSelectedText: string) => {
  try {
    const serverResponse = await fetch('https://poc.rhynorater.com/subvertQuery.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query, request, response, requestSelectedText, responseSelectedText }),
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

const commands = computed(() => {
  console.log("Computing commands. Query input:", queryInput.value);
  const commandDefinitions = [
    {
      id: 'httpql-suggest',
      name: `httpql: ${queryInput.value.replace(/^h(t(t(p(q(l(:)?)?)?)?)?)?/i, '')}`,
      autoComplete: "httpql:",
      regex: /^(h(t(t(p(q(l(:(.*)?)?)?)?)?)?)?)?$/i,
      shortcut: [],
      perform: async () => {
          const apiKey = props.getApiKey(props.caido);
          const response = await fetchSubvertHTTPQLResponse(apiKey, queryInput.value);
          queryResult.value = response.trim();
          console.log(`Query executed successfully, response: ${queryResult.value}`);

          const cmLineDiv = document.querySelector('.cm-line');
          if (cmLineDiv) {
            cmLineDiv.innerHTML = `<pre>${queryResult.value}</pre>`;
          }
        },
    }
  ]
  let definedCommands = commandDefinitions.filter(cmd => cmd.autoComplete).map(cmd => cmd.autoComplete);
  let realCommands = [];
  commandDefinitions.forEach(cmd => {
    if (cmd.regex && cmd.regex.test(queryInput.value)) {
      realCommands.push(cmd);
    }else{
      console.log("Command not matched:", cmd.name, "Regex:", cmd.regex, "Query input:", queryInput.value);
    }
  });
  console.log(definedCommands, queryInput.value, !definedCommands.some(cmd => queryInput.value.toLowerCase().startsWith(cmd)));
  if (!definedCommands.some(cmd => queryInput.value.toLowerCase().startsWith(cmd))) {
    realCommands.push({
      id: 'query-subvert',
      name: `Subvert query: ${queryInput.value}`,
      perform: async () => {
        console.log("Performing query-subvert command");
        console.log("Get Selected Text", props.caido.window.getActiveEditor()?.getSelectedText())
        const { request, response, requestEditor, responseEditor,requestSelectedText, responseSelectedText } = getCurrentReplayEditors();
        const apiKey = props.getApiKey(props.caido);
        const serverResponse = await fetchSubvertResponse(apiKey, queryInput.value, request, response, requestSelectedText, responseSelectedText);
        console.log("Subvert response:", serverResponse);
        props.caido.window.getActiveEditor()?.replaceSelectedText(serverResponse.response);
      }
    });
  }
  return realCommands;
});

const getCurrentReplayEditors = (): {
  requestEditor: any;
  responseEditor: any;
  request: string | undefined;
  response: string | undefined;
  requestSelectedText: string | undefined;
  responseSelectedText: string | undefined;
  focusedEditor: any;
  focusedEditorText: string | undefined;
  focusedEditorSelectedText: string | undefined;
} => {
  if (window.location.hash.split("?")[0] !== '#/replay') {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focusedEditor: undefined,
      focusedEditorText: undefined,
      focusedEditorSelectedText: undefined
    };
  }

  const requestEditor = document.querySelector('.c-request__body .cm-content')?.cmView?.view;
  const responseEditor = document.querySelector('.c-response__body .cm-content')?.cmView?.view;
  const focusedEditor = document.querySelector('.cm-editor.cm-focused .cm-content')?.cmView?.view;

  const getSelectedText = (editor: any) => {
    if (editor) {
      const {from, to} = editor.state.selection.main;
      return editor.state.sliceDoc(from, to);
    }
    return undefined;
  };

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focusedEditor,
    focusedEditorText: focusedEditor?.state.doc.toString(),
    focusedEditorSelectedText: getSelectedText(focusedEditor)
  };
};


const onSelect = (command: any) => {
  console.log("Selecting command:", command);
  const commandid = document.querySelector('[command-item][aria-selected="true"]')?.getAttribute("commandid");
  let callback = commands.value.find(cmd => cmd.id === commandid)?.perform;
  callback();
  queryInput.value = "";
  isPaletteOpen.value = false;
};

onKeyStroke("Enter", (e) => {
  if (isPaletteOpen.value) {
    const selectedItem = document.querySelector('[command-item][aria-selected="true"]');
    if (selectedItem) {
      selectedItem.dispatchEvent(new Event('click', { bubbles: true }));
    }
    e.preventDefault();
  }
});

onKeyStroke("Escape", (e) => {
  if (isPaletteOpen.value) {
    isPaletteOpen.value = false;
    e.preventDefault();
  }
});
onKeyStroke("Tab", (e) => {

  if (isPaletteOpen.value) {
    const selectedItem = document.querySelector('[command-item][aria-selected="true"]');
    const commandInput = document.querySelector('[command-input]');
    if (selectedItem && commandInput) {
      const autocompleteValue = selectedItem.getAttribute('auto-complete');
      if (autocompleteValue) {
        commandInput.value = autocompleteValue;
        // Move cursor to the end of the input
        commandInput.setSelectionRange(autocompleteValue.length, autocompleteValue.length);
      }
    }
    e.preventDefault();
  }
});

</script>

<style>
[command-dialog-mask] {
  background-color: rgba(0, 0, 0, 0.3);
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 9999999;
  animation: 333ms cubic-bezier(0.16, 1, 0.3, 1) 0s 1 normal none running shown;
}

[command-dialog-wrapper] {
  position: relative;
  background: var(--c-bg-subtle);
  border-radius: 6px;
  box-shadow: none;
  flex-direction: column;
  margin: 20vh auto auto;
  max-width: 560px;
  animation: 333ms cubic-bezier(0.16, 1, 0.3, 1) 0s 1 normal none running shown;
}

[command-input] {
  width: 100%;
  padding: var(--c-space-2);
  background: var(--c-bg-default);
  color: var(--c-fg-default);
  border: none;
  border-radius: var(--c-border-radius-1);
}

[command-input]:focus {
  outline: var(--c-border-width-2) solid var(--c-fg-secondary);
}

[command-group-heading] {
  color: var(--c-fg-subtle);
  margin-top: var(--c-space-2);
  margin-bottom: var(--c-space-2);
}

[command-empty] {
  width: 100%;
  text-align: center;
  padding: var(--c-space-4);
  color: var(--c-fg-subtle);
}
[command-item][aria-selected=true] {
    background-color: rgba(255,255,255,.1)
}
</style>

<style scoped>
.c-command-palette__header {
  padding: var(--c-space-4);
  border-bottom: var(--c-border-width-1) solid var(--c-border-default);
}

.c-command-palette__body {
  padding: var(--c-space-4);
  background-color: rgba(0, 0, 0, 0.1);
  max-height: 40vh;
  overflow-y: auto;
}

.c-command-palette__footer {
  padding: var(--c-space-2);
  border-top: var(--c-border-width-1) solid var(--c-border-default);
  display: flex;
  gap: var(--c-space-4);
}

.c-command-palette__footer-text {
  color: var(--c-fg-subtle);
  display: flex;
  align-items: center;
  gap: var(--c-space-1);
}

.c-command-palette__footer-text span {
  background-color: var(--c-bg-default);
  padding: var(--c-space-1) var(--c-space-2);
  border-radius: var(--c-border-radius-1);
  font-size: var(--c-font-size-100);
}

.c-command-palette__footer-shortcut {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  color: var(--c-fg-subtle);
}

.c-command-palette__footer-shortcut span {
  background-color: var(--c-bg-default);
  padding: var(--c-space-1) var(--c-space-2);
  border-radius: var(--c-border-radius-1);
  font-size: var(--c-font-size-100);
}
</style>