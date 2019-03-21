'use strict';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const gfHot = require("../webpack.hot.js");
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const IgnoreNotFoundExportPlugin = require("../IgnoreNotFoundExportPlugin.js");


//Override (entry, output, plugins) Written by JGW
let fmsHot = merge(common, {
  entry: {
    app: ['webpack-dev-server/client?http://0.0.0.0:3333', './public/app-thingspin-fms/dev.ts'],
  },
  
  output: {
    path: path.resolve(__dirname, '../../../public/build'),
    filename: 'fms-[name].[hash].js',
    publicPath: '/public/build/',
    pathinfo: false,
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/fms-index.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-index-template.html'),
      inject: 'body',
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      THINGSPIN_THEME: JSON.stringify(process.env.THINGSPIN_THEME || 'light'),
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new IgnoreNotFoundExportPlugin(),
  ],
  
});

//Copy already used Grafana webpack.hot.js
const { resolve, devtool, devServer, optimization, } = gfHot;
fmsHot = Object.assign(fmsHot, {
  resolve,
  devtool,
  devServer,
  optimization,
  module: gfHot.module,

});

module.exports = fmsHot;