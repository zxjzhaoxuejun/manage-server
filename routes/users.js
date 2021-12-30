/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User=require('./../models/userSchema')
const UserCounter=require('./../models/userCountesSchema')
const util=require('./../utils/utils')
const {createToken} = require('./../utils/jwttoken')
const sha1=require('sha1')
const svgCaptcha=require('svg-captcha')

router.prefix('/users')

/**
 * 登录
 */
router.post('/login', async (ctx, next)=>{
  try {
    const {userName,userPwd,code}=ctx.request.body
    /**
     * 返回数据库指定字段，三种方式
     * 1.'userName sex state userEmail mobile role _id'
     * 2. {userName:1,_id:1},1返回，0不返回
     * 3.select('userName')
     */
     if(code.toLocaleLowerCase() !== ctx.session.code.toLocaleLowerCase()){
      ctx.body=util.fail('验证码输入错误!')
      return false
    }
    const res= await User.findOne({
      userName,
      'userPwd':sha1(userPwd)
    },'userName sex state userEmail mobile role _id roleList userId deptId')//查询指定字段
    if(res){
      const data=res._doc
      const token=createToken(data)
      data.token=token
      await User.findOneAndUpdate({userId:data.userId},{lastLoginTime:new Date()})
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
    const {code,userEmail,password}=ctx.request.body.code
    if(code.toLowerCase() !== ctx.session.code.toLowerCase()){
      ctx.body=util.fail('验证码输入错误!')
      return false
    }
    const haveUser=await User.findOne({userEmail})
    if(haveUser){
      ctx.body=util.fail('用户已存在!')
      return false
    }
    const doc= await UserCounter.findOneAndUpdate({_id:'userId'},{$inc:{sequence_value:1}},{new:true})
    let newUser = new User({userEmail,password:sha1(password),"userId":doc.sequence_value})
    await newUser.save().then(()=>{
      ctx.body=util.success('','注册成功!')
    }).catch(err=>{
      ctx.body=util.fail(err)
    })
  } catch (error) {
    ctx.body=util.fail(error)
  }
})

/**
 * 修改密码
 */
router.post('/password',async (ctx,next)=>{
  if(ctx.request.body.code.toLocaleLowerCase() !== ctx.session.code.toLocaleLowerCase()){
    ctx.body=util.fail('验证码输入错误!')
    return false
  }
  try {
      const {_id}=ctx.payload
      const res= await User.findOne({_id,userPwd:ctx.request.body.oldPwd})
      if(!res){
        ctx.body=util.fail('原始密码输入错误!')
        return false
      }
      await User.findOneAndUpdate({_id},{$set:ctx.request.body},{new:true}).then(res=>{
        ctx.body=util.success(util.CODE.SUCCESS,'修改成功!')
      }).catch(err=>{
        ctx.body=util.fail(err.msg)
      })
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})


/**
 * 获取验证码
 */
//https://www.npmjs.com/package/svg-captcha
router.get('/code-captcha',async (ctx,next)=>{
  console.log(ctx)
  try {
    const captcha=await svgCaptcha.create({
      size:4, //随机字符串的大小
      ignoreChars:'0o1i',//过滤掉一些字符，例如0o1i
      noise:1, //噪声线的数量
      color:true, //字符将具有不同的颜色而不是灰色，如果设置了背景选项，则为true
      // background:'＃ff6600',// SVG图片的背景颜色
      height:34,
      width:100
    })
    ctx.session.code=captcha.text
    ctx.response.type='image/svg+xml'
    ctx.body =util.success(captcha.data)
  } catch (error) {
    ctx.body=util.fail(error.msg)
  }
})

/**
 * 获取用户列表
 */
router.post('/list',async (ctx,next)=>{
  const {userId,userName,state}=ctx.request.body
  const {page,skipIndex}=util.pager(ctx.request.body)
  let params={}
  if(userName) params.userName=userName
  if(userId) params.userId=userId
  if(state&&state!='0')params.state=state
  //根据条件查询用户列表
  try {
    const query=User.find(params,{_id:0,userPwd:0})
  const list=await query.skip(skipIndex).limit(page.pageSize)
  const total=await User.countDocuments(params)
  ctx.body=util.success({
    total,
    list
  })
  } catch (error) {
    ctx.body=util.fail(`数据异常：${error}`)
  }
})

/**
 * 添加用户
 */
router.post('/operate',async(ctx)=>{
  const {mobile,job,role,roleList,deptId,userName,state,userEmail,userId,action}=ctx.request.body
  if(!userEmail||!userName||!deptId){
    ctx.body=util.fail('参数错误',util.CODE.PARAM_ERROR)
    return false
  }
  if(action==='add'){
    const doc =await UserCounter.findOneAndUpdate({_id:"userId"},{$inc:{sequence_value:1}},{new:true})
    const res =await User.findOne({$or:[{userEmail},{userName}]},'_id userName userEmail')
    if(res){
      ctx.body=util.fail(`有重复的用户，信息如下：${res.userName}-${res.userEmail}`)
    }else{
      const user=new User({
        mobile,
        job,
        role,
        roleList,
        deptId,
        userName,
        state,
        userEmail,
        "userId":doc.sequence_value,
        userPwd:sha1('z123456')
      })

      await user.save().then(()=>{
        ctx.body=util.success('','用户新增成功!')
      })

    }
  }else{
    const res=await User.findOneAndUpdate({userId},{mobile,job,role,roleList,deptId,state})
    if(res){
      ctx.body=util.success('','更新成功')
      return;
    }
    ctx.body=util.fail('更新失败')
  }
})

/**
 * 用户删除、批量删除
 */
router.post('/delete',async (ctx)=>{
//待删除的用户id数组
const {userIds}=ctx.request.body
// User.updateMany({$or:[{userId:100001},{userId:100002}]},{state:2})
// const res=await User.updateMany({userId:{$in:userIds}},{state:2})
const res=await User.deleteMany({userId:{$in:userIds}})
if(res.deletedCount){
  ctx.body=util.success(res,`共删除成功${res.deletedCount}条`)
  return;
}
ctx.body=util.fail('删除失败')
})

module.exports = router
