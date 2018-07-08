import * as spritejs from 'spritejs'
const {Path} = spritejs
let started = false
let d = ''
let points = []

export default {
  name: 'brush',
  init() {

  },
  data: {

  },
  cover: {

  },
  draw: {
    mouseup(ev, layer) {
      if (points.length === 0) {
        points = []
        return
      }
      points.forEach(p => (d += getL(p[0], p[1])))
      points = []
      drawPath(d, layer, this)
    },
    mousedown(ev, layer) {
      started = true
      points = []
      d = ''
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
      drawPath(d, layer, this)
    }
  }

}

const getM = (x, y) => {
  return `M${x} ${y}`
}
const getL = (x, y) => {
  return `L${x} ${y}`
}
const getC = (points) => {
  return 'C' + (points.map(p => `${p[0]},${p[1]}`).join(' '))
}
const drawPath = (d, layer, vm) => {
  const p = new Path()
  p.attr({
    path: {
      d: d
    },
    lineCap: 'round',
    lineJoin: 'round',
    strokeColor: vm.setting.brush.color,
    lineWidth: vm.setting.brush.width,
    fillColor: 'transparent'
  })
  requestAnimationFrame(() => layer.appendChild(p))
}
