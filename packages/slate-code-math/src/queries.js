export default option => {
  return {
    getClosestMathBlockByKey(editor, key) {
      const { document } = editor.value;
      return document.getClosest(key, block => block.type === 'math');
    },

    getClosestMathBlock(editor) {
      const { startBlock } = editor.value;
      return editor.getClosestMathBlockByKey(startBlock.key);
    },
  };
};
