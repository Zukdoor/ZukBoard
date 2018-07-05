import * as spritejs from 'spritejs'
import plugins from './plugins'
const {Scene} = spritejs

class Draw {
  constructor(vm, selector, width, height) {
    this._scene = new Scene(selector, width, height)
    this.layerCover = null
    this.layerDraw = null
    this.drawing = false
    this.vm = vm
  }
  init() {
    this.layerCover = this._scene.layer('canvas-cover')
    this.layerDraw = this._scene.layer('canvas-draw')
    this.registerEvents()
  }
  registerEvents() {
    this.layerCover.on('mouseup', (ev) => {
      this.drawing = false
      this.emitEvents('mouseup', ev)
    })
    this.layerCover.on('mousedown', (ev) => {
      this.drawing = true
      this.emitEvents('mousedown', ev)
    })
    this.layerCover.on('mousemove', (ev) => {
      if (!this.drawing) return
      this.emitEvents('mousemove', ev)
    })
  }
  emitEvents(event, ev) {
    Object.keys(plugins).forEach(key => {
      plugins[key].draw[event] && plugins[key].draw[event].call(this.vm, ev, this.layerDraw)
    })
  }
}

export default Draw
