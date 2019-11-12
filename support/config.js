import factory from './factory';
import slateCodeBase from '../packages/slate-code-base/package.json';
import slateCodeMath from '../packages/slate-code-math/package.json';

const configurations = [...factory(slateCodeBase), ...factory(slateCodeMath)];

export default configurations;
