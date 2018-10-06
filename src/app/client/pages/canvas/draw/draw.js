import { fabric } from 'fabric'
import { plugins } from './plugins'
import { genKey, eventEmitter, getSystem, LoadImageAsync, browser } from './plugins/util'
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
let instance = null
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
    this.zoomPercent = 1
    this._vm = vm
    this.imgCache = {}
    this.SYNC_TYPE = SYNC_TYPE
    this.index = 0
    this.textEditing = false
    this.canvaswidth = container.offsetWidth
    this.canvasHeight = container.offsetHeight
    instance = this
    window.canvas = this.layerDraw
    this.lastPosX = this.lastPosY = null
  }
  init() {
    this.initBrush()
    this.initSelect()
    this.initPan()
    this.initText()
    this.initZoom()
    this.registerEvents()
  }
  getInstance() {
    return instance
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
    canvas.on('after:render', () => {
      this._vm.hideLoading()
    })
    eventEmitter.addListener('on-should-draw-img', (ev) => {
      this.addImage(ev)
    })
    eventEmitter.addListener('on-brush-update', (width, color) => {
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = +width
    })
    eventEmitter.addListener('on-text-update', (size, color) => {
      canvas.getActiveObjects().forEach(o => {
        if (o.type !== 'i-text') return
        o.setColor(color)
        canvas.renderAll()
      })
      // canvas.freeDrawingBrush.width = +width
    })
    window.addEventListener('resize', () => {
      canvas.setWidth(this.container.offsetWidth)
      canvas.setHeight(this.container.offsetHeight)
    })
  }
  addImage(url) {
    const canvas = this.layerDraw
    LoadImageAsync(url).then((attr) => {
      let scale = 1
      let left = 0
      if (attr.width >= this.canvaswidth / 2) {
        scale = (this.canvaswidth / (2 * attr.width)).toFixed(1)
      }
      left = (this.canvaswidth - attr.width * scale) / 2
      fabric.Image.fromURL(url, (upImg) => {
        const img = upImg.set({ left: left, top: 150 }).scale(scale)
        img.set('id', genKey())
        img.set('btype', this.current)
        canvas.add(img)
        this._vm.sync('uploadImg', SYNC_TYPE.INSERT, img.toJSON(['id', 'btype']))
      }, { crossOrigin: 'Anonymous' })
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
      if (browser.versions.ios || browser.versions.android) {
        this.lastPosX = e.e.touches[0].clientX
        this.lastPosY = e.e.touches[0].clientY
      }
    })
    canvas.on('mouse:move', (e) => {
      if (this.current !== 'pan') return
      if (!panning) return
      if (browser.versions.ios || browser.versions.android) {
        e = e.e
        var vpt = canvas.viewportTransform.slice(0)
        vpt[4] += e.targetTouches[0].clientX - this.lastPosX
        vpt[5] += e.targetTouches[0].clientY - this.lastPosY
        canvas.setViewportTransform(vpt)
        this.lastPosX = e.targetTouches[0].clientX
        this.lastPosY = e.targetTouches[0].clientY
      } else {
        var delta = new fabric.Point(e.e.movementX, e.e.movementY)
        canvas.relativePan(delta)
      }
    })
  }
  initText() {
    const canvas = this.layerDraw
    let isTmpChangeState = false
    let tmpState = ''
    canvas.on('text:editing:entered', (e) => {
      this.textEditing = true
    })
    canvas.on('text:editing:exited', (e) => {
      this.textEditing = false
    })
    canvas.on('selection:created', (e) => {
      if (this.current === 'kbText') return
      if (e.selected && e.selected.length === 1 && e.selected[0].type === 'i-text') {
        tmpState = this.current
        this._vm.choose('kbText', true)
        isTmpChangeState = true
      }
    })
    canvas.on('selection:cleared', (e) => {
      if (isTmpChangeState) {
        this._vm.choose(tmpState, true)
        tmpState = ''
        isTmpChangeState = false
      }
    })
  }
  initZoom() {
    const canvas = this.layerDraw
    const baseT = getSystem() === 'win' ? 1000 : 200
    canvas.on('mouse:wheel', (opt) => {
      if (this.current !== 'pan') {
        return
      }
      var delta = opt.e.deltaY

      // var pointer = canvas.getPointer(opt.e)
      var zoom = canvas.getZoom()
      zoom = zoom - delta / baseT
      if (zoom > 1.5) zoom = 1.5
      if (zoom < 0.1) zoom = 0.1
      this.zoomPercent = zoom
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })
  }
  setZoom(zoom) {
    const canvas = this.layerDraw
    const center = canvas.getCenter()
    const transform = { x: center.left, y: center.top }
    canvas.zoomToPoint(transform, zoom)
  }
  redo(opt) {
    // plugins[opt.key].redo.call(this.vm, opt, this.layerDraw)
  }
  undo(opt) {
    // plugins[opt.key].undo.call(this.vm, opt, this.layerDraw)
  }
  deleteSelected() {
    if (this.textEditing) return
    const canvas = this.layerDraw
    const deleteIds = canvas.getActiveObjects().map(o => o.id)
    canvas.getActiveObjects().forEach(o => canvas.remove(o))
    this._vm.sync('choose', SYNC_TYPE.DELETE, deleteIds)
  }
  addText(input) {
    const canvas = this.layerDraw
    const text = new fabric.IText(input)
    text.set('id', genKey())
    text.set('btype', this.current)
    text.set({ left: canvas.width / 3, top: canvas.height / 3 })
    text.setColor(this._vm.plugins.kbText.setting.color)
    canvas.add(text)
    this._vm.sync('kbText', SYNC_TYPE.INSERT, text.toJSON(['id', 'btype']))
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
Draw.getInstance = function () {
  return instance
}

export default Draw
