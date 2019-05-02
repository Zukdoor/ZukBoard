const methods = require('./methods')

function registerFollow(socket) {
  socket.on('startFollow', async (item, id) => {
    methods.startFollow(item, id)
    socket.to(id).emit('startFollow', item)
  })
  socket.on('endFollow', async (item, id) => {
    const isLastOne = await methods.endFollow(item, id)
    console.log('isLastOne', isLastOne)
    if (isLastOne) {
      socket.nsp.to(id).emit('endFollow', item)
      // socket.to(id).emit('endFollow', item)
    }
  })
}

registerFollow.endFollow = async function (id, item, userid) {
  const board = await methods.get(id)
  if (!board.follow.id === userid) {
    // todo: add user system
    return
  }
  methods.endFollow(item, id)
}
module.exports = registerFollow
