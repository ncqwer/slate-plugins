const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, '/src/index.js'),
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'bundle.js',
    devtoolModuleFilenameTemplate: info =>
      // path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
      info.absoluteResourcePath.replace(/\\/g, '/'),
  },
  mode: 'development',
  devServer: {
    contentBase: 'public',
    historyApiFallback: true,
    inline: true,
  },
  devtool: 'cheap-module-eval-source-map',
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      { parser: { requireEnsure: false } },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            // options: {
            //   limit: imageInlineSizeLimit,
            //   name: 'static/media/[name].[hash:8].[ext]',
            // },
          },
          // Process application JS with Babel.
          // The preset includes JSX, Flow, TypeScript, and some ESnext features.
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: path.join(__dirname, '/src'),
            loader: require.resolve('babel-loader'),
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: [
                'transform-class-properties',
                [
                  require.resolve('babel-plugin-named-asset-import'),
                  {
                    loaderMap: {
                      svg: {
                        ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                      },
                    },
                  },
                ],
              ],
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
              // See #6846 for context on why cacheCompression is disabled
              cacheCompression: false,
            },
          },
          {
            test: /\.(js|mjs)$/,
            // include: /(?:slate-code-base)|(?:slate-code-math)|(?:slate-table)/,
            include: /packages\/slate/,
            loader: 'babel-loader',
            // options: {
            //   // babelrc: false,
            //   // configFile: false,
            //   // compact: false,
            //   // cacheDirectory: true,
            //   // // See #6846 for context on why cacheCompression is disabled
            //   // cacheCompression: false,

            //   // If an error happens in a package, it's possible to be
            //   // because it was compiled. Thus, we don't want the browser
            //   // debugger to show the original code. Instead, the code
            //   // being evaluated would be much more helpful.
            //   inputSourceMap: true,
            // },
          },
          {
            test: /\.(js|mjs)$/,
            exclude: /@babel(?:\/|\\{1,2})runtime/,
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              configFile: false,
              compact: false,
              cacheDirectory: true,
              // See #6846 for context on why cacheCompression is disabled
              cacheCompression: false,

              // If an error happens in a package, it's possible to be
              // because it was compiled. Thus, we don't want the browser
              // debugger to show the original code. Instead, the code
              // being evaluated would be much more helpful.
              sourceMaps: false, // no no no i need the source map for package
            },
          },
          {
            test: /\.(css|less)$/,
            exclude: /\.module\.css$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, '/public/index.html'),
    }),
  ],
  node: {
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    http2: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
