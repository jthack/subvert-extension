export const getCurrentReplayEditors = (): {
  requestEditor: any;
  responseEditor: any;
  request: string | undefined;
  response: string | undefined;
  requestSelectedText: string | undefined;
  responseSelectedText: string | undefined;
  focusedEditor: any;
  focusedEditorText: string | undefined;
  focusedEditorSelectedText: string | undefined;
  currentlySelectedReplayTab: string;
  currentlySelectedReplayTabSessionId: string;
} => {
  if (window.location.hash.split("?")[0] !== '#/replay') {
    return {
      requestEditor: undefined,
      responseEditor: undefined,
      request: undefined,
      response: undefined,
      requestSelectedText: undefined,
      responseSelectedText: undefined,
      focusedEditor: undefined,
      focusedEditorText: undefined,
      focusedEditorSelectedText: undefined,
      currentlySelectedReplayTab: '',
      currentlySelectedReplayTabSessionId: ''
    };
  }

  const requestEditor = document.querySelector('.c-request__body .cm-content')?.cmView?.view;
  const responseEditor = document.querySelector('.c-response__body .cm-content')?.cmView?.view;
  const focusedEditor = document.querySelector('.cm-editor.cm-focused .cm-content')?.cmView?.view;

  const getSelectedText = (editor: any) => {
    if (editor) {
      const {from, to} = editor.state.selection.main;
      return editor.state.sliceDoc(from, to);
    }
    return undefined;
  };

  return {
    requestEditor,
    responseEditor,
    request: requestEditor?.state.doc.toString(),
    response: responseEditor?.state.doc.toString(),
    requestSelectedText: getSelectedText(requestEditor),
    responseSelectedText: getSelectedText(responseEditor),
    focusedEditor,
    focusedEditorText: focusedEditor?.state.doc.toString(),
    focusedEditorSelectedText: getSelectedText(focusedEditor),
    currentlySelectedReplayTab: getCurrentlySelectedReplayTab(),
    currentlySelectedReplayTabSessionId: getCurrentlySelectedReplayTabSessionId()
  };
};


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

export const getCurrentTab = () => {
    const activeTab = document.querySelector(".c-sidebar-item[data-is-active=\"true\"]");
    return activeTab ? activeTab.textContent: '';
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