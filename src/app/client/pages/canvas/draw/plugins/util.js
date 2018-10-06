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
