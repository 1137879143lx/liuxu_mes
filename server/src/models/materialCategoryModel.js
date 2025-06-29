const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const db = require('../config/db')

const materialCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '物料类型名称不能为空'],
      unique: true,
      trim: true,
      maxlength: [50, '物料类型名称不能超过50个字符']
    },
    code: {
      type: String,
      required: [true, '类别编码不能为空'],
      unique: true,
      trim: true,
      maxlength: [20, '类别编码不能超过20个字符']
    },
    unit: {
      type: String,
      required: [true, '单位不能为空'],
      trim: true,
      maxlength: [10, '单位不能超过10个字符']
    },
    codeRule: {
      type: String,
      trim: true,
      maxlength: [100, '编码规则不能超过100个字符']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '描述不能超过500个字符']
    },
    status: {
      type: Number,
      enum: [0, 1], // 0: 禁用, 1: 启用
      default: 1
    },
    createTime: {
      type: Date,
      default: Date.now,
      get: (v) => (v ? new Date(v).toLocaleString('zh-CN') : '')
    },
    updateTime: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
    versionKey: false,
    toJSON: { getters: true }
  }
)

// 更新时间中间件
materialCategorySchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updateTime = new Date()
  }
  next()
})

materialCategorySchema.plugin(mongoosePaginate)
const MaterialCategory = db.model('MaterialCategory', materialCategorySchema)

module.exports = MaterialCategory
