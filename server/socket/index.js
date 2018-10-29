const registerSync = require('./registerSync')
const registerFollow = require('./registerFollow')

function register(io) {
  io.on('connection', async (socket) => {
    socket.on('joinRoom', async (id) => {
      socket.join(id)
    })
    registerSync(socket)
    registerFollow(socket)
    socket.on('disconnect', () => {})
  })
}
module.exports = register
