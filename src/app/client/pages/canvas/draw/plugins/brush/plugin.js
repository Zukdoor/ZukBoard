import uuid from 'node-uuid'
import { paintPath } from '../util'

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
const PLUGIN_NAME = 'brush'
// vue instance
let _vm = {}
// sync对象，根据不同id识别不同线
const drawing = {}

let line = {
  node: undefined
}
export default {
  name: PLUGIN_NAME,
  init() {
    _vm = this
  },
  data: {

  },
  cover: {

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
  draw: {
    mouseup(ev, layer) {
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
      _id = uuid.v4().substring(0, 8)
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
// const path = '';
const drawPath = (d, layer, setting, line) => {
  paintPath(d, layer, setting || _vm.plugins[PLUGIN_NAME].setting, line)
}
const report = () => {
  _vm.sync(PLUGIN_NAME, _id, d)
  data = []
}
const reportPoint = (type, point) => {
  if (!_id) return
  _vm.syncPoint(PLUGIN_NAME, _id, type, point)
}
