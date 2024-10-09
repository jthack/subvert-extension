import { getCurrentSidebarTab, getCurrentReplayEditors, getCurrentHttpHistoryEditors, getHttpHistoryCurrentRow, getHttpqlBar, getCurrentScope } from "./caidoUtils";
import { actionFunctions } from "./commands";
import type { Caido } from "@caido/sdk-frontend";
import { API_ENDPOINT, ActiveEntity, CONTEXT_ENDPOINT } from "./constants";

// Context functions
export const getSubvertContext = (caido: Caido) => {
    console.log("Getting subvert context");
    let context;
    let activeEntity: ActiveEntity;
    const activeTab = getCurrentSidebarTab();
    if (activeTab === 'Replay') {
        const { request, response, requestSelectedText, responseSelectedText, currentlySelectedReplayTab, currentlySelectedReplayTabSessionId, focused } = getCurrentReplayEditors();
        if (focused === "request") {
            activeEntity = ActiveEntity.ReplayRequest;
        } else if(focused === "response") {
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
    } else if (activeTab === 'HTTP History') {
        const { request, response, requestSelectedText, responseSelectedText, focused } = getCurrentHttpHistoryEditors();
        if (focused === "request") {
            activeEntity = ActiveEntity.HttpHistoryRequest;
        } else if(focused === "response") {
            activeEntity = ActiveEntity.HttpHistoryResponse;
        }
        const currentRow = getHttpHistoryCurrentRow();
        const httpqlBar = getHttpqlBar();
        let scope = getCurrentScope();
        const scopeConfig = caido.scopes.getScopes().filter((s)=>s.name==scope);
        scope = scopeConfig.length > 0 ? scopeConfig[0] : undefined;

        context = {
            request,
            response,
            requestSelectedText,
            responseSelectedText,
            currentRow,
            httpqlBar,
            scope
        };
    }
    sendSubvertContext(context, activeEntity);
    return { context, activeEntity };
}

export const sendSubvertContext = (context: any, activeEntity: ActiveEntity) => {
    fetch(API_ENDPOINT+CONTEXT_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context, activeEntity })
    });
}

// Response functions
export const handleServerResponse = (caido: any, actions: any[]) => {
  actions.forEach(action => {
    const actionFunction = actionFunctions[action.name];
    if (actionFunction) {
      actionFunction(caido, ...action.parameters);
    } else {
      console.error(`Unknown action: ${action.name}`);
    }
  });
}

export const fetchSubvertResponse = async (apiKey: string, query: string, activeEntity: ActiveEntity, context: any) => {
  try {
    const serverResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query, deprecatedActiveEntity: activeEntity, deprecatedContext: context }),
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
