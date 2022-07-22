var rm = require('rimraf');
let webpack = require('webpack');
let webpackConfig = require('./webpack.dev.conf');

rm(webpackConfig.output.path, function(err) {
  if (err) throw err;
  webpack(webpackConfig, function(err, stats) {
    console.log(err, stats);
  });
});
