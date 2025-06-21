const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

// 获取数据库连接
const db = require('../config/db')

// 物料明细子schema
const materialItemSchema = new mongoose.Schema({
  materialCode: {
    type: String,
    required: [true, '物料编码不能为空'],
    trim: true
  },
  materialName: {
    type: String,
    required: [true, '物料名称不能为空'],
    trim: true
  },
  specification: {
    type: String,
    default: '',
    trim: true
  },
  unit: {
    type: String,
    required: [true, '单位不能为空'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, '数量不能为空'],
    min: [0.01, '数量必须大于0']
  },
  estimatedUnitPrice: {
    type: Number,
    default: 0,
    min: [0, '单价不能为负数']
  },
  estimatedAmount: {
    type: Number,
    default: 0,
    min: [0, '金额不能为负数']
  },
  note: {
    type: String,
    default: '',
    trim: true
  }
}, { _id: false })

// 审核历史记录子schema
const approvalHistorySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'approve', 'reject', 'convert', 'complete']
  },
  operator: {
    type: String,
    required: [true, '操作人不能为空'],
    trim: true
  },
  operatorId: {
    type: String,
    required: [true, '操作人ID不能为空'],
    trim: true
  },
  comment: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, '备注不能超过500个字符']
  },
  createTime: {
    type: Date,
    default: Date.now
  }
}, { _id: false })

// 采购申请主schema
const purchaseRequestSchema = new mongoose.Schema({
  // 基本信息
  requestNo: {
    type: String,
    required: [true, '申请单号不能为空'],
    unique: true,
    trim: true,
    index: true
  },
  applicant: {
    type: String,
    required: [true, '申请人不能为空'],
    trim: true,
    index: true
  },
  applicantId: {
    type: String,
    trim: true,
    index: true
  },
  department: {
    type: String,
    required: [true, '申请部门不能为空'],
    index: true
  },

  // 申请详情
  urgency: {
    type: String,
    required: [true, '紧急程度不能为空'],
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
    index: true
  },
  requestDate: {
    type: Date,
    required: [true, '申请日期不能为空'],
    index: true
  },
  expectedDate: {
    type: Date,
    required: [true, '期望到货日期不能为空']
  },
  reason: {
    type: String,
    required: [true, '申请原因不能为空'],
    trim: true,
    maxlength: [1000, '申请原因不能超过1000个字符']
  },

  // 物料明细
  materialList: {
    type: [materialItemSchema],
    required: [true, '物料清单不能为空'],
    validate: {
      validator: function (v) {
        return v && v.length > 0
      },
      message: '至少需要一个物料项'
    }
  },

  // 金额信息
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, '总金额不能为负数']
  },

  // 状态管理
  applicationStatus: {
    type: String,
    required: [true, '申请状态不能为空'],
    enum: ['pending', 'approved', 'rejected', 'converted', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // 审核信息
  approver: {
    type: String,
    trim: true
  },
  approverId: {
    type: String,
    trim: true
  },
  approvalDate: {
    type: Date
  },
  approvalComment: {
    type: String,
    trim: true,
    maxlength: [500, '审核意见不能超过500个字符']
  },

  // 审核历史
  approvalHistory: {
    type: [approvalHistorySchema],
    default: []
  },

  // 关联信息
  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  purchaseOrderNo: {
    type: String,
    trim: true
  },

  // 系统字段
  enable_flag: {
    type: String,
    enum: ['Y', 'N'],
    default: 'Y',
    index: true
  },
  createTime: {
    type: Date,
    default: Date.now,
    index: true
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
  },

  // 备注信息
  remark: {
    type: String,
    trim: true,
    maxlength: [1000, '备注不能超过1000个字符']
  }
}, {
  timestamps: {
    createdAt: 'createTime',
    updatedAt: 'updateTime'
  },
  versionKey: false
  ,
  // 在模型中添加以下字段（如果还没有的话）

  // 转换信息
  converter: {
    type: String,
    trim: true,
    maxlength: [50, '转换人姓名不能超过50个字符']
  },
  convertTime: {
    type: Date,
    index: true
  },
  purchaseOrderNo: {
    type: String,
    trim: true,
    maxlength: [50, '采购订单号不能超过50个字符'],
    index: true
  }
})

// 索引设置
purchaseRequestSchema.index({ requestNo: 1 })
purchaseRequestSchema.index({ applicant: 1, requestDate: -1 })
purchaseRequestSchema.index({ department: 1, applicationStatus: 1 })
purchaseRequestSchema.index({ applicationStatus: 1, createTime: -1 })
purchaseRequestSchema.index({ urgency: 1, expectedDate: 1 })
purchaseRequestSchema.index({ enable_flag: 1, createTime: -1 })

// 复合索引
purchaseRequestSchema.index({
  enable_flag: 1,
  applicationStatus: 1,
  createTime: -1
})

// 中间件
purchaseRequestSchema.pre('save', function (next) {
  // 计算总金额
  if (this.materialList && this.materialList.length > 0) {
    this.totalAmount = this.materialList.reduce((sum, item) => {
      return sum + (item.estimatedAmount || 0)
    }, 0)
  }

  // 添加创建记录到审核历史
  if (this.isNew) {
    this.approvalHistory.push({
      action: 'create',
      operator: this.createBy || this.applicant,
      operatorId: this.createBy || 'system',
      comment: '创建采购申请',
      createTime: new Date()
    })
  }

  next()
})

// 更新前验证
purchaseRequestSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updateTime: new Date() })
  next()
})

// 应用分页插件
purchaseRequestSchema.plugin(mongoosePaginate)

// 使用指定的数据库连接创建模型
const PurchaseRequest = db.model('PurchaseRequest', purchaseRequestSchema, 'purchase_requests')

module.exports = PurchaseRequest