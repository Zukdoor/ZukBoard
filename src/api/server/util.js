const mongoose = require('mongoose')
const util = {
  ObjectId(id) {
    return new mongoose.Types.ObjectId(id)
  }
}
module.exports = util
