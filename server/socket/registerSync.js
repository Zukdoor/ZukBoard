const methods = require('./methods')

module.exports = function (socket) {
  socket.on('sync', async (type, item, id, roomId) => {
    if (!item.data) return
    methods[type](item, id)
    socket.to(roomId).emit('sync', type, item)
  })
  socket.on('clear', async (id) => {
    socket.to(id).emit('clear', id)
    methods.clear(id)
  })
}
