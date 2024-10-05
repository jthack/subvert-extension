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