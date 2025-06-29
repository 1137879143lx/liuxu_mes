const express = require('express')
const cors = require('cors')
const expressjwt = require('express-jwt')
const config = require('./config/config')

// 引入路由模块
const userRouter = require('./routes/UserRouters')
const customerRouter = require('./routes/CustomerRouters')
const supplierRouter = require('./routes/SupplierRouters')
const cuttingStockListRouter = require('./routes/Cutting_stock_listRouters')
const prReplenishmentRequisitionRouter = require('./routes/Pr_ReplenishmentRequisitionRouters')
const MaterialCategoryRouter = require('./routes/materialCategoryRoutes')
const UnitRouter = require('./routes/unitsRouters')
const MaterialRouter = require('./routes/materialsRouters')
const uploadRouter = require('./routes/upLoadRouters')
const SurfaceTreatmentRouter = require('./routes/surfaceTreatmentRouter')
const processSettingRouter = require('./routes/ProcessSettingRouters')
const salesQuoteRouter = require('./routes/salesQuoteRouters.JS')
const InboundRouter = require('./routes/InboundRouters')
const purchaseRequestRouter = require('./routes/purchaseRequestRouters')
const materialCategoryRoutes = require('./routes/materialCategoryRoutes')
// 引入生产任务路由
const productionTaskRouters = require('./routes/productionTaskRouters')
// 客户

const app = express()

// 跨域中间件
app.use(cors())
// 解析post请求中间件
app.use(
  express.urlencoded({
    limit: '50mb', // 增加URL编码请求体限制
    extended: true,
    parameterLimit: 50000
  })
)
// 解析json中间件
app.use(
  express.json({
    limit: '50mb', // 增加JSON请求体限制
    extended: true
  })
)

// 静态资源托管中间件
// app.use(express.static('../public'))
app.use(express.static('public'))
app.use(express.static('public/uploads'))

// 路由

// 验证token中间件
app.use(
  expressjwt({ secret: config.jwtSecretKey }).unless({
    path: ['/api/user/login', '/api/user/create']
  })
)

// // 添加请求日志中间件
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
//   next()
// })

app.use('/api/user', userRouter) // 引入路由
app.use('/api/customers', customerRouter) // // 使用路由
app.use('/api/suppliers', supplierRouter) // // 使用路由
app.use('/api/cutting_stock_list', cuttingStockListRouter) // // 使用路由
app.use('/api/pr_ReplenishmentRequisition', prReplenishmentRequisitionRouter) // // 使用路由
app.use('/api/materialcategory', MaterialCategoryRouter) // // 使用路由
app.use('/api/units', UnitRouter) // // 使用路由
app.use('/api/materials', MaterialRouter) // // 使用路由
app.use('/api', uploadRouter) // // 使用路由
app.use('/api/surfaceTreatment', SurfaceTreatmentRouter) // // 使用路由
app.use('/api/processSetting', processSettingRouter) // // 使用路由
app.use('/api/salesQuote', salesQuoteRouter) // // 使用路由
app.use('/api/inbounds', InboundRouter) // // 使用路由
app.use('/api/inventory', require('./routes/inventoryRouters'))
app.use('/api/outbounds', require('./routes/OutboundRouters'))
app.use('/api/suppliers', require('./routes/SupplierRouters'))
app.use('/api/purchaseRequests', purchaseRequestRouter) // // 使用路由
app.use('/api/material-categories', materialCategoryRoutes) // 使用物料类别路由
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes') // 引入采购订单路由
app.use('/api/purchaseOrders', purchaseOrderRoutes) // 使用采购订单路由
// 注册路由
app.use('/api/production-tasks', productionTaskRouters)

// 解析错误中间件
// eslint-disable-next-line space-before-function-paren
app.use(function (err, req, res, next) {
  console.log(req.body, req.headers)
  console.log('错误的中间件:' + err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') {
    return res.json({ status: 505, msg: '身份认证失败,请重新登录' })
  }

  // 处理请求体过大错误
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      code: 413,
      message: '请求数据过大，图片文件大小不能超过50MB',
      error: 'Payload too large'
    })
  }

  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: err.message
  })

  // 未知错误...
  next(err) // fix for Problem 1
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    path: req.originalUrl
  })
})

// 监听端口
app.listen(3333, () => {
  console.log('server is running at http://localhost:3333')
})
