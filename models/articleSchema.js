const mongoose=require('mongoose')

const articleSchema =mongoose.Schema({
    "articleId":{type:Number,default:0},//文章Id
    "title":String,//申请单号
    "type":Number,//类型，1.js，2.html，3css3，4.front，
    "desc":String,//描述
    "content":String,//内容
    "comment":{type:Number,default:0},//评论
    "views":{type:Number,default:0},//浏览量
    "recommend":{type:Number,default:0},//推荐
    "auth":{type:String,default:"天空之城"},//作者
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('article',articleSchema,'article')