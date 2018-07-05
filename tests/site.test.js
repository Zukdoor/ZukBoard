const request = require('supertest')
const app = require('../app')
const routers = require('./router.map').site

/* global describe it */

describe('#site', function () {
  routers.map(val => {
    it(val.it, function (done) {
      request(app)
        .get(val.path)
        .expect('Content-Type', /text\/html/)
        .expect(val.status, (err, res) => {
          if (err) throw err
          done()
        })
    })
  })
})
