const mongoose = require('mongoose')
const db = require('../config/db')
const mongoosePaginate = require('mongoose-paginate-v2')
const moment = require('moment')

const materialSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, '物料编码不能为空'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, '物料名称不能为空'],
      trim: true
    },
    specification: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      required: [true, '计量单位不能为空'],
      trim: true
    },
    inventory: {
      type: Number,
      min: [0, '安全库存不能为负数'],
      default: 0
    },
    maxInventory: {
      type: Number,
      min: [0, '最大库存不能为负数'],
      default: 0
    },
    price: {
      type: Number,
      min: [0, '单价不能为负数'],
      default: 0
    },
    density: {
      type: Number,
      min: [0, '密度不能为负数'],
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
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    description: {
      type: String,
      trim: true,
      maxlength: [500, '描述不能超过500个字符']
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
    },
    // 系统字段
    enable_flag: {
      type: String,
      enum: ['Y', 'N'],
      default: 'Y'
    },
    createTime: {
      type: Date,
      default: Date.now,
      get: (v) => moment(v).format('YYYY-MM-DD HH:mm:ss')
    },
    updateTime: {
      type: Date,
      default: Date.now
    },
    createBy: {
      type: String,
      trim: true
    },
    updateBy: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
    versionKey: false,
    toJSON: { getters: true }
  }
)

// 索引
materialSchema.index({ code: 1, isDeleted: 1 })
materialSchema.index({ name: 1, isDeleted: 1 })
materialSchema.index({ category: 1, isDeleted: 1 })
materialSchema.index({ status: 1, isDeleted: 1 })

// 软删除方法
materialSchema.methods.softDelete = function (deletedBy = 'system') {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = deletedBy
  this.enable_flag = 'N'
  return this.save()
}

// 恢复方法
materialSchema.methods.restore = function () {
  this.isDeleted = false
  this.deletedAt = undefined
  this.deletedBy = undefined
  this.enable_flag = 'Y'
  return this.save()
}

// 插件
materialSchema.plugin(mongoosePaginate)

const Material = db.model('Material', materialSchema)

module.exports = Material
