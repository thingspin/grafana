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
    filename: '[name].[hash].js',
    publicPath: '/public/build/',
    pathinfo: false,
  },

  devServer: {
    publicPath: '/public/build/',
    hot: true,
    port: 3333,
    proxy: {
      '!/public/build': 'http://localhost:3000',
      '/thingspin-proxy/mqtt': {
        target: 'ws://localhost:3000',
        ws: true,
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
      '/api/plugin-proxy/*': {
        target: 'http://localhost:3000',
        ws: true,
      },
      '/thingspin/analytics/*': {
        target: 'http://localhost:3000',
        ws: true,
      }
    },
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/index.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-index-template.html'),
      inject: 'body',
      alwaysWriteToDisk: true,
      chunksSortMode: 'none',
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
const { mode, resolve, devtool, optimization, } = gfHot;
fmsHot = Object.assign(fmsHot, {
  mode,
  devtool,
  resolve,
  // optimization,
  module: {
    rules: (gfHot.module.rules.concat([{
      test: /\.css$/,  
      include: /node_modules/,  
      loaders: ['style-loader', 'css-loader'],
    }])),
  },
});

module.exports = fmsHot;