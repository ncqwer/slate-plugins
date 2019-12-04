import defaultOption from './option';
import render from './render';
import command from './command';

export default opt => {
  const realOpt = Object.assign({}, defaultOption, opt);

  return {
    ...render(realOpt),
    command: command(realOpt),
  };
};
