const mongoose = require('mongoose')
const db = require('../config/db')
const moment = require('moment')
const mongoosePaginate = require('mongoose-paginate-v2')

// 定义出库物料明细子模式
const outboundMaterialSchema = new mongoose.Schema({
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
    remark: {
        type: String
    } // 备注
}, { _id: false })

// 定义出库模型
const outboundSchema = new mongoose.Schema({
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
        type: Date
    }, // 审核时间
    outboundTime: {
        type: Date
    }, // 出库时间
    remark: {
        type: String
    }, // 备注
    urgentLevel: {
        type: String,
        enum: ['normal', 'urgent', 'emergency'], // 普通、紧急、特急
        default: 'normal'
    }, // 紧急程度
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
outboundSchema.pre('save', function (next) {
    this.updateTime = Date.now() + 60 * 60 * 8 * 1000

    // 计算总数量和总金额
    if (this.materials && this.materials.length > 0) {
        this.totalRequestQuantity = this.materials.reduce((sum, material) => sum + (material.requestQuantity || 0), 0)
        this.totalActualQuantity = this.materials.reduce((sum, material) => sum + (material.actualQuantity || 0), 0)
        this.totalAmount = this.materials.reduce((sum, material) => {
            const amount = (material.actualQuantity || 0) * (material.unitPrice || 0)
            material.totalAmount = amount
            return sum + amount
        }, 0)
    }

    next()
})

// 更新时间中间件（findOneAndUpdate）
outboundSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updateTime: Date.now() + 60 * 60 * 8 * 1000 })
    next()
})

outboundSchema.plugin(mongoosePaginate)
const Outbound = db.model('outbounds', outboundSchema)
module.exports = Outbound