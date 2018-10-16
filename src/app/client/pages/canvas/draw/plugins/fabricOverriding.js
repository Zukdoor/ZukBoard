import { fabric } from 'fabric'

fabric.Object.prototype._setCornerCoords = function () {
  const coords = this.oCoords
  const newTheta = fabric.util.degreesToRadians(45 - this.angle)
  const cornerHypotenuse = this.cornerSize * 2
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
