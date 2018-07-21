import * as spritejs from 'spritejs'
import { plugins } from './plugins'
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
    this.layerCover = this._scene.layer('canvas-cover', {
      renderMode: 'repaintAll'
    })
    this.layerDraw = this._scene.layer('canvas-draw', {
      renderMode: 'repaintAll'
    })
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
    this.layerDraw.canvas.addEventListener('mousemove', (ev) => {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      this.emitEvents('mousemove', 'cover', ev)
      if (!this.drawing) return
      this.emitEvents('mousemove', 'draw', ev)
    }, true)
    document.body.addEventListener('mouseup', (ev) => {
      this.drawing = false
      this.emitEvents('mouseup', 'draw', ev)
    })
  }
  emitEvents(event, canvas, ev) {
    Object.keys(plugins).forEach(key => {
      if (key !== this.current) {
        return
      }
      plugins[key][canvas][event] && plugins[key][canvas][event].call(this.vm, ev, canvas === 'draw' ? this.layerDraw : this.layerCover)
    })
  }
  clear() {
    // let canvas = document.querySelector('[data-layer-id=canvas-draw]')
    // this.layerDraw.clearContext(canvas.getContext('2d'))
    this.layerDraw.clearContext(this.layerDraw.context)
    // this.layerDraw.\.context.clearRect(0, 0, 1000, 500)
  }
  callInit() {
    Object.keys(plugins).forEach(key => {
      plugins[key].init && plugins[key].init.call(this.vm, this.layerDraw, this.layerCover)
    })
  }
  callUnInstall(key) {
    if (key) {
      plugins[key].uninstall && plugins[key].uninstall.call(this.vm, this.layerDraw, this.layerCover)
      return
    }
    Object.keys(plugins).forEach(key => {
      plugins[key].uninstall && plugins[key].uninstall.call(this.vm, this.layerDraw, this.layerCover)
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
  setKey(key) {
    if (key === this.current) {
      return
    }
    this.callUnInstall(this.current)
    this.current = key
  }
}

export default Draw
