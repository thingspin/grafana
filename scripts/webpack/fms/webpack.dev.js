'use strict';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//Override (entry, output, plugins) Written by JGW
module.exports = (env = {}) => merge(common, {
  devtool: 'cheap-module-source-map',
  mode: 'development',

  entry: {
    app: './public/app-thingspin-fms/index.ts',
    dark: './public/sass/fms.dark.scss',
    light: './public/sass/fms.light.scss',
  },

  // If we enabled watch option via CLI
  watchOptions: {
    ignored: /node_modules/,
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
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      require('../sass.rule.js')({
        sourceMap: false,
        reserveUrl: false
      }),
      {
        test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.css$/,  
        include: /node_modules/,  
        loaders: ['style-loader', 'css-loader'],
      }
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    env.noTsCheck
      ? new webpack.DefinePlugin({}) // bogus plugin to satisfy webpack API
      : new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true,
      }),
    new MiniCssExtractPlugin({
      filename: "fms.[name].[hash].css"
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/error.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-error-template.html'),
      inject: false,
      chunksSortMode: 'none',
      excludeChunks: ['dark', 'light']
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/index.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-index-template.html'),
      inject: 'body',
      chunksSortMode: 'none',
      excludeChunks: ['dark', 'light']
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ]
});
