const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const db = require('../config/db')

const materialSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, '物料编码不能为空'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '物料名称不能为空'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  specification: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  unit: {
    type: String,
    required: [true, '计量单位不能为空'],
    trim: true
  },
  density: {
    type: Number,
    min: [0, '密度不能为负数']
  },
  maxInventory: {
    type: Number,
    min: [0, '最大库存不能为负数'],
    default: 0
  },
  inventory: {
    type: Number,
    min: [0, '安全库存不能为负数'],
    default: 0
  },
  price: {
    type: Number,
    min: [0, '单价不能为负数'],
    default: 0
  },
  category: {
    type: String,
    required: [true, '物料类别不能为空'],
    trim: true
  },
  status: {
    type: String,
    enum: ['启用', '禁用'],
    default: '启用'
  },
  image: {
    type: String,
    trim: true
  },
  version: {
    type: String,
    default: 'V1.0',
    trim: true
  },
  leadTime: {
    type: Number,
    min: [1, '采购周期不能小于1天'],
    default: 7
  },
  supplier: {
    type: String,
    trim: true
  },
  // 软删除标记
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
})

// 创建索引
materialSchema.index({ code: 1 })
materialSchema.index({ name: 1 })
materialSchema.index({ category: 1 })
materialSchema.index({ status: 1 })
materialSchema.index({ isDeleted: 1 })

// 添加分页插件
materialSchema.plugin(mongoosePaginate)

// 修复预处理查询，避免冲突
materialSchema.pre(/^find/, function () {
  // 检查是否已经设置了 isDeleted 查询条件
  const query = this.getQuery()
  const options = this.getOptions()

  // 使用 Object.hasOwn()（Node.js 16.9.0+）或 in 操作符
  const hasIsDeletedProperty = ('isDeleted' in query)

  // 如果没有明确设置 includeDeleted 选项，且查询中没有 isDeleted 条件
  // 则自动过滤已删除的数据
  if (!options.includeDeleted && !hasIsDeletedProperty) {
    this.where({ isDeleted: { $ne: true } })
  }
})

// 实例方法：软删除
materialSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = deletedBy
  return this.save()
}

// 实例方法：恢复
materialSchema.methods.restore = function () {
  this.isDeleted = false
  this.deletedAt = undefined
  this.deletedBy = undefined
  return this.save()
}

// 静态方法：查找包括已删除的数据
materialSchema.statics.findWithDeleted = function (filter = {}) {
  return this.find(filter, null, { includeDeleted: true })
}

// 静态方法：只查找已删除的数据
materialSchema.statics.findDeleted = function (filter = {}) {
  return this.find({ ...filter, isDeleted: true }, null, { includeDeleted: true })
}
const Material = db.model('Material', materialSchema)

module.exports = Material