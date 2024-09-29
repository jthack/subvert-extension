<template>
  <div class="subvert-ui-container">
    <h2 class="centered-content">Subvert</h2>
    <div class="input-group">
      <label for="apiKey">API Key:</label>
      <div class="input-wrapper">
        <input 
          type="password" 
          id="apiKey" 
          v-model="apiKey" 
          @input="onInputChange"
        />
        <span class="validation-icon" :class="{ 'valid': isApiKeyValid, 'invalid': !isApiKeyValid }">
          {{ isApiKeyValid ? '✓' : '✗' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
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
    const isApiKeyValid = ref(false);

    const validateApiKey = async (key: string): Promise<boolean> => {
      try {
        const response = await fetch('https://poc.rhynorater.com/validate.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey: key }),
        });
        return response.ok;
      } catch (error) {
        console.error('Error validating API key:', error);
        return false;
      }
    };

    const saveApiKey = async () => {
      console.log("Validating API Key:", apiKey.value);
      const isValid = await validateApiKey(apiKey.value);
      isApiKeyValid.value = isValid;
      if (isValid) {
        console.log("Saving valid API Key");
        props.caido.storage.set({ apiKey: apiKey.value });
      }
    };

    const onInputChange = async () => {
      const storage = await props.caido.storage.get();
      console.log("Current storage:", storage);
      saveApiKey();
    };

    onMounted(async () => {
      console.log("Component mounted");
      // Load the API key from storage when the component is created
      const storage = await props.caido.storage.get();
      console.log("Storage:", storage);
      if (storage.apiKey) {
        apiKey.value = storage.apiKey;
        isApiKeyValid.value = await validateApiKey(storage.apiKey);
      }
    });

    return {
      apiKey,
      isApiKeyValid,
      onInputChange,
    };
  },
});
</script>

<style scoped>
.subvert-ui-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  margin: 0; /* Remove auto margin */
}

.centered-content {
  text-align: center; /* Center only the h2 */
}

.input-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center; /* Align items vertically */
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 25%; /* Ensure the input wrapper takes full width of its container */
  margin-left: 10px; /* Add some space between label and input */
}

label {
  white-space: nowrap;
}

input[type="password"] {
  width: 100%;
  padding: 5px;
  padding-right: 30px;
  box-sizing: border-box; /* Include padding in the width calculation */
}

.validation-icon {
  position: absolute;
  right: 10px;
  font-size: 18px;
}

.validation-icon.valid {
  color: green;
}

.validation-icon.invalid {
  color: red;
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