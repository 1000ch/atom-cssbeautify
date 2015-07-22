"use babel";

import fs          from 'fs';
import path        from 'path';
import CSSBeautify from 'cssbeautify';

export let config = {
  executeOnSave: {
    title: 'Execute on save',
    description: 'Execute Beautifying CSS on save.',
    type: 'boolean',
    default: false
  },
  indentType: {
    title: 'Indent Type',
    type: 'string',
    default: 'space',
    enum: ['space', 'tab']
  },
  indentSize: {
    title: 'Indent Size',
    type: 'number',
    default: 2
  }
};

const isExecuteOnSave = () => atom.config.get('cssbeautify.executeOnSave');
const indentType      = () => atom.config.get('cssbeautify.indentType')
const indentSize      = () => atom.config.get('cssbeautify.indentSize')

const execute = () => {

  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let text = editor.getText();
  let selectedText = editor.getSelectedText();

  let indent = '';
  switch (indentType()) {
    case 'space':
      indent = Array(indentSize() + 1).join(' ');
      break;
    case 'tab':
      indent = '\t';
      break;
  }

  if (selectedText.length !== 0) {
    try {
      editor.setTextInBufferRange(
        editor.getSelectedBufferRange(),
        CSSBeautify(selectedText, {
          indent: indent
        })
      );
    } catch (e) {}
  } else {
    try {
      editor.setText(
        CSSBeautify(text, {
          indent: indent
        })
      )
    } catch (e) {}
  }
};

let editorObserver = null;

export const activate = (state) => {
  atom.commands.add('atom-workspace', 'cssbeautify:execute', () => {
    execute();
  });
  editorObserver = atom.workspace.observeTextEditors((editor) => {
    editor.getBuffer().onWillSave(() => {
      if (isExecuteOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
