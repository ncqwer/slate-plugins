import { handleBEM } from '@zhujianshi/slate-plugin-utils';

import defaultOptions from './option';
import createRenders from './render';
import createHandlers from './handler';
import createSchema from './schema';
import createCommands from './commands';
import createQueries from './queries';

export default options => {
  const optRaw = Object.assign({}, defaultOptions, options);

  const opt = Object.assign({}, optRaw, {
    className: handleBEM(optRaw),
  });
  return {
    ...createRenders(opt),
    ...createHandlers(opt),
    schema: createSchema(opt),
    commands: createCommands(opt),
    queries: createQueries(opt),
  };
};
