export default opt => {
  const { tableType, rowType, cellType } = opt;
  return {
    getTableByKey(editor, key) {
      return editor.value.document.getClosest(key, block => block.type === tableType);
    },
    getRowByKey(editor, key) {
      return editor.value.document.getClosest(key, block => block.type === rowType);
    },
    getCellByKey(editor, key) {
      return editor.value.document.getClosest(key, block => block.type === cellType);
    },
    getTablePositionByKey(editor, key) {
      const cellBlock = editor.getCellByKey(key);
      const tableBlock = editor.getTableByKey(key);
      const rowBlock = editor.getRowByKey(key);
      return [tableBlock, rowBlock, cellBlock];
    },
    getTablePosition(editor) {
      const { startBlock } = editor.value;
      return editor.getTablePositionByKey(startBlock.key);
    },
  };
};
