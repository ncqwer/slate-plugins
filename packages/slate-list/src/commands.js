export default opt => {
  const { listItemType } = opt;
  const orderListReg = /^(\d+).$/;
  const unorderListReg = /^-$/;
  const taskListReg = /^-\s?\[(x)?\]$/;
  return {
    wrapListItem(editor, typeFlag) {
      let match = null;
      if ((match = taskListReg.exec(typeFlag))) {
        return editor.wrapBlock({
          type: listItemType,
          data: {
            checked: !!match[1],
            modifier: 'task',
          },
        });
      }
      if ((match = orderListReg.exec(typeFlag)))
        return editor.wrapBlock({
          type: listItemType,
          data: {
            startIdx: match[1],
            modifier: 'order',
          },
        });
      if (unorderListReg.test(typeFlag))
        return editor.wrapBlock({
          type: listItemType,
          data: {
            checked: false,
            modifier: 'unorder',
          },
        });
    },
  };
};
