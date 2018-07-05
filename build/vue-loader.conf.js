const CURRENT_PATH = process.cwd()
const utils = require(CURRENT_PATH + '/build/utils')
const config = require(CURRENT_PATH + '/config').webpackConfig
const isDevlopment = process.env.NODE_ENV === 'development'

console.log(isDevlopment)
module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isDevlopment
      ? config.dev.cssSourceMap
      : config.build.productionSourceMap,
    extract: !isDevlopment
  })
}
