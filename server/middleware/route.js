const path = require('path')
const reg = require('path-to-regexp')
const { existsSync } = require('fs')
const debug = require('debug')('middleware:router')
const CURRENT_PATH = process.cwd()

const getPagePath = page => {
  return path.join(CURRENT_PATH + '/src/' + page + '/server/router.js')
}

const addRenderBundle = async (ctx, page) => {
  if (existsSync(getPagePath(page))) {
    // 给pages动态添加bundle
    ctx.errorRender = ctx.render
    const _render = ctx.render
    let renderArguments = []
    ctx.render = function () {
      let options = arguments[1] || {}
      renderArguments = renderArguments.concat(arguments[0], options)
      // 给webpack构建添加bundle
      renderArguments[1].bundle = page
      return _render.apply(ctx, renderArguments)
    }
  }
}

const defaultRoute = async (ctx, info, method) => {
  try {
    let controller = ''
    let page = info[1]
    let match = false
    const action = info.splice(2).join('/') || '/'
    await addRenderBundle(ctx, page)

    debug('page =>' + page)
    if (page === '' || page === 'ping') { // route /
      debug('which page =>' + page)
      controller = await require(path.join(
        CURRENT_PATH,
        '/server/routes/index'
      ))
    } else if (existsSync(getPagePath(page))) { // route /api and /apps
      controller = await require(getPagePath(page))
    } else {
      ctx.status = 404
      ctx.throw(404)
    }
    let keys = Object.keys(controller)
    debug('keys => ' + keys)
    for (var i = 0, len = keys.length; i < len; i++) {
      let f = keys[i]
      let mid = f.split('#')
      let len = mid.length
      let httpMethod = len === 1 ? 'get' : mid[0]
      let router = mid[len - 1]
      debug('router => ' + router)
      let regex = ''
      if (page === '') {
        regex = reg(router, []).exec(page + '/' + action)
      } else if (page === 'ping') {
        regex = reg(router, []).exec(page + '/')
      } else {
        regex = reg(router, []).exec(action)
      }
      debug('regex => ' + regex)
      if (!match && httpMethod === method && regex) {
        ctx.params = regex[1]
        match = true
        return await controller[f](ctx, regex.splice(1))
      }
    }
    if (!match) {
      debug('not match')
      ctx.status = 404 // 一级路由正确，二级路由不匹配
    }
  } catch (error) {
    debug('ctx.status' + ctx.status)
    ctx.throw(error)
  }
}

module.exports = async (ctx, next) => {
  return await defaultRoute(
    ctx,
    ctx.url.split('?')[0].split('/'),
    ctx.method.toLowerCase()
  )
}
