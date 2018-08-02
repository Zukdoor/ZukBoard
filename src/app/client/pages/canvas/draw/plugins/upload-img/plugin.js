import uuid from 'node-uuid'
import * as spritejs from 'spritejs'
import { eventEmitter, changeCursor } from '../util'

const { Sprite } = spritejs

const PLUGIN_NAME = 'uploadImg'
// vue instance
let _vm = {}
let render = {}
const RESIZE_TYPE = {
  LEFT: 1,
  TOP: 2,
  RIGHT: 3,
  BOTTOM: 4,
  LEFT_TOP: 5,
  LEFT_BOTTOM: 6,
  RIGHT_TOP: 7,
  RIGHT_BOTTOM: 8
}
const plugin = {
  name: PLUGIN_NAME,
  init(layerDraw, layerCover) {
    _vm = this
    eventEmitter.addListener('on-should-draw-img', (ev) => {
      plugin.initImg('', ev, layerDraw)
    })
    plugin.layerCover = layerCover
    plugin.layerDraw = layerDraw
  },
  uninstall(layerDraw, layerCover) {
  },
  clear() {
    render = {}
  },
  syncBoard(data, layer) {
    if (!render[data.id]) {
      plugin.initImg(data.id, data.data.path, layer, null, true)
      return
    }
    let img = render[data.id]
    img.attr(data.data)
  },
  syncBoardWithPoint(data, layer) {
    if (!render[data.id]) return
    let img = render[data.id]
    img.attr(data.data)
  },
  cover: {
    mousemove(ev, layer) {
    }
  },
  draw: {
    mouseup(ev, layer) {
    },
    mousedown(ev, layer) {
    },
    mousemove(ev, layer) {
    }
  },
  initImg(id, path, layer, opt, isSync) {
    const imgId = id || uuid.v4()
    const img = new Sprite(path)
    let x0
    let y0
    let startPos
    let keepChoose = false
    let moving = false
    let resizing = false
    let startSize
    img.attr({
      zIndex: _vm.zindex++,
      // anchor: 0.5,
      pos: [600, 600],
      border: {
        style: 'dashed',
        width: 0,
        color: '#f56c6c'
      }
    })
    render[imgId] = img
    // img.on('click', (evt) => {
    //   console.log(evt)
    // })

    img.on('mouseup', (evt) => {
      moving = false
      resizing = false
      startPos = null
      changeCursor(layer, 'default')
      report(imgId, {
        pos: img.attr('pos'),
        size: img.attr('size')
      }, true)
      reportRealTime(imgId, {
        pos: img.attr('pos'),
        size: img.attr('size')
      })
    })
    img.on('mousedown', (evt) => {
      if (!checkIsCurrent()) return
      const res = checkResize(img, evt)
      if (res.isResize) {
        resizing = true
        startSize = {
          type: res.type,
          width: res.width,
          height: res.height,
          x: evt.layerX,
          y: evt.layerY,
          pos: img.attr('pos')
        }
        keepChoose = true
        return
      }
      moving = true
      x0 = evt.x
      y0 = evt.y
      startPos = img.attr('pos')
    })
    img.on('click', (evt) => {
      if (!checkIsCurrent()) return
      keepChoose = !keepChoose
      clearBorder()
      if (!keepChoose) {
        img.attr({
          border: {
            width: 0
          }
        })
      }
      img.attr({
        border: {
          style: 'dashed',
          width: 3,
          color: '#f56c6c'
        }
      })
      evt.stopDispatch()
    })
    img.on('mouseenter', (evt) => {
      // clearBorder()
      if (!checkIsCurrent()) return
      img.attr({
        border: {
          style: 'dashed',
          width: 3,
          color: '#f56c6c'
        }
      })
      evt.stopDispatch()
    })
    img.on('mouseleave', (evt) => {
      if (keepChoose) {
        return
      }
      img.attr({
        border: {
          width: 0
        }
      })
      evt.stopDispatch()
    })
    img.on('mousemove', (evt) => {
      if (!checkIsCurrent()) return
      // if (resizing) {
      //   handleResize(img, evt, startSize)
      //   evt.stopDispatch()
      // }
      checkResize(img, evt)
      if (!moving) return
      const dx = evt.x - x0
      const dy = evt.y - y0
      img.attr({
        // anchor: [evt.layerX, evt.layerY],
        pos: [startPos[0] + dx, startPos[1] + dy]
      })
      reportRealTime(imgId, {
        pos: [startPos[0] + dx, startPos[1] + dy]
      })
      changeCursor(layer, 'move')
      evt.stopDispatch()
    })
    document.addEventListener('mouseup', () => {
      moving = false
      resizing = false
      changeCursor(plugin.layerDraw, 'default')
    })
    plugin.layerDraw.on('mousemove', (evt) => {
      if (resizing) {
        handleResize(img, evt, startSize)
      }
    })
    layer.append(img)
    if (!isSync) {
      report(imgId, {
        path,
        pos: [500, 205],
        size: []
      }, true)
    }
  }

}
export default plugin
const clearBorder = () => {
  plugin.layerDraw.children.forEach(item => {
    item.attr({
      border: {
        width: 0
      }
    })
  })
}
const checkResize = (img, evt) => {
  const width = img.contentSize[0]
  const height = img.contentSize[1]
  const relativePos = img.pointToOffset(evt.layerX, evt.layerY)
  const x = relativePos[0]
  const y = relativePos[1]
  const offest = 10
  const res = {
    isResize: false,
    width,
    height
  }
  if (x > 0 - offest && x < 0 + offest && y > 0 - offest && y < 0 + offest) {
    console.log('left top')
    res.isResize = true
    res.type = RESIZE_TYPE.LEFT_TOP
    changeCursor(plugin.layerDraw, 'nwse-resize')
  }
  if (x > width - offest && x < width + offest && y > height - offest && y < height + offest) {
    console.log('right bottom')
    res.isResize = true
    res.type = RESIZE_TYPE.RIGHT_BOTTOM
    changeCursor(plugin.layerDraw, 'nwse-resize')
  }
  if (x > width - offest && x < width + offest && y > 0 - offest && y < 0 + offest) {
    console.log('right top')
    res.isResize = true
    res.type = RESIZE_TYPE.RIGHT_TOP
    changeCursor(plugin.layerDraw, 'nesw-resize')
  }
  if (x > 0 - offest && x < 0 + offest && y > height - offest && y < height + offest) {
    console.log('left bottom')
    res.isResize = true
    res.type = RESIZE_TYPE.LEFT_BOTTOM
    changeCursor(plugin.layerDraw, 'nesw-resize')
  }
  if (x > 0 && x < width && y > 0 - offest && y < 0 + offest && !res.isResize) {
    console.log('top')
    res.isResize = true
    res.type = RESIZE_TYPE.TOP
    changeCursor(plugin.layerDraw, 'ns-resize')
  }
  if (x > 0 && x < width && y > height - offest && y < height + offest && !res.isResize) {
    console.log('bottom')
    res.isResize = true
    res.type = RESIZE_TYPE.BOTTOM
    changeCursor(plugin.layerDraw, 'ns-resize')
  }
  if (x > 0 - offest && x < 0 + offest && y > 0 && y < height && !res.isResize) {
    console.log('left')
    res.isResize = true
    res.type = RESIZE_TYPE.LEFT
    changeCursor(plugin.layerDraw, 'ew-resize')
  }
  if (x > width - offest && x < width + offest && y > 0 && y < height && !res.isResize) {
    console.log('right')
    res.isResize = true
    res.type = RESIZE_TYPE.RIGHT
    changeCursor(plugin.layerDraw, 'ew-resize')
  }
  if (!res.isResize) {
    changeCursor(plugin.layerDraw, 'default')
  }
  return res
}
const handleResize = (img, evt, startSize) => {
  let width = startSize.width
  let height = startSize.height
  let xOffest = evt.layerX - startSize.x
  let yOffest = evt.layerY - startSize.y
  let x = startSize.pos[0]
  let y = startSize.pos[1]
  console.log(xOffest, yOffest)
  switch (startSize.type) {
    case RESIZE_TYPE.TOP:
      height -= yOffest
      y += yOffest
      break
    case RESIZE_TYPE.BOTTOM:
      height += yOffest
      break
    case RESIZE_TYPE.LEFT:
      width -= xOffest
      x += xOffest
      break
    case RESIZE_TYPE.RIGHT:
      width += xOffest
      break
    case RESIZE_TYPE.LEFT_TOP:
      height -= yOffest
      width -= xOffest
      x += xOffest
      y += yOffest
      break
    case RESIZE_TYPE.RIGHT_TOP:
      height -= yOffest
      width += xOffest
      y += yOffest
      break
    case RESIZE_TYPE.LEFT_BOTTOM:
      height += yOffest
      width -= xOffest
      x += xOffest
      break
    case RESIZE_TYPE.RIGHT_BOTTOM:
      height += yOffest
      width += xOffest
      break
  }
  img.attr({
    pos: [x, y],
    size: [width, height]
  })
}
const report = (id, info, needPush) => {
  _vm.sync(PLUGIN_NAME, id, info, needPush)
}
const reportRealTime = (id, info) => {
  if (!id) return
  _vm.syncDataRealTime(PLUGIN_NAME, id, info)
}
const checkIsCurrent = () => {
  return _vm.drawer.current === 'uploadImg' || _vm.drawer.current === 'choose'
}
