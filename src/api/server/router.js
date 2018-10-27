// const fetch = require(CURRENT_PATH + '/server/tools/request')
/* eslint-disable */
const CURRENT_PATH = process.cwd()
const path = require('path')
const fs = require('fs')
const multiparty = require('multiparty')
var uuid = require('uuid');
const resCode = require('../resCode')
const db = require(CURRENT_PATH + '/db/mongo')
const env = process.env.NODE_ENV || "development"
const getOSSParams = require('./oss')

const createResult = function (ctx, code, msg = '', data = null) {
  ctx.body = {
    code,
    msg,
    data
  }
  return code === 0
}
const { ObjectId } = require('./util')

const  parse = function (ctx) {
  var form = new multiparty.Form();
  return new Promise((resolve) => {
    form.parse(ctx.req, async function (err, fields, files) {
      resolve({ fields, files})
      
    });
  })
}
module.exports = {
  'get#/': async ctx => {
    ctx.body = 'hello'
  },
  'get#board/list': async ctx => {
    let list = await db.Board.find({})
    createResult(ctx, resCode.OK, '', list)
  },
  'get#board/get': async ctx => {
    try {
      let id = ctx.query.id
      let model = await db.Board.findOne({_id: ObjectId(id)})
    // GenerateScript()
      createResult(ctx, resCode.OK, '', model)
    } catch(e) {
      createResult(ctx, resCode.SEARCH_NOT_EXIST, '')
    }
    
  },
  'post#board/create': async ctx => {
    // 暂时写死画板ID
    const { name } = ctx.request.body
    const insertResult = await db.Board.collection.insertMany([{
      name: name || '画板',
      roomId: uuid.v4(),
      canvas: [],
      follow: {
        open: false,
        config: {}
      }
    }])
    model = insertResult.ops[0]
    // GenerateScript()
    createResult(ctx, resCode.OK, '', model)
  },
  'get#image/sign': async ctx => {
    let dirpath = 'zukboard'
    const filename = `${Date.now()}`
    createResult(ctx, resCode.OK, '', getOSSParams(dirpath, filename))
  },
  'post#image/upload': async ctx => {
    const { fields, files } = await parse(ctx)
    const img = files.img[0]
    let dirpath = 'public/dist/images'
    if (env !== 'development') {
      dirpath = '/data/images'
    }
    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath, '0755')
    }
    const ext = img.originalFilename.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    fs.readFile(img.path, function (err, data) {
      fs.writeFile(path.resolve(dirpath, filename), data, function (err) {
      })
    })
    
    createResult(ctx, resCode.OK, '', {
      url: path.join(env === 'development' ? '/dist/images' : '/images', filename)
    })
  },
  'post#board/save': async ctx => {
    // 暂时写死画板ID
    const { canvas } = ctx.request.body
    let id = ctx.request.body.id
    if (!canvas) {
      return createResult(ctx, resCode.NO_PARAM, '缺少参数')
    }
    let model = await db.Board.findOne({_id: ObjectId(id)})
    if (!model) {
      return createResult(ctx, resCode.SEARCH_NOT_EXIST, '画版不存在')
    }
    const saveResult = await db.Board.collection.insertMany({_id: id}, {$set: {
      canvas
    }})
    // GenerateScript()
    createResult(ctx, resCode.OK, '', model)
  }
  
}
