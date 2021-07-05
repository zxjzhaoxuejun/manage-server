const util=require('./../utils')
let extractors = {}
extractors.fromHeader = function(header_name='authorization'){
    return function(ctx){
        let token   = null,
            request = ctx.request;
        if (request.header[header_name]) {
            token = header_name === 'authorization' ? 
            request.header[header_name].replace('Bearer ', '') :
            request.header[header_name];
            console.log('token=>'+token)
        }else{
            ctx.body =util.fail(`${header_name} 不合法`,util.CODE.AUTH_ERROR)
        }
        return token;
    }
}

extractors.fromUrlQueryParameter = function(param_name){
    return function(ctx){
        let token   = null,
            request = ctx.request;
        if (request.query[param_name] && Object.prototype.hasOwnProperty.call(request.query, param_name)) {
            token = request.query[param_name];
        }else{
            ctx.body =util.success(`${param_name} 不合法`)
        }
        return token;
    }
}

extractors.fromBodyField = function(field_name){
    return function(ctx){
        let token   = null,
            request = ctx.request;
        if (request.body[field_name] && Object.prototype.hasOwnProperty.call(request.body, field_name)) {
            token = request.body[field_name];
        }else{
            ctx.body =util.fail(`${field_name} 不合法`,util.CODE.AUTH_ERROR)
        }
        return token;
    }
}

module.exports = extractors