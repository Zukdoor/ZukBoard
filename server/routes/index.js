const fetch = require('../tools/request')

module.exports = {
  'get#/': async ctx => {
    // 勿删，跟目录直接给404页
    ctx.redirect('/app/site')
  },
  'get#ping': ctx => {
    // 勿删，线上docker环境健康检查使用
    // TODO 添加一个header
    ctx.body = 'pong'
  },
  'get#api/login': async ctx => {
    // demo
    let data = await fetch({
      url: `${ctx.state.testApiUrl}/api/login`,
      method: 'post',
      data: {
        password: 'BAg2xzrEE3t2QvZwGGvM',
        username: 'lvjinlnog'
      }
    })
    ctx.body = data
  }
  // 'get#api/(.*)': async ctx => {
  //   ctx.body = {
  //     data: 11112
  //   }
  // },
  // 'post#api/(.*)': async ctx => {
  //   ctx.body = {
  //     data: 2222
  //   }
  // }
}
