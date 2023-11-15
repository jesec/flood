module.exports = {
  transformIgnorePatterns: ['node_modules/(?!(p-queue|p-timeout)/)'],
  transform: {
    // transform ESM only package to CommonJS
    '^.+\\.(t|j)sx?$': [
      'esbuild-jest',
      {
        format: 'cjs',
      },
    ],
  },
};
