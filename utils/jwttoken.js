
/**
 * token验证
 */
const jwt=require('jsonwebtoken')
const jwtSecret = 'sieia'

const createToken=(data,expiresIn)=>{
    let obj = {};
    obj.data = data || {};//存入token的数据
    obj.ctime = (new Date()).getTime();//token的创建时间
    expiresIn =expiresIn||'1d'//设定的过期时间
    let token = jwt.sign(obj,jwtSecret,{expiresIn})
    return token
}


const varifyToken=(token)=>{
    let res=null
    try {
        const{data,ctime,exp}=jwt.verify(token,jwtSecret)
        console.log(jwt.verify(token,jwtSecret))
        let nowTime = (new Date()).getTime();
        if(Math.floor((nowTime-ctime)/1000)<exp){
            res = data;        
        }
    } catch (error) {
        
    }
    return res
}

module.exports={varifyToken,createToken}