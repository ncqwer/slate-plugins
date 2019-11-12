import React from 'react';
import { KatexBlock } from './block';
import commands from './commands';
import queries from './queries';

const MathBlockRegex = /^\$\$(\s)+$/;

const createMathPlugin = opt => {
  const schema = {
    blocks: {
      math: {
        nodes: [{ match: { type: 'code' } }],
        normalize,
      },
    },
  };
  return {
    commands: commands(opt),
    queries: queries(opt),
    schema,
    renderBlock,
    onKeyDown,
    renderInline,
  };
  function renderBlock(props, editor, next) {
    const { node } = props;
    switch (node.type) {
      case 'math':
        return <KatexBlock {...props} />;
      default:
        return next();
    }
  }
  function onKeyDown(event, editor, next) {
    switch (event.key) {
      case 'Enter':
        return setMathBlock(editor, next);
      default:
        return next();
    }
  }
  function renderInline(props, editor, next) {
    return next();
  }
  function normalize(editor, error) {
    if (error.code === 'child_type_invalid') {
      const { node, child } = error;
      /* eslint-disable no-console*/
      console.log(node);
      console.log(child);
      if (child.type === 'paragraph') return editor.moveNodeAfterAnotherNode(child, node);
    }
  }
  // helper function
  function setMathBlock(editor, next) {
    const startBlock = editor.value.startBlock;
    const text = startBlock.text;
    if (MathBlockRegex.test(text) && startBlock.type === 'paragraph') {
      return editor.insertMathBlock().removeNodeByKey(startBlock.key);
    }
    return next();
  }
};

export default createMathPlugin;
