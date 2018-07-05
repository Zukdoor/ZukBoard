const CURRENT_PATH = process.cwd()
const env = process.env.NODE_ENV || 'development'
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const favicon = require('koa-favicon')
const bodyparser = require('koa-bodyparser')
const nunjucks = require('nunjucks')
const serve = require('koa-static')
const session = require('koa-session')
// http 缓存
const etag = require('koa-etag')
const cacheControl = require('koa-cache-control')
const conditional = require('koa-conditional-get')

const renderConf = require(CURRENT_PATH + '/config')
const WEBPACK_HASH_MAP = require(CURRENT_PATH + '/public/webpack-hash-map')
const devServer = require(CURRENT_PATH + '/build/dev-server')
const finalHandler = require(CURRENT_PATH + '/server/middleware/finalHandler')
// const htmlMinifier = require(CURRENT_PATH + '/server/middleware/htmlMinifier')
const router = require(CURRENT_PATH + '/server/middleware/route')

app.keys = ['some secret hurr']
app.use(session({
  key: 'USER_SESSION_ID',
  cookie: {
    maxAge: Date.now() + 1000 * 60 * 60 * 24
  }
}, app))

nunjucks.configure(CURRENT_PATH + '/server/views', {
  autoescape: true,
  watch: true, // 依赖 chokidar
  tags: {
    variableStart: '##',
    variableEnd: '##'
  }
})
// add globle attribute to ctx.state
app.use(async (ctx, next) => {
  ctx.state.ENV = env
  ctx.state.WEBPACK_HASH_MAP = WEBPACK_HASH_MAP
  ctx.state.staticBaseUrl = renderConf.ENV_VAR[env].staticBaseUrl
  ctx.state.testApiUrl = renderConf.ENV_VAR[env].testApiUrl
  await next()
})

app.use(finalHandler())
app.use(favicon(CURRENT_PATH + '/public/favicon.ico'))
app.use(serve(CURRENT_PATH + '/public'), { maxage: 3601000 }) // 静态资源缓存
app.use(json())
// app.use(htmlMinifier())
app.use(conditional())
app.use(etag())
app.use(cacheControl())
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)

// Must be used before any router is used
app.use(
  views(CURRENT_PATH + '/server/views', {
    map: { html: 'nunjucks' }
  })
)

if (env === 'development') {
  devServer(app)
}

app.use(router)

app.listen(renderConf.port, () => {
  console.log(`App (${env}) is now running on port => ${renderConf.port}`)
})
