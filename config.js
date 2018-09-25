const CURRENT_PATH = process.cwd()

const { join } = require('path')
const port = require('read-pkg-up').sync().pkg.port

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
      db: 'mongodb://zuk:zukdoor123@ds113703.mlab.com:13703/heroku_dn2rrbn7'
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
