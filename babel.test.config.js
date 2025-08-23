// babel.test.config.js
module.exports = {
  presets: ['babel-preset-expo', '@babel/preset-typescript'],
  plugins: [
    ['module-resolver', {
      alias: { '@': './', '~': './' },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    }],
  ],
};
