const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...require('node-libs-browser'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
  util: require.resolve('util'),
  assert: require.resolve('assert'),
  events: require.resolve('events'),
};

module.exports = config;
