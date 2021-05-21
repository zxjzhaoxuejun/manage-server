/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User=require('./../models/userSchema')
const util=require('./../utils/utils')
const sha1=require('sha1')
const svgCaptcha=require('svg-captcha')

router.prefix('/users')

router.post('/login', async (ctx, next)=>{
  try {
    const {userName,userPwd}=ctx.request.body
    const res= await User.findOne({
      userName,
      'userPwd':sha1(userPwd)
    })
    if(res){
      ctx.body=util.success(res)
    }else{
      ctx.body=util.fail('账号或密码不正确',20001)
    }
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})

router.post('/register',async (ctx,next)=>{
  try {

    if(ctx.request.body.code.toLocaleLowerCase() !== ctx.session.code.toLocaleLowerCase()){
      ctx.body=util.fail('验证码输入错误!')
      return false
    }
    let newUser = new User(ctx.request.body)
    await newUser.save().then(()=>{
      ctx.body=util.success('','注册成功!')
    }).catch(err=>{
      ctx.body=util.fail(err.msg)
    })
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})

//https://www.npmjs.com/package/svg-captcha
router.get('/code-captcha',async (ctx,next)=>{
  try {
    const captcha=await svgCaptcha.create({
      size:4, //随机字符串的大小
      ignoreChars:'0o1i',//过滤掉一些字符，例如0o1i
      noise:1, //噪声线的数量
      color:true, //字符将具有不同的颜色而不是灰色，如果设置了背景选项，则为true
      // background:'＃ff6600',// SVG图片的背景颜色
      height:38
    })
    ctx.session.code=captcha.text
    ctx.response.type='image/svg+xml'
    ctx.body =util.success(captcha.data)
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})



module.exports = router
