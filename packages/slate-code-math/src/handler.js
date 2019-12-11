import isHotKey from 'is-hotkey';

import { ifFlow, Condition } from '@zhujianshi/slate-plugin-utils';

export default () => {
  const isSpace = isHotKey('space');
  const isEnter = isHotKey('enter');
  const isModE = isHotKey('mod+e');
  const MathBlockRegex = /^\$\$(\s)*$/;
  return {
    onKeyDown(event, editor, next) {
      return ifFlow([Condition.or(isSpace, isEnter, isModE), handleSpace], [() => true, next])(
        event,
        editor,
        next,
      );
    },
  };
  function handleSpace(event, editor, next) {
    const startBlock = editor.value.startBlock;
    const text = startBlock.text;
    if (MathBlockRegex.test(text) && startBlock.type === 'paragraph') {
      return editor.insertMathBlock().removeNodeByKey(startBlock.key);
    }
    return next();
  }
};
