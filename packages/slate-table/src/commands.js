import { Block, Text } from 'slate';
import { Range } from 'immutable';

export default opt => {
  const { tableType, rowType, contentType, cellType } = opt;
  const createTable = (
    rows,
    cols,
    contentGetXY = () => () => ({
      nodes: [Text.create('hello world')],
    }),
  ) =>
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
  const createCell = ({ data, ...content }) =>
    Block.create({
      type: cellType,
      data,
      nodes: [
        Block.create({
          type: contentType,
          ...content,
        }),
      ],
    });
  return {
    insertTable(editor, ...args) {
      const { startBlock } = editor.value;
      return editor.insertTableByKey(startBlock.key, ...args).focus();
    },
    insertTableByKey(editor, key, ...args) {
      const { document } = editor.value;
      const topBlock = document.getFurthestAncestor(key);
      const offset = document.nodes.indexOf(topBlock);
      const newTableBlock = createTable(...args);
      return editor
        .insertNodeByKey(document.key, offset + 1, newTableBlock)
        .moveToEndOfNode(newTableBlock);
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
      const contentGen = col => {
        const cellBlock = rowBlock.nodes.get(col);
        return {
          data: cellBlock.data,
        };
      };
      const newRow = createRow(rowBlock.nodes.size, contentGen);
      return editor.insertNodeByKey(tableBlock.key, rows, newRow);
    },
    insertRowAfterAtPosition(editor, pos) {
      const [tableBlock, rowBlock] = pos;
      const rows = tableBlock.nodes.indexOf(rowBlock);
      const contentGen = col => {
        const cellBlock = rowBlock.nodes.get(col);
        return {
          data: cellBlock.data,
        };
      };
      const newRow = createRow(rowBlock.nodes.size, contentGen);
      return editor.insertNodeByKey(tableBlock.key, rows + 1, newRow);
    },
    insertColumnAfter(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      editor.insertColumnAfterAtPosition(pos);
      const focusBlockKey = editor.value.document.getNode(selection.focus.path).key;
      const newPoint = selection.focus.setKey(focusBlockKey);
      const newRange = selection.setStart(newPoint).setEnd(newPoint);
      return editor.select(newRange).focus();
    },
    insertColumnBefore(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      editor.insertColumnBeforeAtPosition(pos);
      const focusBlockKey = editor.value.document.getNode(selection.focus.path).key;
      const newPoint = selection.focus.setKey(focusBlockKey);
      const newRange = selection.setStart(newPoint).setEnd(newPoint);
      return editor.select(newRange).focus();
    },
    insertRowAfter(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      editor.insertRowAfterAtPosition(pos);
      const focusBlockKey = editor.value.document.getNode(selection.focus.path).key;
      const newPoint = selection.focus.setKey(focusBlockKey);
      const newRange = selection.setStart(newPoint).setEnd(newPoint);
      return editor.select(newRange).focus();
    },
    insertRowBefore(editor) {
      const { selection } = editor.value;
      const pos = editor.getTablePosition();
      editor.insertRowBeforeAtPosition(pos);
      const focusBlockKey = editor.value.document.getNode(selection.focus.path).key;
      const newPoint = selection.focus.setKey(focusBlockKey);
      const newRange = selection.setStart(newPoint).setEnd(newPoint);
      return editor.select(newRange).focus();
    },
    removeRowAtPos(editor, pos) {
      const [, rowBlock] = pos;
      return editor.removeNodeByKey(rowBlock.key);
    },
    removeColumnAtPos(editor, pos) {
      const [tableBlock, rowBlock, cellBlock] = pos;
      const cols = rowBlock.nodes.indexOf(cellBlock);
      return editor.withoutNormalizing(() => {
        tableBlock.nodes.forEach(row => {
          const target = row.nodes.get(cols);
          return editor.removeNodeByKey(target.key);
        });
      });
    },
    removeColumn(editor) {
      const pos = editor.getTablePosition();
      const [, rowBlock, cellBlock] = pos;
      if (rowBlock.nodes.size === 1) return editor.removeColumnAtPos(pos);
      const cols = rowBlock.nodes.indexOf(cellBlock);
      const newCol = cols === 0 ? cols + 1 : cols - 1;
      const newSelectedCell = rowBlock.nodes.get(newCol);
      return editor
        .removeColumnAtPos(pos)
        .moveToStartOfNode(newSelectedCell)
        .focus();
    },
    removeRow(editor) {
      const pos = editor.getTablePosition();
      const [tableBlock, rowBlock, cellBlock] = pos;
      if (tableBlock.nodes.size === 1) return editor.removeColumnAtPos(pos);
      const rows = tableBlock.nodes.indexOf(rowBlock);
      const cols = rowBlock.nodes.indexOf(cellBlock);
      const newRows = rows === 0 ? rows + 1 : rows - 1;
      const newSelectedCell = tableBlock.nodes.get(newRows).nodes.get(cols);
      return editor
        .removeRowAtPos(pos)
        .moveToStartOfNode(newSelectedCell)
        .focus();
    },
    alignColumnTextAtPosition(editor, pos, value) {
      const [tableBlock, rowBlock, cellBlock] = pos;
      const cols = rowBlock.nodes.indexOf(cellBlock);
      return editor.withoutNormalizing(() => {
        tableBlock.nodes.forEach(row => {
          const target = row.nodes.get(cols);
          const targetData = target.data;
          const newData = targetData.set('text-align', `table-cell--align-${value}`);
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
