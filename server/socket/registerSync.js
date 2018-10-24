const { SYNC_TYPE } = require('./constant')

const CURRENT_PATH = process.cwd()
const db = require(CURRENT_PATH + '/db/mongo')
const { ObjectId } = require(CURRENT_PATH + '/src/api/server/util')

module.exports = function (socket) {
  socket.on('sync', async (type, item, id, roomId) => {
    if (!item.data) return
    if (type === SYNC_TYPE.UNDO) {
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        $pull: {
          canvas: { opId: item.opId }
        }
      })
      socket.to(roomId).emit('sync', type, item)
      return
    }
    if (type === SYNC_TYPE.REDO) {
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        $push: {
          canvas: item
        }
      })
      socket.to(roomId).emit('sync', type, item)
      return
    }
    if (type === SYNC_TYPE.INSERT) {
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        $push: {
          canvas: item
        }
      })
      socket.to(roomId).emit('sync', type, item)
      return
    }
    if (type === SYNC_TYPE.MOVE_BY_PRESENTER) {
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        $set: {
          'follow.config.pan': item.data
        }
      })
      socket.to(roomId).emit('sync', type, item)
      return
    }
    if (type === SYNC_TYPE.ZOOM) {
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        $set: {
          'follow.config.zoom': item.data.zoom
        }
      })
      socket.to(roomId).emit('sync', type, item)
      return
    }
    if (type === SYNC_TYPE.UPDATE || type === SYNC_TYPE.DELETE) {
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        $push: {
          canvas: item
        }
      })
      socket.to(roomId).emit('sync', type, item)
      return
    }
    if (type === SYNC_TYPE.MOVE) {
      socket.to(roomId).emit('sync', type, item)
      return
    }
    socket.to(roomId).emit('sync', type, item)
    const board = await db.Board.findOne({
      _id: ObjectId(id)
    })
    const index = board.canvas.findIndex(i => i.id === item.id)
    if (index > -1 && item.key !== 'uploadImg') {
      board.canvas[index] = item
    } else {
      board.canvas.push(item)
    }
    await db.Board.updateOne({
      _id: ObjectId(id)
    }, {
      '$set': {
        canvas: board.canvas
      }
    })
  })
  socket.on('clear', async (id) => {
    socket.to(id).emit('clear', id)
    await db.Board.updateOne({
      _id: ObjectId(id)
    }, {
      '$set': {
        canvas: []
      }
    })
  })
}
