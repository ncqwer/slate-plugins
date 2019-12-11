export default opt => {
  const { listType, listItemType } = opt;
  return {
    blocks: {
      [listType]: {
        object: 'block',
        nodes: [{ match: { object: 'block', type: listItemType } }],
      },
      [listItemType]: {
        object: 'block',
        nodes: [{ match: { object: 'block' } }],
        parent: { type: listType },
        normalize: normalizeListItem,
      },
    },
  };

  function normalizeListItem(editor, error) {
    const { code, node } = error;
    if (code === 'parent_type_invalid') return editor.wrapBlockByKey(node.key, listType);
  }
};
