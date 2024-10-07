import { getCurrentReplayEditors, getCurrentTab, getHttpqlBar, setHttpqlBar, getCurrentlySelectedReplayTabSessionId, sendCurrentReplayTab} from "./caidoUtils";

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
  renameReplayTab: (caido: any, newName: string, sessionId?: string) => {
    caido.graphql.renameReplaySession({id: sessionId || getCurrentlySelectedReplayTabSessionId(), name: newName});
  },
  sendReplayTab: (caido: any) => {
    sendCurrentReplayTab();
  }
};