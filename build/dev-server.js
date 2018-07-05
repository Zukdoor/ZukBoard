const devServer = function (app) {
  const CURRENT_PATH = process.cwd()
  const opn = require('opn')
  const port = require('read-pkg-up').sync().pkg.port
  const webpack = require('webpack')
  const config = require(CURRENT_PATH + '/config').webpackConfig
  const webpackConfig = require(CURRENT_PATH + '/build/webpack.dev.conf')
  const autoOpenBrowser = !!config.dev.autoOpenBrowser
  const compiler = webpack(webpackConfig)
  const { devMiddleware, hotMiddleware } = require('koa-webpack-middleware')

  const webpackDevMiddleware = devMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  })
  const webpackHotMiddleware = hotMiddleware(compiler, {
    log: () => {}
  })
  compiler.plugin('compilation', function (compilation) {
    // compiler.hooks.htmlWebpackPluginAfterEmit.tap('htmlWebpackPluginAfterEmit', params => {
    //   webpackHotMiddleware.publish({ action: 'reload' })
    // })
    // compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    //   cb()
    // })
  })

  app.use(webpackDevMiddleware)
  app.use(webpackHotMiddleware)

  const uri = 'http://127.0.0.1:' + port
  let _resolve
  /* eslint-disable no-new */
  new Promise(resolve => {
    _resolve = resolve
  })
  console.log('> Starting dev server...')
  webpackDevMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV === 'development') {
      opn(uri)
    }
    _resolve()
  })
}

module.exports = devServer
