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
    const {userId,userName}=ctx.payload
    const {applyState,type}=ctx.request.query
    const {page,skipIndex}=util.pager(ctx.request.query)
    let params={}
    if(type==='approve'){
      if(applyState==1||applyState==2){
        params.curAuditUserName=userName
        params.$or=[{'applyState':1},{'applyState':2}]
      }else if(applyState>2){
        //子文档查询
        params={"auditFlows.userId":userId,applyState}
      }else{
        params={"auditFlows.userId":userId}
      }
      
    }else{
      params={
        "applyUser.userId":userId
      }
      if(applyState) params.applyState=applyState
    }
    
    
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

  /**
   * 审核接口
   */
  router.post('/approve',async (ctx,next)=>{
    const {userEmail,userName,userId} =ctx.payload
    const {_id,action,remark}=ctx.request.body
    // 1.待审批，2.审批中，3审批拒绝，4.审批通过，5.作废
    try {
      let doc=await Leave.findById(_id)
    let auditLogs=doc.auditLogs||[]
    let params={}

    if(action==='refuse'){
      // 拒绝
      params.applyState=3
    }else{
      //审核通过
      if(doc.auditFlows.length==doc.auditLogs.length){
        ctx.body=util.success('','此单已处理，请勿重复处理!')
        return;
      }else if(doc.auditFlows.length==doc.auditLogs.length+1){
        params.applyState=4
      }else if(doc.auditFlows.length>doc.auditLogs.length){
        params.applyState=2
        params.curAuditUserName=doc.auditFlows[doc.auditLogs.length+1].userName
      } 
    }
    auditLogs.push({
      userId,
      userName,
      createTime:new Date(),
      remark,
      action:action=='pass'?'审核通过':'审核拒绝'
    })
    params.auditLogs=auditLogs
    let res =await Leave.findByIdAndUpdate(_id,params)
    ctx.body=util.success('','处理成功!')
    } catch (error) {
      ctx.body=util.fail(`查询异常：${error.message}`)
    }
  })

  /**
   * 获取待审批数量
   */
  router.get('/approveCount',async (ctx)=>{
    const {userName}=ctx.payload
    try {
      let params={}
      params.curAuditUserName=userName
      params.$or=[{'applyState':1},{'applyState':2}]
      const total=await Leave.countDocuments(params)
      ctx.body=util.success(total)
    } catch (error) {
      ctx.body=util.fail(`异常错误:${error.message}`)
    }
  })
  module.exports=router