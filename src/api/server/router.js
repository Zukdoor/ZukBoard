// const fetch = require(CURRENT_PATH + '/server/tools/request')
/* eslint-disable */
const CURRENT_PATH = process.cwd()
const resCode = require('../resCode')
const db = require(CURRENT_PATH + '/db/mongo')
const createResult = function (ctx, code, msg = '', data = null) {
  ctx.body = {
    code,
    msg,
    data
  }
  return code === 0
}
const { ObjectId } = require('./util')
const MOCK_ID = '5b0fde1d685ea9001df5f832'
module.exports = {
  'get#/': async ctx => {
    ctx.body = 'hello'
  },
  'get#board/list': async ctx => {
    let list = await db.Board.find({})
    createResult(ctx, resCode.OK, '', list)
  },
  'get#board/get': async ctx => {
    // 暂时写死画板ID
    let id = ctx.query.id
    id = MOCK_ID
    let model = await db.Board.findOne({_id: ObjectId(id)})
    // GenerateScript()
    createResult(ctx, resCode.OK, '', model)
  },
  'post#board/create': async ctx => {
    // 暂时写死画板ID
    const { name } = ctx.request.body
    let model = await db.Board.findOne({_id: ObjectId(MOCK_ID)})
    if (model) {
      createResult(ctx, resCode.OK, '', model)
      return
    }

    const insertResult = await db.Board.collection.insert([{
      _id: ObjectId(MOCK_ID),
      name: name || '画板',
      roomId: 'test_room_id',
      canvas: []
    }])
    model = insertResult.ops[0]
    // GenerateScript()
    createResult(ctx, resCode.OK, '', model)
  },
  'post#board/save': async ctx => {
    // 暂时写死画板ID
    const { canvas } = ctx.request.body
    let id = ctx.request.body.id
    id = MOCK_ID
    if (!canvas) {
      return createResult(ctx, resCode.NO_PARAM, '缺少参数')
    }
    let model = await db.Board.findOne({_id: ObjectId(id)})
    if (!model) {
      return createResult(ctx, resCode.SEARCH_NOT_EXIST, '画版不存在')
    }
    const saveResult = await db.Board.collection.insert({_id: id}, {$set: {
      canvas
    }})
    // GenerateScript()
    createResult(ctx, resCode.OK, '', model)
  }
  
}
