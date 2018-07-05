const env = process.env.NODE_ENV

// TODO 还没有抽离完成

// 1、Note the used of MULTI and EXEC in order to make sure that
// we'll both increment and set the expire at every API call.
// 2、Date.now() 性能

/**
 * [rate description]
 * @param  {[String]} options.key      [description]
 * @param  {[Number]} options.max      [description]
 * @param  {[String]} options.redirect [description]
 */
function rate(ctx, options) {
  let Time = Date.now()
    .toString()
    .substr(0, 10)
  let currentSecond = 'act01Activity-' + env + '-' + Time
  return new Promise(function (resolve, reject) {
    ctx.redisClient.incr(currentSecond, (err, count) => {
      'use strict'
      if (err) {
        reject(new Error('rate'))
      } else {
        console.log('count =>' + count)
        if (parseInt(count) > 499) {
          resolve()
        } else {
          reject()
        }
      }
    })
  })
}

const ratelimte = options => {
  return async (ctx, next) => {
    let answerUrl = '/error'
    try {
      await rate(ctx, options)
      ctx.redirect(answerUrl)
    } catch (error) {
      await next()
    }
  }
}

module.exports = ratelimte
