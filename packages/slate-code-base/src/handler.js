import isHotKey from 'is-hotkey';
import detectIntent from 'detect-indent';
import { Range } from 'slate';

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

const ifFlow = (...conditionActions) => (...props) => {
  for (const [condition, action] of conditionActions) {
    if (condition(...props)) return action(...props);
  }
};
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
  const isSpace = isHotKey('space');
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
  const isInCodeLineBlock = (event, editor, next) => {
    const { startBlock, endBlock } = editor.value;
    return startBlock.type !== option.codeLineType || endBlock.type !== option.codeLineType;
  };
  return {
    onKeyDown(event, editor, next) {
      return ifFlow(
        [isSpace, handleSpace], // convert to code block
        [isInCodeLineBlock, () => next()],
        [isShiftEnter, handleShiftEnter], // escape the code
        [isEnter, handleEnter],
        [isTab, handleTab],
        [isModD, handleModD],
        [isModEnter, handleModEnter],
        [isModSlash, handleModSlash],
        [isBackspace, handleBackspace],
        [isModShiftK, handleModShiftK],
        [isModShiftUp, handleModShiftUp],
        [isModShiftDown, handleModShiftDown],
        [isModRightSquareBrakets, handleModRightSquareBrakets],
        [isModLeftSquareBrakets, handleModLeftSquareBrakets],
        [isCompensateBrakets, handleCompensateBrakets],
        [() => true, () => next()], // default condition
      )(event, editor, next);
    },
  };

  function handleSpace(event, editor, next) {
    const { startBlock } = editor.value;
    if (startBlock.type !== 'paragraph') return next(); // only convert paragraph block to code block
    const text = startBlock.text;
    const res = codeBlockReg.exec(text);
    if (!res) return next();
    const [matchStr, languageAlias] = res;
    let languageType = AVALIABLE_LANGUAGES_MAP[languageAlias];
    if (!languageType) languageType = 'javascript';
    const remainStr = text.slice(matchStr.length);
    return editor.insertCodeBlock(languageType, remainStr).removeNodeByKey(startBlock.key);
  }

  function handleShiftEnter(event, editor, next) {
    return editor.insertBlock('paragraph');
  }

  function handleEnter(event, editor, next) {
    const { startBlock } = editor.value;
    const text = startBlock.text;
    const indent = detectIntent(text).indent.replace('/t', tabSpace);
    const [isCollapsed, lCh, rCh] = editor.getFocusCharWhenCollapsed();
    if (isCollapsed) {
      const newIndent = indent + tabSpace;
      const twoCh = [lCh, rCh].join('');
      if (matchedBraketsReg.test(twoCh)) {
        return editor
          .splitBlock()
          .insertText(indent)
          .moveToEndOfNode(startBlock)
          .splitBlock()
          .insertText(newIndent);
      } else if (braketsStartReg.test(lCh)) {
        return editor.splitBlock().insertText(newIndent);
      }
    }
    return editor
      .splitBlock()
      .insertText(indent)
      .focus();
  }

  function handleTab(event, editor, next) {
    event.preventDefault();
    return editor.insertText(tabSpace);
  }

  function handleModD(event, editor, next) {
    const { startBlock, selection } = editor.value;
    const range = Range.create({
      anchor: selection.anchor,
      focus: selection.focus,
    });
    if (!range.isCollapsed) return next();
    event.preventDefault();
    const offset = range.focus.offset;
    const text = startBlock.text;
    let [startBias, endBias, expected] = getSingleWordBias(text, variableChReg, offset); // 向后匹配
    if (!expected && startBias === 0) {
      // 尝试向前匹配
      [startBias, endBias] = getSingleWordBias(text, variableChReg, offset - 1); // 向前匹配
      /* eslint-disable no-console*/
      console.log(`向前匹配:start${startBias}:endBias${endBias}`);
      return editor.moveStartBackward(startBias + 1);
    }
    return editor.moveStartBackward(startBias).moveEndForward(endBias + 1);
  }

  function handleModEnter(event, editor, next) {
    const { startBlock } = editor.value;
    const indent = editor.getCodeLineIndentByNode(startBlock);
    return editor
      .moveToEndOfNode(startBlock)
      .insertBlock(option.codeLineType)
      .insertText(indent);
  }

  function handleBackspace(event, editor, next) {
    const { startBlock, document } = editor.value;
    const [isCollapsed, lCh, rCh] = editor.getFocusCharWhenCollapsed();
    const twoCh = [lCh, rCh].join('');
    if (isCollapsed && matchedBraketsReg.test(twoCh)) {
      return editor
        .moveStartBackward(1)
        .moveEndForward(1)
        .delete();
    }
    const text = startBlock.text;
    if (!spaceReg.test(text)) return next();
    const nowIndent = editor.getCodeLineIndentByNode(startBlock);
    const preIndents = editor.getPrevCodeLineIndentByBlock(startBlock);
    const avaliableIndent = preIndents.reverse().find(indent => indent.length < nowIndent.length);
    if (!avaliableIndent && avaliableIndent !== '') return next();
    console.log(preIndents);
    console.log(`avaliableIndent:${avaliableIndent.length}`);
    const path = document.getPath(startBlock.getFirstText());
    return editor.setTextByPath(path, avaliableIndent);
  }

  function handleModShiftK(event, editor, next) {
    const { endText, selection } = editor.value;
    const [startPoint, endPoint] = editor.getStartAndEndPointAtRange(selection);
    const backwardStep = startPoint.offset;
    const forwardStep = endText.text.length - endPoint.offset;
    const newSelection = selection.moveStartBackward(backwardStep).moveEndForward(forwardStep);
    event.preventDefault();
    return editor.deleteAtRange(newSelection);
  }

  function handleCompensateBrakets(event, editor, next) {
    const { startBlock, selection } = editor.value;
    const range = Range.create({
      anchor: selection.anchor,
      focus: selection.focus,
    });

    let appendText;
    if (event.key === '{') appendText = '}';
    if (event.key === '(') appendText = ')';
    if (event.key === '[') appendText = ']';
    if (event.key === '`') appendText = '`';
    event.preventDefault();
    if (range.isCollapsed) {
      if (braketsEndReg.test(event.key)) {
        const offset = selection.anchor.offset;
        const text = startBlock.text;
        if (braketsEndReg.test(text[offset])) {
          // 已经存在不需要插入
          return editor.moveForward(1).focus();
        }
        if (event.key !== '`') return editor.insertText(event.key).focus();
      }

      return editor
        .insertText(event.key + appendText)
        .moveBackward(1)
        .focus();
    }
    return editor.compensateBrackets(event.key, appendText);
  }

  function handleModRightSquareBrakets(event, editor, next) {
    const { selection } = editor.value;
    return editor.addIndentByRange(selection);
  }

  function handleModLeftSquareBrakets(event, editor, next) {
    const { selection } = editor.value;
    return editor.deleteIndentByRange(selection);
  }

  function handleModSlash(event, editor, next) {
    const { selection } = editor.value;
    event.preventDefault();
    return editor.toggleCommentCodeLineAtRange(selection);
  }

  function handleModShiftUp(event, editor, next) {
    event.preventDefault();
    const { startBlock, endBlock } = editor.value;
    const codeBlock = editor.getClosestCodeBlockByKey(startBlock.key);
    const offset = codeBlock.nodes.indexOf(startBlock);
    if (offset === 0) return next();
    const prev = codeBlock.nodes.get(offset - 1);
    const targetOffset = codeBlock.nodes.indexOf(endBlock);
    if (!~targetOffset) return next(); // !~(-1) === true;
    return editor.moveNodeByKey(prev.key, codeBlock, targetOffset);
  }
  function handleModShiftDown(event, editor, next) {
    event.preventDefault();
    const { startBlock, endBlock } = editor.value;
    const codeBlock = editor.getClosestCodeBlockByKey(endBlock.key);
    const len = codeBlock.nodes.size;
    const offset = codeBlock.nodes.indexOf(endBlock);
    if (offset === len - 1) return next();
    const last = codeBlock.nodes.get(offset + 1);
    const targetOffset = codeBlock.nodes.indexOf(startBlock);
    if (!~targetOffset) return next(); // !~(-1) === true;
    return editor.moveNodeByKey(last.key, codeBlock, targetOffset);
  }
};
