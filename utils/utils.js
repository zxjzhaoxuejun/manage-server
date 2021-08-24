const log4js=require('./log4j')
/**
 * 通用工具函数
 */
const CODE={
    SUCCESS:200,
    PARAM_ERROR:10001,//参数错误
    USER_ACCOUNT_ERROR:20001,//账号或密码错误
    USER_LOGIN_ERROR:30001,//用户未登录
    BUSINESS_ERROR:40001,//业务请求失败
    AUTH_ERROR:50001,//认证失败或TOKEN过期
}

module.exports={
    pager({pageNum=1,pageSize=10}){
        pageNum*=1;
        pageSize*=1;
        const skipIndex=(pageNum-1)*pageSize

        return {
            page:{
                pageNum,
                pageSize
            },
            skipIndex
        }
    },
    success(data=null,msg='',code=CODE.SUCCESS){
        log4js.debug(data)
        return {
            code,
            data,
            msg
        }
    },
    fail(msg='',code=CODE.BUSINESS_ERROR){
        log4js.error(msg)
        return{
            code,
            msg
        }
    },
    formateDate(date, rule) {
      let fmt = rule || 'yyyy-MM-dd hh:mm:ss'
      if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, date.getFullYear())
      }
      const o = {
          // 'y+': date.getFullYear(),
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'h+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds()
      }
      for (let k in o) {
          if (new RegExp(`(${k})`).test(fmt)) {
              const val = o[k] + '';
              fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? val : ('00' + val).substr(val.length));
          }
      }
      return fmt;
  },
    CODE
}