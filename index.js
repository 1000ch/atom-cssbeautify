"use babel";

import { CompositeDisposable } from 'atom';
import CSSBeautify from 'cssbeautify';

let subscriptions;
let beautifyOnSave;
let indentType;
let indentSize;
let openBrace;
let autoSemicolon;

function getIndent() {
  let indent = '';
  switch (indentType) {
    case 'space':
      indent = Array(indentSize + 1).join(' ');
      break;
    case 'tab':
      indent = '\t';
      break;
  }
  return indent;
}

function beautify(css) {
  try {
    return CSSBeautify(css, {
      indent: getIndent(),
      openbrace: openBrace,
      autosemicolon: autoSemicolon
    });
  } catch (e) {
    console.error(e);
  }
  return null;
}

function execute() {
  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let position = editor.getCursorBufferPosition();
  let text = editor.getText();
  let selectedText = editor.getSelectedText();

  if (selectedText.length !== 0) {
    let formatted = beautify(selectedText);
    if (formatted) {
      let range = editor.getSelectedBufferRange();
      editor.setTextInBufferRange(range, formatted);
      editor.setCursorBufferPosition(position);
    }
  } else {
    let formatted = beautify(text);
    if (formatted) {
      editor.setText(formatted);
      editor.setCursorBufferPosition(position);
    }
  }
}

let editorObserver = null;

export function activate(state) {
  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.config.observe('cssbeautify.beautifyOnSave', value => beautifyOnSave = value));
  subscriptions.add(atom.config.observe('cssbeautify.indentType', value => indentType = value));
  subscriptions.add(atom.config.observe('cssbeautify.indentSize', value => indentSize = value));
  subscriptions.add(atom.config.observe('cssbeautify.openBrace', value => openBrace = value));
  subscriptions.add(atom.config.observe('cssbeautify.autoSemicolon', value => autoSemicolon = value));

  atom.commands.add('atom-workspace', 'cssbeautify:execute', () => {
    execute();
  });

  editorObserver = atom.workspace.observeTextEditors(editor => {
    editor.getBuffer().onWillSave(() => {
      if (beautifyOnSave) {
        execute();
      }
    });
  });
}

export function deactivate() {
  subscriptions.dispose();
  editorObserver.dispose();
}
