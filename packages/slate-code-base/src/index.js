import { handleBEM } from '@zhujianshi/slate-plugin-utils';

import createCommands from './commands';
import createQueries from './queries';
import handler from './handler';
import defaultOptions from './option';
import createRenders from './render.js';

// may be a better name
const createCodePlugin = options => {
  const optRaw = Object.assign({}, defaultOptions, options);

  const opt = Object.assign({}, optRaw, {
    className: handleBEM(optRaw),
  });
  const schema = {
    blocks: {
      code: {
        nodes: [
          {
            match: { type: 'code_line' },
          },
        ],
        normalize,
      },
      code_line: {
        nodes: [{ match: { object: 'text' } }],
      },
    },
  };
  return {
    commands: createCommands(opt),
    queries: createQueries(opt),
    ...handler(opt),
    ...createRenders(opt),
    schema,
  };

  function normalize(editor, error) {
    if (error.code === 'child_type_invalid') {
      const { node, child } = error;

      if (child.type === 'paragraph') return editor.moveNodeAfterAnotherNode(child, node);
    }
  }
};

export default createCodePlugin;
