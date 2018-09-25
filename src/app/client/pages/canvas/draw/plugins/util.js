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
