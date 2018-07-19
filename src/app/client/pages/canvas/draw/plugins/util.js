import * as spritejs from 'spritejs'
const {Path} = spritejs
let count = 0
export const paintPath = (d, layer, setting, line) => {
  console.log(line, setting)
  if (line && line.node) {
    line.node.attr({
      path: {
        d: d
      }
    })
    return
  }
  console.log('append', ++count)
  const p = new Path()
  p.attr({
    path: {
      d: d
    },
    lineCap: 'round',
    lineJoin: 'round',
    strokeColor: setting.color,
    lineWidth: setting.width,
    fillColor: 'transparent'
  })
  if (line) {
    line.node = p
  }
  console.log(line)
  requestAnimationFrame(() => layer.appendChild(p))
}
