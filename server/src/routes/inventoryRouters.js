const express = require('express')
const router = express.Router()
const Inventory = require('../models/inventorySchema')
const moment = require('moment')

// 创建统计路由
const statsRouter = express.Router()

// 获取库存统计信息
statsRouter.get('/summary', async (req, res) => {
    try {
        console.log('访问统计信息接口')

        const [
            totalItems,
            normalStock,
            shortageStock,
            overstockItems
        ] = await Promise.all([
            Inventory.countDocuments({ enable_flag: 'Y' }),
            Inventory.countDocuments({ enable_flag: 'Y', status: 'normal' }),
            Inventory.countDocuments({ enable_flag: 'Y', status: 'shortage' }),
            Inventory.countDocuments({ enable_flag: 'Y', status: 'overstock' })
        ])

        const result = {
            totalItems,
            normalStock,
            shortageStock,
            overstockItems
        }

        console.log('统计信息查询结果:', result)

        res.json({
            code: 200,
            message: '获取统计信息成功',
            data: result
        })
    } catch (error) {
        console.error('获取统计信息失败:', error)
        res.json({
            code: 500,
            message: '获取统计信息失败',
            error: error.message
        })
    }
})

// 挂载统计路由
router.use('/stats', statsRouter)

// 导出库存数据 - 添加版本字段
router.get('/export', async (req, res) => {
    try {
        console.log('访问导出接口')
        const {
            materialCode,
            materialName,
            warehouse,
            stockStatus,
            version // 添加版本筛选条件


        } = req.query

        // 构建查询条件
        const query = { enable_flag: 'Y' }

        if (materialCode) {
            query.materialCode = { $regex: materialCode, $options: 'i' }
        }

        if (materialName) {
            query.materialName = { $regex: materialName, $options: 'i' }
        }

        if (warehouse) {
            query.warehouse = warehouse
        }

        if (stockStatus) {
            query.status = stockStatus
        }

        // 添加版本筛选
        if (version) {
            query.version = { $regex: version, $options: 'i' }
        }

        const inventoryData = await Inventory.find(query)
            .sort({ lastUpdateTime: -1 })
            .lean()

        // 转换数据格式用于导出（包含版本字段）
        const exportData = inventoryData.map(item => ({
            '物料编码': item.materialCode,
            '物料名称': item.materialName,
            '规格型号': item.specification || '',
            '版本': item.version || '', // 添加版本字段
            '单位': item.unit,
            '仓库': item.warehouse,
            '当前库存': item.currentStock,
            '安全库存': item.safetyStock,
            '最大库存': item.maxStock,
            '库存状态': getStatusText(item.status),
            '最后更新时间': moment(item.lastUpdateTime).format('YYYY-MM-DD HH:mm:ss')
        }))

        res.json({
            code: 200,
            message: '导出成功',
            data: exportData
        })
    } catch (error) {
        console.error('导出库存数据失败:', error)
        res.json({
            code: 500,
            message: '导出失败',
            error: error.message
        })
    }
})
// 获取出入库历史记录
router.get('/history', async (req, res) => {
    try {
        console.log('访问历史记录接口')
        const {
            materialCode,
            warehouse,
            page = 1,
            limit = 20,
            transactionType,
            businessType,
            startDate,
            endDate
        } = req.query

        if (!materialCode || !warehouse) {
            return res.json({
                code: 400,
                message: '物料编码和仓库参数不能为空'
            })
        }

        // 构建查询条件
        const query = {
            materialCode: materialCode,
            warehouse: warehouse,
            enable_flag: 'Y'
        }

        // 可选筛选条件
        if (transactionType) {
            query.transactionType = transactionType
        }

        if (businessType) {
            query.businessType = businessType
        }

        // 日期范围查询
        if (startDate || endDate) {
            query.createTime = {}
            if (startDate) {
                query.createTime.$gte = new Date(startDate)
            }
            if (endDate) {
                query.createTime.$lte = new Date(endDate + ' 23:59:59')
            }
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createTime: -1 },
            customLabels: {
                totalDocs: 'total',
                docs: 'data',
                limit: 'pageSize',
                page: 'currentPage'
            }
        }

        const InventoryTransaction = require('../models/inventoryTransactionModel')
        const result = await InventoryTransaction.paginate(query, options)

        res.json({
            code: 200,
            message: '获取历史记录成功',
            data: result
        })
    } catch (error) {
        console.error('获取历史记录失败:', error)
        res.json({
            code: 500,
            message: '获取历史记录失败',
            error: error.message
        })
    }
})

// 在批量导入库存数据的路由中添加版本字段处理
router.post('/import', async (req, res) => {
    try {
        console.log('访问导入接口')
        const { items } = req.body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.json({
                code: 400,
                message: '导入数据不能为空'
            })
        }

        let successCount = 0
        let failCount = 0
        const errors = []
        const processedMaterials = new Set()

        console.log(`开始处理 ${items.length} 条库存导入数据`)

        // 逐条处理导入数据
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            try {
                // 基础数据验证
                const validationResult = validateInventoryItem(item, i + 1)
                if (!validationResult.isValid) {
                    errors.push(...validationResult.errors)
                    failCount++
                    continue
                }

                // 检查当前批次中是否有重复的物料编码+仓库组合
                const materialKey = `${item.materialCode}_${item.warehouse}`
                if (processedMaterials.has(materialKey)) {
                    errors.push({
                        row: item.rowIndex || i + 1,
                        materialCode: item.materialCode,
                        message: '当前导入数据中存在重复的物料编码和仓库组合'
                    })
                    failCount++
                    continue
                }
                processedMaterials.add(materialKey)

                // 查找是否已存在该物料的库存记录
                let inventory = await Inventory.findOne({
                    materialCode: item.materialCode,
                    warehouse: item.warehouse,
                    enable_flag: 'Y'
                })

                // 计算库存状态
                const status = calculateStockStatus(item.currentStock, item.safetyStock, item.maxStock)

                if (inventory) {
                    // 如果存在，更新库存信息（包含版本字段）
                    const updateData = {
                        materialName: item.materialName,
                        specification: item.specification || '',
                        version: item.version || '', // 添加版本字段
                        unit: item.unit,
                        currentStock: item.currentStock,
                        safetyStock: item.safetyStock || 0,
                        maxStock: item.maxStock || 0,
                        status: status,
                        lastUpdateTime: new Date(Date.now() + 60 * 60 * 8 * 1000),
                        remark: item.remark || ''
                    }

                    await Inventory.findByIdAndUpdate(inventory._id, updateData, { runValidators: true })
                    console.log(`更新库存记录: ${item.materialCode} - ${item.warehouse} - 版本: ${item.version || '无'}`)
                } else {
                    // 如果不存在，创建新记录（包含版本字段）
                    const newInventory = new Inventory({
                        materialCode: item.materialCode,
                        materialName: item.materialName,
                        specification: item.specification || '',
                        version: item.version || '', // 添加版本字段
                        unit: item.unit,
                        warehouse: item.warehouse,
                        warehouseCode: getWarehouseCode(item.warehouse),
                        currentStock: item.currentStock,
                        safetyStock: item.safetyStock || 0,
                        maxStock: item.maxStock || 0,
                        status: status,
                        lastUpdateTime: new Date(Date.now() + 60 * 60 * 8 * 1000),
                        remark: item.remark || ''
                    })

                    await newInventory.save()
                    console.log(`创建新库存记录: ${item.materialCode} - ${item.warehouse} - 版本: ${item.version || '无'}`)
                }

                successCount++
            } catch (error) {
                console.error(`处理第${i + 1}条数据失败:`, error)
                errors.push({
                    row: item.rowIndex || i + 1,
                    materialCode: item.materialCode || '未知',
                    message: error.message || '数据处理失败'
                })
                failCount++
            }
        }

        console.log(`导入完成: 成功 ${successCount} 条, 失败 ${failCount} 条`)

        res.json({
            code: 200,
            message: '导入完成',
            data: {
                totalCount: items.length,
                successCount,
                failCount,
                errors: errors.slice(0, 100)
            }
        })
    } catch (error) {
        console.error('批量导入库存失败:', error)
        res.json({
            code: 500,
            message: '批量导入失败',
            error: error.message
        })
    }
})

// 库存调整
router.post('/adjust', async (req, res) => {
    try {
        console.log('访问库存调整接口')
        const {
            materialId,
            adjustType,
            adjustQuantity,
            reason,
            operator,
            operatorId
        } = req.body

        // 验证必填字段
        if (!materialId || !adjustType || adjustQuantity === undefined || !reason) {
            return res.json({
                code: 400,
                message: '缺少必填字段'
            })
        }

        // 验证 materialId 格式
        if (!materialId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({
                code: 400,
                message: '无效的库存记录ID格式'
            })
        }

        // 查找库存记录
        const inventory = await Inventory.findById(materialId)
        if (!inventory || inventory.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '库存记录不存在'
            })
        }

        let newStock = inventory.currentStock
        let adjustReason = reason

        // 根据调整类型计算新库存
        switch (adjustType) {
            case 'in':
                newStock = inventory.currentStock + adjustQuantity
                adjustReason = `入库调整: ${reason}`
                break
            case 'out':
                newStock = inventory.currentStock - adjustQuantity
                if (newStock < 0) {
                    return res.json({
                        code: 400,
                        message: '调整后库存不能为负数'
                    })
                }
                adjustReason = `出库调整: ${reason}`
                break
            case 'set':
                newStock = adjustQuantity
                adjustReason = `库存设定: ${reason}`
                break
            default:
                return res.json({
                    code: 400,
                    message: '无效的调整类型'
                })
        }

        // 计算新的库存状态
        const newStatus = calculateStockStatus(newStock, inventory.safetyStock, inventory.maxStock)

        // 更新库存
        const updatedInventory = await Inventory.findByIdAndUpdate(
            materialId,
            {
                currentStock: newStock,
                status: newStatus,
                lastUpdateTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
            },
            { new: true, runValidators: true }
        )

        res.json({
            code: 200,
            message: '库存调整成功',
            data: updatedInventory
        })
    } catch (error) {
        console.error('库存调整失败:', error)
        res.json({
            code: 500,
            message: '库存调整失败',
            error: error.message
        })
    }
})

// 获取库存列表（支持分页和搜索）
router.get('/', async (req, res) => {
    try {
        console.log('访问库存列表接口')
        const {
            page = 1,
            limit = 20,
            materialCode,
            materialName,
            warehouse,
            stockStatus,
            specification
        } = req.query

        // 构建查询条件
        const query = { enable_flag: 'Y' }

        if (materialCode) {
            query.materialCode = { $regex: materialCode, $options: 'i' }
        }

        if (materialName) {
            query.materialName = { $regex: materialName, $options: 'i' }
        }

        if (warehouse) {
            query.warehouse = warehouse
        }

        if (stockStatus) {
            query.status = stockStatus
        }
        if (specification) {
            query.specification = { $regex: specification, $options: 'i' }
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { lastUpdateTime: -1 },
            customLabels: {
                totalDocs: 'total',
                docs: 'data',
                limit: 'pageSize',
                page: 'currentPage'
            }
        }

        const result = await Inventory.paginate(query, options)

        res.json({
            code: 200,
            message: '获取库存列表成功',
            data: result
        })
    } catch (error) {
        console.error('获取库存列表失败:', error)
        res.json({
            code: 500,
            message: '获取库存列表失败',
            error: error.message
        })
    }
})

// 根据ID获取库存详情 - 必须放在最后
router.get('/:id', async (req, res) => {
    try {
        console.log(`访问库存详情接口，ID: ${req.params.id}`)

        // 验证ID是否为有效的ObjectId格式
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({
                code: 400,
                message: '无效的库存记录ID格式'
            })
        }

        const inventory = await Inventory.findById(req.params.id)

        if (!inventory || inventory.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '库存记录不存在'
            })
        }

        res.json({
            code: 200,
            message: '获取库存详情成功',
            data: inventory
        })
    } catch (error) {
        console.error('获取库存详情失败:', error)
        res.json({
            code: 500,
            message: '获取库存详情失败',
            error: error.message
        })
    }
})

// 工具函数：验证库存项数据
function validateInventoryItem(item, rowIndex) {
    const errors = []

    // 必填字段验证
    if (!item.materialCode || typeof item.materialCode !== 'string' || item.materialCode.trim() === '') {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '物料编码不能为空'
        })
    }

    if (!item.materialName || typeof item.materialName !== 'string' || item.materialName.trim() === '') {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '物料名称不能为空'
        })
    }

    if (!item.unit || typeof item.unit !== 'string' || item.unit.trim() === '') {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '单位不能为空'
        })
    }

    if (!item.warehouse || typeof item.warehouse !== 'string' || item.warehouse.trim() === '') {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '仓库不能为空'
        })
    }

    // 数值验证
    if (typeof item.currentStock !== 'number' || item.currentStock < 0) {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '当前库存必须为非负数'
        })
    }

    if (typeof item.safetyStock !== 'number' || item.safetyStock < 0) {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '安全库存必须为非负数'
        })
    }

    if (typeof item.maxStock !== 'number' || item.maxStock < 0) {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '最大库存必须为非负数'
        })
    }

    // 业务逻辑验证
    if (item.maxStock > 0 && item.safetyStock > item.maxStock) {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: '安全库存不能大于最大库存'
        })
    }

    // 仓库值验证
    const validWarehouses = ['原料仓', '成品仓', '半成品仓', '耗材仓']
    if (item.warehouse && !validWarehouses.includes(item.warehouse)) {
        errors.push({
            row: item.rowIndex || rowIndex,
            materialCode: item.materialCode || '未知',
            message: `仓库值无效，请选择：${validWarehouses.join('、')}`
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// 工具函数：计算库存状态
function calculateStockStatus(currentStock, safetyStock, maxStock) {
    if (currentStock <= safetyStock) {
        return 'shortage'
    } else if (maxStock > 0 && currentStock >= maxStock) {
        return 'overstock'
    } else {
        return 'normal'
    }
}

// 工具函数：获取仓库代码
function getWarehouseCode(warehouseName) {
    const warehouseMap = {
        '原料仓': 'RAW',
        '成品仓': 'FIN',
        '半成品仓': 'SEMI',
        '耗材仓': 'CONS'
    }
    return warehouseMap[warehouseName] || 'OTHER'
}

// 工具函数：获取状态文本
function getStatusText(status) {
    const statusMap = {
        normal: '正常',
        shortage: '缺货',
        overstock: '超储'
    }
    return statusMap[status] || status
}

module.exports = router