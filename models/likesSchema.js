const mongoose =require('mongoose')
const likesSchema=mongoose.Schema({
    "commentId":{type:mongoose.Schema.Types.ObjectId},//
    "userId":String,
    "isLike":{type:Boolean,default:false}
})
module.exports=mongoose.model('likes',likesSchema,'likes')