'use strict';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const gfDev = require("../webpack.dev.js");
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//Override (entry, output, plugins) Written by JGW
let fmsDev = merge(common, {
  devtool: "cheap-module-source-map",
  mode: 'development',

  entry: {
    app: './public/app-thingspin-fms/index.ts',
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
      require('./sass.rule.js')({ sourceMap: false, preserveUrl: false }),
      {
        test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.css$/,  
        include: /node_modules/,  
        loaders: ['style-loader', 'css-loader'],
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "fms.[name].[hash].css"
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/error.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-error-template.html'),
      inject: false,
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/index.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-index-template.html'),
      inject: 'body',
      chunks: ['manifest', 'vendor', 'app'],
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
  ]
});

//Copy already used Grafana webpack.dev.js
const { devtool, mode, } = gfDev;
module.exports = Object.assign(fmsDev, {
  devtool,
  mode,
  module: {
    rules: gfDev.module.rules.concat([{
      test: /\.css$/,  
      include: /node_modules/,  
      loaders: ['style-loader', 'css-loader'],
    }]),
  },
});
