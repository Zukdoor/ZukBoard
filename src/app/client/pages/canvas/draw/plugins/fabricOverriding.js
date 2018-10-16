import { fabric } from 'fabric'

fabric.Object.prototype._setCornerCoords = function () {
  const coords = this.oCoords
  const newTheta = fabric.util.degreesToRadians(45 - this.angle)
  const cornerHypotenuse = this.cornerSize * 1.5
  const cosHalfOffset = cornerHypotenuse * fabric.util.cos(newTheta)
  const sinHalfOffset = cornerHypotenuse * fabric.util.sin(newTheta)
  let x, y

  for (let point in coords) {
    x = coords[point].x
    y = coords[point].y
    coords[point].corner = {
      tl: {
        x: x - sinHalfOffset,
        y: y - cosHalfOffset
      },
      tr: {
        x: x + cosHalfOffset,
        y: y - sinHalfOffset
      },
      bl: {
        x: x - cosHalfOffset,
        y: y + sinHalfOffset
      },
      br: {
        x: x + sinHalfOffset,
        y: y + cosHalfOffset
      }
    }
  }
}
fabric.Canvas.prototype._shouldClearSelection = function (e, target) {
  let activeObjects = this.getActiveObjects()

  let activeObject = this._activeObject

  return (
    (!target && !e.shiftKey) ||
    (target &&
      activeObject &&
      activeObjects.length > 1 &&
      activeObjects.indexOf(target) === -1 &&
      activeObject !== target &&
      !this._isSelectionKeyPressed(e)) ||
    (target && !target.evented) ||
    (target &&
      !target.selectable &&
      activeObject &&
      activeObject !== target)
  )
}
const container = document.querySelector('body')
fabric.util.addListener(container, 'keydown', function (e) {
  if (e.code === 'Space') {
    window.spaceDown = true
  }
})
fabric.util.addListener(container, 'keyup', function (e) {
  if (e.code === 'Space') {
    window.spaceDown = false
  }
})
