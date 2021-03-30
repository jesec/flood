const path = require('path');
const paths = require('../../shared/config/paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

const generateConfig = (proxy, allowedHost) => {
  return {
    firewall: false,
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
    https: protocol === 'https',
    host,
    historyApiFallback: true,
    public: allowedHost,
    proxy: {
      '/api/': {
        target: proxy,
        changeOrigin: true,
        secure: false,
      },
    },
  };
};

module.exports = generateConfig;
