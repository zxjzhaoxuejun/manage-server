const jwt = require('jsonwebtoken')
const extractors = require('./extractors')
const util=require('./../utils')

/**
 * 
 * @param {object} options 
 *  @param {function} jwtFromRequest
 * 默认验证 header 的 authorization
*extractors提供的提取函数，支持get、post、header方式提取
*这些函数都接收一个字符串参数（需要提取的key）
*对应函数：
*fromUrlQueryParameter、
*fromBodyField、
*fromHeader
 *  @param {array} safetyRoutes 不需要验证的路由
 *   @param {string} secretOrKey  与生成token时传入的标识保持一致
 */

function checkJwt({jwtFromRequest,safetyRoutes,secretOrKey}={}){
    return async function(ctx,next){
        if(typeof safetyRoutes !== 'undefined'){
            let url = ctx.request.url
            //对安全的路由 不验证token
            if(Array.isArray(safetyRoutes)){
                for (let i = 0, len = safetyRoutes.length; i < len; i++) {
                    let route = safetyRoutes[i],
                        reg = new RegExp(`^${route}`);   
                    //若匹配到当前路由 则直接跳过  不开启验证                
                    if(reg.test(url)){
                        return await next()
                    }
                }
            }else{
                throw new TypeError('safetyRoute 接收类型为数组')
            }
        }
        if(typeof secretOrKey === 'undefined'){
            throw new Error('secretOrKey 为空')
        }
        if(typeof jwtFromRequest === 'undefined'){
            jwtFromRequest = extractors.fromHeader()
        }
        let token = jwtFromRequest(ctx)
        if(token){
            //token验证
            let err = await new Promise(resolve=>{
                jwt.verify(token, secretOrKey,function(err,payload){
                    if(!err){
                        //将token解码后的内容 添加到上下文
                        ctx.payload = payload.data
                    }
                    resolve(err)
                })
            })
            if(err){
                ctx.body =util.fail(err.message === 'jwt expired' ? 'token 过期' : 'token 出错',util.CODE.AUTH_ERROR) 
                return
            }
            await next()
        }
    }
}

module.exports = {
    checkJwt,
    extractors
}