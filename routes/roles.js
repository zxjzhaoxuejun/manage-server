/**
 * 角色管理模块
 */
const router = require('koa-router')()
const Roles=require('./../models/roleSchema')
const RoleCounter=require('./../models/roleCountSchema')
const util=require('./../utils/utils')
const {varifyToken} = require('./../utils/jwttoken')


router.prefix('/role')

/**
 * 添加/编辑角色
 */
router.post('/operate',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
    if(tokenState){
        const {roleName,remark,action,roleId}=ctx.request.body
        if(action==='add'){
            const doc =await RoleCounter.findOneAndUpdate({_id:"roleId"},{$inc:{sequence_value:1}},{new:true})
            const res =await Roles.findOne({$or:[{roleName}]},'_id roleName')
            if(res){
                ctx.body=util.fail(`有重复的角色，信息如下：${res.roleName}`)
            }else{
                let newRole = new Roles({roleName,remark,"roleId":doc.sequence_value})
                await newRole.save().then(()=>{
                ctx.body=util.success('','角色添加成功!')
                }).catch(err=>{
                    ctx.body=util.fail(err.msg)
                })
            }
        }else{
            //编辑
            const res=await Roles.findOneAndUpdate({roleId},{roleName,remark})
            if(res){
            ctx.body=util.success('','更新成功')
            return;
            }
            ctx.body=util.fail('更新失败')
        }
        
    }else{
        ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
    }
    } catch (error) {
      ctx.body=util.fail(error.msg)
    }
})

/**
 * 角色列表查询
 */
router.get('/list',async (ctx,next)=>{
    try {
    const {authorization}=ctx.request.headers
    const token=authorization.split(' ')[1]
    const tokenState=varifyToken(token)
        if(tokenState){
            const {roleName}=ctx.request.query
            const {page,skipIndex}=util.pager(ctx.request.query)
            let params={}
            if(roleName) params.roleName=roleName
        try {
            const query= Roles.find(params)
            const list= await query.skip(skipIndex).limit(page.pageSize)
            const total=await Roles.countDocuments(params)
            ctx.body=util.success({
                list,
                total
            })
        } catch (error) {
            ctx.body=util.fail(`数据异常：${error}`)
        }
        }else{
            ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
        }
    } catch (error) {
        ctx.body=util.fail(error.msg)
    }
})

/**
 * 角色列表删除
 */
router.post('/delete',async (ctx)=>{
    try {
        const {authorization}=ctx.request.headers
        const token=authorization.split(' ')[1]
        const tokenState=varifyToken(token)
        if(tokenState){
            const {roleIds} =ctx.request.body
            console.log(roleIds)
            const res=await Roles.deleteMany({roleId:{$in:roleIds}})
            if(res.deletedCount){
                ctx.body=util.success(res,`共删除成功${res.deletedCount}条`)
                return;
            }
            ctx.body=util.fail(`删除失败`)
        }else{
            ctx.body=util.fail('认证失败或TOKEN过期',util.CODE.AUTH_ERROR)
        }
    } catch (error) {
        ctx.body=util.fail(error.msg)
    }
})

/**
 * 权限更新
 * /update/permission
 */
router.post('/update/permission',async (ctx)=>{
    const {roleId,permissionList} =ctx.request.body
    const res=await Roles.findOneAndUpdate({roleId},{permissionList}) 
    if(res){
    ctx.body=util.success('','权限设置成功')
    return;
    }
    ctx.body=util.fail('设置失败')
})
 module.exports=router