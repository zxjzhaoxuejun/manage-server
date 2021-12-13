/**
 * 维护文章ID自增长表
 */
const mongoose=require('mongoose')

const articleSchema =mongoose.Schema({
    _id:String,
    sequence_value:Number
})
module.exports=mongoose.model('articleCounter',articleSchema,'articleCounter')