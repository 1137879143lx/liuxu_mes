const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const db = require('../config/db')

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, //
    unique: true
  }, // 客户名称
  companyName: {
    type: String
  }, // 公司名称
  contactPerson: {
    type: String
  }, // 联系人
  phone: {
    type: String
  }, // 电话
  email: {
    type: String
  }, // 邮箱
  address: {
    type: String
  }, // 地址
  type: {
    type: String,
    enum: ['individual', 'company'],
    default: 'company'
  }, // 客户类型：个人/公司
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }, // 状态
  creditLevel: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    default: 'B'
  }, // 信用等级
  remark: {
    type: String
  }, // 备注
  createTime: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 8 * 1000)
  }, // 创建时间
  updateTime: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 8 * 1000)
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
customerSchema.pre('save', function (next) {
  this.updateTime = new Date(Date.now() + 60 * 60 * 8 * 1000)
  next()
})

customerSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: new Date(Date.now() + 60 * 60 * 8 * 1000) })
  next()
})

customerSchema.plugin(mongoosePaginate)

const Customer = db.model('Customer', customerSchema)

module.exports = Customer
