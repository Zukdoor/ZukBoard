const CURRENT_PATH = process.cwd()
const webpack = require('webpack')
const merge = require('webpack-merge')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const config = require(CURRENT_PATH + '/config').webpackConfig
const utils = require(CURRENT_PATH + '/build/utils')
const baseWebpackConfig = require(CURRENT_PATH + '/build/webpack.base.conf')

Object.keys(baseWebpackConfig.entry).forEach(name => {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(
    baseWebpackConfig.entry[name]
  )
})

module.exports = merge(baseWebpackConfig, {
  mode: 'development', // mode为development自动配置 NoEmitOnErrorsPlugin 与DefinePlugin
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: '/dist/'
  },
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    // new ExtractTextPlugin({filename: utils.assetsPath('css/[name].[contenthash].css')}),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: '"development"'
    //   }
    // }),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  ]
})
