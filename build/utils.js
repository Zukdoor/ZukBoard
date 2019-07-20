const CURRENT_PATH = process.cwd()
const glob = require('glob')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const config = require(CURRENT_PATH + '/config').webpackConfig

exports.assetsPath = _path => {
  var assetsSubDirectory =
    process.env.NODE_ENV === 'development'
      ? config.dev.assetsSubDirectory
      : config.build.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

// 获取所有入口文件
exports.getEntries = globPath => {
  const files = glob.sync(globPath)
  const entries = {}
  files.forEach(filepath => {
    var split = filepath.split('/')
    var name = split[split.length - 3]
    entries[name] = filepath
  })
  console.log(entries)
  return entries
}

exports.cssLoaders = options => {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      // minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader',
        publicPath: '../../'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = options => {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
