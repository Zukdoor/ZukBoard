const mongoose = require('mongoose')
const config = require('../config')

const {
  Schema
} = mongoose

mongoose.connect(config.db, {
  // useMongoClient: true
})
mongoose.connection.on('error', function () {
  console.log('unable to connect to database at ' + config.db)
  throw new Error('unable to connect to database at ' + config.db)
})

const SiteSchema = new Schema({
  name: String,
  user: Object,
  setting: Object,
  createtime: {
    type: Date,
    default: Date.now
  },
  updatetime: {
    type: Date,
    default: Date.now
  }
})

const visitSchema = new Schema({
  url: String,
  fullurl: String,
  type: String,
  siteId: String, // Schema.Types.ObjectId,
  uid: String,
  device: Object,
  perf: Object,
  createtime: {
    type: Date,
    default: Date.now
  }
})
const reportSchema = new Schema({
  siteId: String,
  startTime: Date,
  endTime: Date,
  type: Number,
  report: Object,
  lastUpdate: {
    type: Date,
    default: Date.now
  }
})

const Site = mongoose.model('sites', SiteSchema)
const Visit = mongoose.model('visits', visitSchema)
const Report = mongoose.model('reports', reportSchema)

module.exports = {
  Site,
  Visit,
  Report
}
