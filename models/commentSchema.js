const mongoose=require('mongoose')
const Schema=mongoose.Schema
const commentSchema=new Schema({
    "content":String,//内容
    "userId":String,
    "userName":String,
    "articleId":String,//文章id
    "replyNum":{
        type:Number,
        default:0
    },//回帖数
    "like":{
        type:Number,
        default:0
    },//点赞数
    // commentId:{type:Schema.Types.ObjectId,ref:'likes'},
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  })
//给commentSchema设置一个虚拟关联字段：likeStatus;
commentSchema.virtual('likeStatus', {
    ref: 'likes', // 虚拟字段的model为Person
    localField: '_id', // 查找到Person.band的值和Band.name的值相等的项
    foreignField: 'commentId', //
    // justOne用于指定，返回的likeStatus是单个数据还是一个数组集合，justOne默认为false
    justOne: true
  });
module.exports=mongoose.model('comments',commentSchema,'comments')