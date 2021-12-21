const mongoose=require('mongoose')

const Schema=mongoose.Schema

const replySchema=new Schema({
    "replyId":String,
    "userId":String,
    "userName":String,
    "content":String,//内容
    "articleId":String,//文章id
    "level":{type:Number,default:1},
    "replyNum":{
        type:Number,
        default:0
    },//回帖数
    "like":{
        type:Number,
        default:0
    },//点赞数
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间

},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  })
//给commentSchema设置一个虚拟关联评论点赞字段：likeStatus;
replySchema.virtual('likeStatus', {
    ref: 'likes', // 虚拟字段的model为likes
    localField: '_id', // 查找到comment._id的值和likes.replyId的值相等的项
    foreignField: 'commentId', //
    // justOne用于指定，返回的likeStatus是单个数据还是一个数组集合，justOne默认为false
    justOne: true
  });
  //给commentSchema设置一个虚拟关联评论回复字段：replyList;
replySchema.virtual('replyList', {
    ref: 'replys', // 虚拟字段的model为replys
    localField: '_id', // 查找到comment._id的值和replys.replyId的值相等的项
    foreignField: 'replyId', //
    // justOne用于指定，返回的replyList是单个数据还是一个数组集合，justOne默认为false
    justOne: false
});
module.exports=mongoose.model('replys',replySchema,'replys')