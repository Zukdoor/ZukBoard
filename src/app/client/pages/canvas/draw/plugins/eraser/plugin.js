import uuid from 'node-uuid'
import * as spritejs from 'spritejs'
import { paintPath, eventEmitter } from '../util'

const { Sprite } = spritejs

// 是否开始画线
let started = false
// 每条线的唯一ID
let _id = ''
// 每条线对应的SVG Path路径
let d = ''
// 贝塞尔曲线的点，三个一组
let points = []
// 一条线的所有的点
let data = []
const PLUGIN_NAME = 'eraser'
// vue instance
let _vm = {}
// sync对象，根据不同id识别不同线
const drawing = {}

let circle = null

let circleWidth = 0

let line = {
  node: undefined
}
let point = {
  x: -100,
  y: -100
}

export default {
  name: PLUGIN_NAME,
  init(layerDraw, layerCover) {
    _vm = this
    eventEmitter.addListener('on-eraser-width-change', (ev) => {
      drawCircle(point.x, point.y, layerCover)
    })
  },
  uninstall(layerDraw, layerCover) {
    point.x = -100
    point.y = -100
    drawCircle(-100, -100, layerCover)
  },
  data: {

  },
  syncBoard(data, layer) {
    drawPath(data.data, layer, data.setting)
  },
  syncBoardWithPoint(data, layer) {
    const key = data.id
    if (!drawing[key]) {
      drawing[key] = {
        d: '',
        node: undefined
      }
    }
    drawing[key].d += getPath(data, true)
    drawPath(drawing[key].d, layer, data.setting, drawing[key])
  },
  cover: {
    mousemove(ev, layer) {
      if (ev.layerX || ev.layerX === 0) { // Firefox
        point.x = ev.layerX
        point.y = ev.layerY
      } else if (ev.offsetX || ev.offsetX === 0) { // Opera
        point.x = ev.offsetX
        point.y = ev.offsetY
      }
      drawCircle(point.x, point.y, layer)
    }
  },
  draw: {
    mouseup(ev, layer) {
      console.log(99999)
      started = false
      if (points.length === 0) {
        points = []
        report(this)
        _id = ''
        line.node = null
        return
      }
      points.forEach(p => (d += getL(p[0], p[1])))
      report(this)
      _id = ''
      drawPath(d, layer, null, line)
      line.node = null
    },
    mousedown(ev, layer) {
      this.current.type = 'line'
      points = []
      data = []
      d = ''
      _id = uuid.v4()
    },
    mousemove(ev, layer) {
      var x, y
      if (ev.layerX || ev.layerX === 0) { // Firefox
        x = ev.layerX
        y = ev.layerY
      } else if (ev.offsetX || ev.offsetX === 0) { // Opera
        x = ev.offsetX
        y = ev.offsetY
      }
      if (!started) {
        d = getM(x, y)
        points.push([x, y])

        started = true
        return
      }
      points.push([x, y])

      if (points.length !== 3) return

      d += ' ' + getC(points)
      points = []
      drawPath(d, layer, null, line)
    }
  }

}
// help methods
const getPath = (data, isPoint, isSync = true) => {
  let d = ''
  if (isPoint) data = [data]
  data.map(item => {
    if (item.type === 'L') {
      d += getL(item.points[0], item.points[1], true)
      return
    }
    if (item.type === 'M') {
      d += getM(item.points[0], item.points[1], true)
      return
    }
    d += getC(item.points, true)
  })
  return d
}
const getM = (x, y, isSync) => {
  if (!isSync) {
    reportPoint('M', [x, y])
  }
  data.push({
    type: 'M',
    points: [x, y]
  })
  return `M${x} ${y}`
}
const getL = (x, y, isSync) => {
  if (!isSync) {
    reportPoint('L', [x, y])
  }
  data.push({
    type: 'L',
    points: [x, y]
  })
  return `L${x} ${y}`
}
const getC = (points, isSync) => {
  if (!isSync) {
    reportPoint('C', points)
  }
  data.push({
    type: 'C',
    points
  })
  return 'C' + (points.map(p => `${p[0]},${p[1]}`).join(' '))
}
const drawCircle = (x, y, layer) => {
  let width = _vm.plugins[PLUGIN_NAME].setting.width
  if (!circle) {
    circle = new Sprite({
      size: [width * 2, width * 2],
      pos: [x - width, y - width],
      bgcolor: 'rgba(204, 204, 204, .6)',
      borderRadius: width
    })
    layer.append(circle)
    circleWidth = width
  } else if (width === circleWidth) {
    circle.attr({
      pos: [x - width, y - width]
    })
  } else {
    circle.attr({
      pos: [x - width, y - width],
      size: [width * 2, width * 2],
      borderRadius: width
    })
  }
}
// const path = '';
const drawPath = (d, layer, setting, line) => {
  setting = setting || _vm.plugins[PLUGIN_NAME].setting
  paintPath(d, layer, {
    color: '#fff',
    width: setting.width * 2
  }, line)
}
const report = () => {
  _vm.sync(PLUGIN_NAME, _id, d)
  data = []
}
const reportPoint = (type, point) => {
  if (!_id) return
  _vm.syncPoint(PLUGIN_NAME, _id, type, point)
}
