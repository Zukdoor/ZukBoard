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
    this.layerDraw = new fabric.Canvas('layer-draw', { width: 900, height: 600 })
    this._vm = vm
    this.imgCache = {}
    this.SYNC_TYPE = SYNC_TYPE
    window.canvas = this.layerDraw
  }
  init() {
    this.initBrush()
    this.initSelect()
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
  }
  clear() {
    this.layerDraw.clear()
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
    console.log(data.type, obj)
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
  async handleSyncInsert(data) {
    const canvas = this.layerDraw
    fabric.util.enlivenObjects([data], (objects) => {
      let o = objects[0]
      if (data.key !== 'image') {
        canvas.add(o)
        o.setCoords()
        canvas.moveTo(o, parseInt(o.zindex))
        return
      }
      console.log(this.imgCache[data.id])
      if (this.imgCache[data.id]) {
        o = this.imgCache[data.id]
        canvas.add(o)
        o.setCoords()
        canvas.moveTo(o, parseInt(o.zindex))
        return
      }
      fabric.Image.fromURL(data.src, (upImg) => {
        const img = upImg.set(o)
        this.imgCache[data.id] = img
        canvas.add(img)
        o.setCoords()
        canvas.moveTo(o, parseInt(o.zindex))
      })
    })
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
    // list = filters.filter(item => item.type !== SYNC_TYPE.DELETE)
    // console.log(filters)
    // fabric.util.enlivenObjects(list.map(e => e.data), (objects, index) => {
    //   console.log(index)
    //   objects.forEach(o => {
    //     canvas.add(o)
    //   })
    // })
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
