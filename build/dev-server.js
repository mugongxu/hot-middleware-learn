let express = require('express');
let webpack = require('webpack');
let webpackConfig = require('./webpack.dev.conf');

var app = express();

let compiler = webpack(webpackConfig);

let devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath
});

app.use(devMiddleware);
 
// 热重载
app.use(require('./hot-middleware.js')(compiler, {}));
 
app.listen(3000);
