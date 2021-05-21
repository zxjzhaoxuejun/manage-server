const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const session = require('koa-session')
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
app.keys = ['some secret hurr'];
const CONFIG = {
   key: 'koa:sess',   //cookie key (default is koa:sess)
   maxAge: 300000,  // cookie的过期时间 maxAge in ms (default is 5分钟)
   overwrite: true,  //是否可以overwrite    (默认default true)
   httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
   signed: true,   //签名默认true
   rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
   renew: false,  //(boolean) renew session when session is nearly expired,
}
app.use(session(CONFIG,app))
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
