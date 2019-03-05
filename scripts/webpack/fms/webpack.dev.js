'use strict';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const gfDev = require("../webpack.dev.js");
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//Override (entry, output, plugins) Written by JGW
let fmsDev = merge(common, {
  entry: {
    app: './public/app-thingspin-fms/index.ts',
    dark: './public/sass/fms.dark.scss',
    light: './public/sass/fms.light.scss',
  },

  output: {
    path: path.resolve(__dirname, '../../../public/build'),
    filename: 'fms-[name].[hash].js',
    // Keep publicPath relative for host.com/grafana/ deployments
    publicPath: gfDev.output.publicPath,
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
      require('./sass.rule.js')({ sourceMap: false, minimize: false, preserveUrl: false }),
      {
        test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader'
      },
    ]
  },

  plugins: [
    new CleanWebpackPlugin('../../../public/build', { allowExternal: true }),
    new MiniCssExtractPlugin({
      filename: "fms.[name].[hash].css"
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/fms-error.html'),
      template: path.resolve(__dirname, '../../../public/views/fms-error-template.html'),
      inject: false,
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../../public/views/fms-index.html'),
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
    // new BundleAnalyzerPlugin({
    //   analyzerPort: 8889
    // })
  ]
});

//Copy already used Grafana webpack.dev.js
const { devtool, mode, } = gfDev;
fmsDev = Object.assign(fmsDev, {
  devtool,
  mode,
  module: gfDev.module,
});

module.exports = fmsDev;