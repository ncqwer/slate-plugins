import commands from './commands';
import queries from './queries';
import handler from './handler';
import render from './render';
import defaultOption from './option';

const createMathPlugin = option => {
  const opt = Object.assign({}, defaultOption, option);
  const schema = {
    blocks: {
      math: {
        nodes: [{ match: { type: 'code' } }],
        normalize,
      },
    },
  };
  return {
    commands: commands(opt),
    queries: queries(opt),
    ...handler(opt),
    ...render(opt),
    schema,
  };
  function normalize(editor, error) {
    if (error.code === 'child_type_invalid') {
      const { node, child } = error;
      if (child.type === 'paragraph') return editor.moveNodeAfterAnotherNode(child, node);
    }
  }
};

export default createMathPlugin;
