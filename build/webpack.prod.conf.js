const CURRENT_PATH = process.cwd()
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const safeParser = require('postcss-safe-parser')
const config = require(CURRENT_PATH + '/config').webpackConfig
const utils = require(CURRENT_PATH + '/build/utils')
const baseWebpackConfig = require(CURRENT_PATH + '/build/webpack.base.conf')
const GetBundleHash = require(CURRENT_PATH + '/build/getBundleHash')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: -20,
          chunks: 'all'
        }
      }
    },
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[md5:contenthash:hex:20].css')
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        parser: safeParser
      }
    }),
    new GetBundleHash()
  ]
})
module.exports = webpackConfig
