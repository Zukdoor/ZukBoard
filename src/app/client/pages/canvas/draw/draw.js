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
    this.layerDraw = this._scene.layer('canvas-draw', {
      renderMode: 'repaintAll'
    })
    this.registerEvents()
    this.callInit()
  }
  registerEvents() {
    this.layerDraw.canvas.addEventListener('mouseup', (ev) => {
      this.drawing = false
      this.emitEvents('mouseup', ev)
      ev.preventDefault()
      ev.stopPropagation()
    })
    this.layerDraw.canvas.addEventListener('mousedown', (ev) => {
      this.drawing = true
      this.emitEvents('mousedown', ev)
    })
    this.layerDraw.canvas.addEventListener('mousemove', (ev) => {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      if (!this.drawing) return
      this.emitEvents('mousemove', ev)
    }, true)
    document.body.addEventListener('mouseup', (ev) => {
      console.log(ev)
      this.drawing = false
      this.emitEvents('mouseup', ev)
    })
    // document.body.addEventListener('mousemove', (ev) => {
    //   if (!this.drawing) return
    //   this.drawing = false
    //   this.emitEvents('mouseup', ev)
    // })
  }
  emitEvents(event, ev) {
    Object.keys(plugins).forEach(key => {
      plugins[key].draw[event] && plugins[key].draw[event].call(this.vm, ev, this.layerDraw)
    })
  }
  clear() {
    // let canvas = document.querySelector('[data-layer-id=canvas-draw]')
    // this.layerDraw.clearContext(canvas.getContext('2d'))
    this.layerDraw.clearContext(this.layerDraw.context)
  }
  callInit() {
    Object.keys(plugins).forEach(key => {
      plugins[key].init && plugins[key].init.call(this.vm, this.layerDraw, this.layerCover)
    })
  }
  syncBoard(opt) {
    plugins[opt.key].syncBoard.call(this.vm, opt, this.layerDraw)
  }
  redo(opt) {
    plugins[opt.key].redo.call(this.vm, opt, this.layerDraw)
  }
  undo(opt) {
    plugins[opt.key].undo.call(this.vm, opt, this.layerDraw)
  }
  syncBoardWithPoint(opt) {
    plugins[opt.key].syncBoardWithPoint.call(this.vm, opt, this.layerDraw)
  }
}

export default Draw
