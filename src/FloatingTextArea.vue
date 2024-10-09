<template>
  <div
    class="subvert-floating-textarea"
    :style="{ top: position.y + 'px', left: position.x + 'px', width: size.width + 'px', height: size.height + 'px' }"
    @mousedown="startDrag"
  >
    <textarea
      ref="textarea"
      class="subvert-textarea"
      v-model="text"
      :placeholder="placeholder"
      @keydown.esc.prevent="close"
      @focus="refreshContext"
      autofocus
    ></textarea>
    <div class="context-info">
        current context: <strong>{{ context.activeEntity }}</strong>
    </div>
    <div class="context-info">
        context keys: <strong>{{ Object.keys(context.context).filter(key => context.context[key]!=='' && context.context[key]!==undefined).join(', ') }}</strong>
    </div>
    <div class="info-text">
      <span><strong>↩</strong> to submit</span>
      <span><strong>esc</strong> to close</span>
      <span><strong>↑↓</strong> for history</span>
      <span><strong>tab</strong> to use history</span>
    </div>
    <div class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { onKeyStroke } from "@vueuse/core";
import { getSubvertContext } from './subvertUtils';
import type { Caido } from "@caido/sdk-frontend";
import { ActiveEntity } from './constants';

const props = defineProps<{
  onSubmit: (text: string, activeEntity: ActiveEntity, context: any) => void;
  onClose: () => void;
  caido: Caido;
}>();

const text = ref('');
const firstRun = ref(true);
const placeholderText = 'Query subvert...';
const context = ref(getSubvertContext(props.caido));
const placeholder = ref(placeholderText);
const position = ref({ x: 100, y: 100 });
const size = ref({ width: 500, height: 200 });
const isDragging = ref(false);
const isResizing = ref(false);
const offset = ref({ x: 0, y: 0 });
const textarea = ref<HTMLTextAreaElement | null>(null);

const commandHistory = ref<string[]>([]);
let historyIndex = -1;

const refreshContext = () => {
  if (firstRun.value) { firstRun.value = false; return }
  context.value = getSubvertContext(props.caido);
};

const loadCommandHistory = () => {
  const savedHistory = localStorage.getItem('subvertCommandHistory');
  if (savedHistory) {
    commandHistory.value = JSON.parse(savedHistory);
  }
};

const saveCommandHistory = () => {
  localStorage.setItem('subvertCommandHistory', JSON.stringify(commandHistory.value));
};

const addToHistory = (command: string) => {
  commandHistory.value.unshift(command);
  if (commandHistory.value.length > 50) {
    commandHistory.value.pop();
  }
  saveCommandHistory();
};

const submit = () => {
  if (text.value.trim()) {
    addToHistory(text.value);
    props.onSubmit(text.value, context.value.activeEntity, context.value.context);
    text.value = '';
    historyIndex = -1;
    placeholder.value = placeholderText;
  }
};

const close = () => {
  props.onClose();
};

const startDrag = (event: MouseEvent) => {
  if (event.target === textarea.value) return;
  isDragging.value = true;
  offset.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  };
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

const drag = (event: MouseEvent) => {
  if (isDragging.value) {
    position.value = {
      x: event.clientX - offset.value.x,
      y: event.clientY - offset.value.y,
    };
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
};

const startResize = (event: MouseEvent) => {
  event.stopPropagation();
  isResizing.value = true;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
};

const resize = (event: MouseEvent) => {
  if (isResizing.value) {
    const newWidth = event.clientX - position.value.x;
    const newHeight = event.clientY - position.value.y;
    size.value = {
      width: Math.max(200, newWidth),
      height: Math.max(100, newHeight),
    };
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
};

const scrollHistory = (direction: number) => {
  if (text.value.trim() === '') {
    historyIndex += direction;
    if (historyIndex < 0) historyIndex = 0;
    if (historyIndex >= commandHistory.value.length) historyIndex = commandHistory.value.length - 1;
    if (commandHistory.value[historyIndex]) {
      placeholder.value = commandHistory.value[historyIndex];
    }
  }
};

onMounted(() => {
  textarea.value?.focus();
  loadCommandHistory();
});

onKeyStroke("Enter", (e) => {
  if (e.target === textarea.value && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
});

onKeyStroke("Escape", (e) => {
  if (e.target === textarea.value) {
    e.preventDefault();
    close();
  }
});

onKeyStroke("ArrowUp", (e) => {
  if (e.target === textarea.value) {
    e.preventDefault();
    scrollHistory(1);
  }
});

onKeyStroke("ArrowDown", (e) => {
  if (e.target === textarea.value) {
    e.preventDefault();
    scrollHistory(-1);
  }
});

onKeyStroke("Tab", (e) => {
  if (e.target === textarea.value && text.value.trim() === '' && historyIndex >= 0 && placeholder.value !== placeholderText) {
    e.preventDefault();
    text.value = placeholder.value;
    placeholder.value = placeholderText;
  }
});

watch(text, (newValue) => {
  if (newValue.trim() === '') {
    placeholder.value = placeholderText;
    historyIndex = -1;
  }
});
</script>

<style scoped>
.subvert-floating-textarea {
  position: fixed;
  z-index: 9999;
  background-color: var(--c-bg-subtle);
  border: var(--c-border-width-1) solid var(--c-border-default);
  border-radius: var(--c-border-radius-1);
  padding: var(--c-space-2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.subvert-textarea {
  width: 100%;
  height: calc(100% - 30px); /* Adjust for info-text height */
  padding: var(--c-space-2);
  resize: none;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  border-radius: var(--c-border-radius-1);
  background-color: var(--c-bg-default);
}

.subvert-textarea:focus {
 outline: var(--c-border-width-2) solid var(--c-fg-secondary);
}

.info-text {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--c-fg-subtle);
}

.info-text span {
  display: flex;
  align-items: center;
}

.info-text strong {
  background-color: var(--c-bg-default);
  padding: 2px 4px;
  border-radius: 3px;
  margin-right: 4px;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  cursor: se-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 5px;
  height: 5px;
  border-right: 2px solid var(--c-border-default);
  border-bottom: 2px solid var(--c-border-default);
}
.context-info {
    font-size: 12px;
    padding-top: 8px;
    color: var(--c-fg-subtle);
}
.context-info strong {
    background-color: var(--c-bg-default);
    padding: 1px 4px;
    border-radius: 3px;
    color: var(--c-fg-subtle);
    margin-right: 4px;
}
</style>