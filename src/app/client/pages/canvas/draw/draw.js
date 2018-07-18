import * as spritejs from 'spritejs'
import plugins from './plugins'
const {Scene} = spritejs

class Draw {
  constructor(vm, selector, width, height) {
    this._scene = new Scene(selector, width, height)
    this.layerCover = null
    this.layerDraw = null
    this.drawing = false
    this.current = 'brush'
    this.vm = vm
  }
  init() {
    this.layerCover = this._scene.layer('canvas-cover')
    this.layerDraw = this._scene.layer('canvas-draw', {
      renderMode: 'repaintAll'
    })
    this.layerCover.context.fillStyle = 'black'
    this.layerCover.context.fillRect(0, 0, 1000, 500)
    this.registerEvents()
    this.callInit()
  }
  registerEvents() {
    this.layerDraw.canvas.addEventListener('mouseup', (ev) => {
      this.drawing = false
      this.emitEvents('mouseup', 'draw', ev)
      ev.preventDefault()
      ev.stopPropagation()
    })
    this.layerDraw.canvas.addEventListener('mousedown', (ev) => {
      this.drawing = true
      this.emitEvents('mousedown', 'draw', ev)
    })
    this.layerCover.canvas.addEventListener('mousemove', (ev) => {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      if (!this.drawing) return
      this.emitEvents('mousemove', 'draw', ev)
    }, true)
    this.layerCover.canvas.addEventListener('mouseup', (ev) => {
      // this.moving = false
      this.emitEvents('mouseup', 'cover', ev)
      ev.preventDefault()
      ev.stopPropagation()
    })
    this.layerCover.canvas.addEventListener('mousedown', (ev) => {
      // this.moving = true
      this.emitEvents('mousedown', 'cover', ev)
    })
    this.layerDraw.canvas.addEventListener('mousemove', (ev) => {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      // if (!this.moving) return
      this.emitEvents('mousemove', 'cover', ev)
    }, true)
    document.body.addEventListener('mouseup', (ev) => {
      console.log(ev)
      this.drawing = false
      this.emitEvents('mouseup', 'draw', ev)
    })
    // document.body.addEventListener('mousemove', (ev) => {
    //   if (!this.drawing) return
    //   this.drawing = false
    //   this.emitEvents('mouseup', ev)
    // })
  }
  emitEvents(event, canvas, ev) {
    Object.keys(plugins).forEach(key => {
      if (key !== this.current) {
        return
      }
      console.log(key, event)
      plugins[key][canvas][event] && plugins[key][canvas][event].call(this.vm, ev, canvas === 'draw' ? this.layerDraw : this.layerCover)
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
