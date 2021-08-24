const mongoose=require('mongoose')

const auditSchema =mongoose.Schema({
    "orderNo":String,//申请单号
    "applyType":Number,//申请类型，1.事假，2.调休，3.年假
    "startTime":{
        type:Date,
        default:Date.now()
    },//开始时间
    "endTime":{
        type:Date,
        default:Date.now()
    },//结束时间
    "applyUser":{
        userId:String,
        userName:String,
        userEmail:String
    },//申请人信息
    "leaveTime":String,//休假时间
    "reasons":String,//休假原因
    "auditUsers":String,//审批人
    "curAuditUserName":String,//当前审批人
    "applyState":{type:Number,default:1},//审批状态，1.待审批，2.审批中，3审批拒绝，4.审批通过，5.作废
    "auditFlows":[
        {
            userId:String,
            userName:String,
            userEmail:String
        }
    ],//审批流
    "auditLogs":[
        {
            userId:String,
            userName:String,
            createTime:Date,
            remark:String,
            action:String
        }
    ],//审批日志
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('leaves',auditSchema,'leaves')