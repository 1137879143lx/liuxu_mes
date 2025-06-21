const mongoose = require('mongoose')
const db = require('../config/db')

const materialCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '物料类别名称不能为空'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, '物料类别编码不能为空'],
    trim: true,
    unique: true,
    uppercase: true
  },
  unit: {
    type: String,
    required: [true, '计量单位不能为空'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['启用', '禁用'],
    default: '启用'
  },
  // 编码生成规则
  codeRule: {
    type: String,
    trim: true,
    default: 'AUTO' // AUTO: 自动生成, MANUAL: 手动输入
  },
  // 编码前缀
  codePrefix: {
    type: String,
    trim: true,
    uppercase: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
})

// 在保存前设置编码前缀
materialCategorySchema.pre('save', function (next) {
  if (!this.codePrefix && this.code) {
    this.codePrefix = this.code
  }
  next()
})

// 创建索引
materialCategorySchema.index({ name: 1 })
materialCategorySchema.index({ code: 1 })
materialCategorySchema.index({ status: 1 })
materialCategorySchema.index({ isDeleted: 1 })

const MaterialCategory = db.model('MaterialCategory', materialCategorySchema)

module.exports = MaterialCategory