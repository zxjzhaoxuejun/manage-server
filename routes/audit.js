/**
 * 审批管理模块
 */
 const router = require('koa-router')()
 const Leave=require('./../models/auditSchema')
 const Dept=require('../models/deptSchema')
 const util=require('./../utils/utils')
 
 router.prefix('/leave')
 /**
 * 查询所有休假申请单
 */
  router.get('/list',async (ctx,next)=>{
    const {userId}=ctx.payload
    console.log(ctx.payload)
    const {applyState}=ctx.request.query
    const {page,skipIndex}=util.pager(ctx.request.query)
    let params={
        "applyUser.userId":userId
    }
    if(applyState) params.applyState=applyState
    //根据条件查询用户列表
    try {
    const query=Leave.find(params)
    const list=await query.skip(skipIndex).limit(page.pageSize)
    const total=await Leave.countDocuments(params)
    ctx.body=util.success({
      total,
      list
    })
    } catch (error) {
      ctx.body=util.fail(`数据异常：${error}`)
    }
  })

  /**
   * 休假申请提交
   */
  router.post('/operate',async (ctx,next)=>{
    const {deptId,userId,userName,userEmail}=ctx.payload
    const {_id,action,...params}=ctx.request.body
    if(action==='create'){
        let orderNo='XJ'
    orderNo+=util.formateDate(new Date(),'yyyyMMdd')
    const total=await Leave.countDocuments()
    params.orderNo=orderNo+total

    let dept=[]
    while(deptId.length){
        //获取用户当前部门ID
        let id=deptId.pop()
        //查找部门负责人
        let deptObj=await Dept.findById(id)
        dept.push(deptObj)
    }

    //获取人事部门负责人信息
    let userList=await Dept.find({deptName:{$in:['人事部']}})
    let auditUsers=[]//审批人列表
    let auditFlows=[]//审批流
    dept.map(item=>{
        auditFlows.push({userId:item.userId,userName:item.userName,userEmail:item.userEmail})
        auditUsers.push(item.userName)
    })
    let curAuditUserName=dept[0].userName//当前审批人
    
    userList.map(item=>{
        auditFlows.push({userId:item.userId,userName:item.userName,userEmail:item.userEmail})
        auditUsers.push(item.userName)
    })
    params.auditUsers=auditUsers.join(',')
    params.curAuditUserName=curAuditUserName
    params.auditFlows=auditFlows
    params.auditLogs=[]
    params.applyUser={
        userId,userName,userEmail
    }
    let res=await Leave.create(params)
    ctx.body=util.success('','提交申请成功')
    }else{
        let res=await Leave.findByIdAndUpdate(_id,{applyState:5,updateTime:new Date()})
        ctx.body=util.success('','删除成功')
    }
    
  })

  module.exports=router