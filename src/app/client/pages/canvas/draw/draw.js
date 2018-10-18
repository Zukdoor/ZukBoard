import { fabric } from 'fabric'
import { plugins } from './plugins'
import {} from './plugins/fabricOverriding'
import HandleImage from './plugins/upload-img/handleImage'
import { genKey, eventEmitter, getSystem, browser } from './plugins/util'

const SYNC_TYPE = {
  INSERT: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MOVE: 'move',
  REDO: 'redo',
  UNDO: 'undo',
  MOVE_BY_PRESENTER: 'move_by_presenter'
}
let instance = null
class Draw {
  constructor(vm, selector, width, height) {
    this.current = 'choose'
    const container = document.querySelector('.canvas-container')
    this.container = container
    this.isPresenter = false
    this.presenterVp = {
      x: 0,
      y: 0
    }
    this.presenterZoom = 1
    this.isFollowingMode = false
    this.container = container
    this.layerDraw = new fabric.Canvas('layer-draw', {
      width: container.offsetWidth,
      height: container.offsetHeight,
      preserveObjectStacking: true,
      perPixelTargetFind: true,
      targetFindTolerance: 15,
      interactive: false
      // skipTargetFind: false
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
    this.baseWidth = this.canvaswidth
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
    this.initFollow()
    this.registerEvents()
    this.initImage()
    this.registerCanvasEvents()
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
      console.warn('object:moving')
      if (canvas.isDrawingMode) return
      canvas.interactive = false
      if (e.target.type !== 'activeSelection' && e.target.type !== 'group' && !e.target.toActive) {
        canvas.discardActiveObject(e)
        this._vm.canDelete = false
      }
      this._vm.sync(e.target.btype, SYNC_TYPE.MOVE, e.target.toJSON(['id', 'btype']), true)
    })

    canvas.on('object:moved', (e) => {
      if (canvas.getActiveObjects().length > 0 || (e.target && e.target.toActive)) {
        canvas.interactive = true
      }
    })

    canvas.on('object:modified', (e) => {
      this._vm.sync(e.target.btype, SYNC_TYPE.UPDATE, e.target.toJSON(['id', 'btype']))
    })
    canvas.on('after:render', () => {
      this._vm.hideLoading()
    })

    canvas.on('object:selected', (e) => {
      // interactive
      //  canvas.interactive = true
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
    this._vm.$nextTick(() => {
      this.resizeCanvas()
    })
    window.addEventListener('resize', () => {
      this.resizeCanvas()
    })
    this.container.addEventListener('gesturestart', (ev) => {
      if (this.current !== 'pan') return
      this.lastPosX = ev.clientX
      this.lastPosY = ev.clientY
    }, false)
    this.container.addEventListener('gesturechange', (ev) => {
      this.changeZoom(ev)
    }, false)
  }
  resizeCanvas() {
    const canvas = this.layerDraw
    const canvasWidth = this.container.offsetWidth
    const canvasHeight = this.container.offsetHeight // 800 / 1080 * canvasWidth
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.setWidth(canvasWidth)
      canvas.setHeight(canvasHeight)
    }
    if (this.isFollowingMode) {
      this.setZoom(canvasWidth / this.baseWidth * this.presenterZoom)
    }
  }
  initImage() {
    const image = new HandleImage(this)
    image.log()
  }
  changeZoom(ev) {
    const canvas = this.layerDraw
    if (this.current !== 'pan') return
    let scale = event.scale
    let zoom = canvas.getZoom()
    if (scale > 1) {
      zoom = Number(zoom) + Number((scale / 20).toFixed(1))
    } else {
      zoom -= ((scale / 30).toFixed(2))
    }
    if (zoom > 1.5) zoom = 1.5
    if (zoom < 0.1) zoom = 0.1
    this.zoomPercent = zoom
    canvas.zoomToPoint({ x: this.lastPosX, y: this.lastPosY }, zoom)
    ev.preventDefault()
    ev.stopPropagation()
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
      // Specify style of control, 'rect' or 'circle'
      if (e.selected && e.selected.length > 0) {
        console.warn('selection:created')
        setTimeout(() => {
          console.warn('------', this._vm.canDelete)
          this._vm.canDelete = true
          canvas.interactive = true
          canvas.drawControls(canvas.getContext())
        }, 50)

        this.setCornerStyle('circle')
      }
      // this.setControlsVisibility({ tl: true,
      //   tr: true,
      //   br: true,
      //   bl: true,
      //   ml: false,
      //   mt: false,
      //   mr: false,
      //   mb: false,
      //   mtr: true })
    })

    canvas.on('selection:updated', (e) => {
      // Specify style of control, 'rect' or 'circle'
      if (e.selected && e.selected.length > 0) {
        this.setCornerStyle('circle')
      }
    })

    canvas.on('selection:active', (e) => {
      e.target && (e.target.toActive = true)
    })

    canvas.on('before:selection:cleared', (e) => {
      // if (!canvas.getActiveObject()) {
      //   return
      // }
      // if (canvas.getActiveObject().type !== 'group') {
      //   return
      // }
      // canvas.getActiveObject().()
    })

    canvas.on('selection:cleared', (e) => {
      this._vm.canDelete = false
      canvas.interactive = false
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
  setCornerStyle(style) {
    const canvas = this.layerDraw
    // canvas.forEachObject(function (o) {
    //   o.cornerStyle = style
    // })
    //
    // if (!canvas.getActiveObject()) {
    //   return
    // }
    // if (canvas.getActiveObject().type !== 'activeSelection') {
    //   return
    // }
    let activeObject = canvas.getActiveObject()
    activeObject.cornerStyle = 'circle'
  }
  setControlsVisibility(opt) {
    this.layerDraw.forEachObject(function (o) {
      o._controlsVisibility = opt
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

    canvas.on('mouse:down:before', (e) => {

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
        if (this.isPresenter) {
          this._vm.sync('sync', SYNC_TYPE.MOVE_BY_PRESENTER, { x: vpt[4], y: vpt[5], isMobile: true })
        }
      } else {
        var delta = new fabric.Point(e.e.movementX, e.e.movementY)
        canvas.relativePan(delta)
        if (this.isPresenter) {
          this._vm.sync('sync', SYNC_TYPE.MOVE_BY_PRESENTER, { ...this.getVpPoint(), isMobile: false })
        }
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
      // canvas.perPixelTargetFind = true
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
  getVpPoint() {
    var vpt = this.layerDraw.viewportTransform.slice(0)
    return {
      x: vpt[4],
      y: vpt[5]
    }
  }
  moveToPoint(x, y, isMobile) {
    var vpt = this.layerDraw.viewportTransform.slice(0)
    vpt[4] = x
    vpt[5] = y
    this.layerDraw.setViewportTransform(vpt)
    // var delta = new fabric.Point(x, y)
    // this.layerDraw.relativePan(delta)
  }
  setZoom(zoom) {
    const canvas = this.layerDraw
    // const center = canvas.getCenter()
    const transform = { x: 0, y: 0 }
    canvas.zoomToPoint(transform, zoom)
    this.zoomPercent = zoom
  }
  initFollow() {
    const canvas = this.layerDraw
    canvas.on('mouse:move', (e) => {
      // this._vm.sync('follow', SYNC_TYPE.FOLLOW, { x: e.e.movementX, y: e.e.movementY })
    })
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
    // if (canvas.getActiveObject().type === 'group') {
    //   canvas.getActiveObject().toActiveSelection()
    // }
    const deleteIds = canvas.getActiveObjects().map(o => o.id)
    const activeObjects = canvas.getActiveObjects()
    canvas.discardActiveObject()
    if (activeObjects.length === 0) return
    canvas.remove.apply(canvas, activeObjects)
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
      if (!window.spaceDown) {
        this.layerDraw.isDrawingMode = true
      }
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
  registerCanvasEvents() {
    const canvas = this.layerDraw
    const that = this
    canvas.on('mouse:down:before', () => {
      if (window.spaceDown) {
        canvas.isDrawingMode = false
      }
    })
    canvas.on('mouse:down', (e) => {
      that.canDrag = true
      if (browser.versions.ios || browser.versions.android) {
        that.lastPosX = e.e.touches[0].clientX
        that.lastPosY = e.e.touches[0].clientY
      }
    })
    canvas.on('mouse:move', (e) => {
      if (that.canDrag && window.spaceDown) {
        that.toggleSelection(false)
        canvas.defaultCursor = '-webkit-grab'
        if (browser.versions.ios || browser.versions.android) {
          e = e.e
          let vpt = canvas.viewportTransform.slice(0)
          vpt[4] += e.targetTouches[0].clientX - that.lastPosX
          vpt[5] += e.targetTouches[0].clientY - that.lastPosY
          canvas.setViewportTransform(vpt)
          that.lastPosX = e.targetTouches[0].clientX
          that.lastPosY = e.targetTouches[0].clientY
          if (that.isPresenter) {
            that._vm.sync('sync', SYNC_TYPE.MOVE_BY_PRESENTER, { x: vpt[4], y: vpt[5], isMobile: true })
          }
        } else {
          let delta = new fabric.Point(e.e.movementX, e.e.movementY)
          canvas.relativePan(delta)
          if (that.isPresenter) {
            that._vm.sync('sync', SYNC_TYPE.MOVE_BY_PRESENTER, { ...that.getVpPoint(), isMobile: false })
          }
        }
      }
    })
    canvas.on('mouse:up', () => {
      that.canDrag = false
      if (that.current === 'brush') {
        canvas.isDrawingMode = true
        canvas.defaultCursor = 'crosshair'
      } else if (that.current === 'pan') {
        that.toggleSelection(false)
      } else if (that.current === 'choose') {
        that.toggleSelection(true)
        canvas.defaultCursor = 'default'
      } else {
        that.toggleSelection(true)
      }
    })
    canvas.on('touch:longpress', (e) => {
      console.log('longpress')
    })
  }
}
Draw.getInstance = function () {
  return instance
}

export default Draw
