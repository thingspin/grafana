const common = require('../webpack.common.js');
const path = require('path');

// Customized entry and module
common.entry = {
  app: './public/app-thingspin-fms/index.ts',
};
common.output = {
    path: path.resolve(__dirname, '../../../public/build'),
    filename: '[name].[hash].js',
    // Keep publicPath relative for host.com/grafana/ deployments
    publicPath: 'public/build/',
  },
common.module.rules = [{
  test: require.resolve('jquery'),
  use: [
    {
      loader: 'expose-loader',
      query: 'jQuery'
    },
    {
      loader: 'expose-loader',
      query: '$'
    }
  ]
},
{
  test: /\.html$/,
  exclude: /fms\-(index|error)\-template\.html/,
  use: [
    { loader: 'ngtemplate-loader?relativeTo=' + (path.resolve(__dirname, '../../../public')) + '&prefix=public' },
    {
      loader: 'html-loader',
      options: {
        attrs: [],
        minimize: true,
        removeComments: false,
        collapseWhitespace: false
      }
    },
  ]
}]


module.exports = common;
