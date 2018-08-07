import * as spritejs from 'spritejs'
import { plugins } from './plugins'
const {Scene} = spritejs

class Draw {
  constructor(vm, selector, width, height) {
    this._scene = new Scene(selector, {
      viewport: ['auto', 'auto'],
      stickMode: 'height',
      stickExtend: true,
      resolution: [1600, 1200]})
    this.layerCover = null
    this.layerDraw = null
    this.drawing = false
    this.current = 'brush'
    this.vm = vm
  }
  init() {
    this.layerCover = this._scene.layer('canvas-cover', {
      // renderMode: 'repaintAll'
    })
    this.layerDraw = this._scene.layer('canvas-draw', {
      renderMode: 'repaintAll'
    })
    this.registerEvents()
    this.callInit()
  }
  registerEvents() {
    this.layerDraw.on('mouseup', (ev) => {
      if (this.current === 'uploadImg' ||
      this.current === 'choose') return
      this.drawing = false
      this.emitEvents('mouseup', 'draw', ev)
      ev.stopDispatch()
    })
    this.layerDraw.on('mousedown', (ev) => {
      this.drawing = true
      this.emitEvents('mousedown', 'draw', ev)
    })
    this.layerDraw.on('mousemove', (ev) => {
      if (this.current === 'uploadImg' ||
        this.current === 'choose') return
      // ev.stopImmediatePropagation()
      // ev.preventDefault()
      this.emitEvents('mousemove', 'cover', ev)
      if (!this.drawing) return
      this.emitEvents('mousemove', 'draw', ev)
    }, true)
    document.body.addEventListener('mouseup', (ev) => {
      if (this.current === 'uploadImg' ||
        this.current === 'choose') return
      if (!this.drawing) return
      this.drawing = false
      // this.emitEvents('mouseup', 'draw', ev)
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
    // const layerDraw = this.layerDraw
    // function remove() {
    //   if (layerDraw.children.length === 0) return
    //   layerDraw.children.forEach(item => {
    //     item.remove()
    //   })
    //   remove()
    // }
    // remove()
    this.layerDraw.clear()
    Object.keys(plugins).forEach(key => {
      plugins[key].clear && plugins[key].clear.call(this.vm, this.layerDraw, this.layerCover)
    })
    // this.vm.renderList = []
    this.vm.zindex = 0
    // plugins[opt.key].clear && plugins[opt.key].clear.call(this.vm)
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
