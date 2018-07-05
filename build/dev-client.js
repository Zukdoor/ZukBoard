/* eslint-disable */
require('eventsource-polyfill')
// var hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true')
var hotClient = require('webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true')

hotClient.subscribe(function(event) {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
