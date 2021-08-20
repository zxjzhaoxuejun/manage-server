const mongoose=require('mongoose')

const menuSchema =mongoose.Schema({
    "parentId":[mongoose.Types.ObjectId],
    "menuName":String,//菜单名称
    "icon":String,//图标
    "path":String,//路由地址
    "component":String,//组件路径
    "componentName":String,//组件名称
    "menuCode":String,//权限标识
    "menuState":Number,//菜单状态1.正常，2停用
    "menuType":Number,//菜单类型1.菜单,2.按钮
    "createTime":{
        type:Date,
        default:Date.now()
    },//创建时间
    "updateTime":{
        type:Date,
        default:Date.now()
    },//更新时间
})

module.exports=mongoose.model('menu',menuSchema,'menu')