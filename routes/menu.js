/**
 * 权限管理模块
 */
const router = require('koa-router')()
const Menu=require('../models/menuSchema')
const Role=require('../models/roleSchema')
const util=require('../utils/utils')
const {varifyToken} = require('../utils/jwttoken')


router.prefix('/menu')

/**
 * 新增、编辑菜单
 */
router.post('/operate',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
      const {_id,action,...params}=ctx.request.body
      let res,msg
      try {
        if(action==='add'){
          res=await Menu.create(params)
          console.log(res)
          msg='新增成功'
        }else{
          //编辑
          params.updateTime=new Date()
          res=await Menu.findByIdAndUpdate(_id,params)
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
    await Menu.findByIdAndRemove(_id)
    const res=await Menu.deleteMany({parentId:{$all:[_id]}})
    const msg=`删除成功${res.deletedCount+1}条`
    ctx.body=util.success('',msg)
  } catch (error) {
    ctx.body=util.fail(error)
  }
})
/**
 * 查询菜单列表
 */
router.get('/list',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
        const {menuName,menuState}=ctx.request.query
        let params={}
        if(menuName)params.menuName=menuName
        if(menuState)params.menuState=menuState
        const rootList= await Menu.find(params)||[]
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
 * 
 * 获取用户对应的权限菜单
 * 
 */
router.get('/get/permission/list',async(ctx)=>{
  try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
        const {role,roleList}=tokenState
        const menuList= await getPermissionMenuList(role,roleList)
        const activeList=await getActionMap(menuList)
        ctx.body=util.success({menuList,activeList})     
    }else{
        ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
    }
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
})

async function getPermissionMenuList(userRole,roleKeys){
  let rootList=[]
  if(userRole===0){
    console.log('管理员：'+userRole)
    //管理员，返回全部菜单
    rootList= await Menu.find({})||[]
  }else{
    console.log('普通用户：'+userRole)
    /**
     * 普通用户
     * 根据用户有的角色，获取权限列表
     * 现查找用户对应的角色有那些
     */
    let roleList=await Role.find({_id:{$in:roleKeys}})
    let permissionList=[]
    roleList.map(role=>{
      let {checkedKeys,halfCheckedKeys}=role.permissionList
      permissionList=permissionList.concat([...checkedKeys,...halfCheckedKeys])
    })
    permissionList=[...new Set(permissionList)]
    rootList=await Menu.find({_id:{$in:permissionList}})
  }
  return getTreeMenu(rootList,undefined,[])
}

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
     }else if(v.children[0].menuType==2){
       //快速区分按钮和菜单
       v.action=v.children
     }
   })
   return list
 }

 /**
  * 递归拼接按钮权限列表
  * @param {菜单} list 
  */
 function getActionMap (list) {
  const actionMap = []
  const deep = (arr) => {
    while (arr.length) {
      const item = arr.pop()
      if (item.action) {
        // 表示最后一级且是按钮
        item.action.map(actionItem=>{
          actionMap.push(actionItem.menuCode)
        })
      }
      if (item.children && !item.action) {
        // 表示不是最后一级
        deep(item.children)
      }
    }
  }
  deep(JSON.parse(JSON.stringify(list)))
  return actionMap
}
 module.exports=router