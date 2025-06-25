const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const db = require('../config/db')

const processSchema = new mongoose.Schema({
  process: {
    // 修改：从 name 改为 process
    type: String,
    required: true
  }, // 工序名称
  status: {
    type: Number,
    default: 0 // 0: 未开始, 1: 进行中, 2: 已完成
  },
  man_hour: {
    // 修改：从 estimatedHours 改为 man_hour
    type: Number,
    default: 0
  }, // 预计工时
  actualHours: {
    type: Number,
    default: 0
  }, // 实际工时
  submitter: {
    // 修改：从 operator 改为 submitter
    type: String
  }, // 操作人员
  start_time: {
    // 修改：从 startedAt 改为 start_time
    type: Date
  }, // 开始时间
  Submission_time: {
    // 修改：从 completedAt 改为 Submission_time
    type: Date
  }, // 完成时间
  remark: {
    type: String
  } // 备注
})

const productionTaskSchema = new mongoose.Schema({
  Batch_number: {
    // 修改：从 taskNumber 改为 Batch_number
    type: String,
    required: true,
    unique: true
  }, // 任务编号
  client: {
    // 保持 client
    type: String,
    required: true
  }, // 客户
  porject: {
    // 修改：从 project 改为 porject (注意拼写)
    type: String
  }, // 项目
  image: {
    type: String
  }, // 图片
  materialCode: {
    type: String,
    required: true
  }, // 材料代码
  materialName: {
    type: String,
    required: true
  }, // 材料名称
  versions: {
    // 修改：从 version 改为 versions
    type: String,
    default: '1.0'
  }, // 版本
  count: {
    // 修改：从 quantity 改为 count
    type: Number,
    required: true,
    min: 1
  }, // 数量
  type: {
    type: String,
    required: true
  }, // 类型
  clientDeliveryDate: {
    // 修改：从 customerDeliveryDate 改为 clientDeliveryDate
    type: Date,
    required: true
  }, // 客户交货日期
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'paused', 'cancelled'],
    default: 'pending'
  }, // 状态
  Difficulty: {
    // 修改：从 urgency 改为 Difficulty
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }, // 紧急程度/难度等级
  man_hour: {
    // 修改：从 estimatedHours 改为 man_hour
    type: Number,
    default: 0
  }, // 预计总工时
  actualHours: {
    type: Number,
    default: 0
  }, // 实际总工时
  process: [processSchema], // 工序列表 (保持 process)
  createdBy: {
    type: String,
    required: true
  }, // 创建者
  description: {
    type: String
  }, // 任务描述
  remark: {
    type: String
  }, // 备注
  createTime: {
    // 修改：从 createdAt 改为 createTime
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 8 * 1000) // 东8区时间
  }, // 创建时间
  updateTime: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 8 * 1000) // 东8区时间
  }, // 更新时间
  enable_flag: {
    type: String,
    default: 'Y'
  }, // 启用标志
  deleteTime: {
    type: Date
  } // 删除时间
})

// 更新时间中间件
productionTaskSchema.pre('save', function (next) {
  this.updateTime = new Date(Date.now() + 60 * 60 * 8 * 1000)
  next()
})

productionTaskSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: new Date(Date.now() + 60 * 60 * 8 * 1000) })
  next()
})

productionTaskSchema.plugin(mongoosePaginate)

const ProductionTask = db.model('ProductionTask', productionTaskSchema)

module.exports = ProductionTask
