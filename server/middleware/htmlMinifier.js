const minify = require('html-minifier').minify

module.exports = () => {
  return async (ctx, next) => {
    await next()
    if (!ctx.response.is('html')) return
    var body = ctx.response.body
    if (!body) return
    if (typeof body.pipe === 'function') return
    if (Buffer.isBuffer(body)) {
      body = body.toString('utf8')
    } else if (typeof body === 'object') {
      return
    }
    ctx.response.body = minify(body, {
      collapseWhitespace: true
    })
  }
}
