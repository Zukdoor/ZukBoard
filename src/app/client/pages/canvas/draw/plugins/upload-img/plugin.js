import uuid from 'node-uuid'
import * as spritejs from 'spritejs'
import { eventEmitter } from '../util'

const { Sprite } = spritejs

// 每条线的唯一ID
let _id = ''
const PLUGIN_NAME = 'uploadImg'
// vue instance
let _vm = {}

export default {
  name: PLUGIN_NAME,
  init(layerDraw, layerCover) {
    _vm = this
    console.log(_vm, _id, Sprite)
    eventEmitter.addListener('on-should-draw-img', (ev) => {
      _id = uuid.v4()
      const img = new Sprite(ev)
      img.attr({
        anchor: 0.5,
        pos: [500, 250]
      })
      // img.on('click', (evt) => {
      //   console.log(evt)
      // })
      let moving = false
      img.on('mouseup', (evt) => {
        moving = false
        console.log(evt)
      })
      img.on('mousedown', (evt) => {
        moving = true
        console.log(evt)
      })
      layerDraw.on('mousemove', (evt) => {
        console.log(2332)
        if (!moving) return
        img.attr({
          pos: [evt.layerX, evt.layerY]
        })
        console.log(evt)
      })
      layerDraw.append(img)
    })
  },
  uninstall(layerDraw, layerCover) {
  },
  data: {

  },
  syncBoard(data, layer) {
  },
  syncBoardWithPoint(data, layer) {
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
  }

}

// const report = () => {
//   _vm.sync(PLUGIN_NAME, _id, d)
//   data = []
// }
// const reportPoint = (type, point) => {
//   if (!_id) return
//   _vm.syncPoint(PLUGIN_NAME, _id, type, point)
// }
