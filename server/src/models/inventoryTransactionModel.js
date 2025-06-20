const mongoose = require('mongoose')
const db = require('../config/db')
const moment = require('moment')
const mongoosePaginate = require('mongoose-paginate-v2')

// 定义出入库记录模型
const inventoryTransactionSchema = new mongoose.Schema({
    materialCode: {
        type: String,
        required: [true, '物料编码不能为空'],
        index: true
    }, // 物料编码
    materialName: {
        type: String,
        required: [true, '物料名称不能为空']
    }, // 物料名称
    version: {
        type: String
    }, // 版本


    warehouse: {
        type: String,
        required: [true, '仓库不能为空']
    }, // 仓库
    transactionType: {
        type: String,
        required: [true, '交易类型不能为空'],
        enum: ['in', 'out', 'adjust'] // 入库、出库、调整
    }, // 交易类型
    businessType: {
        type: String,
        required: [true, '业务类型不能为空'],
        enum: ['purchase', 'production', 'return', 'transfer', 'sale', 'scrap', 'adjust'] // 采购、生产、退货、调拨、销售、报废、调整
    }, // 业务类型
    quantity: {
        type: Number,
        required: [true, '数量不能为空']
    }, // 数量（正数表示增加，负数表示减少）
    stockBefore: {
        type: Number,
        required: [true, '变动前库存不能为空']
    }, // 变动前库存
    stockAfter: {
        type: Number,
        required: [true, '变动后库存不能为空']
    }, // 变动后库存
    reason: {
        type: String,
        required: [true, '变动原因不能为空']
    }, // 变动原因
    operator: {
        type: String,
        required: [true, '操作人不能为空']
    }, // 操作人
    operatorId: {
        type: String
    }, // 操作人ID
    referenceNo: {
        type: String
    }, // 关联单号（入库单号、出库单号等）
    remark: {
        type: String
    }, // 备注
    enable_flag: {
        type: String,
        default: 'Y'
    }, // 是否启用标志
    createTime: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 60 * 8 * 1000),
        get: (v) => moment(v).utcOffset(0).format('YYYY-MM-DD HH:mm:ss')
    } // 创建时间
})

// 索引
inventoryTransactionSchema.index({ materialCode: 1, warehouse: 1, createTime: -1 })
inventoryTransactionSchema.index({ createTime: -1 })

inventoryTransactionSchema.plugin(mongoosePaginate)
const InventoryTransaction = db.model('inventory_transactions', inventoryTransactionSchema)
module.exports = InventoryTransaction