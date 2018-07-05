// const CURRENT_PATH = process.cwd()
// const fetch = require(CURRENT_PATH + '/server/tools/request')
// const config = require(CURRENT_PATH + '/config')

module.exports = {
  'get#/': async ctx => {
    // console.log(ctx.session.user)
    // if (ctx.session.user) {
    //   console.log('login by cookie')
    //   return ctx.redirect('/app/site/list')
    // }
    // if (!ctx.query.token) {
    //   console.log('unlogin')
    //   return ctx.redirect('/login')
    // }

    // let result = await fetch({
    //   url: `${config.sso}/login/api/v2/user`,
    //   method: 'post',
    //   data: {
    //     secret: config.ssoSercet,
    //     token: ctx.query.token
    //   }
    // })
    // if (result && result.code === 0) {
    //   ctx.session.user = result.data
    //   return ctx.redirect('/app/site/list')
    // }
    // return ctx.redirect('/login?error_code=1')
    return ctx.redirect('/app/canvas/draw')
  },
  'get#(.*)': async ctx => {
    // if (!ctx.session.user) {
    //   return ctx.redirect('/login')
    // }
    await ctx.render('layout/index.html', {
      title: '',
      dataset: encodeURIComponent(JSON.stringify({
        user: ctx.session.user,
        biUrl: ctx.state.biUrl
      }))
    })
  }
}
