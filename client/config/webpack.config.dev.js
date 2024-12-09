const path = require('node:path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const WebpackBar = require('webpackbar');
const paths = require('../../shared/config/paths');

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              plugins: [require.resolve('react-refresh/babel')],
            },
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
              modules: {
                mode: 'global',
                localIdentName: '[name]_[local]__[hash:base64:5]',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                silenceDeprecations: ['mixed-decls'],
              },
            },
          },
        ],
      },
      {
        exclude: [/node_modules/],
        test: /\.(ts|js)x?$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        test: /\.md$/,
        loader: 'raw-loader',
      },
      {
        test: [/\.woff2$/],
        type: 'asset/resource',
      },
      {
        include: [/\.svg$/],
        issuer: /\.s?css$/,
        type: 'asset/resource',
      },
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset/resource',
      },
      // https://github.com/lingui/js-lingui/issues/1048
      {
        resourceQuery: /raw-lingui/,
        type: 'javascript/auto',
      },
    ],
  },
  entry: paths.appIndex,
  resolve: {
    extensions: ['.cjs', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@client': path.resolve('./client/src/javascript'),
      '@shared': path.resolve('./shared'),
    },
  },
  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash:8].[ext]',
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      emitWarning: true,
      threads: true,
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new ReactRefreshWebpackPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    new WebpackBar(),
  ],
  devtool: 'source-map',
  optimization: {
    moduleIds: 'named',
  },
};
