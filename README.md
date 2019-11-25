---
name: slate-plugins
menu: Plugins
---

### what

anylater 编辑器使用的 slate-plugins 插件集合

### FAQ

#### 如何开发新插件

以下方法是基于 lerna 的 cli 方法的简单封装，具体参数可参考[lerna](https://github.com/lerna/lerna)

##### 新建项目文件夹

####

```bash
yarn pkgcreate {yourscope}/{yourSlatePlugins}
```

P.S.　需要自行在子项目的 package.json 配置 npm 发布时的配置

- files 字段
- main lib 字段
- publishConfig 　字段

##### 添加依赖

```bash
yarn pkgadd {yourdependency} --scope {yourscope}/{yourSlatePlugins}
```

##### 修改 rollup 配置

```js
import factory from './factory';
import slateCodeBase from '../packages/slate-code-base/package.json';
import slateCodeMath from '../packages/slate-code-math/package.json';
import slateTable from '../packages/slate-table/package.json';
import slateUtils from '../packages/slate-plugin-utils/package.json';
import yourPkg from '../package/yourPkg/package.json',

const configurations = [
  ...factory(slateUtils),
  ...factory(slateCodeBase),
  ...factory(slateTable),
  ...factory(slateCodeMath),
  ...factory(yourPkg),
];

export default configurations;
```

#### 如何添加开发工具

```bash
yarn rootdevadd {devDependency}
```

P.S. 通常意义上，子项目的所有 devDep 都应该提升到根级别上

#### 使用 playground 来调试

修改 playground/editor.js 上添加你的插件并在根级目录上

```bash
yarn start
```

默认配置上，你的插件应该以 slate-作为起始名，如果你的包不符合此规则，请修改 playground/webpack.config.js 使得 webpack 可以找到你的项目的 sourcemap 文件
