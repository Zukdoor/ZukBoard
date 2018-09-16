const mongoose = require('mongoose')
const util = {
  ObjectId(id) {
    return mongoose.Types.ObjectId(id)
  }
}
module.exports = util
