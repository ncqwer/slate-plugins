export default opt => {
  const tableType = opt.tableType;
  const rowType = opt.rowType;
  const cellType = opt.cellType;
  const contentType = opt.contentType;

  return {
    blocks: {
      [tableType]: {
        nodes: [
          {
            match: { object: 'block', type: rowType },
            min: 1,
          },
        ],
        normalize: tableNormalize,
      },
      [rowType]: {
        parent: { type: tableType },
        nodes: [{ match: { object: 'block', type: cellType }, min: 1 }],
        normalize: rowNormalize,
      },
      [cellType]: {
        parent: { type: rowType },
        nodes: [{ match: { object: 'block' }, min: 1 }],
        normalize: cellNormalize,
      },
    },
  };

  function tableNormalize(editor, error) {
    const { code, node, index } = error;
    if (code === 'child_min_invalid')
      return editor.insertNodeByKey(node.key, index, { object: 'block', type: rowType });
    if (code === 'child_type_invalid') {
      return editor.removeNodeByKey(error.child.key);
    }
    if (code === 'child_object_invalid') {
      return editor.removeNodeByKey(error.child.key);
    }
  }
  function rowNormalize(editor, error) {
    const { code, node, index } = error;
    if (code === 'child_min_invalid')
      return editor.insertNodeByKey(node.key, index, { object: 'block', type: rowType });
    if (code === 'child_object_invalid') return editor.removeNodeByKey(error.child.key);
    if (code === 'child_type_invalid') return editor.removeNodeByKey(error.child.key);
    if (code === 'parent_type_invalid') return editor.wrapBlockByKey(node.key, tableType);
  }
  function cellNormalize(editor, error) {
    const { code, node, index } = error;
    if (code === 'child_min_invalid')
      return editor.insertNodeByKey(node.key, index, { object: 'block', type: contentType });
    if (code === 'child_object_invalid') return editor.removeNodeByKey(error.child.key);
    if (code === 'child_type_invalid') return editor.removeNodeByKey(error.child.key);
    if (code === 'parent_type_invalid') return editor.wrapBlockByKey(node.key, rowType);
  }
};
