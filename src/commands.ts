import { getCurrentReplayEditors, setHttpqlBar, getCurrentlySelectedReplayTabSessionId, sendCurrentReplayTab, navigateToSidebarTab, getCurrentScope} from "./caidoUtils";

export const actionFunctions = {
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
  navigateToSidebarTab: (caido: any, tabName: string) => {
    navigateToSidebarTab(tabName);
  },
  updateScope: (caido: any, scopeObject: {name:string, allowList: string[], denyList: string[]}) => {
    let currentScope = getCurrentScope();
    let scopes = caido.scopes.getScopes();
    currentScope = scopes.filter((s: any)=>s.name==currentScope)[0];
    caido.scopes.updateScope(currentScope.id, scopeObject);
  },
  renameReplayTab: (caido: any, newName: string, sessionId?: string) => {
    caido.graphql.renameReplaySession({id: sessionId || getCurrentlySelectedReplayTabSessionId(), name: newName});
  },
  sendReplayTab: (caido: any) => {
    sendCurrentReplayTab();
  }
};