var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.npm_config_production ? 'production' : 'development',
  entry: {
    app: ['./index.js']
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.css', '.scss'],
    alias: {
      'vue$': 'vue/dist/vue.esm-bundler.js'
    }
  },
  module: {
    rules: []
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: process.env.npm_config_production ? path.resolve(__dirname, '../dist/index.html') : 'index.html',
      template: 'index.html',
      inject: true
    })
  ]
}
