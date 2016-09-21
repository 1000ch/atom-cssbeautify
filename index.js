"use babel";

import CSSBeautify from 'cssbeautify';

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

  beautifyOnSave = atom.config.get('cssbeautify.beautifyOnSave');
  indentType = atom.config.get('cssbeautify.indentType');
  indentSize = atom.config.get('cssbeautify.indentSize');
  openBrace = atom.config.get('cssbeautify.openBrace');
  autoSemicolon = atom.config.get('cssbeautify.autoSemicolon');

  atom.config.observe('cssbeautify.beautifyOnSave', value => beautifyOnSave = value);
  atom.config.observe('cssbeautify.indentType', value => indentType = value);
  atom.config.observe('cssbeautify.indentSize', value => indentSize = value);
  atom.config.observe('cssbeautify.openBrace', value => openBrace = value);
  atom.config.observe('cssbeautify.autoSemicolon', value => autoSemicolon = value);
}

export function deactivate() {
  editorObserver.dispose();
}
