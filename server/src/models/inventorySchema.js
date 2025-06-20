const mongoose = require('mongoose')
const db = require('../config/db')
const moment = require('moment')
const mongoosePaginate = require('mongoose-paginate-v2')

// 定义库存模型
const inventorySchema = new mongoose.Schema({
    materialCode: {
        type: String,
        required: [true, '物料编码不能为空'],
        index: true
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
    warehouse: {
        type: String,
        required: [true, '仓库不能为空']
    }, // 仓库
    warehouseCode: {
        type: String
    }, // 仓库编码
    currentStock: {
        type: Number,
        default: 0,
        min: [0, '库存数量不能小于0']
    }, // 当前库存
    safetyStock: {
        type: Number,
        default: 0
    }, // 安全库存
    maxStock: {
        type: Number,
        default: 0
    }, // 最大库存
    status: {
        type: String,
        enum: ['normal', 'shortage', 'overstock'],
        default: 'normal'
    }, // 库存状态
    lastUpdateTime: {
        type: Date,
        default: Date.now() + 60 * 60 * 8 * 1000
    }, // 最后更新时间
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

// 更新状态的中间件
inventorySchema.pre('save', function (next) {
    this.updateTime = Date.now() + 60 * 60 * 8 * 1000
    this.lastUpdateTime = Date.now() + 60 * 60 * 8 * 1000

    // 自动计算库存状态
    if (this.currentStock <= this.safetyStock) {
        this.status = 'shortage'
    } else if (this.currentStock >= this.maxStock && this.maxStock > 0) {
        this.status = 'overstock'
    } else {
        this.status = 'normal'
    }

    next()
})

// 组合索引
inventorySchema.index({ materialCode: 1, warehouse: 1 }, { unique: true })

inventorySchema.plugin(mongoosePaginate)
const Inventory = db.model('inventories', inventorySchema)
module.exports = Inventory // 导出库存模型