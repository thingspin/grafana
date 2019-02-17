'use strict';

const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const gfProd = require("../webpack.prod.js");
const path = require('path');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

//Override (module, plugins) Written by JGW
let fmsProd = merge(common, {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'tslint-loader',
          options: {
            emitErrors: true,
            typeCheck: false,
          }
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          },
        },
      },
      require('../sass.rule.js')({
        sourceMap: false, minimize: false, preserveUrl: false
      })
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "fms.[name].[hash].css"
    }),
    new ngAnnotatePlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/fms-error.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-error-template.html'),
      inject: false,
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/fms-index.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-index-template.html'),
      inject: 'body',
      chunks: ['vendor', 'app'],
    }),
    function () {
      this.hooks.done.tap('Done', function (stats) {
        if (stats.compilation.errors && stats.compilation.errors.length) {
          console.log(stats.compilation.errors);
          process.exit(1);
        }
      });
    }
  ]
});

//Copy already used Grafana webpack.prod.js
const { mode, devtool, entry, optimization } = gfProd;
fmsProd = Object.assign(fmsProd, {
  mode,
  devtool,
  entry,
  optimization,
});

module.exports = fmsProd;