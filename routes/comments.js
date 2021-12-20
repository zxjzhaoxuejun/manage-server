/**
 * 评论模块
 */
const router = require('koa-router')()
const Comment = require('./../models/commentSchema')
const Article = require('./../models/articleSchema')
const Likes = require('./../models/likesSchema')
const util = require('./../utils/utils')
const mongoose = require("mongoose")
const likesSchema = require('./../models/likesSchema')

router.prefix('/comment')

router.post('/save', async (ctx, next) => {
    try {
        const params = ctx.request.body
        const newComment = new Comment(params)
        await newComment.save().then(async () => {
            await Article.findOneAndUpdate({ articleId: params.articleId }, { $inc: { comment: 1 } }, { new: true })
            ctx.body = util.success('', '评论成功!')
        }).catch(() => {
            ctx.body = util.fail('评论失败!')
        })
    } catch (error) {
        ctx.body = util.fail(error)
    }
})

/**
 * 获取评论列表
 */
router.post('/list', async (ctx, next) => {
    try {
        const {userId}=ctx.payload
        const { articleId } = ctx.request.body
           const list= await Comment.find({articleId}).populate({
               path:'likeStatus',
               match:{userId:{$eq:userId}},//条件
               select:{'isLike':1,'_id':0}//去掉_id属性，选择isLike
           }).sort({'createTime':-1})
           ctx.body=util.success({
                list
            })
        // await Comment.aggregate([
        //     {
        //         $match:{
        //             "articleId":{$eq:articleId+''}
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "likes",
        //             localField: "_id",
        //             foreignField: "commentId",
        //             as: "child",
        //         }
        //     },
        //     {
        //         $project:{ updateTime:0,__v:0,'child._id':0,'child.commentId':0,'child.userId':0,'child.__v':0 }
        //      },
        //     //  {
        //     //     $match:{
        //     //         "child":{$ne:[]}
        //     //     }
        //     // },
        //     // #拆分数组，空数组也进行拆分
        //     // {$unwind:{path:"$child",preserveNullAndEmptyArrays: true}},
        //      {
        //         $sort:{"createTime":-1}
        //     }
        // ],(err,doc)=>{
        //     ctx.body = util.success({
        //         list:doc
        //     })
        // })
        
    } catch (error) {
        ctx.body = util.fail(error)
    }
})

/**
 * 点赞保存
 */
router.post('/like', async (ctx, next) => {
    try {
        const params = ctx.request.body
        const res = await Likes.findOneAndUpdate({ commentId: params.commentId,userId:params.userId }, { $set: { isLike: params.isLike } }, { new: true })
        if (res) {
            if (params.isLike) {
                await Comment.findOneAndUpdate({ _id: params.commentId }, { $inc: { like: 1 } }, { new: true })
            } else {
                await Comment.findOneAndUpdate({ _id: params.commentId }, { $inc: { like: -1 } }, { new: true })
            }
            ctx.body = util.success('', '')
        } else {
            const newLikes = new Likes(params)
            await newLikes.save().then(async () => {
                if (params.isLike) {
                    await Comment.findOneAndUpdate({ _id: params.commentId }, { $inc: { like: 1 } }, { new: true })
                } else {
                    await Comment.findOneAndUpdate({ _id: params.commentId }, { $inc: { like: -1 } }, { new: true })
                }
                ctx.body = util.success('', '')
            }).catch(err => {
                ctx.body = util.fail(err.msg)
            })
        }
    } catch (error) {
        ctx.body = util.fail(error)
    }
})


module.exports = router