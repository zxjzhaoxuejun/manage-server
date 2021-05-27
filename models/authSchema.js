const mongoose=require('mongoose')

const authSchema =mongoose.Schema({
    "parentId":String,
    "menuName":String,//
    "menuCode":String,
    "level":Number,
    "type":Number,
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "lastLoginTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('menu',authSchema,'menu')