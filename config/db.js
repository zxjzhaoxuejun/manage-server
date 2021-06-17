/**
 * 数据库连接
 */
const mongoose=require('mongoose')
const config= require('./index')
const log4js=require('./../utils/log4j')

mongoose.connect(config.URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.set('useFindAndModify', false)
const db=mongoose.connection
let maxConnectTimes=0
db.on('error',()=>{
    log4js.error('***数据库连接失败***')
})

db.on('disconnected',()=>{
    log4js.error('***数据库断开连接***')
    if(maxConnectTimes<3){
        maxConnectTimes++
        mongoose.connect(config.URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
    }
})
db.on('open',()=>{
    log4js.info('***数据库连接成功***')
})