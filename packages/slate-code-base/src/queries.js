import detectIntent from 'detect-indent';

export default option => {
  const tabSpace = ' '.repeat(option.tabLength);
  return {
    getClosestCodeBlockByKey(editor, key) {
      const { document } = editor.value;
      return document.getClosest(key, block => block.type === option.codeType);
    },

    getClosestCodeBlock(editor) {
      const { startBlock } = editor.value;
      return editor.getClosestCodeBlockByKey(startBlock.key);
    },

    getCodeLineIndentByNode(editor, codeLineBlock) {
      const text = codeLineBlock.text;
      return detectIntent(text).indent.replace('/t', tabSpace);
    },

    getPrevCodeLineIndentByBlock(editor, block) {
      const { document } = editor.value;
      const parentBlock = document.getParent(block.key);
      return parentBlock.nodes
        .takeUntil(child => child.key === block.key)
        .map(child => editor.getCodeLineIndentByNode(child));
    },

    getFocusCharWhenCollapsed(editor) {
      const { startText, selection } = editor.value;
      if (!selection.isCollapsed) return [false];
      const text = startText.text;
      return [true, text[selection.focus.offset - 1], text[selection.focus.offset]];
    },

    getStartAndEndPointAtRange(editor, range) {
      const isForward = range.isForward;
      const startPoint = isForward ? range.anchor : range.focus;
      const endPoint = isForward ? range.focus : range.anchor;
      return [startPoint, endPoint];
    },
  };
};
