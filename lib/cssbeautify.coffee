'use strict';

fs          = require('fs')
path        = require('path')
CSSBeautify = require('cssbeautify')

module.exports =

  config:
    executeOnSave:
      title: 'Execute on save'
      description: 'Execute Beautifying CSS on save.'
      type: 'boolean'
      default: false
    indentType:
      title: 'Indent Type'
      type: 'string'
      default: 'space'
      enum: ['space', 'tab']
    indentSize:
      title: 'Indent Size'
      type: 'number'
      default: 2

  activate: (state) ->
    atom.commands.add 'atom-workspace', 'cssbeautify:execute', () => @execute()
    @editorObserver = atom.workspace.observeTextEditors (editor) =>
      editor.getBuffer().onWillSave () =>
        if (@isExecuteOnSave())
          @execute()

  deactivate: ->
    @editorObserver.dispose()

  isExecuteOnSave: ->
    atom.config.get('atom-cssbeautify.executeOnSave')

  indentType: ->
    atom.config.get('atom-cssbeautify.indentType')

  indentSize: ->
    atom.config.get('atom-cssbeautify.indentSize')

  execute: ->
    editor = atom.workspace.getActiveTextEditor()
    console.log(1000)
    return unless editor isnt no

    grammarName = editor.getGrammar().name.toLowerCase()
    isCSS  = grammarName is 'css'
    isHTML = grammarName is 'html'

    text = editor.getText()
    selected = editor.getSelectedText()
    indent = ''
    if @indentType() is 'space' then indent = Array(@indentSize() + 1).join(' ')
    if @indentType() is 'tab'   then indent = '\t'

    console.log(CSSBeautify(text, { indent: indent }))

    if selected.length isnt 0
      try
        editor.setTextInBufferRange(
          editor.getSelectedBufferRange(),
          CSSBeautify(selected, { indent: indent })
        )
      catch e
        console.log(e)
    else
      try
        editor.setText(
          CSSBeautify(text, { indent: indent })
        )
      catch e
        console.log(e)
