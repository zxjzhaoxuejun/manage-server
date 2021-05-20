const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const router = require('koa-router')()
// const logger = require('koa-logger')

const log4js=require('./utils/log4j')
const users = require('./routes/users')



// error handler
onerror(app)
require('./config/db')

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  // const start = new Date()
  if(ctx.request.method=='POST'){
    log4js.info(`[POST] parama:${JSON.stringify(ctx.request.body)}`)
  }else{
    log4js.info(`[GET] parama:${JSON.stringify(ctx.request.query)}`)
  } 
  await next()
})

// routes
router.prefix('/api')
router.use(users.routes(), users.allowedMethods())
app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
  log4js.error(`${err.stack}`)
});

module.exports = app
