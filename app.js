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
const utils=require('./utils/utils')
const users = require('./routes/users')
// const auth=require('./routes/auth')
const roles=require('./routes/roles')
const menus=require('./routes/menu')
const depts=require('./routes/dept')
const upload=require('./routes/upload')
const leave=require('./routes/audit')
const article=require('./routes/article')
// const koajwt=require('koa-jwt')//jsonwebtoken中间件
const {checkJwt,extractors} = require('./utils/check-jwt')

  
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
  await next().catch(err=>{
    if(err.status==401){
      ctx.status=200
      ctx.body=utils.fail('Token认证失败',utils.CODE.AUTH_ERROR)
    }else{
      throw err
    }
  })
})

//
//秘钥
const jwtSecret = 'sieia'
app.use(checkJwt({
  secretOrKey: jwtSecret,
  safetyRoutes: [
    '/api/users/login',
    '/api/users/register',
    '/api/users/code-captcha',
  ]
}))
// app.use(koajwt({secret:jwtSecret}).unless({
//   // 设置login、register接口，可以不需要认证访问
//   path:[
//     /^\/api\/users\/login/,
//     /^\/api\/users\/register/,
//     /^\/api\/users\/code-captcha/,
//   ]
// }))
// routes
router.prefix('/api')
router.use(users.routes(), users.allowedMethods())
// router.use(auth.routes(), auth.allowedMethods())
router.use(roles.routes(),roles.allowedMethods())
router.use(menus.routes(),menus.allowedMethods())
router.use(depts.routes(),depts.allowedMethods())
router.use(leave.routes(),leave.allowedMethods())
router.use(upload.routes(),upload.allowedMethods())
router.use(article.routes(),article.allowedMethods())
app.use(router.routes(), router.allowedMethods())



// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
  log4js.error(`${err.stack}`)
});

module.exports = app
