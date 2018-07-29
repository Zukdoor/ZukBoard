import uuid from 'node-uuid'
import * as spritejs from 'spritejs'
import { eventEmitter, changeCursor } from '../util'

const { Sprite } = spritejs

const PLUGIN_NAME = 'uploadImg'
// vue instance
let _vm = {}
let render = {}

const plugin = {
  name: PLUGIN_NAME,
  init(layerDraw, layerCover) {
    _vm = this
    eventEmitter.addListener('on-should-draw-img', (ev) => {
      plugin.initImg('', ev, layerDraw)
    })
    plugin.layerCover = layerCover
  },
  uninstall(layerDraw, layerCover) {
  },
  clear() {
    render = {}
  },
  syncBoard(data, layer) {
    if (!render[data.id]) {
      plugin.initImg(data.id, data.data.path, layer, null, true)
      return
    }
    let img = render[data.id]
    img.attr(data.data)
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
    let x0
    let y0
    let startPos
    img.attr({
      zIndex: _vm.zindex++,
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
      changeCursor(layer, 'default')
      report(imgId, {
        pos: img.attr('pos')
      }, true)
    })
    img.on('mousedown', (evt) => {
      moving = true
      x0 = evt.x
      y0 = evt.y
      startPos = img.attr('pos')
    })
    img.on('mousemove', (evt) => {
      if (!moving) return
      const dx = evt.x - x0
      const dy = evt.y - y0
      img.attr({
        // anchor: [evt.layerX, evt.layerY],
        pos: [startPos[0] + dx, startPos[1] + dy]
      })
      reportRealTime(imgId, {
        pos: [startPos[0] + dx, startPos[1] + dy]
      })
      changeCursor(layer, 'move')
      evt.stopDispatch()
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
      }, true)
    }
  }

}
export default plugin
const report = (id, info, needPush) => {
  console.log(id, info, 999)
  _vm.sync(PLUGIN_NAME, id, info, needPush)
}
const reportRealTime = (id, info) => {
  if (!id) return
  _vm.syncDataRealTime(PLUGIN_NAME, id, info)
}
