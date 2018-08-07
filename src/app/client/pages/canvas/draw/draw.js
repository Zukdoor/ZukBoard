import {fabric} from 'fabric'
import { plugins } from './plugins'
import { genKey, eventEmitter } from './plugins/util'
fabric.Canvas.prototype.getObjectById = function (id) {
  var objs = this.getObjects()
  for (var i = 0, len = objs.length; i < len; i++) {
    if (objs[i].id === id) {
      return objs[i]
    }
  }
  return 0
}
class Draw {
  constructor(vm, selector, width, height) {
    this.current = 'brush'
    this.layerDraw = new fabric.Canvas('layer-draw', { width: 900, height: 600 })
    this.layerDraw.isDrawingMode = true
    this._vm = vm
    window.canvas = this.layerDraw
  }
  init() {
    this.initBrush()
    this.registerEvents()
  }
  registerEvents() {
    const canvas = this.layerDraw
    canvas.on('path:created', (e) => {
      if (e.path.id === undefined) {
        e.path.set('id', genKey())
        e.path.set('btype', this.current)
      }
      this._vm.sync(e.path.btype, e.path.id, e.path.toJSON(['id', 'btype']), true)
    })
    canvas.on('object:moving', (e) => {
      if (canvas.isDrawingMode) return
      this._vm.sync(e.target.btype, e.target.id, e.target.toJSON(['id', 'btype']), true)
    })
    canvas.on('object:modified', (e) => {
      this._vm.sync(e.target.btype, e.target.id, e.target.toJSON(['id', 'btype']), true)
    })
    eventEmitter.addListener('on-should-draw-img', (ev) => {
      fabric.Image.fromURL(ev, (upImg) => {
        const img = upImg.set({left: 0, top: 0})
        img.set('id', genKey())
        img.set('btype', this.current)
        canvas.add(img)
        this._vm.sync('uploadImg', '123', img.toJSON(['id', 'btype']), true)
      })
    })
    eventEmitter.addListener('on-brush-update', (width, color) => {
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = width
    })
  }
  clear() {
    this.layerDraw.clear()
  }
  callInit() {
    Object.keys(plugins).forEach(key => {
      plugins[key].init && plugins[key].init.call(this.vm, this.layerDraw, this.layerCover)
    })
  }
  syncBoard(opt) {
    const canvas = this.layerDraw
    let obj = canvas.getObjectById(opt.data.id)
    if (obj) {
      obj.set(opt.data)
      canvas.renderAll()
      canvas.calcOffset()
      return
    }
    fabric.util.enlivenObjects([opt.data], (objects) => {
      objects.forEach(function (o) {
        canvas.add(o)
      })
    })
  }
  initBoard(list) {
    const canvas = this.layerDraw
    console.log(list.map(e => e.data))
    fabric.util.enlivenObjects(list.map(e => e.data), (objects) => {
      canvas.renderOnAddRemove = false
      objects.forEach(o => {
        canvas.add(o)
      })
      canvas.renderOnAddRemove = true
      canvas.renderAll()
    })
  }
  initBrush() {
    const canvas = this.layerDraw
    const setting = this._vm.plugins.brush.setting
    canvas.freeDrawingBrush.color = setting.color
    canvas.freeDrawingBrush.width = setting.width
  }
  redo(opt) {
    // plugins[opt.key].redo.call(this.vm, opt, this.layerDraw)
  }
  undo(opt) {
    // plugins[opt.key].undo.call(this.vm, opt, this.layerDraw)
  }
  syncBoardWithPoint(opt) {
    // plugins[opt.key].syncBoardWithPoint.call(this.vm, opt, this.layerDraw)
  }
  setKey(key) {
    if (key === this.current) {
      return
    }
    // this.callUnInstall(this.current)
    this.current = key
    if (key === 'brush') {
      this.layerDraw.isDrawingMode = true
      return
    }
    this.layerDraw.isDrawingMode = false
  }
}

export default Draw
