const insertCharAtOffset = (str, offset, ch) => {
  const leftStr = str.slice(0, offset);
  const rightStr = str.slice(offset);
  return Array.prototype.join.call([leftStr, ch, rightStr], '');
};

export default option => {
  const commentReg = /^(\s*)\/\//;
  // const emptyReg = /^(\s*)/;
  const tabSpace = ' '.repeat(option.tabLength);
  return {
    insertCodeBlock(editor, language, codeText = 'n') {
      return editor.insertBlock({
        object: 'block',
        type: option.codeType,
        data: { language },
        nodes: [
          {
            object: 'block',
            type: option.codeLineType,
            nodes: [{ object: 'text', text: codeText }],
          },
        ],
      });
    },
    moveNodeAfterAnotherNode(editor, node, anotherNode) {
      const parentBlock = editor.value.document.getParent(anotherNode.key);
      const offset = parentBlock.nodes.indexOf(anotherNode);
      return editor.moveNodeByKey(node.key, parentBlock.key, offset + 1);
    },
    exitCodeBlock(editor) {
      const codeBlock = editor.getClosestCodeBlock();
      return editor.insertParagraphAfterNode(codeBlock);
    },
    compensateBrackets(editor, startCh, endCh) {
      const { startText, endText, selection } = editor.value;
      let startPoint = null;
      let endPoint = null;
      if (selection.isForward) {
        startPoint = selection.anchor;
        endPoint = selection.focus;
      } else {
        startPoint = selection.focus;
        endPoint = selection.anchor;
      }
      const startOffset = startPoint.offset;
      const endOffset = endPoint.offset;
      if (startText.key === endText.key) {
        const newStartText = insertCharAtOffset(startText.text, startOffset, startCh);
        const newEndText = insertCharAtOffset(newStartText, endOffset + 1, endCh);
        const newSelection = selection.moveForward(1);
        return editor.setTextByPath(startPoint.path, newEndText).select(newSelection);
      }
      const newStartText = insertCharAtOffset(startText.text, startOffset, startCh);
      const newEndText = insertCharAtOffset(endText.text, endOffset, endCh);
      const newSelection = selection.moveStartForward(1);
      return editor
        .setTextByPath(startPoint.path, newStartText)
        .setTextByPath(endPoint.path, newEndText)
        .select(newSelection);
    },

    addIndentByRange(editor, range) {
      const { document } = editor.value;
      const allTexts = document.getTextsAtRange(range);
      const newRange = range.moveForward(option.tabLength);
      return allTexts
        .reduce((acc, text) => {
          const textStr = text.text;
          const path = document.getPath(text);
          const newStr = tabSpace + textStr;
          return acc.setTextByPath(path, newStr);
        }, editor)
        .select(newRange);
    },

    deleteIndentByRange(editor, range) {
      const { document } = editor.value;
      const allTexts = document.getTextsAtRange(range);
      const startText = allTexts.first();
      const endText = allTexts.last();
      let startStep = 0;
      let endStep = 0;
      allTexts.reduce((acc, text) => {
        const textStr = text.text;
        const path = document.getPath(text);
        const indentLen = editor.getCodeLineIndentByNode(text).length;
        let newIndentLen = indentLen - option.tabLength;
        if (newIndentLen < 0) newIndentLen = 0;
        const sliceIdx = indentLen - newIndentLen;
        const newStr = textStr.slice(sliceIdx);
        if (text.key === startText.key) startStep = sliceIdx;
        if (text.key === endText.key) endStep = sliceIdx;
        return acc.setTextByPath(path, newStr);
      }, editor);
      const newRange = range.isCollapsed
        ? range.moveBackward(startStep)
        : range.moveStartBackward(startStep).moveEndBackward(endStep);
      return editor.select(newRange);
    },

    toggleCommentCodeLineAtRange(editor, range) {
      const { document } = editor.value;
      const allTexts = document.getTextsAtRange(range);
      const startText = allTexts.first();
      const endText = allTexts.last();
      const isAllCommenLine = allTexts
        .map(text => commentReg.test(text.text))
        .reduce((acc, has) => acc && has);
      const [startPoint, endPoint] = editor.getStartAndEndPointAtRange(range);
      if (!isAllCommenLine) {
        const indentNum = allTexts.map(text => editor.getCodeLineIndentByNode(text).length).min();
        const indent = ' '.repeat(indentNum);
        // add comment
        const startStep = indentNum >= startPoint.offset ? 0 : 2; // '//'.length ===3
        const endStep = indentNum >= endPoint.offset ? 0 : 2;
        const newRange = range.isCollapsed
          ? range.moveForward(startStep)
          : range.moveStartForward(startStep).moveEndForward(endStep);
        return allTexts
          .reduce((acc, text) => {
            const textStr = text.text;
            const path = document.getPath(text);
            const newStr = textStr.replace(indent, `${indent}//`);
            return acc.setTextByPath(path, newStr);
          }, editor)
          .select(newRange);
      } else {
        const startStep = commentReg.exec(startText.text)[1].length >= startPoint.offset ? 0 : 2;
        const endStep = commentReg.exec(endText.text)[1].length >= endPoint.offset ? 0 : 2;
        const newRange = range.moveStartBackward(startStep).moveEndForward(endStep);
        return allTexts
          .reduce((acc, text) => {
            const textStr = text.text;
            const path = document.getPath(text);
            const newStr = textStr.replace(commentReg, '$1');
            return acc.setTextByPath(path, newStr);
          }, editor)
          .select(newRange);
      }
    },
  };
};
