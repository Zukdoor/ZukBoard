module.exports = {
  'get#/': async ctx => {
    // 勿删，根目录直接给404页
    ctx.redirect('/app/site')
  }
}
