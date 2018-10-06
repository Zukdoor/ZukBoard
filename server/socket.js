const CURRENT_PATH = process.cwd()
const db = require(CURRENT_PATH + '/db/mongo')
const { ObjectId } = require(CURRENT_PATH + '/src/api/server/util')
const SYNC_TYPE = {
  INSERT: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MOVE: 'move',
  REDO: 'redo',
  UNDO: 'undo'
}
function register(io) {
  io.on('connection', async (socket) => {
    socket.on('sync', async (type, item, id) => {
      if (!item.data) return
      if (type === SYNC_TYPE.UNDO) {
        await db.Board.updateOne({
          _id: ObjectId(id)
        }, {
          $pull: {
            canvas: { opId: item.opId }
          }
        })
        socket.broadcast.emit('sync', type, item)
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
        socket.broadcast.emit('sync', type, item)
        return
      }
      if (type === SYNC_TYPE.UNDO.INSERT) {
        await db.Board.updateOne({
          _id: ObjectId(id)
        }, {
          $push: {
            canvas: item
          }
        })
        socket.broadcast.emit('sync', type, item)
        return
      }
      // if (type === SYNC_TYPE.UNDO.DELETE) {
      //   await db.Board.updateOne({
      //     _id: ObjectId(id)
      //   }, {
      //     $pull: {
      //       canvas: {id: {
      //         $in: item.id
      //       }}
      //     }
      //   })
      //   socket.broadcast.emit('sync', type, item)
      //   return
      // }
      if (type === SYNC_TYPE.UPDATE || type === SYNC_TYPE.DELETE) {
        await db.Board.updateOne({
          _id: ObjectId(id)
        }, {
          $push: {
            canvas: item
          }
        })
        socket.broadcast.emit('sync', type, item)
        return
      }
      if (type === SYNC_TYPE.MOVE) {
        socket.broadcast.emit('sync', type, item)
        return
      }
      socket.broadcast.emit('sync', type, item)
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
    socket.on('drawpoint', (item, id) => {
      socket.broadcast.emit('drawpoint', item)
    })
    socket.on('clear', async (id) => {
      socket.broadcast.emit('clear', id)
      await db.Board.updateOne({
        _id: ObjectId(id)
      }, {
        '$set': {
          canvas: []
        }
      })
    })
    socket.on('disconnect', () => {
    })
  })
}
module.exports = register
