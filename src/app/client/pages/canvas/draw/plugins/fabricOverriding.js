import { fabric } from 'fabric'
/**
 * Sets the coordinates of the draggable boxes in the corners of
 * the image used to scale/rotate it.
 * @private
 */
fabric.Object.prototype._setCornerCoords = function () {
  const coords = this.oCoords

  const newTheta = fabric.util.degreesToRadians(45 - this.angle)

  /* Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2, */
  /* 0.707106 stands for sqrt(2)/2 */

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
