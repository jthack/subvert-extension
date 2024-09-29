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
                :data-value="command.name"
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

const fetchSubvertResponse = async (apiKey: string, query: string) => {
  try {
    const response = await fetch('https://poc.rhynorater.com/subvertQuery.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.response;
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
  let definedCommands = ["httpql"];
  let commands = [
    {
      id: 'httpql-suggest',
      name: `httpql: ${queryInput.value.replace(/^[h]*[t]*[p]*[q]*[l]*\s*/, '')}`,
      shortcut: [],
      perform: async () => {
        const apiKey = props.getApiKey(props.caido);
        // const response = await fetchSubvertHTTPQLResponse(apiKey, queryInput.value);
        const response = await fetchSubvertResponse(apiKey, queryInput.value);
        queryResult.value = response.trim();
        console.log(`Query executed successfully, response: ${queryResult.value}`);

        const cmLineDiv = document.querySelector('.cm-line');
        if (cmLineDiv) {
          cmLineDiv.innerHTML = `<pre>${queryResult.value}</pre>`;
        }

        // console.log("Calling closePalette");
        // props.closePalette();
      },
    },
  ];
  if (!definedCommands.some(cmd => queryInput.value.toLowerCase().startsWith(cmd))) {
    commands.push({
      id: 'query-subvert',
      name: `Subvert query: ${queryInput.value}`,
      shortcut: [],
      perform: async () => {
        const apiKey = props.getApiKey(props.caido);
        const response = await fetchSubvertResponse(apiKey, queryInput.value);
        queryResult.value = response.trim();
        console.log(`Query executed successfully, response: ${queryResult.value}`);

        const cmLineDiv = document.querySelector('.cm-line');
        if (cmLineDiv) {
          cmLineDiv.innerHTML = `<pre>${queryResult.value}</pre>`;
        }

        // console.log("Calling closePalette");
        // props.closePalette();
      },
    });
  }
  return commands;
});

const selected = ref<{ id: string; perform: () => void } | undefined>();
const onSelect = (command: any) => {
  console.log("Selecting command:", command);
  selected.value = command;
};

onKeyStroke("Enter", (e) => {
  if (isPaletteOpen.value && selected.value) {
    console.log("Running command:", selected.value);
    selected.value.perform();
    isPaletteOpen.value = false;
    selected.value = undefined;
    e.preventDefault();
  }
});

onKeyStroke("Escape", (e) => {
  if (isPaletteOpen.value) {
    isPaletteOpen.value = false;
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