/**
 * 部门管理模块
 */
const router = require('koa-router')()
const Dept=require('../models/deptSchema')
const util=require('../utils/utils')
const {varifyToken} = require('../utils/jwttoken')


router.prefix('/dept')

/**
 * 新增、编辑
 */
router.post('/operate',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
      const {_id,action,userObj,...params}=ctx.request.body
      let res,msg
      try {
        if(action==='add'){
          res=await Dept.create(params)
          msg='创建成功'
        }else{
          //编辑
          params.updateTime=new Date()
          res=await Dept.findByIdAndUpdate(_id,params)
          msg="编辑成功"
        }
        ctx.body=util.success('',msg)
      } catch (error) {
        ctx.body=util.fail(error)
        return
      }
    }else{
        ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
    }
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
})

/**
 * 删除
 */
router.post('/delete',async(ctx)=>{
  const {_id}=ctx.request.body
  try {
    await Dept.findByIdAndRemove(_id)
    const res=await Dept.deleteMany({parentId:{$all:[_id]}})
    const msg=`删除成功${res.deletedCount+1}条`
    ctx.body=util.success('',msg)
  } catch (error) {
    ctx.body=util.fail(error)
  }
})
/**
 * 查询列表
 */
router.get('/list',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
        const {deptName}=ctx.request.query
        let params={}
        if(deptName)params.deptName=deptName
  
        const rootList= await Dept.find(params)||[]
        const res= getTreeMenu(rootList,undefined,[])
        ctx.body=util.success(res)     
    }else{
        ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
    }
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
})
/**
 * 递归拼接树形菜单列表
 */
 function getTreeMenu(rootList,id,list){
   for(let i=0;i<rootList.length;i++){
     let item=rootList[i]
     if(String(item.parentId[item.parentId.length-1])===String(id)){
        list.push(item._doc)
     }
   }
   list.map(v=>{
     v.children=[]
     getTreeMenu(rootList,v._id,v.children)
     if(v.children.length===0){
       delete v.children
     }
   })
   return list
 }
 module.exports=router