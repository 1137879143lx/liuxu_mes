const mongoose = require('mongoose')
const db = require('../config/db')
const moment = require('moment-timezone')
const mongoosePaginate = require('mongoose-paginate-v2')

// 定义入库物料明细子模式
const inboundMaterialSchema = new mongoose.Schema(
  {
    materialCode: {
      type: String,
      required: [true, '物料编码不能为空']
    }, // 物料编码
    materialName: {
      type: String,
      required: [true, '物料名称不能为空']
    }, // 物料名称
    specification: {
      type: String
    }, // 规格型号
    version: {
      type: String
    }, // 版本
    unit: {
      type: String,
      required: [true, '单位不能为空']
    }, // 单位
    quantity: {
      type: Number,
      required: [true, '入库数量不能为空'],
      min: [0, '入库数量不能小于0']
    }, // 入库数量
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, '单价不能小于0']
    }, // 单价
    totalAmount: {
      type: Number,
      default: 0
    }, // 小计金额
    remark: {
      type: String
    } // 备注
  },
  {
    _id: false // 不为子文档生成_id
  }
)

// 获取当前北京时间的函数
function getBeijingTime() {
  return moment().tz('Asia/Shanghai').toDate()
}

// 格式化北京时间的函数
function formatBeijingTime(date) {
  return moment(date).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

// 定义入库模型
const inboundSchema = new mongoose.Schema(
  {
    inboundNo: {
      type: String,
      required: [true, '入库单号不能为空'],
      unique: true
    }, // 入库单号
    inboundType: {
      type: String,
      required: [true, '入库类型不能为空'],
      enum: ['purchase', 'production', 'return', 'transfer'], // 采购入库、生产入库、退货入库、调拨入库
      default: 'purchase'
    }, // 入库类型

    supplier: {
      type: String,
      required: [true, '供应商不能为空']
    }, // 供应商
    warehouse: {
      type: String,
      required: [true, '入库仓库不能为空']
    }, // 入库仓库
    warehouseCode: {
      type: String
    }, // 仓库编码
    totalQuantity: {
      type: Number,
      default: 0
    }, // 总数量
    totalAmount: {
      type: Number,
      default: 0
    }, // 总金额
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'], // 待入库、已入库、已取消
      default: 'pending'
    }, // 状态
    materials: [inboundMaterialSchema], // 入库物料明细
    operator: {
      type: String,
      required: [true, '操作人不能为空']
    }, // 操作人
    operatorId: {
      type: String
    }, // 操作人ID
    inboundTime: {
      type: Date
    }, // 入库时间
    remark: {
      type: String
    }, // 备注
    purchaseOrderNo: {
      type: String
    }, // 采购订单号
    deliveryNote: {
      type: String
    }, // 送货单号
    enable_flag: {
      type: String,
      default: 'Y'
    }, // 是否启用标志
    createTime: {
      type: Date,
      default: getBeijingTime,
      get: function (v) {
        return formatBeijingTime(v)
      }
    }, // 创建时间
    updateTime: {
      type: Date,
      default: getBeijingTime,
      get: function (v) {
        return formatBeijingTime(v)
      }
    } // 更新时间
  },
  {
    timestamps: false, // 关闭默认的时间戳，使用自定义的
    toJSON: { getters: true }, // 启用getter，确保JSON序列化时应用时间格式化
    toObject: { getters: true }
  }
)

// 更新时间中间件
inboundSchema.pre('save', function (next) {
  // 如果是新文档，设置创建时间
  if (this.isNew) {
    this.createTime = getBeijingTime()
  }

  // 总是更新修改时间
  this.updateTime = getBeijingTime()

  // 计算总数量和总金额
  if (this.materials && this.materials.length > 0) {
    this.totalQuantity = this.materials.reduce((sum, material) => sum + (material.quantity || 0), 0)
    this.totalAmount = this.materials.reduce((sum, material) => {
      const amount = (material.quantity || 0) * (material.unitPrice || 0)
      material.totalAmount = amount
      return sum + amount
    }, 0)
  } else {
    this.totalQuantity = 0
    this.totalAmount = 0
  }

  next()
})

// 更新时间中间件（findOneAndUpdate等更新操作）
inboundSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updateTime: getBeijingTime() })

  // 如果更新了materials字段，重新计算总数量和总金额
  const update = this.getUpdate()
  if (update.materials || update.$set?.materials) {
    const materials = update.materials || update.$set?.materials
    if (materials && materials.length > 0) {
      const totalQuantity = materials.reduce((sum, material) => sum + (material.quantity || 0), 0)
      const totalAmount = materials.reduce((sum, material) => {
        const amount = (material.quantity || 0) * (material.unitPrice || 0)
        material.totalAmount = amount
        return sum + amount
      }, 0)

      this.set({
        totalQuantity: totalQuantity,
        totalAmount: totalAmount
      })
    }
  }

  next()
})

// 添加索引
inboundSchema.index({ inboundNo: 1 })
inboundSchema.index({ createTime: -1 })
inboundSchema.index({ status: 1 })
inboundSchema.index({ supplier: 1 })
inboundSchema.index({ warehouse: 1 })
inboundSchema.index({ inboundType: 1 })

// 添加分页插件
inboundSchema.plugin(mongoosePaginate)

// 创建模型
const Inbound = db.model('inbounds', inboundSchema)

module.exports = Inbound
