import defaultOptions from './option';
import render from './render';
import command from './command';
import query from './queries';

import { handleBEM } from '@zhujianshi/slate-plugin-utils';

export default options => {
  const optRaw = Object.assign({}, defaultOptions, options);

  const opt = Object.assign({}, optRaw, {
    className: handleBEM(optRaw),
  });

  return {
    ...render(opt),
    commands: command(opt),
    queries: query(opt),
  };
};
