//文章管理
const router = require('koa-router')()
const Article=require('./../models/articleSchema')
const ArticleCounter=require('./../models/articleCountesSchema')
const util=require('./../utils/utils')

router.prefix('/article')

//保存
router.post('/save',async(ctx)=>{
    try {
        const doc = await ArticleCounter.findOneAndUpdate({_id:'articleId'},{$inc:{sequence_value:1}},{new:true})
        let articleInfo = new Article({...ctx.request.body,"articleId":doc.sequence_value})
        await articleInfo.save().then(()=>{
          ctx.body=util.success('','添加成功!')
        }).catch(err=>{
          ctx.body=util.fail(err.msg)
        })
      } catch (error) {
        ctx.body=util.fail(error.msg)
      }
  })
  /**
   * 查询文章列表
   */
  router.post('/list',async(ctx)=>{
    const {type,keywords}=ctx.request.body
    const {page,skipIndex}=util.pager(ctx.request.body)
    let params={}
    if(type) params.type=type
    if(keywords) params.title= keywords
    //根据条件查询列表
    try {
        const query=Article.find(params)
        const list=await query.skip(skipIndex).limit(page.pageSize)
        const total=await Article.countDocuments(params)
        ctx.body=util.success({
            total,
            list
        })
    } catch (error) {
        ctx.body=util.fail(`数据异常：${error}`)
    }
  })

  /**
   * 查询文章详情
   */
   router.post('/details',async(ctx)=>{
    const {articleId}=ctx.request.body
    let params={
        articleId
    }
    //根据条件查询列表
    try {
        const doc=await Article.findOneAndUpdate({articleId},{$inc:{views:1}},{new:true})
        console.log('doc测试=>'+doc)
        const res=await Article.find(params)
        ctx.body=util.success({
            data:res[0]
        })
    } catch (error) {
        ctx.body=util.fail(`数据异常：${error}`)
    }
  })




  module.exports=router