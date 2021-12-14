// 引入配置 koa-multer 模块 
const router = require('koa-router')()
const multer=require('./../utils/multer')
const util=require('./../utils/utils')
const Uploads=require('./../models/uploadSchema')


  router.prefix('/upload')
  
  router.post('/uploadImg', multer.single('file'), async (ctx, next) => {
    // {
    //     fieldname: 'file',
    //     originalname: '6.jpg',
    //     encoding: '7bit',
    //     mimetype: 'image/jpeg',
    //     destination: 'public/upload/images_2021_12',
    //     filename: '1639452594269.jpg',
    //     path: 'public\\upload\\images_2021_12\\1639452594269.jpg',
    //     size: 19199
    //   }
      const {filename,mimetype,size,destination}=ctx.req.file
      const url=`http://localhost:3000/${destination}/${filename}`
      const uploadParams={
          name:filename,
          type:mimetype,
          url,
          size
      }
      try {
        let newUpload = new Uploads(uploadParams)
        await newUpload.save().then(()=>{
          ctx.body=util.success({
              filename: url//返回文件名
          },'添加成功!')
        }).catch(err=>{
          ctx.body=util.fail(err.msg)
        })
      } catch (err) {
        ctx.body=util.fail(err.msg)
      }
    
})
    

module.exports=router