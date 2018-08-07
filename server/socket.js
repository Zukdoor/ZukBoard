const CURRENT_PATH = process.cwd()
const db = require(CURRENT_PATH + '/db/mongo')
const { ObjectId } = require(CURRENT_PATH + '/src/api/server/util')
function register(io) {
  io.on('connection', async (socket) => {
    socket.on('drawline', async (item, id) => {
      if (!item.data) return
      socket.broadcast.emit('drawline', item)
      const board = await db.Board.findOne({
        _id: ObjectId(id)
      })
      const index = board.canvas.findIndex(i => i.id === item.id)
      if (index > -1 && item.key !== 'uploadImg') {
        board.canvas[index] = item
      } else {
        board.canvas.push(item)
      }
      await db.Board.update({
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
      await db.Board.update({
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
