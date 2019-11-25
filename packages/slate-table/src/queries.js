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
      //　FIX: 解决编辑器失焦时，startBlock可能为null导致后续查询报错的问题
      if (!startBlock) return [];
      return editor.getTablePositionByKey(startBlock.key);
    },
  };
};
