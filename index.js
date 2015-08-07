"use babel";

import fs          from 'fs';
import path        from 'path';
import CSSBeautify from 'cssbeautify';

export let config = {
  beautifyOnSave: {
    title: 'Beautify on Save',
    description: 'Execute beautifying CSS on save.',
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
  },
  openBrace: {
    title: 'Open Brace',
    description: 'defines the placement of open curly brace.',
    type: 'string',
    default: 'end-of-line',
    enum: ['end-of-line', 'separate-line']
  },
  autoSemicolon: {
    title: 'Auto Semicolon',
    description: 'always inserts a semicolon after the last ruleset.',
    type: 'boolean',
    default: false
  }
};

const beautifyOnSave = () => atom.config.get('cssbeautify.beautifyOnSave');
const indentType     = () => atom.config.get('cssbeautify.indentType')
const indentSize     = () => atom.config.get('cssbeautify.indentSize')
const openBrace      = () => atom.config.get('cssbeautify.openBrace')
const autoSemicolon  = () => atom.config.get('cssbeautify.autoSemicolon')

const getIndent = () => {

  let indent = '';
  switch (indentType()) {
    case 'space':
      indent = Array(indentSize() + 1).join(' ');
      break;
    case 'tab':
      indent = '\t';
      break;
  }
  return indent;
};

const execute = () => {

  const editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  let text = editor.getText();
  let selectedText = editor.getSelectedText();

  if (selectedText.length !== 0) {
    try {
      editor.setTextInBufferRange(
        editor.getSelectedBufferRange(),
        CSSBeautify(selectedText, {
          indent: getIndent(),
          openbrace: openBrace(),
          autosemicolon: autoSemicolon()
        })
      );
    } catch (e) {}
  } else {
    try {
      editor.setText(
        CSSBeautify(text, {
          indent: getIndent(),
          openbrace: openBrace(),
          autosemicolon: autoSemicolon()
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
      if (beautifyOnSave()) {
        execute();
      }
    });
  });
};

export const deactivate = () => {
  editorObserver.dispose();
};
