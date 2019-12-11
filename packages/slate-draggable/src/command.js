export default opt => {
  return {
    moveNodeBeforeAnotherNode(editor, node, anotherNode) {
      const parentBlock = editor.value.document.getParent(anotherNode.key);
      const offset = parentBlock.nodes.indexOf(anotherNode);
      return editor.moveNodeByKey(node.key, parentBlock.key, offset);
    },
  };
};
