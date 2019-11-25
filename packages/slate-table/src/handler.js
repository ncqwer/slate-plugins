import isHotKey from 'is-hotkey';
import { Text } from 'slate';
import { ifFlow } from '@zhujianshi/slate-plugin-utils';

export default opt => {
  const tableReg = /^(?:\|\s*(\S+)\s*)+\|$/;
  const alwaysTrue = () => true;
  const isModE = isHotKey('mod+e');
  const isEnter = isHotKey('enter');
  const isShiftEnter = isHotKey('shift+enter');
  const isOutCellBlock = (event, editor, next) => {
    const [, , cellBlock] = editor.getTablePosition();
    if (!cellBlock) return true;
    return false;
  };
  const isEnterWhenOutCellBlock = (...args) => isOutCellBlock(...args) && isEnter(...args);
  const isTab = isHotKey('tab');
  return {
    onKeyDown(event, editor, next) {
      return ifFlow(
        [isModE, handleModE],
        [isEnterWhenOutCellBlock, handleModE],
        [isOutCellBlock, next],
        [isShiftEnter, handleShiftEnter],
        [isTab, handleTab],
        [alwaysTrue, defaultHander],
      )(event, editor, next);
    },
  };

  function defaultHander(event, editor, next) {
    return next();
  }

  // function seeSomething(event, editor, next) {
  //   /* eslint-disable*/
  //   console.group('let me see');
  //   const { startBlock, startText, document } = editor.value;
  //   event.preventDefault();
  //   console.log(
  //     'filterDescendants====>',
  //     startBlock.filterDescendants(() => true),
  //   );
  //   console.log('hhhhh');
  //   console.log('getAncestors====>', document.getAncestors(startBlock.key));
  //   console.log('getParent====>', document.getParent(startBlock.key));
  //   console.log('getPath====>', document.getPath(startBlock.key));
  //   console.log('(another)getPath====>', startBlock.getPath(startText.key));
  //   console.log('getBlocks====>', startBlock.getBlocks());
  //   console.log('getBlocksByType====>', document.getBlocksByType('paragraph'));
  //   console.log('getChild====>', document.getChild(startBlock.key));
  //   console.log(
  //     'getClosest====>',
  //     document.getClosest(startBlock.key, () => true),
  //   );
  //   console.log('getClosestBlock====>', document.getClosestBlock(startBlock.key));
  //   console.log('getClosestInline====>', document.getClosestInline(startText.key));
  //   // console.log('getClosestVoid====>', document.getClosestVoid(startBlock.key));
  //   console.log('getCommonAncestor====>', document.getCommonAncestor(startBlock.key));
  //   console.log('getDepth====>', document.getDepth(startText.key));
  //   console.log('getFurthest====>', document.getFurthest(startText.key, alwaysTrue));
  //   console.log('getFurthestAncestor====>', document.getFurthestAncestor(startText.key));
  //   console.log('getFurthestBlock====>', document.getFurthestBlock(startText.key));
  //   console.groupEnd();
  //   // return editor.insertTable();
  // }

  function handleModE(event, editor, next) {
    const { startBlock, document } = editor.value;
    if (startBlock.type !== 'paragraph') return next();
    if (!document.nodes.includes(startBlock)) return next();
    const text = startBlock.text;
    const result = tableReg.exec(text);
    if (!result) return next();
    event.preventDefault();
    const heads = result[1].replace(/\s/, '').split('|');
    return editor
      .insertTable(1, heads.length, () => col => {
        return {
          nodes: [Text.create(heads[col])],
        };
      })
      .removeNodeByKey(startBlock.key);
  }

  function handleShiftEnter(event, editor, next) {
    event.preventDefault();
    const [tableBlock] = editor.getTablePosition();
    return editor.insertParagraphAfterNode(tableBlock);
  }

  function handleTab(event, editor, next) {
    event.preventDefault();
    const pos = editor.getTablePosition();
    const [tableBlock, rowBlock, cellBlock] = pos;
    const rows = tableBlock.nodes.indexOf(rowBlock);
    const cols = rowBlock.nodes.indexOf(cellBlock);
    const isNextRow = rowBlock.nodes.size === cols + 1;
    const isLastRow = tableBlock.nodes.size === rows + 1;
    if (isNextRow && isLastRow)
      return editor
        .insertRowAfterAtPosition(pos)
        .moveToEndOfNode(cellBlock)
        .moveForward(1);
    if (isNextRow) {
      const nextRowBlock = tableBlock.nodes.get(rows + 1);
      return editor.moveToStartOfNode(nextRowBlock).focus();
    } else {
      const nextCellBlock = rowBlock.nodes.get(cols + 1);
      return editor.moveToStartOfNode(nextCellBlock).focus();
    }
  }
};
