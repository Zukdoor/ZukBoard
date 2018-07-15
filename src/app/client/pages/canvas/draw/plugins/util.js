import * as spritejs from 'spritejs'
const {Path} = spritejs
export const paintPath = (d, layer, setting) => {
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
  requestAnimationFrame(() => layer.appendChild(p))
}
