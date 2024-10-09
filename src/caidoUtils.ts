import { Caido } from "@caido/sdk-frontend";

//utils 
const getSelectedText = (editor: any) => {
if (editor) {
    const {from, to} = editor.state.selection.main;
    return editor.state.sliceDoc(from, to);
}
return undefined;
};


export const getCurrentReplayEditors = () => {
  if (window.location.hash.split("?")[0] !== '#/replay') {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focused: undefined,
      currentlySelectedReplayTab: '',
      currentlySelectedReplayTabSessionId: ''
    };
  }

  const requestEditor = document.querySelector('.c-request__body .cm-content')?.cmView?.view;
  const responseEditor = document.querySelector('.c-response__body .cm-content')?.cmView?.view;
  const focusedEditor = document.querySelector('.cm-editor.cm-focused .cm-content')?.cmView?.view;
  let focused = undefined;
  if (focusedEditor === requestEditor) {
    focused = "request"
  } else if (focusedEditor === responseEditor) {
    focused = "response"
  }

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focused,
    currentlySelectedReplayTab: getCurrentlySelectedReplayTab(),
    currentlySelectedReplayTabSessionId: getCurrentlySelectedReplayTabSessionId()
  };
};

export const getCurrentHttpHistoryEditors = () => {
  if (window.location.hash.split("?")[0] !== '#/intercept') {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focused: undefined,
    };
  }

  const requestEditor = document.querySelector('.c-request .cm-content')?.cmView?.view;
  const responseEditor = document.querySelector('.c-response .cm-content')?.cmView?.view;
  const focusedEditor = document.querySelector('.cm-editor.cm-focused .cm-content')?.cmView?.view;
  let focused = undefined;
  if (focusedEditor === requestEditor) {
    focused = "request"
  } else if (focusedEditor === responseEditor) {
    focused = "response"
  }

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focused,
    focusedEditorSelectedText: getSelectedText(focusedEditor)
  };
};

export const getHttpHistoryCurrentRow = () => {
    const selectedRow = document.querySelector('.c-table__item-row[data-is-selected="true"]');
    const row = selectedRow ? Array.from(selectedRow.querySelectorAll(".c-item-cell__inner")).map(cell => cell.textContent || '') : [];
    const header = Array.from(document.querySelector(".c-table__header-row")?.querySelectorAll(".c-header-cell__content") || []).map(r => r.textContent || '');
    
    const rowData = header.reduce((acc, key, index) => {
        acc[key] = row[index] || '';
        return acc;
    }, {});

    return rowData;
}

export const setHttpqlBar = (text: string) => {
    const view = document.querySelector(".c-search-query-editor__editor .cm-content")?.cmView?.view 
    const line = document.querySelector(".c-search-query-editor__editor .cm-line")
    if (line && view) {
        line.textContent = text
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,  // 13 is the Enter key code
            charCode: 13,
            which: 13,
            bubbles: true  // Make sure the event bubbles up
        });
        view.contentDOM.dispatchEvent(enterEvent) 
    }
};

export const getHttpqlBar = (text: string) => {
    const view = document.querySelector(".c-search-query-editor__editor .cm-content")?.cmView?.view 
    return view?.state.doc.toString()
};

export const getCurrentScope = () => {
    const scope = document.querySelector(".c-scope-dropdown .p-select-label span")?.textContent
    return scope || ''
};

export const getCurrentSidebarTab = () => {
    const activeTab = document.querySelector(".c-sidebar-item[data-is-active=\"true\"]");
    return activeTab ? activeTab.textContent: '';
};
export const navigateToSidebarTab = (tabName: string) => {
    const tab = Array.from(document.querySelectorAll(".c-sidebar-item:has(.c-sidebar__label)")).filter((a)=>a.querySelector(".c-sidebar__label")?.textContent==tabName);
    if (tab.length == 0) {
        console.error(`Tab with name "${tabName}" not found`);
        return;
    }
    if (tab[0] instanceof HTMLElement) {
        tab[0].dispatchEvent(new MouseEvent("mousedown"));
    }
};
export const getCurrentlySelectedReplayTab = () => {
    const activeTab = document.querySelector(".c-tab[data-is-selected=\"true\"]");
    return activeTab ? activeTab.textContent : '';
};
export const getCurrentlySelectedReplayTabSessionId = () => {
    const activeTab = document.querySelector(".c-tab[data-is-selected=\"true\"]");
    return activeTab ? activeTab.getAttribute("data-session-id") : '';
};
export const sendCurrentReplayTab = () => {
    const sendButton = document.querySelector('.c-send-request-button button');
    if (sendButton instanceof HTMLElement) {
        sendButton.click();
    } else {
        console.error('Send request button not found');
    }
};
export const switchToReplayTab = (sessionId: string) => {
    const targetTab = document.querySelector(`[data-session-id="${sessionId}"] .c-tree-item__item`);
    if (targetTab instanceof HTMLElement) {
        targetTab.dispatchEvent(new MouseEvent("mousedown"));
    } else {
        console.error(`Tab with session ID "${sessionId}" not found`);
    }
};
export const switchToReplayTabByName = (name: string) => {
    const allTabs = document.querySelectorAll('.c-tree-session');
    for (const tab of allTabs) {
        const labelElement = tab.querySelector('.c-label__label');
        if (labelElement && labelElement.textContent === name) {
            const clickableItem = tab.querySelector('.c-tree-item__item');
            if (clickableItem instanceof HTMLElement) {
                clickableItem.dispatchEvent(new MouseEvent("mousedown"));
                return;
            }
        }
    }
    console.error(`Tab with name "${name}" not found`);
};