import isHotKey from 'is-hotkey';

const ifFlow = (...conditionActions) => (...args) => {
  for (const [condtion, action] of conditionActions) {
    if (condtion(...args)) return action(...args);
  }
};

export default opt => {
  const alwaysTrue = () => true;
  const isShiftTab = isHotKey('shift+tab');
  return {
    onKeyDown(event, editor, next) {
      return ifFlow(
        [isShiftTab, handleShiftTab],

        [alwaysTrue, defaultHander],
      )(event, editor, next);
    },
  };

  function defaultHander(event, editor, next) {
    return next();
  }

  function seeSomething(event, editor, next) {
    /* eslint-disable*/
    console.group('let me see');
    const { startBlock, startText, document } = editor.value;
    event.preventDefault();
    console.log(
      'filterDescendants====>',
      startBlock.filterDescendants(() => true),
    );
    console.log('getAncestors====>', document.getAncestors(startBlock.key));
    console.log('getParent====>', document.getParent(startBlock.key));
    console.log('getPath====>', document.getPath(startBlock.key));
    console.log('(another)getPath====>', startBlock.getPath(startText.key));
    console.log('getBlocks====>', startBlock.getBlocks());
    console.log('getBlocksByType====>', document.getBlocksByType('paragraph'));
    console.log('getChild====>', document.getChild(startBlock.key));
    console.log(
      'getClosest====>',
      document.getClosest(startBlock.key, () => true),
    );
    console.log('getClosestBlock====>', document.getClosestBlock(startBlock.key));
    console.log('getClosestInline====>', document.getClosestInline(startText.key));
    // console.log('getClosestVoid====>', document.getClosestVoid(startBlock.key));
    console.log('getCommonAncestor====>', document.getCommonAncestor(startBlock.key));
    console.log('getDepth====>', document.getDepth(startText.key));
    console.log('getFurthest====>', document.getFurthest(startText.key, alwaysTrue));
    console.log('getFurthestAncestor====>', document.getFurthestAncestor(startText.key));
    console.log('getFurthestBlock====>', document.getFurthestBlock(startText.key));
    console.groupEnd();
    // return editor.insertTable();
  }

  function handleShiftTab(event, editor, next) {
    return editor.insertTable(3, 3);
  }
};
