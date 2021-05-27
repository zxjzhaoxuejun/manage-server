/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User=require('./../models/userSchema')
const util=require('./../utils/utils')
const {varifyToken,createToken} = require('./../utils/jwttoken')
const sha1=require('sha1')
const svgCaptcha=require('svg-captcha')

router.prefix('/users')

/**
 * 登录
 */
router.post('/login', async (ctx, next)=>{
  try {
    const {userName,userPwd}=ctx.request.body
    /**
     * 返回数据库指定字段，三种方式
     * 1.'userName sex state userEmail mobile role _id'
     * 2. {userName:1,_id:1},1返回，0不返回
     * 3.select('userName')
     */
    const res= await User.findOne({
      userName,
      'userPwd':sha1(userPwd)
    },'userName sex state userEmail mobile role _id')//查询指定字段
    if(res){
      const data=res._doc
      const token=createToken(data)
      data.token=token
      ctx.body=util.success(data)
    }else{
      ctx.body=util.fail('账号或密码不正确',util.CODE.USER_ACCOUNT_ERROR)
    }
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})

/**
 * 注册
 */
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

/**
 * 修改密码
 */
router.post('/password',async (ctx,next)=>{
  try {

    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
      await User.findOneAndUpdate({_id:tokenState._id},{$set:ctx.request.body},{new:true}).then(res=>{
        ctx.body=util.success(util.CODE.SUCCESS,'修改成功!')
      }).catch(err=>{
        ctx.body=util.fail(err.msg)
      })
    }else{
      ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
    }
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})


/**
 * 获取验证码
 */
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
