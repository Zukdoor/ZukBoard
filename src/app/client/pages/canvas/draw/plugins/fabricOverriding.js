import { fabric } from 'fabric'
import { eventEmitter } from './util'
/**
 * Sets the coordinates of the draggable boxes in the corners of
 * the image used to scale/rotate it.
 * @private
 */
fabric.Canvas.prototype.getObjectById = function (id) {
  const objs = this.getObjects()
  for (let i = 0, len = objs.length; i < len; i++) {
    if (objs[i].id === id) {
      return objs[i]
    }
  }
  return 0
}

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
    eventEmitter.emit('set-cursor', true)
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    window.shiftDown = true
  }
})
fabric.util.addListener(container, 'keyup', function (e) {
  if (e.code === 'Space') {
    window.spaceDown = false
    eventEmitter.emit('set-cursor', false)
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    window.shiftDown = false
  }
})
fabric.Canvas.prototype.__onLongPress = function (e, self) {
  this.fire('touch:longpress', {
    e: e, self: self
  })
}
fabric.util.object.extend(fabric.Object.prototype, {
  toActive: false,
  isMoved: false
})

fabric.Object.prototype.onDeselect = function (opt) {
  this.toActive = false
  this.isMoved = false
}

/**
 * @private
 */
// fabric.Canvas.prototype._getActionFromCorner = function (target, corner, e) {
//   if (!corner || (corner && !this.interactive)) {
//     return 'drag'
//   }
//
//   switch (corner) {
//     case 'mtr':
//       return 'rotate'
//     case 'ml':
//     case 'mr':
//       return e[this.altActionKey] ? 'skewY' : 'scaleX'
//     case 'mt':
//     case 'mb':
//       return e[this.altActionKey] ? 'skewX' : 'scaleY'
//     default:
//       return 'scale'
//   }
// }

/**
 * @private
 * Compares the old activeObject with the current one and fires correct events
 * @param {fabric.Object} obj old activeObject
 */
fabric.Canvas.prototype._fireSelectionEvents = function (oldObjects, e) {
  var somethingChanged = false
  var objects = this.getActiveObjects()

  var added = []
  var removed = []
  var opt = { e: e }
  oldObjects.forEach(function (oldObject) {
    if (objects.indexOf(oldObject) === -1) {
      somethingChanged = true
      oldObject.fire('deselected', opt)
      removed.push(oldObject)
    }
  })
  objects.forEach(function (object) {
    if (oldObjects.indexOf(object) === -1) {
      somethingChanged = true
      object.fire('selected', opt)
      added.push(object)
    }
  })
  if (oldObjects.length > 0 && objects.length > 0) {
    opt.selected = added
    opt.deselected = removed
    // added for backward compatibility
    opt.updated = added[0] || removed[0]
    opt.target = this._activeObject
    somethingChanged && this.fire('selection:updated', opt)
    !somethingChanged && this.fire('selection:active', opt)
  } else if (objects.length > 0) {
    // deprecated event
    if (objects.length === 1) {
      opt.target = added[0]
      this.fire('object:selected', opt)
    }
    opt.selected = added
    // added for backward compatibility
    opt.target = this._activeObject
    this.fire('selection:created', opt)
  } else if (oldObjects.length > 0) {
    opt.deselected = removed
    this.fire('selection:cleared', opt)
  }
}
