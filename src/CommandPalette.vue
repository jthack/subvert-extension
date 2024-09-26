<template>
  <div class="command-palette">
    <div class="palette-header">
      <h2>HTTPQL Command Palette</h2>
    </div>
    <input
      v-model="query"
      @input="handleInput"
      @keydown.enter="executeQuery"
      placeholder="Type your query here..."
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    caido: Object,
    fetchHttpQLResponse: Function,
    getApiKey: Function,
    setApiKey: Function,
    closePalette: Function,
  },
  setup(props) {
    const query = ref('');

    const handleInput = () => {
      // Prevent the default search behavior
    };

    const executeQuery = async () => {
      console.log(`Executing query: ${query.value}`);
      try {
        const apiKey = props.getApiKey(props.caido);
        let response = await props.fetchHttpQLResponse(apiKey, query.value);
        response = response.trim(); // Strip newline from the response
        console.log(`Query executed successfully, response: ${response}`);

        // Find the div with class cm-line and set its innerHTML to the response
        const cmLineDiv = document.querySelector('.cm-line');
        if (cmLineDiv) {
          cmLineDiv.innerHTML = `<pre>${response}</pre>`;
        }

        // Close the command palette
        console.log("Calling closePalette");
        props.closePalette();
      } catch (error) {
        console.error(`Error executing query: ${error}`);
      }
    };

    return {
      query,
      handleInput,
      executeQuery,
    };
  },
});
</script>

<style scoped>
.command-palette {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgb(38, 38, 38);
  color: white;
  padding: 1em;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  border-radius: 8px;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}

input {
  width: 100%;
  padding: 0.5em;
  margin-bottom: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>