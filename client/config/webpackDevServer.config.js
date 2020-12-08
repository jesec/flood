const paths = require('../../shared/config/paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

const generateConfig = (proxy, allowedHost) => {
  return {
    firewall: false,
    compress: true,
    static: [
      {
        directory: paths.appPublic,
        staticOptions: {},
        publicPath: paths.appBuild,
        serveIndex: true,
        watch: {
          ignored: /node_modules/,
        },
      },
    ],
    https: protocol === 'https',
    host,
    overlay: false,
    historyApiFallback: true,
    public: allowedHost,
    proxy,
  };
};

module.exports = generateConfig;
