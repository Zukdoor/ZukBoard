const CURRENT_PATH = process.cwd()
const db = require(CURRENT_PATH + '/db/mongo')
const { ObjectId } = require(CURRENT_PATH + '/src/api/server/util')
const { SYNC_TYPE } = require('./constant')

const methods = {
  [SYNC_TYPE.UNDO]: (item, id) => {
    update(id, '$pull', {
      canvas: { opId: item.opId }
    })
  },
  [SYNC_TYPE.REDO]: (item, id) => {
    update(id, '$push', { canvas: item })
  },
  [SYNC_TYPE.INSERT]: (item, id) => {
    update(id, '$push', { canvas: item })
  },
  [SYNC_TYPE.MOVE_BY_PRESENTER]: (item, id) => {
    update(id, '$set', { 'follow.config.pan': item.data })
  },
  [SYNC_TYPE.ZOOM]: (item, id) => {
    update(id, '$set', { 'follow.config.zoom': item.data })
  },
  [SYNC_TYPE.UPDATE]: (item, id) => {
    update(id, '$push', { canvas: item })
  },
  [SYNC_TYPE.DELETE]: (item, id) => {
    update(id, '$push', { canvas: item })
  },
  [SYNC_TYPE.MOVE]: () => {},
  startFollow: (item, id) => {
    update(id, '$set', {
      follow: {
        open: true,
        uid: '',
        config: item
      }
    })
  },
  endFollow: (id) => {
    update(id, '$set', {
      follow: {
        open: false,
        config: {}
      }
    })
  },
  clear: (id) => {
    update(id, '$set', { canvas: [] })
  },
  get: async (id) => {
    return await db.Board.findOne({
      _id: ObjectId(id)
    })
  }
}

async function update(id, op, config) {
  await db.Board.updateOne({
    _id: ObjectId(id)
  }, {
    [op]: config
  })
}

module.exports = methods
