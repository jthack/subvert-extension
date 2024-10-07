import { ActiveEntity } from "./types";
import { getCurrentTab, getCurrentReplayEditors } from "./caidoUtils";

export const getSubvertContext = (caido: Caido) => {
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
    return { context, activeEntity };
}