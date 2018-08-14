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
const SYNC_TYPE = {
  INSERT: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MOVE: 'move',
  REDO: 'redo',
  UNDO: 'undo'
}

class Draw {
  constructor(vm, selector, width, height) {
    this.current = 'choose'
    const container = document.querySelector('.canvas-container')
    this.container = container
    this.layerDraw = new fabric.Canvas('layer-draw', {
      width: container.offsetWidth,
      height: container.offsetHeight,
      preserveObjectStacking: true,
      perPixelTargetFind: true,
      targetFindTolerance: 15
      // controlsAboveOverlay: true
    })
    this._vm = vm
    this.imgCache = {}
    this.SYNC_TYPE = SYNC_TYPE
    this.index = 0
    window.canvas = this.layerDraw
  }
  init() {
    this.initBrush()
    this.initSelect()
    this.initPan()
    this.registerEvents()
  }
  registerEvents() {
    const canvas = this.layerDraw
    canvas.on('path:created', (e) => {
      if (e.path.id === undefined) {
        e.path.set('id', genKey())
        e.path.set('btype', this.current)
      }
      this._vm.sync(e.path.btype, SYNC_TYPE.INSERT, e.path.toJSON(['id', 'btype']))
    })
    canvas.on('object:moving', (e) => {
      if (canvas.isDrawingMode) return
      this._vm.sync(e.target.btype, SYNC_TYPE.MOVE, e.target.toJSON(['id', 'btype']), true)
    })
    canvas.on('object:modified', (e) => {
      this._vm.sync(e.target.btype, SYNC_TYPE.UPDATE, e.target.toJSON(['id', 'btype']))
    })
    eventEmitter.addListener('on-should-draw-img', (ev) => {
      fabric.Image.fromURL(ev, (upImg) => {
        const img = upImg.set({left: 0, top: 0})
        img.set('id', genKey())
        img.set('btype', this.current)
        canvas.add(img)
        this._vm.sync('uploadImg', SYNC_TYPE.INSERT, img.toJSON(['id', 'btype']))
      })
    })
    eventEmitter.addListener('on-brush-update', (width, color) => {
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = +width
    })
    window.addEventListener('resize', () => {
      canvas.setWidth(this.container.offsetWidth)
      canvas.setHeight(this.container.offsetHeight)
    })
  }
  clear() {
    this.layerDraw.clear()
    this.index = 0
  }
  callInit() {
    Object.keys(plugins).forEach(key => {
      plugins[key].init && plugins[key].init.call(this.vm, this.layerDraw, this.layerCover)
    })
  }
  syncBoard(type, opt) {
    console.log(type, opt)
    const data = opt.data
    type === SYNC_TYPE.INSERT && this.handleSyncInsert(data)
    type === SYNC_TYPE.DELETE && this.handleSyncRemove(data)
    type === SYNC_TYPE.UPDATE && this.handleSyncUpdate(data)
    type === SYNC_TYPE.MOVE && this.handleSyncUpdate(data)
  }
  handleSyncUpdate(data) {
    let obj = this.layerDraw.getObjectById(data.id)
    if (!obj) return
    obj.set(data)
    this.layerDraw.renderAll()
    this.layerDraw.calcOffset()
    obj.setCoords()
  }
  handleSyncRemove(data) {
    data.forEach(id => {
      let obj = this.layerDraw.getObjectById(id)
      if (!obj) return
      this.layerDraw.remove(obj)
    })
  }
  handleSyncInsert(data) {
    const canvas = this.layerDraw
    data.zIndex = this.index++
    fabric.util.enlivenObjects([data], (objects) => {
      let o = objects[0]
      canvas.add(o)
      o.setCoords()
      canvas.moveTo(o, o.zIndex)
    })
  }
  handleImageInsert(data, o) {
    let img = this.imgCache[data.id]
    if (img) {
      const imgObj = new fabric.Image(img)
      imgObj.set(o)
      o.setCoords()
      this.layerDraw.moveTo(o, o.zIndex)
      // this.layerDraw.add(img)
      return
    }
    img = new Image()
    img.src = data.src
    img.onload = () => {
      this.imgCache[data.id] = img
      const imgObj = new fabric.Image(img)
      delete o.src
      imgObj.set(o)
      o.setCoords()
      this.layerDraw.moveTo(o, o.zIndex)
    }
  }
  sort() {
    // const this.layerDraw.get
  }
  initBoard(list) {
    const canvas = this.layerDraw
    let deleteIds = []
    list.forEach(item => {
      if (item.type !== SYNC_TYPE.DELETE) {
        return
      }
      deleteIds = deleteIds.concat(item.id)
    })
    list.forEach(item => {
      if (item.data.type !== 'image' || item.type !== SYNC_TYPE.INSERT) {
        return
      }
      let lastItem = list.filter(i => (item.id === i.id)).pop()
      item.data = Object.assign({}, lastItem.data)
    })
    list = list.filter(item => {
      if (item.type === SYNC_TYPE.DELETE) {
        return false
      }
      return deleteIds.indexOf(item.id) === -1
    })
    canvas.renderOnAddRemove = false
    list.forEach(item => this.syncBoard(item.type, item))
    canvas.renderOnAddRemove = true
    canvas.renderAll()
    canvas.calcOffset()
  }
  initBrush() {
    const canvas = this.layerDraw
    const setting = this._vm.plugins.brush.setting
    canvas.freeDrawingBrush.color = setting.color
    canvas.freeDrawingBrush.width = setting.width
  }
  initSelect() {
    const canvas = this.layerDraw
    canvas.on('selection:created', (e) => {
      this._vm.canDelete = true
    })
    canvas.on('selection:cleared', (e) => {
      this._vm.canDelete = false
    })
  }
  toggleSelection(flag) {
    this.layerDraw.selection = flag
    this.layerDraw.forEachObject(o => {
      o.hasControls = flag
      o.selectable = flag
      o.evented = flag
      o.hasBorders = flag
      o.lockMovementX = !flag
      o.lockMovementY = !flag
    })
  }
  initPan() {
    const canvas = this.layerDraw
    let panning = false
    canvas.on('mouse:up', (e) => {
      if (this.current !== 'pan') return
      panning = false
      canvas.defaultCursor = '-webkit-grab'
    })
    canvas.on('mouse:out', (e) => {
      if (this.current !== 'pan') return
      panning = false
      canvas.defaultCursor = '-webkit-grab'
    })
    canvas.on('mouse:down', (e) => {
      if (this.current !== 'pan') return
      canvas.defaultCursor = '-webkit-grabbing'
      panning = true
    })
    canvas.on('mouse:move', (e) => {
      if (this.current !== 'pan') return
      if (!panning) return
      var delta = new fabric.Point(e.e.movementX, e.e.movementY)
      canvas.relativePan(delta)
    })
  }
  redo(opt) {
    // plugins[opt.key].redo.call(this.vm, opt, this.layerDraw)
  }
  undo(opt) {
    // plugins[opt.key].undo.call(this.vm, opt, this.layerDraw)
  }
  deleteSelected() {
    const canvas = this.layerDraw
    const deleteIds = canvas.getActiveObjects().map(o => o.id)
    canvas.getActiveObjects().forEach(o => canvas.remove(o))
    this._vm.sync('choose', SYNC_TYPE.DELETE, deleteIds)
  }
  setKey(key) {
    const canvas = this.layerDraw
    if (key === this.current) {
      return
    }
    // this.callUnInstall(this.current)
    this.current = key
    if (key === 'brush') {
      this.toggleSelection(true)
      canvas.defaultCursor = 'crosshair'
      this.layerDraw.isDrawingMode = true
      return
    }
    if (key === 'pan') {
      this.toggleSelection(false)
      canvas.defaultCursor = '-webkit-grab'
      this.layerDraw.isDrawingMode = false
      return
    }
    canvas.defaultCursor = 'default'
    this.toggleSelection(true)
    this.layerDraw.isDrawingMode = false
  }
}

export default Draw
