const multer = require('koa-multer')
const date=new Date()
const storage = multer.diskStorage({
    //文件保存路径
    //根据日期创建，防止文件夹达到最大数量的文件
  destination: 'public/upload/' + 'images_' + date.getFullYear() + '_' + (date.getMonth() + 1),
    //修改文件名称
    filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
      cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
  })
    
//加载配置
const upload = multer({ storage: storage,limits:{ fieldSize:1024*1024*5} })//限制5Mb
module.exports=upload