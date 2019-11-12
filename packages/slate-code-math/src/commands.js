import { Block } from 'slate';

export default option => {
  return {
    // useful
    insertParagraphAfterNode(editor, node) {
      const parentBlock = editor.value.document.getParent(node.key);
      const offset = parentBlock.nodes.indexOf(node);
      const paragraph = Block.create('paragraph');
      return editor
        .delete()
        .insertNodeByKey(parentBlock.key, offset + 1, paragraph)
        .moveToEndOfBlock(node)
        .moveForward(1);
    },
    insertMathBlock(editor, latexText = '') {
      const codeBlockKey = editor.insertCodeBlock('latex', latexText).getClosestCodeBlock();
      return editor.wrapBlockByKey(codeBlockKey, 'math');
      // return editor.insertBlock({
      //   object: "block",
      //   type: "math",
      //   nodes: [
      //     {
      //       object: "block",
      //       type: "code",
      //       data: { language: "latex" },
      //       nodes: [
      //         {
      //           object: "block",
      //           type: "code_line",
      //           nodes: [{ object: "text", text: latexText }]
      //         }
      //       ]
      //     }
      //   ]
      // });
    },
    exitMathBlock(editor) {
      const mathBlock = editor.getClosestMathBlock();
      return editor.insertParagraphAfterNode(mathBlock);
    },
  };
};
