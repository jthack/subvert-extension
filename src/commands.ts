import { getCurrentReplayEditors, getCurrentTab, getHttpqlBar, setHttpqlBar, getCurrentlySelectedReplayTabSessionId } from "./utils";

enum ActiveEntity {
  ReplayRequest = 'replayRequest',
  ReplayResponse = 'replayResponse',
  HttpHistoryRequest = 'httpHistoryRequest',
  HttpHistoryResponse = 'httpHistoryResponse',
  HTTPQL = 'httpql',
  MatchAndReplace = 'matchAndReplace'
}

const actionFunctions = {
  activeEditorReplaceSelection: (caido: any, text: string) => {
    caido.window.getActiveEditor()?.replaceSelectedText(text);
    caido.window.getActiveEditor()?.focus();
  },
  replayRequestReplace: (caido: any, text: string) => {
    const { requestEditor } = getCurrentReplayEditors();
    if (requestEditor) {
      requestEditor.dispatch({
        changes: {from: 0, to: requestEditor.state.doc.length, insert: text}
      });
      requestEditor.focus();
    }
  },
  replayRequestReplaceSelection: (caido: any, text: string) => {
    const { requestEditor } = getCurrentReplayEditors();
    if (requestEditor) {
      requestEditor.dispatch(
        requestEditor.state.replaceSelection(text)
      );
      requestEditor.focus();
    }
  },
  httpqlBarReplace: (caido: any, text: string) => {
    setHttpqlBar(text);
  },
  // Add more action functions here as needed
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
    const serverResponse = await fetch('https://poc.rhynorater.com/subvertQuery.php', {
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

export function getCommandDefinitions(queryInput: string, caido: any, getApiKey: Function) {
  return [
    {
      id: 'httpql-suggest',
      name: `httpql: ${queryInput.replace(/^h(t(t(p(q(l(:)?)?)?)?)?)?/i, '')}`,
      autoComplete: "httpql:",
      regex: /^(h(t(t(p(q(l(:(.*)?)?)?)?)?)?)?)?$/i,
      shortcut: [],
      perform: async () => {
        const apiKey = getApiKey(caido);
        const context = {httpqlBar: getHttpqlBar()};
        const serverResponse = await fetchSubvertResponse(apiKey, queryInput, ActiveEntity.HTTPQL, context);
        console.log(`Query executed successfully, response:`, serverResponse);
        handleServerResponse(caido, serverResponse.actions);
      },
    },
    {
      id: 'query-subvert',
      name: `Subvert query: ${queryInput}`,
      perform: async () => {
        console.log("Performing query-subvert command");
        let context;
        let activeEntity: ActiveEntity;
        const activeTab = getCurrentTab();
        if (activeTab === 'Replay') {     
          const { request, response, requestSelectedText, responseSelectedText, currentlySelectedReplayTab, currentlySelectedReplayTabSessionId } = getCurrentReplayEditors();
          const activeEditorSelectedText = caido.window.getActiveEditor()?.getSelectedText();
          if (activeEditorSelectedText === requestSelectedText) {
            activeEntity = ActiveEntity.ReplayRequest;
          } else if(activeEditorSelectedText === responseSelectedText) {
            activeEntity = ActiveEntity.ReplayResponse;
          }
          console.log("Active entity:", activeEntity);
          context = {
            request,
            response,
            requestSelectedText,
            responseSelectedText,
            currentlySelectedReplayTab,
            currentlySelectedReplayTabSessionId
          };
        } else if (activeTab === 'Match & Replace') {
          // Handle Tamper tab logic here
        }
        const apiKey = getApiKey(caido);
        const serverResponse = await fetchSubvertResponse(apiKey, queryInput, activeEntity, context);
        console.log("Subvert response:", serverResponse);
        handleServerResponse(caido, serverResponse.actions);
      }
    }
  ];
}
