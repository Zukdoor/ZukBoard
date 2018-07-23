import uuid from 'node-uuid'
import * as spritejs from 'spritejs'
import { eventEmitter } from '../util'

const { Sprite } = spritejs

const PLUGIN_NAME = 'uploadImg'
// vue instance
let _vm = {}
let render = {}

const plugin = {
  name: PLUGIN_NAME,
  init(layerDraw, layerCover) {
    _vm = this
    eventEmitter.addListener('on-should-draw-img', (path) => {
      plugin.initImg('', path, layerDraw)
    })
  },
  uninstall(layerDraw, layerCover) {
  },
  data: {

  },
  syncBoard(data, layer) {
    console.log(data)
    plugin.initImg(data.id, data.data.path, layer, null, true)
  },
  syncBoardWithPoint(data, layer) {
    console.log(data)
    if (!render[data.id]) return
    let img = render[data.id]
    img.attr(data.data)
  },
  cover: {
    mousemove(ev, layer) {
    }
  },
  draw: {
    mouseup(ev, layer) {
    },
    mousedown(ev, layer) {
    },
    mousemove(ev, layer) {
    }
  },
  initImg(id, path, layer, opt, isSync) {
    const imgId = id || uuid.v4()
    const img = new Sprite(path)
    img.attr({
      anchor: 0.5,
      pos: [500, 250]
    })
    render[imgId] = img
    // img.on('click', (evt) => {
    //   console.log(evt)
    // })
    let moving = false
    img.on('mouseup', (evt) => {
      moving = false
    })
    img.on('mousedown', (evt) => {
      moving = true
    })
    layer.on('mousemove', (evt) => {
      if (!moving) return
      img.attr({
        pos: [evt.layerX, evt.layerY]
      })
      reportRealTime(imgId, {
        pos: [evt.layerX, evt.layerY]
      })
    })
    document.addEventListener('mouseup', () => {
      moving = false
    })
    layer.append(img)
    if (!isSync) {
      report(imgId, {
        path,
        pos: [500, 205],
        size: []
      })
    }
  }

}
export default plugin
const report = (id, info) => {
  console.log(id, info, 999)
  _vm.sync(PLUGIN_NAME, id, info)
}
const reportRealTime = (id, info) => {
  if (!id) return
  _vm.syncDataRealTime(PLUGIN_NAME, id, info)
}
