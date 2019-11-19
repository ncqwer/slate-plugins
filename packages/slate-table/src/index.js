import defaultOptions from './option';
import createRenders from './render';
import createHandlers from './handler';
import createSchema from './schema';
import createCommands from './commands';
import createQueries from './queries';

export default options => {
  const opt = Object.assign({}, defaultOptions, options);
  return {
    ...createRenders(opt),
    ...createHandlers(opt),
    schema: createSchema(opt),
    commands: createCommands(opt),
    queries: createQueries(opt),
  };
};
