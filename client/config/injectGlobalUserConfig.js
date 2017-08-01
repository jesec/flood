'use strict';

function injectGlobalUserConfig(userConfig) {
  this.userConfig = userConfig;
}

injectGlobalUserConfig.prototype.apply = function(compiler) {
  const getStringifiedUserConfig = () => {
    return JSON.stringify({
      basePath: this.userConfig.basePath || '/',
      maxHistoryStates: this.userConfig.maxHistoryStates || 30,
      pollInterval: this.userConfig.pollInterval || 1000 * 5
    });
  };

  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback) {
      htmlPluginData.html = htmlPluginData.html.replace(
        '%GLOBAL_CONFIGURATION%',
        `<script>window.floodConfig = ${getStringifiedUserConfig()};</script>`
      );
      callback(null, htmlPluginData);
    });
  });
};

module.exports = injectGlobalUserConfig;
