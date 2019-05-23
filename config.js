const CURRENT_PATH = process.cwd()

const { join } = require('path')
const port = require('read-pkg-up').sync().package.port

const mongoBaseUri = process.env.MONGODB_URI

module.exports = {
  port: port,
  ENV_VAR: {
    development: {
      staticBaseUrl: '/',
      apiUrl: '',
      db: 'mongodb://127.0.0.1:27017/board'
    },
    testing: {
      staticBaseUrl: '/',
      apiUrl: '',
      db: 'mongodb://127.0.0.1:27017/board'
    },
    production: {
      staticBaseUrl: '/',
      apiUrl: '',
      db: 'mongodb://127.0.0.1:27017/board'
    },
    heroku: {
      staticBaseUrl: '/',
      apiUrl: '',
      db: mongoBaseUri
    },
    now: {
      staticBaseUrl: '/',
      apiUrl: '',
      db: mongoBaseUri
    }
  },
  webpackConfig: {
    build: {
      assetsRoot: join(CURRENT_PATH, '/public'),
      assetsSubDirectory: 'dist',
      productionSourceMap: true,
      productionGzip: false,
      productionGzipExtensions: ['js', 'css'],
      bundleAnalyzerReport: process.env.npm_config_report
    },
    dev: {
      port: port,
      autoOpenBrowser: false,
      assetsSubDirectory: 'dist',
      entries: join(CURRENT_PATH, '/src/**/client/main.js'),
      proxyTable: {},
      cssSourceMap: false
    }
  }
}
