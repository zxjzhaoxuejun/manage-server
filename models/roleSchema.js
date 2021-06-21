const mongoose=require('mongoose')

const roleSchema =mongoose.Schema({
    "roleId":Number,
    "permissionList":{
        "checkedKeys": [],
        "halfCheckedKeys":[]
    },
    "roleName":String,//
    "remark":String,
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "lastLoginTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('roles',roleSchema,'roles')