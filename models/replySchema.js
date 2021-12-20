const mongoose=require('mongoose')

const Schema=mongoose.Schema

const replySchema=new Schema({
    "replyId":String,
    "userId":String,
    "userName":String,
    "content":String,//内容
    "articleId":String,//文章id
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间

})

module.exports=mongoose.model('replys',replySchema,'replys')