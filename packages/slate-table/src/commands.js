import { Block, Text } from 'slate';
import { Range } from 'immutable';

export default opt => {
  const { tableType, rowType, contentType, cellType } = opt;
  const createTable = (rows, cols, contentGetXY = () => () => 'hello world') =>
    Block.create({
      type: tableType,
      object: 'block',
      nodes: Range(0, rows)
        .map(i => createRow(cols, contentGetXY(i)))
        .toList(),
    });
  const createRow = (cols, contentGetY) =>
    Block.create({
      type: rowType,
      object: 'block',
      nodes: Range(0, cols)
        .map(i => createCell(contentGetY(i)))
        .toList(),
    });
  const createCell = text =>
    Block.create({
      type: cellType,
      nodes: [
        Block.create({
          type: contentType,
          nodes: [Text.create({ text })],
        }),
      ],
    });
  return {
    insertTable(editor, ...args) {
      const { startBlock } = editor.value;
      return editor.insertTableByKey(startBlock.key, ...args);
    },
    insertTableByKey(editor, key, ...args) {
      const { document } = editor.value;
      const topBlock = document.getFurthestAncestor(key);
      const offset = document.nodes.indexOf(topBlock);
      const newTableBlock = createTable(...args);
      return editor.insertNodeByKey(document.key, offset + 1, newTableBlock);
    },
    insertColumnBeforeAtPosition(editor, pos) {
      const [tableBlock, rowBlock, cellBlock] = pos;
      const cols = rowBlock.nodes.indexOf(cellBlock);
      if (!~cols) throw new Error('invalid table position');
      return editor.withoutNormalizing(() => {
        tableBlock.nodes.forEach(row => {
          const newCell = createCell('');
          editor.insertNodeByKey(row.key, cols, newCell);
        });
      });
    },
    insertColumnAfterAtPosition(editor, pos) {
      const [tableBlock, rowBlock, cellBlock] = pos;
      const cols = rowBlock.nodes.indexOf(cellBlock);
      if (!~cols) throw new Error('invalid table position');
      return editor.withoutNormalizing(() => {
        tableBlock.nodes.forEach(row => {
          const newCell = createCell('');
          editor.insertNodeByKey(row.key, cols + 1, newCell);
        });
      });
    },
    insertRowBeforeAtPosition(editor, pos) {
      const [tableBlock, rowBlock] = pos;
      const rows = tableBlock.nodes.indexOf(rowBlock);
      const newRow = createRow(rowBlock.nodes.size, () => '');
      return editor.insertNodeByKey(tableBlock.key, rows, newRow);
    },
    insertRowAfterAtPosition(editor, pos) {
      const [tableBlock, rowBlock] = pos;
      const rows = tableBlock.nodes.indexOf(rowBlock);
      const newRow = createRow(rowBlock.nodes.size, () => '');
      return editor.insertNodeByKey(tableBlock.key, rows + 1, newRow);
    },
    insertColumnAfter(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      return editor
        .insertColumnAfterAtPosition(pos)
        .select(selection)
        .focus();
    },
    insertColumnBefore(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      return editor
        .insertColumnBeforeAtPosition(pos)
        .select(selection)
        .focus();
    },
    insertRowAfter(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      return editor
        .insertRowAfterAtPosition(pos)
        .select(selection)
        .focus();
    },
    insertRowBefore(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      return editor
        .insertRowBeforeAtPosition(pos)
        .select(selection)
        .focus();
    },
    alignColumnTextAtPosition(editor, pos, value) {
      const [tableBlock, rowBlock, cellBlock] = pos;
      const cols = rowBlock.nodes.indexOf(cellBlock);
      return editor.withoutNormalizing(() => {
        tableBlock.nodes.forEach(row => {
          const target = row.nodes.get(cols);
          const targetData = target.data;
          const newData = targetData.set('text-align', `table-cell-align-${value}`);
          return editor.setNodeByKey(target.key, { data: newData });
        });
      });
    },
    alignColumnText(editor, value) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      return editor
        .alignColumnTextAtPosition(pos, value)
        .select(selection)
        .focus();
    },
  };
};
