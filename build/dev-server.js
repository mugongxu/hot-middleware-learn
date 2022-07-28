let express = require('express');
let webpack = require('webpack');
let webpackConfig = require('./webpack.dev.conf');
var { getHooks } = require('html-webpack-plugin');

// 热更新客户端配置
Object.keys(webpackConfig.entry).forEach(function(name) {
  webpackConfig.entry[name] = ['./build/hot-client.js'].concat(webpackConfig.entry[name])
});

// hot-module-replacement
webpackConfig.plugins = [new webpack.HotModuleReplacementPlugin()].concat(webpackConfig.plugins);

var app = express();

let compiler = webpack(webpackConfig);

let devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath
});

// 热重载
let hotMiddleware = require('./hot-middleware.js')(compiler, {});
// 强制页面刷新当html-webpack-plugin template发生变化时
if (compiler.hooks) {
  compiler.hooks.compilation.tap('compilation', function(compilation) {
    // webpack5
    getHooks(compilation).afterEmit.tap('html-webpack-plugin-after-emit', function(data) {
      hotMiddleware.publish({ action: 'reload' });
    });
  });
} else {
  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
      hotMiddleware.publish({ action: 'reload' });
      cb();
    });
  });
}

app.use(devMiddleware);

app.use(hotMiddleware);

app.listen(3000);
