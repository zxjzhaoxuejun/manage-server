/**
 * 权限管理模块
 */
const router = require('koa-router')()
const Menu=require('./../models/authSchema')
const util=require('./../utils/utils')

router.prefix('/auth')

/**
 * 添加权限
 */
router.post('/add',async (ctx,next)=>{
    try {
      let newMenu = new Menu(ctx.request.body)
      await newMenu.save().then(()=>{
        ctx.body=util.success('','权限添加成功!')
      }).catch(err=>{
        ctx.body=util.fail(err.msg)
      })
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
})

/**
 * 权限查询
 */
router.post('/list',async (ctx,next)=>{
    try {
        const res= await Menu.find()
        if(res){
            ctx.body=util.success(res)
        }else{
            ctx.body=util.fail(err.msg)
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
      
    await Menu.findOneAndUpdate({_id:ctx.request.body._id},{$set:ctx.request.body},{new:true}).then(res=>{
      ctx.body=util.success(util.CODE.SUCCESS,'修改成功!')
    }).catch(err=>{
      ctx.body=util.fail(err.msg)
    })
      
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
  })

 module.exports=router