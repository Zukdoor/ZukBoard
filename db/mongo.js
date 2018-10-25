const mongoose = require('mongoose')
const configAll = require('../config')
const env = process.env.NODE_ENV || 'development'
const config = configAll.ENV_VAR[env]

const {
  Schema
} = mongoose

mongoose.connect(config.db, {
  useNewUrlParser: true
  // useMongoClient: true
})
mongoose.connection.on('error', function () {
  console.log('unable to connect to database at ' + config.db)
  throw new Error('unable to connect to database at ' + config.db)
})
const boardSchema = new Schema({
  name: String,
  roomId: String,
  canvas: Array,
  follow: Object,
  createTime: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
})

const Board = mongoose.model('board', boardSchema)

module.exports = {
  Board
}
