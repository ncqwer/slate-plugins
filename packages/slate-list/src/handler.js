import isHotKey from 'is-hotkey';

import { Block, Text } from 'slate';
import { ifFlow } from '@zhujianshi/slate-plugin-utils';

export default opt => {
  const { listItemType } = opt;
  const listReg = /^(\s{0,3}((?:\d+\.)|(?:-\s?\[x?\])|-)\s{0,3})\S/;
  const spaceReg = /^\s*$/;
  const isSpace = isHotKey('space');
  const isModEnter = isHotKey('mod+enter');
  const isEnter = isHotKey('enter');
  const isTab = isHotKey('tab');
  const isBackspace = isHotKey('backspace');
  return {
    onKeyDown(event, editor, next) {
      return ifFlow(
        [isSpace, handleSpace],
        [isModEnter, handleModEnter],
        [isEnter, handleEnter],
        [isTab, handleTab],
        [isBackspace, handleBackspace],
        [() => true, next],
      )(event, editor, next);
    },
  };

  function handleSpace(event, editor, next) {
    const { startBlock, startText } = editor.value;
    if (startBlock.type !== 'paragraph') return next();
    const text = startBlock.text;
    const match = listReg.exec(text);
    if (!match) return next();
    event.preventDefault();
    const [, markText] = match;
    return editor.removeTextByKey(startText.key, 0, markText.length).wrapListItem(match[2]);
    // return editor.removeTextByKey(startText.key, 0, markText.length).wrapBlock(listItemType);
  }

  function handleModEnter(event, editor, next) {
    const { startBlock, document } = editor.value;
    const listItem = document.getClosest(startBlock.key, block => block.type === listItemType);
    if (!listItem) return next();
    event.preventDefault();
    const parentList = document.getParent(listItem.key);
    const idx = parentList.nodes.indexOf(listItem);
    const listParent = document.getParent(parentList.key);
    const listIdx = listParent.nodes.indexOf(parentList);
    const newParagraph = Block.create({
      type: 'paragraph',
      nodes: [Text.create(' ')],
    });
    return editor
      .splitNodeByKey(parentList.key, idx + 1)
      .insertNodeByKey(listParent.key, listIdx + 1, newParagraph)
      .moveToEndOfNode(listItem)
      .moveForward(1);
  }

  function handleEnter(event, editor, next) {
    const { startBlock, document } = editor.value;
    const listItem = document.getClosest(startBlock.key, block => block.type === listItemType);
    if (!listItem) return next();
    event.preventDefault();
    const parentList = document.getParent(listItem.key);
    const idx = parentList.nodes.indexOf(listItem);
    const newListItem = Block.create({
      type: listItemType,
      object: 'block',
      nodes: [
        Block.create({
          type: 'paragraph',
          object: 'block',
          nodes: [Text.create('')],
        }),
      ],
      data: listItem.data,
    });
    return editor
      .insertNodeByKey(parentList.key, idx + 1, newListItem)
      .moveToEndOfNode(listItem)
      .moveForward(1);
  }

  function handleTab(event, editor, next) {
    const { startBlock, document, startText } = editor.value;
    if (startBlock.type !== 'paragraph') return next();
    const text = startText.text;
    if (!spaceReg.test(text)) return next();
    const listItem = document.getParent(startBlock.key);
    if (!listItem || listItem.type !== listItemType) return next();
    event.preventDefault();
    return editor.removeTextByKey(startText.key, 0, text.length).wrapBlock({
      type: listItemType,
      data: listItem.data,
    });
  }

  function handleBackspace(event, editor, next) {
    const { startBlock, document, selection } = editor.value;
    if (!selection.isCollapsed || selection.focus.offset !== 0) return next();
    if (startBlock.type !== 'paragraph') return next();
    const listItem = document.getParent(startBlock.key);
    if (!listItem || listItem.type !== listItemType) return next();
    const parentList = document.getParent(listItem.key);
    if (listItem.nodes.first() !== startBlock) return next();
    event.preventDefault();
    const idx = parentList.nodes.indexOf(listItem);
    const listParent = document.getParent(parentList.key);
    const listIdx = listParent.nodes.indexOf(parentList);
    return editor.withoutNormalizing(() => {
      editor.splitNodeByKey(parentList.key, idx + 1);
      return listItem.nodes.forEach((childNode, i) => {
        return editor.moveNodeByKey(childNode.key, listParent.key, listIdx + 1 + i);
      });
    });
  }
};
