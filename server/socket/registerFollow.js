const CURRENT_PATH = process.cwd()
const db = require(CURRENT_PATH + '/db/mongo')
const { ObjectId } = require(CURRENT_PATH + '/src/api/server/util')

function registerFollow(socket) {
  socket.on('startFollow', async (item, id) => {
    await db.Board.updateOne({
      _id: ObjectId(id)
    }, {
      '$set': {
        follow: {
          open: true,
          uid: '',
          config: item
        }
      }
    })
    socket.to(id).emit('startFollow', item)
  })
  socket.on('endFollow', async (item, id) => {
    await db.Board.updateOne({
      _id: ObjectId(id)
    }, {
      '$set': {
        follow: {
          open: false,
          config: {}
        }
      }
    })
    socket.to(id).emit('endFollow', item)
  })
}

registerFollow.endFollow = async function (id, userid) {
  const board = await db.Board.findOne({
    _id: ObjectId(id)
  })
  if (!board.follow.id === userid) {
    // todo: add user syetem
    return
  }
  await db.Board.updateOne({
    _id: ObjectId(id)
  }, {
    '$set': {
      follow: {
        open: false,
        config: {}
      }
    }
  })
}
module.exports = registerFollow
