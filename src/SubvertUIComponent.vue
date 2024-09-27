<template>
  <div class="subvert-ui-container">
    <h2>HTTPQL Plugin</h2>
    <div class="input-group">
      <label for="apiKey">API Key:</label>
      <input type="password" id="apiKey" v-model="apiKey" @change="saveApiKey" />
    </div>
    <div class="input-group">
      <label for="query">HTTPQL Query:</label>
      <textarea id="query" v-model="query" rows="4"></textarea>
    </div>
    <button @click="executeQuery" :disabled="!apiKey">Execute Query</button>
    <div v-if="result" class="result">
      <h3>Result:</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Caido } from "@caido/sdk-frontend";

export default defineComponent({
  name: 'SubvertUIComponent',
  props: {
    caido: {
      type: Object as () => Caido,
      required: true
    }
  },
  setup(props) {
    const apiKey = ref('');
    const query = ref('');
    const result = ref('');

    const saveApiKey = () => {
      props.caido.storage.set({ apiKey: apiKey.value });
    };

    const executeQuery = async () => {
      try {
        const response = await fetch('http://137.184.207.84:8000/api/httpql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey.value,
          },
          body: JSON.stringify({ query: query.value }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        result.value = await response.text();
      } catch (error) {
        console.error('Error executing query:', error);
        result.value = 'Error: ' + (error as Error).message;
      }
    };

    // Load the API key from storage when the component is created
    props.caido.storage.get().then((storage) => {
      console.log("Storage:", storage);
      if (storage.apiKey) {
        apiKey.value = storage.apiKey;
      }
    });

    return {
      apiKey,
      query,
      result,
      saveApiKey,
      executeQuery,
    };
  },
});
</script>

<style scoped>
.subvert-ui-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="password"],
textarea {
  width: 100%;
  padding: 5px;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
}

pre {
  background-color: #f4f4f4;
  padding: 10px;
  overflow-x: auto;
}
</style>