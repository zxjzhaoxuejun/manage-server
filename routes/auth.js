/**
 * 权限管理模块
 */
const router = require('koa-router')()
const Menu=require('./../models/authSchema')
const util=require('./../utils/utils')
const {varifyToken} = require('./../utils/jwttoken')


router.prefix('/auth')

/**
 * 添加权限
 */
router.post('/add',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
        let newMenu = new Menu(ctx.request.body)
      await newMenu.save().then(()=>{
        ctx.body=util.success('','权限添加成功!')
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
 * 权限查询
 */
router.post('/list',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
        const res= await Menu.find()
        if(res){
            ctx.body=util.success(res)
        }else{
            ctx.body=util.fail(err.msg)
        }
    }else{
        ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
    }
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
})

/**
 * 修改权限
 */
router.post('/edit',async (ctx,next)=>{
    try {
      const {authorization}=ctx.request.headers
      const token=authorization.split(' ')[1]
      const tokenState=varifyToken(token)
      
      if(tokenState){
        await Menu.findOneAndUpdate({_id:ctx.request.body._id},{$set:ctx.request.body},{new:true}).then(res=>{
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

 module.exports=router