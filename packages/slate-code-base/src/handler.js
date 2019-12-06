import isHotKey from 'is-hotkey';
import detectIntent from 'detect-indent';
import { Range, Editor, Node, Path } from 'slate';
import { ifFlow, compose } from '@zhujianshi/slate-plugin-utils';

import { CODE_LINE_TYPE, CODE_TYPE, MARK_TYPE } from './constants';

import { Code } from './index';

const AVALIABLE_LANGUAGES = {
  javascript: ['js', 'javascript', 'jsx'],
  css: ['css'],
  markup: ['markup'],
  latex: ['latex', 'tex'],
  c: ['c'],
  cpp: ['c++', 'cpp'],
  html: ['html'],
  php: ['php'],
  haskell: ['haskell', 'hs'],
};

const AVALIABLE_LANGUAGES_MAP = Object.keys(AVALIABLE_LANGUAGES).reduce((outAcc, languageType) => {
  const alaisTypes = AVALIABLE_LANGUAGES[languageType];
  return alaisTypes.reduce(
    (innerAcc, alias) => ({
      ...innerAcc,
      [alias]: languageType,
    }),
    outAcc,
  );
}, {});

const getSingleWordBias = (text, rule, offset = 0) => {
  let startBias = 0;
  let startCh = text[offset - startBias];
  let endBias = 0;
  let endCh = text[offset + endBias];
  if (text.length === 0 || !text[offset]) return [0, 0];
  const expected = rule.test(text[offset]);
  const testFunc = ch => rule.test(ch) === expected;
  while (startCh && testFunc(startCh)) {
    ++startBias;
    startCh = text[offset - startBias];
  }
  while (endCh && testFunc(endCh)) {
    ++endBias;
    endCh = text[offset + endBias];
  }
  if (startCh) --startBias;
  if (endCh) --endBias;
  return [startBias, endBias, expected];
};

export default option => {
  const variableChReg = /\w/;
  const codeBlockReg = /^\s{0,3}```([\w\+]*)/;
  const spaceReg = /^\s*$/;
  const braketsStartReg = /[{([`]/;
  const matchedBraketsReg = /(?:\{\})|(?:\[\])|(?:\(\))|(?:``)/;
  const braketsEndReg = /[})\]`]/;
  const isShiftEnter = isHotKey('shift+enter');
  const isModD = isHotKey('mod+d');
  const isModShiftK = isHotKey('mod+shift+k');
  const isEnter = isHotKey('enter');
  const isBackspace = isHotKey('backspace');
  const isModE = isHotKey('mod+e');
  const isTab = isHotKey('tab');
  const isModEnter = isHotKey('mod+enter');
  const isModLeftSquareBrakets = isHotKey('mod+[');
  const isModRightSquareBrakets = isHotKey('mod+]');
  const isModSlash = isHotKey('mod+/');
  const isModShiftUp = isHotKey('mod+shift+up');
  const isModShiftDown = isHotKey('mod+shift+down');
  const isCompensateBrakets = event =>
    braketsStartReg.test(event.key) || braketsEndReg.test(event.key);
  const tabSpace = ' '.repeat(option.tabLength);
  const isOutCodeLineBlock = (event, editor, next) => {
    const [[startBlock], [endBlock]] = Code.edgeBlock(editor);
    return startBlock.type !== CODE_LINE_TYPE || endBlock.type !== CODE_LINE_TYPE;
  };
  const isEnterWhenOutCodeLineBlock = (...args) => isOutCodeLineBlock(...args) && isEnter(...args);
  return {
    onKeyDown(event, editor, next) {
      return ifFlow(
        [isModE, handleModE], // convert to code block
        [isEnterWhenOutCodeLineBlock, handleModE],
        [isOutCodeLineBlock, () => next()],
        [isShiftEnter, handleShiftEnter], // escape the code
        [isEnter, handleEnter],
        [isTab, handleTab],
        [isModD, handleModD],
        [isModEnter, handleModEnter],
        [isBackspace, handleBackspace],
        [isModShiftK, handleModShiftK],
        [isModSlash, handleModSlash],
        [isModShiftUp, handleModShiftUp],
        [isModShiftDown, handleModShiftDown],
        [isModRightSquareBrakets, handleModRightSquareBrakets],
        [isModLeftSquareBrakets, handleModLeftSquareBrakets],
        [isCompensateBrakets, handleCompensateBrakets],
        [() => true, () => next()], // default condition
      )(event, editor, next);
    },
  };

  function handleModE(event, editor, next) {
    const [[startBlock, startBlockPath]] = Code.edgeBlock(editor);
    if (startBlock.type !== 'paragraph') return next(); // only convert paragraph block to code block
    if (!editor.children.includes(startBlock)) return next();
    const text = Node.text(startBlock);
    const res = codeBlockReg.exec(text);
    if (!res) return next();
    event.preventDefault();
    const [matchStr, languageAlias] = res;
    let languageType = AVALIABLE_LANGUAGES_MAP[languageAlias];
    if (!languageType) languageType = 'javascript';
    const remainStr = text.slice(matchStr.length);
    Code.insertCodeBlock(editor, languageType, remainStr);
    return Editor.removeNodes(editor, { at: startBlockPath });
  }

  function handleShiftEnter(event, editor, next) {
    event.preventDefault();
    return Code.exitCodeBlock(editor);
  }

  function handleEnter(event, editor, next) {
    const [[startBlock]] = Code.edgeBlock(editor);
    const text = Node.text(startBlock);
    const indent = detectIntent(text).indent.replace('/t', tabSpace);
    const [isCollapsed, lCh, rCh] = Code.focusCharWhenCollapsed(editor);

    if (isCollapsed) {
      const newIndent = indent + tabSpace;
      const twoCh = [lCh, rCh].join('');
      if (matchedBraketsReg.test(twoCh)) {
        event.preventDefault();
        Editor.splitNodes(editor);
        Editor.insertText(editor, newIndent);
        Editor.splitNodes(editor);
        Editor.insertText(editor, indent);
        return Editor.move(editor, { distance: indent.length + 1, reverse: true });
        // return editor
        //   .splitBlock()
        //   .insertText(indent)
        //   .moveToEndOfNode(startBlock)
        //   .splitBlock()
        //   .insertText(newIndent);
      } else if (braketsStartReg.test(lCh)) {
        event.preventDefault();
        Editor.insertText(editor, newIndent);
        Editor.move(editor, { distance: newIndent.length, reverse: true });
        Editor.splitNodes(editor);
        return Editor.move(editor, { distance: newIndent.length });
      }
    }
    if (indent.length === 0) return;
    event.preventDefault();
    Editor.insertText(editor, indent);
    Editor.move(editor, { distance: indent.length, reverse: true });
    Editor.splitNodes(editor);
    return Editor.move(editor, { distance: indent.length });
  }

  function handleTab(event, editor, next) {
    event.preventDefault();
    return Editor.insertText(editor, tabSpace);
  }

  function handleModD(event, editor, next) {
    const { selection } = editor;
    const [[startBlock]] = Code.edgeBlock(editor);

    if (!Range.isCollapsed(selection)) return next();
    event.preventDefault();
    const offset = selection.focus.offset;
    const text = Node.text(startBlock);
    let [startBias, endBias, expected] = getSingleWordBias(text, variableChReg, offset); // 向后匹配
    if (!expected && startBias === 0) {
      // 尝试向前匹配
      [startBias, endBias] = getSingleWordBias(text, variableChReg, offset - 1); // 向前匹配
      /* eslint-disable no-console*/
      console.log(`向前匹配:start${startBias}:endBias${endBias}`);
      const newRange = Code.moveRange(selection, { start: -(startBias + 1) });
      return Editor.select(editor, newRange);
      // return editor.moveStartBackward(startBias + 1);
    }
    const newRange = Code.moveRange(selection, { start: -startBias, end: endBias + 1 });
    return Editor.select(editor, newRange);
    // return editor.moveStartBackward(startBias).moveEndForward(endBias + 1);
  }

  function handleModEnter(event, editor, next) {
    const [[startBlock, startBlockPath]] = Code.edgeBlock(editor);
    const indent = Code.codeLineIndent(startBlock, tabSpace);
    Editor.select(editor, Editor.end(editor, startBlockPath));
    return Editor.insertNodes(editor, {
      type: CODE_LINE_TYPE,
      children: [{ text: indent, marks: [] }],
    });
  }

  function handleBackspace(event, editor, next) {
    const { selection } = editor;
    const [startPoint] = Range.edges(selection);
    const [[startBlock, startBlockPath]] = Code.edgeBlock(editor);
    const [isCollapsed, lCh, rCh] = Code.focusCharWhenCollapsed(editor);
    const twoCh = [lCh, rCh].join('');
    if (isCollapsed && matchedBraketsReg.test(twoCh)) {
      event.preventDefault();
      Editor.delete(editor, { reverse: true });
      return Editor.delete(editor);
      // return editor
      //   .moveStartBackward(1)
      //   .moveEndForward(1)
      //   .delete();
    }
    const text = Node.text(startBlock);
    if (!spaceReg.test(text)) return next();
    const nowIndent = Code.codeLineIndent(startBlock, tabSpace);
    // const nowIndent = editor.getCodeLineIndentByNode(startBlock);
    const preIndents = Code.prevCodeLineIndent(editor, startBlockPath, tabSpace);
    // const preIndents = editor.getPrevCodeLineIndentByBlock(startBlock);
    const avaliableIndent = preIndents.reverse().find(indent => indent.length < nowIndent.length);
    if (!avaliableIndent && avaliableIndent !== '') return next();
    event.preventDefault();
    console.log(preIndents);
    console.log(`avaliableIndent:${avaliableIndent.length}`);
    return Editor.insertText(editor, avaliableIndent, { at: startPoint.path });
  }

  function handleModShiftK(event, editor, next) {
    event.preventDefault();
    const { selection } = editor;
    const [startPoint, endPoint] = Range.edges(selection);
    const endText = Node.get(editor, endPoint.path);
    // const newRange = {
    //   anchor: {
    //     path: startPoint.path,
    //     offset: 0,
    //   },
    //   focus: {
    //     path: endPoint.path,
    //     offset: endText.text.length - 1,
    //   },
    // };
    const newRange = Code.moveRange(selection, {
      start: -startPoint.offset,
      end: endText.text.length - endPoint.offset,
    });
    return Editor.delete(editor, { at: newRange });
  }

  function handleCompensateBrakets(event, editor, next) {
    const { selection } = editor;
    const [[startBlock]] = Code.edgeBlock(editor);
    let appendText;
    if (event.key === '{') appendText = '}';
    if (event.key === '(') appendText = ')';
    if (event.key === '[') appendText = ']';
    if (event.key === '`') appendText = '`';
    if (Range.isCollapsed(selection)) {
      event.preventDefault();
      if (braketsEndReg.test(event.key)) {
        const offset = selection.anchor.offset;
        const text = Node.text(startBlock);
        if (braketsEndReg.test(text[offset])) {
          // 已经存在不需要插入
          return Editor.move(editor);
        }
        if (event.key !== '`') return Editor.insertText(editor, event.key);
      }

      Editor.insertText(editor, event.key + appendText);
      return Editor.move(editor, { reverse: true });
      // return editor
      //   .insertText(event.key + appendText)
      //   .moveBackward(1)
      //   .focus();
    }
    if (!appendText) return next();
    event.preventDefault();
    return Code.compensateBrackets(editor, event.key, appendText);
    // return editor.compensateBrackets(event.key, appendText);
  }

  function handleModRightSquareBrakets(event, editor, next) {
    const { selection } = editor;
    return Code.addIndent(editor, { at: selection, tabLength: option.tabLength });
    // return editor.addIndentByRange(selection);
  }

  function handleModLeftSquareBrakets(event, editor, next) {
    const { selection } = editor;
    return Code.deleteIndent(editor, { at: selection, tabLength: option.tabLength });
    // return editor.deleteIndentByRange(selection);
  }

  function handleModSlash(event, editor, next) {
    const { selection } = editor;
    event.preventDefault();
    return Code.toggleCommentCodeLine(editor, { at: selection });
  }

  function handleModShiftUp(event, editor, next) {
    event.preventDefault();

    const [[, startBlockPath], [endBlock, endBlockPath]] = Code.edgeBlock(editor);
    const [codeBlock] = Code.closest(editor, startBlockPath);
    // const offset = codeBlock.nodes.indexOf(startBlock);
    if (startBlockPath[startBlockPath.length - 1] === 0) return next();
    // const prev = codeBlock.nodes.get(offset - 1);
    const targetOffset = codeBlock.children.findIndex(x => x === endBlock);
    if (!~targetOffset) return next(); // !~(-1) === true;
    const { selection } = editor;
    const prevPath = Path.previous(startBlockPath);
    console.log(selection);
    Editor.moveNodes(editor, { at: prevPath, to: endBlockPath });
    console.log(selection);
    const parentPrev = compose(Path.previous, Path.parent);
    return Editor.select(editor, {
      anchor: {
        ...selection.anchor,
        path: parentPrev(selection.anchor.path).concat([0]),
      },
      focus: {
        ...selection.focus,
        path: parentPrev(selection.focus.path).concat([0]),
      },
    });
  }
  function handleModShiftDown(event, editor, next) {
    event.preventDefault();

    const [[startBlock, startBlockPath], [, endBlockPath]] = Code.edgeBlock(editor);
    const [codeBlock] = Code.closest(editor, endBlockPath);
    // const offset = codeBlock.nodes.indexOf(startBlock);
    if (endBlockPath[endBlockPath.length - 1] === codeBlock.children.length - 1) return next();
    // const prev = codeBlock.nodes.get(offset - 1);
    const targetOffset = codeBlock.children.findIndex(x => x === startBlock);
    if (!~targetOffset) return next(); // !~(-1) === true;
    const { selection } = editor;
    const nextPath = Path.next(endBlockPath);
    console.log(selection);
    Editor.moveNodes(editor, { at: nextPath, to: startBlockPath });
    console.log(selection);
    const parentNext = compose(Path.next, Path.parent);
    return Editor.select(editor, {
      anchor: {
        ...selection.anchor,
        path: parentNext(selection.anchor.path).concat([0]),
      },
      focus: {
        ...selection.focus,
        path: parentNext(selection.focus.path).concat([0]),
      },
    });
    // event.preventDefault();
    // const { startBlock, endBlock } = editor.value;
    // const codeBlock = editor.getClosestCodeBlockByKey(endBlock.key);
    // const len = codeBlock.nodes.size;
    // const offset = codeBlock.nodes.indexOf(endBlock);
    // if (offset === len - 1) return next();
    // const last = codeBlock.nodes.get(offset + 1);
    // const targetOffset = codeBlock.nodes.indexOf(startBlock);
    // if (!~targetOffset) return next(); // !~(-1) === true;
    // return editor.moveNodeByKey(last.key, codeBlock, targetOffset);
  }
};
