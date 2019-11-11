import factory from './factory';
import slateCodeBase from '../packages/slate-code-base/package.json';

const configurations = [...factory(slateCodeBase)];

export default configurations;
