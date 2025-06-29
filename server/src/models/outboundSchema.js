const mongoose = require('mongoose')
const db = require('../config/db')
const moment = require('moment-timezone')
const mongoosePaginate = require('mongoose-paginate-v2')

// 定义出库物料明细子模式
const outboundMaterialSchema = new mongoose.Schema(
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
    requestQuantity: {
      type: Number,
      required: [true, '申请数量不能为空'],
      min: [0, '申请数量不能小于0']
    }, // 申请数量
    actualQuantity: {
      type: Number,
      default: 0,
      min: [0, '实际出库数量不能小于0']
    }, // 实际出库数量
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, '单价不能小于0']
    }, // 单价
    totalAmount: {
      type: Number,
      default: 0
    }, // 小计金额
    batchNo: {
      type: String
    }, // 批次号
    expiryDate: {
      type: Date
    }, // 有效期
    remark: {
      type: String
    } // 备注
  },
  {
    _id: false,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
)

// 获取当前北京时间的函数
function getBeijingTime() {
  return moment().tz('Asia/Shanghai').toDate()
}

// 格式化北京时间的函数
function formatBeijingTime(date) {
  if (!date) return null
  return moment(date).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

// 定义出库模型
const outboundSchema = new mongoose.Schema(
  {
    outboundNo: {
      type: String,
      required: [true, '出库单号不能为空'],
      unique: true
    }, // 出库单号
    outboundType: {
      type: String,
      required: [true, '出库类型不能为空'],
      enum: ['production', 'sale', 'transfer', 'return', 'scrap'], // 生产领料、销售出库、调拨出库、退货出库、报废出库
      default: 'production'
    }, // 出库类型
    department: {
      type: String,
      required: [true, '申请部门不能为空']
    }, // 申请部门
    applicant: {
      type: String,
      required: [true, '申请人不能为空']
    }, // 申请人
    applicantId: {
      type: String
    }, // 申请人ID
    warehouse: {
      type: String,
      required: [true, '出库仓库不能为空']
    }, // 出库仓库
    warehouseCode: {
      type: String
    }, // 仓库编码
    totalRequestQuantity: {
      type: Number,
      default: 0
    }, // 总申请数量
    totalActualQuantity: {
      type: Number,
      default: 0
    }, // 总实际出库数量
    totalAmount: {
      type: Number,
      default: 0
    }, // 总金额
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'], // 待审核、已审核、已出库、已取消
      default: 'pending'
    }, // 状态
    materials: [outboundMaterialSchema], // 出库物料明细
    operator: {
      type: String,
      required: [true, '操作人不能为空']
    }, // 操作人
    operatorId: {
      type: String
    }, // 操作人ID
    approver: {
      type: String
    }, // 审核人
    approverId: {
      type: String
    }, // 审核人ID
    approveTime: {
      type: Date,
      get: function (v) {
        return formatBeijingTime(v)
      }
    }, // 审核时间
    outboundTime: {
      type: Date,
      get: function (v) {
        return formatBeijingTime(v)
      }
    }, // 出库时间
    remark: {
      type: String
    }, // 备注
    urgentLevel: {
      type: String,
      enum: ['normal', 'urgent', 'emergency'], // 普通、紧急、特急
      default: 'normal'
    }, // 紧急程度
    businessType: {
      type: String
    }, // 业务类型
    sourceOrderNo: {
      type: String
    }, // 源单据号（如生产订单号、销售订单号等）
    targetLocation: {
      type: String
    }, // 目标位置（如车间、客户等）
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

// 保存前中间件
outboundSchema.pre('save', function (next) {
  // 如果是新文档，设置创建时间
  if (this.isNew) {
    this.createTime = getBeijingTime()
  }

  // 总是更新修改时间
  this.updateTime = getBeijingTime()

  // 计算总数量和总金额
  if (this.materials && this.materials.length > 0) {
    this.totalRequestQuantity = this.materials.reduce((sum, material) => sum + (material.requestQuantity || 0), 0)
    this.totalActualQuantity = this.materials.reduce((sum, material) => sum + (material.actualQuantity || 0), 0)
    this.totalAmount = this.materials.reduce((sum, material) => {
      const amount = (material.actualQuantity || 0) * (material.unitPrice || 0)
      material.totalAmount = amount
      return sum + amount
    }, 0)
  } else {
    this.totalRequestQuantity = 0
    this.totalActualQuantity = 0
    this.totalAmount = 0
  }

  next()
})

// 更新时间中间件（findOneAndUpdate等更新操作）
outboundSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updateTime: getBeijingTime() })

  // 如果更新了materials字段，重新计算总数量和总金额
  const update = this.getUpdate()
  if (update.materials || update.$set?.materials) {
    const materials = update.materials || update.$set?.materials
    if (materials && materials.length > 0) {
      const totalRequestQuantity = materials.reduce((sum, material) => sum + (material.requestQuantity || 0), 0)
      const totalActualQuantity = materials.reduce((sum, material) => sum + (material.actualQuantity || 0), 0)
      const totalAmount = materials.reduce((sum, material) => {
        const amount = (material.actualQuantity || 0) * (material.unitPrice || 0)
        material.totalAmount = amount
        return sum + amount
      }, 0)

      this.set({
        totalRequestQuantity: totalRequestQuantity,
        totalActualQuantity: totalActualQuantity,
        totalAmount: totalAmount
      })
    }
  }

  // 如果审核状态变更，设置审核时间
  if (update.status === 'approved' || update.$set?.status === 'approved') {
    if (!this.getUpdate().approveTime && !this.getUpdate().$set?.approveTime) {
      this.set({ approveTime: getBeijingTime() })
    }
  }

  // 如果状态变为已出库，设置出库时间
  if (update.status === 'completed' || update.$set?.status === 'completed') {
    if (!this.getUpdate().outboundTime && !this.getUpdate().$set?.outboundTime) {
      this.set({ outboundTime: getBeijingTime() })
    }
  }

  next()
})

// 静态方法：生成出库单号
outboundSchema.statics.generateOutboundNo = async function (type = 'production') {
  const typePrefix = {
    production: 'CK-SC', // 生产领料
    sale: 'CK-XS', // 销售出库
    transfer: 'CK-DB', // 调拨出库
    return: 'CK-TH', // 退货出库
    scrap: 'CK-BF' // 报废出库
  }

  const prefix = typePrefix[type] || 'CK-SC'
  const date = moment().tz('Asia/Shanghai').format('YYYYMMDD')

  // 查找当天最大的序号
  const latestDoc = await this.findOne({
    outboundNo: { $regex: `^${prefix}${date}` }
  }).sort({ outboundNo: -1 })

  let sequence = 1
  if (latestDoc) {
    const match = latestDoc.outboundNo.match(/(\d{3})$/)
    if (match) {
      sequence = parseInt(match[1]) + 1
    }
  }

  return `${prefix}${date}${sequence.toString().padStart(3, '0')}`
}

// 实例方法：检查是否可以编辑
outboundSchema.methods.canEdit = function () {
  return this.status === 'pending'
}

// 实例方法：检查是否可以审核
outboundSchema.methods.canApprove = function () {
  return this.status === 'pending'
}

// 实例方法：检查是否可以出库
outboundSchema.methods.canOutbound = function () {
  return this.status === 'approved'
}

// 实例方法：检查是否可以取消
outboundSchema.methods.canCancel = function () {
  return ['pending', 'approved'].includes(this.status)
}

// 虚拟字段：状态描述
outboundSchema.virtual('statusText').get(function () {
  const statusMap = {
    pending: '待审核',
    approved: '已审核',
    completed: '已出库',
    cancelled: '已取消'
  }
  return statusMap[this.status] || this.status
})

// 虚拟字段：出库类型描述
outboundSchema.virtual('outboundTypeText').get(function () {
  const typeMap = {
    production: '生产领料',
    sale: '销售出库',
    transfer: '调拨出库',
    return: '退货出库',
    scrap: '报废出库'
  }
  return typeMap[this.outboundType] || this.outboundType
})

// 虚拟字段：紧急程度描述
outboundSchema.virtual('urgentLevelText').get(function () {
  const levelMap = {
    normal: '普通',
    urgent: '紧急',
    emergency: '特急'
  }
  return levelMap[this.urgentLevel] || this.urgentLevel
})

// 添加索引
outboundSchema.index({ outboundNo: 1 })
outboundSchema.index({ createTime: -1 })
outboundSchema.index({ status: 1 })
outboundSchema.index({ outboundType: 1 })
outboundSchema.index({ department: 1 })
outboundSchema.index({ applicant: 1 })
outboundSchema.index({ warehouse: 1 })
outboundSchema.index({ urgentLevel: 1 })
outboundSchema.index({ operator: 1 })
outboundSchema.index({ approver: 1 })

// 复合索引
outboundSchema.index({ status: 1, createTime: -1 })
outboundSchema.index({ outboundType: 1, status: 1 })
outboundSchema.index({ department: 1, status: 1 })

// 添加分页插件
outboundSchema.plugin(mongoosePaginate)

// 创建模型
const Outbound = db.model('outbounds', outboundSchema)

module.exports = Outbound
