module.exports = {
  // redirect / to a new board
  'get#/': async ctx => {
    ctx.redirect('/app/canvas/draw')
  }
}
