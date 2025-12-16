import path from 'node:path';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import yargs from 'yargs/yargs';

import checkRequiredFiles from './utils/checkRequiredFiles.mjs';
import {choosePort, prepareUrls} from './utils/WebpackDevServerUtils.mjs';
import paths from '../../shared/config/paths.mjs';
import config from '../config/webpack.config.dev.mjs';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
  throw err;
});

const {proxy: floodServerProxy} = yargs(process.argv.slice(2)).env('FLOOD_OPTION_').option('proxy', {
  default: 'http://127.0.0.1:3000',
  type: 'string',
}).argv;

if (!checkRequiredFiles([paths.appHtml, paths.appIndex])) {
  process.exit(1);
}

const DEFAULT_PORT = Number.parseInt(process.env.DEV_SERVER_PORT ?? '', 10) || 4200;
const HOST = process.env.DEV_SERVER_HOST || '0.0.0.0';

choosePort(HOST, DEFAULT_PORT)
  .then((port) => {
    if (port == null) {
      return;
    }

    const protocol = process.env.DEV_SERVER_HTTPS === 'true' ? 'https' : 'http';
    const urls = prepareUrls(protocol, HOST, port);
    const compiler = webpack(config);
    const devServer = new WebpackDevServer(
      {
        allowedHosts: urls.lanUrlForConfig,
        compress: false,
        static: [
          {
            directory: path.resolve(paths.appPublic),
            staticOptions: {},
            publicPath: '/',
            serveIndex: true,
            watch: {
              ignored: /node_modules/,
            },
          },
        ],
        historyApiFallback: true,
        proxy: [
          {
            context: ['/api'],
            target: floodServerProxy,
            changeOrigin: true,
            secure: false,
          },
        ],
        port,
      },
      compiler,
    );

    ['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => devServer.stop().then(() => process.exit()));
    });

    return devServer.start();
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
