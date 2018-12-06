const registerSync = require('./registerSync')
const registerFollow = require('./registerFollow')
const methods = require('./methods')

function register(io) {
  io.on('connection', async (socket) => {
    socket.on('joinRoom', async (id, uid) => {
      socket.join(id)
      socket.uid = uid
      socket.roomid = id
    })
    registerSync(socket)
    registerFollow(socket)
    socket.on('disconnect', async () => {
      const id = socket.roomid
      if (!id) return
      const item = {
        user: socket.uid
      }
      const isLastOne = await methods.endFollow(item, id)
      if (isLastOne) {
        socket.nsp.to(id).emit('endFollow', item)
      }
    })
  })
}
module.exports = register
