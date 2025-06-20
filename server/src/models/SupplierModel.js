const mongoose = require('mongoose')
const db = require('../config/db')
const moment = require('moment')
const mongoosePaginate = require('mongoose-paginate-v2')

// 定义供应商模型
const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: String,
    required: [true, '供应商编号不能为空'],
    unique: true,
    trim: true
  }, // 供应商编号
  shortName: {
    type: String,
    required: [true, '供应商简称不能为空'],
    trim: true
  }, // 简称
  fullName: {
    type: String,
    required: [true, '供应商全称不能为空'],
    trim: true
  }, // 全称
  supplierType: {
    type: String,
    required: [true, '供应商类型不能为空'],
    enum: ['material', 'equipment', 'service', 'other'], // 原材料、设备、服务、其他
    default: 'material'
  }, // 供应商类型
  status: {
    type: String,
    enum: ['active', 'inactive'], // 启用、禁用
    default: 'active'
  }, // 状态
  contactPerson: {
    type: String,
    required: [true, '联系人不能为空'],
    trim: true
  }, // 联系人
  telephone: {
    type: String,
    required: [true, '联系电话不能为空'],
    trim: true
  }, // 联系电话
  email: {
    type: String,
    trim: true,
    lowercase: true
  }, // 邮箱
  fax: {
    type: String,
    trim: true
  }, // 传真
  address: {
    type: String,
    required: [true, '地址不能为空'],
    trim: true
  }, // 地址
  taxRate: {
    type: Number,
    required: [true, '税率不能为空'],
    min: [0, '税率不能小于0'],
    max: [100, '税率不能大于100'],
    default: 13
  }, // 税率
  currency: {
    type: String,
    required: [true, '货币不能为空'],
    enum: ['RMB', 'USD', 'EUR', 'JPY'],
    default: 'RMB'
  }, // 货币
  creditLevel: {
    type: Number,
    min: [1, '信用等级最小为1'],
    max: [5, '信用等级最大为5'],
    default: 3
  }, // 信用等级（1-5星）
  bankName: {
    type: String,
    trim: true
  }, // 银行名称
  bankAccount: {
    type: String,
    trim: true
  }, // 银行账号
  remark: {
    type: String
  }, // 备注
  enable_flag: {
    type: String,
    default: 'Y'
  }, // 是否启用标志
  createTime: {
    type: Date,
    default: Date.now() + 60 * 60 * 8 * 1000,
    get: (v) => moment(v).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')
  }, // 创建时间
  updateTime: {
    type: Date,
    default: Date.now() + 60 * 60 * 8 * 1000,
    get: (v) => moment(v).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')
  } // 更新时间
})

// 更新时间中间件
supplierSchema.pre('save', function (next) {
  this.updateTime = Date.now() + 60 * 60 * 8 * 1000
  next()
})

// 更新时间中间件（findOneAndUpdate）
supplierSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: Date.now() + 60 * 60 * 8 * 1000 })
  next()
})

supplierSchema.plugin(mongoosePaginate)
const Supplier = db.model('suppliers', supplierSchema)
module.exports = Supplier