const CURRENT_PATH = process.cwd()
const path = require('path')
const config = require(CURRENT_PATH + '/config').webpackConfig
const utils = require(CURRENT_PATH + '/build/utils')
const vueLoaderConfig = require(CURRENT_PATH + '/build/vue-loader.conf')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack')

console.log(vueLoaderConfig)

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: utils.getEntries(config.dev.entries),
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [
          resolve('src')
          // , resolve('test')
        ],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     process.env.NODE_ENV !== 'production' ? 'vue-style-loader'
      //       : MiniCssExtractPlugin.loader,
      //     'css-loader'
      //   ]
      // },
      // {
      //   test: /\.scss$/,
      //   use: [
      //     process.env.NODE_ENV !== 'production' ? 'vue-style-loader'
      //       : MiniCssExtractPlugin.loader,
      //     'css-loader',
      //     'sass-loader'
      //   ]
      // },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('images/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '/' + utils.assetsPath('/fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        GA_ID: JSON.stringify(process.env.GA_ID)
      }
    })
  ]
}
