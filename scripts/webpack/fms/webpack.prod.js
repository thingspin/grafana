'use strict';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const gfProd = require("../webpack.prod.js");
const path = require('path');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//Override (module, plugins) Written by JGW
let fmsProd = merge(common, {
  entry: {
    dark: './public/sass/fms.dark.scss',
    light: './public/sass/fms.light.scss',
  },

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
        sourceMap: false,
        preserveUrl: false
      }),
      {
        test: /\.css$/,  
        include: /node_modules/,  
        loaders: ['style-loader', 'css-loader'],
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
    }),
    new MiniCssExtractPlugin({
      filename: "fms.[name].[hash].css"
    }),
    new ngAnnotatePlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/error.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-error-template.html'),
      inject: false,
      excludeChunks: ['dark', 'light'],
      chunksSortMode: 'none'
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/index.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-index-template.html'),
      inject: 'body',
      excludeChunks: ['manifest', 'dark', 'light'],
      chunksSortMode: 'none'
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
const { mode, devtool, optimization } = gfProd;
fmsProd = Object.assign(fmsProd, {
  mode,
  devtool,
  optimization,
});

module.exports = fmsProd;