import * as spritejs from 'spritejs'
import EventEmitter from 'wolfy87-eventemitter'
const {Path} = spritejs
export const eventEmitter = new EventEmitter()
export const paintPath = (d, layer, setting, line, vm) => {
  console.log('drawing', line)
  if (line && line.node) {
    line.node.attr({
      path: {
        d: d
      }
    })
    return
  }
  const p = new Path()
  p.attr({
    path: {
      d: d
    },
    zIndex: vm.zindex++,
    lineCap: 'round',
    lineJoin: 'round',
    strokeColor: setting.color,
    lineWidth: setting.width,
    fillColor: 'transparent'
  })
  if (line) {
    line.node = p
  }
  requestAnimationFrame(() => layer.appendChild(p))
}
