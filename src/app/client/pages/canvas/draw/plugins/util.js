import EventEmitter from 'wolfy87-eventemitter'
export const eventEmitter = new EventEmitter()
export const changeCursor = (layer, type) => {
  document.querySelector('.canvas-container').style.cursor = type
}

export const genKey = () => {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
}

export const getSystem = () => {
  let platform = navigator.platform
  return platform.indexOf('Win') === 0 ? 'win' : 'mac'
}

export const LoadImageAsync = (url) => {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = function () {
      let width = this.width
      let height = this.height
      img.setAttribute('crossOrigin', 'anonymous')
      resolve({ width: width, height: height })
    }
    img.onerror = function () {
      reject()
    }
    img.src = url
  })
}

export const browser = {
  versions: (function () {
    let u = navigator.userAgent
    return {
      mobile: !!u.match(/AppleWebKit.*Mobile.*/) || u.indexOf('iPad') > -1,
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
      android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
      iPhone: u.indexOf('iPhone') > -1,
      iPad: u.indexOf('iPad') > -1
    }
  })()
}

export const compress = (data, opt, callback) => {
  let img = new Image()
  img.onload = function () {
    var w = this.width
    var h = this.height
    var scale = w / h
    if (w > opt.maxWidth && scale > 1) {
      w = opt.maxWidth
      h = opt.maxWidth / scale
    } else if (h > 1280 && scale < 1) {
      h = opt.maxWidth
      w = opt.maxWidth * scale
    }
    let quality = opt.quality || 0.5
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    let anw = document.createAttribute('width')
    anw.nodeValue = w
    let anh = document.createAttribute('height')
    anh.nodeValue = h
    canvas.setAttributeNode(anw)
    canvas.setAttributeNode(anh)
    ctx.drawImage(this, 0, 0, w, h)
    let base64 = canvas.toDataURL('image/jpeg', quality)
    let file = dataURLtoFile(base64)
    callback(file)
  }
  img.src = data
}

var dataURLtoFile = function (base64Data) {
  let byteString
  if (base64Data.split(',')[0].indexOf('base64') >= 0) { byteString = atob(base64Data.split(',')[1]) } else { byteString = unescape(base64Data.split(',')[1]) }
  let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
  let ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], {
    type: mimeString
  })
}
