// 创建redis client 及重试机制

const redis = require('redis')

const logInfo = type => {
  return function () {
    console.log(type, arguments)
  }
}

const defaultOptions = {
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The redis server refused the connection')
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted')
    }
    if (options.attempt > 10) {
      return undefined
    }
    return Math.min(options.attempt * 100, 3000)
  }
}
const redisErrorHandler = err => {
  throw new Error(err)
}

const connectRedis = (app, redisConfig) => {
  const redisClient = redis.createClient(
    Object.assign(redisConfig, defaultOptions)
  )
  redisClient.on('error', redisErrorHandler)
  redisClient.on('connect', logInfo('redis connected'))
  redisClient.on('ready', logInfo('redis ready'))
  redisClient.on('reconnecting', logInfo('redis reconnecting'))
  redisClient.on('end', logInfo('redis end'))

  // 给ctx绑定redisClient
  app.use(async (ctx, next) => {
    ctx.state.redisClient = redisClient
    await next()
  })
}

module.exports.connect = connectRedis
