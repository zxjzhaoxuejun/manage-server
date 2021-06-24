const mongoose=require('mongoose')
/**
 * 部门管理
 */
const menuSchema =mongoose.Schema({
    "parentId":[mongoose.Types.ObjectId],
    "deptName":String,//部门名称
    "userName":String,//负责人
    "userId":String,//负责人id
    "userEmail":String,//负责人邮箱
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('dept',menuSchema,'depts')