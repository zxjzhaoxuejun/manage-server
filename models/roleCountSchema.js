/**
 * 维护角色ID自增长表
 */
const mongoose=require('mongoose')

const roleSchema =mongoose.Schema({
    _id:String,
    sequence_value:Number
})
module.exports=mongoose.model('roleCounter',roleSchema,'roleCounter')