/* 
  this file copy from 
  https://github.com/ianstormtaylor/slate-plugins/tree/master/support/rollup 
  and add some custom changes
*/

import factory from './factory';
import slateCodeBase from '../packages/slate-code-base/package.json';
import slateCodeMath from '../packages/slate-code-math/package.json';
import slateTable from '../packages/slate-table/package.json';

const configurations = [
  ...factory(slateCodeBase),
  ...factory(slateTable),
  ...factory(slateCodeMath),
];

export default configurations;
