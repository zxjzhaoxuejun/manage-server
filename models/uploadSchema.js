const mongoose=require('mongoose')

const uploadSchema =mongoose.Schema({
    "name":String,//
    "url":String,
    "type":String,//类型，
    "size":String,
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('uploads',uploadSchema,'uploads')