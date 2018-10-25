const methods = require('./methods')

function registerFollow(socket) {
  socket.on('startFollow', async (item, id) => {
    methods.startFollow(item, id)
    socket.to(id).emit('startFollow', item)
  })
  socket.on('endFollow', async (item, id) => {
    methods.endFollow(id)
    socket.to(id).emit('endFollow', item)
  })
}

registerFollow.endFollow = async function (id, userid) {
  const board = await methods.get(id)
  if (!board.follow.id === userid) {
    // todo: add user syetem
    return
  }
  methods.endFollow(id)
}
module.exports = registerFollow
