import { handleBEM } from '@zhujianshi/slate-plugin-utils';

import transforms from './transforms';
import queries from './queries';
import handler from './handler';
import render from './render';
import { DEFAULT_OPTION } from './constants';

// may be a better name
const codeBaseReact = options => {
  const optRaw = Object.assign({}, DEFAULT_OPTION, options);

  const opt = Object.assign({}, optRaw, {
    className: handleBEM(optRaw),
  });
  // const { codeType, codeLineType } = opt;
  // const schema = {
  //   blocks: {
  //     [codeType]: {
  //       // code: {
  //       nodes: [
  //         {
  //           match: { type: codeLineType },
  //           // match: { type: 'code_line' },
  //         },
  //       ],
  //       normalize,
  //     },
  //     [codeLineType]: {
  //       // code_line: {
  //       nodes: [{ match: { object: 'text' } }],
  //     },
  //   },
  // };
  return {
    // commands: createCommands(opt),
    // queries: createQueries(opt),
    ...handler(opt),
    ...render(opt),
    // schema,
  };

  // function normalize(editor, error) {
  //   if (error.code === 'child_type_invalid') {
  //     const { node, child } = error;

  //     if (child.type === 'paragraph') return editor.moveNodeAfterAnotherNode(child, node);
  //   }
  // }
};

export default codeBaseReact;

export const Code = {
  ...transforms,
  ...queries,
};

// export * from './handler';

export const withCode = editor => editor;
