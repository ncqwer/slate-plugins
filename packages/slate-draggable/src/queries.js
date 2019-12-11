export default opt => {
  return {
    isTopBlock(editor, block) {
      return editor.value.document.nodes.includes(block);
    },
  };
};
