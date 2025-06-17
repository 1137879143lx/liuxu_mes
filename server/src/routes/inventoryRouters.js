const express = require('express')
const router = express.Router()
const Inventory = require('../models/inventorySchema')
const moment = require('moment')

// 获取库存列表（支持分页和搜索）
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            materialCode,
            materialName,
            warehouse,
            stockStatus
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

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { lastUpdateTime: -1 }, // 按最后更新时间倒序
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
        res.status(500).json({
            code: 500,
            message: '获取库存列表失败',
            error: error.message
        })
    }
})

// 获取库存统计信息
router.get('/statistics', async (req, res) => {
    try {
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

        res.json({
            code: 200,
            message: '获取统计信息成功',
            data: {
                totalItems,
                normalStock,
                shortageStock,
                overstockItems
            }
        })
    } catch (error) {
        console.error('获取统计信息失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取统计信息失败',
            error: error.message
        })
    }
})

// 根据ID获取库存详情
router.get('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)

        if (!inventory || inventory.enable_flag !== 'Y') {
            return res.status(404).json({
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
        res.status(500).json({
            code: 500,
            message: '获取库存详情失败',
            error: error.message
        })
    }
})

// 创建或更新库存记录
router.post('/update-from-inbound', async (req, res) => {
    try {
        const { materials, warehouse, warehouseCode } = req.body

        if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '物料信息不能为空'
            })
        }

        const updatePromises = materials.map(async (material) => {
            const {
                materialCode,
                materialName,
                specification,
                unit,
                quantity
            } = material

            // 查找是否已存在该物料的库存记录
            let inventory = await Inventory.findOne({
                materialCode,
                warehouse,
                enable_flag: 'Y'
            })

            if (inventory) {
                // 如果存在，增加库存
                inventory.currentStock += quantity
                inventory.lastUpdateTime = new Date(Date.now() + 60 * 60 * 8 * 1000)
                await inventory.save()
            } else {
                // 如果不存在，创建新记录
                inventory = new Inventory({
                    materialCode,
                    materialName,
                    specification,
                    unit,
                    warehouse,
                    warehouseCode,
                    currentStock: quantity,
                    safetyStock: 10, // 默认安全库存
                    maxStock: 1000, // 默认最大库存
                    lastUpdateTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
                })
                await inventory.save()
            }

            return inventory
        })

        const results = await Promise.all(updatePromises)

        res.json({
            code: 200,
            message: '库存更新成功',
            data: results
        })
    } catch (error) {
        console.error('更新库存失败:', error)
        res.status(500).json({
            code: 500,
            message: '更新库存失败',
            error: error.message
        })
    }
})

// 库存调整
router.post('/adjust', async (req, res) => {
    try {
        const {
            materialId,
            materialCode,
            warehouse,
            adjustType,
            adjustQuantity,
            reason,
            operator,
            operatorId
        } = req.body

        // 验证必填字段
        if (!materialId && !(materialCode && warehouse)) {
            return res.status(400).json({
                code: 400,
                message: '缺少物料标识信息'
            })
        }

        if (!adjustType || !adjustQuantity || adjustQuantity <= 0) {
            return res.status(400).json({
                code: 400,
                message: '调整类型和数量不能为空且必须大于0'
            })
        }

        if (!reason) {
            return res.status(400).json({
                code: 400,
                message: '调整原因不能为空'
            })
        }

        // 查找库存记录
        let inventory
        if (materialId) {
            inventory = await Inventory.findById(materialId)
        } else {
            inventory = await Inventory.findOne({
                materialCode,
                warehouse,
                enable_flag: 'Y'
            })
        }

        if (!inventory) {
            return res.status(404).json({
                code: 404,
                message: '库存记录不存在'
            })
        }

        const oldStock = inventory.currentStock

        // 根据调整类型更新库存
        switch (adjustType) {
            case 'in': // 入库
                inventory.currentStock += adjustQuantity
                break
            case 'out': // 出库
                if (inventory.currentStock < adjustQuantity) {
                    return res.status(400).json({
                        code: 400,
                        message: '库存不足，无法出库'
                    })
                }
                inventory.currentStock -= adjustQuantity
                break
            case 'set': // 设定
                inventory.currentStock = adjustQuantity
                break
            default:
                return res.status(400).json({
                    code: 400,
                    message: '无效的调整类型'
                })
        }

        inventory.lastUpdateTime = new Date(Date.now() + 60 * 60 * 8 * 1000)
        await inventory.save()

        // 记录库存变动历史（这里可以扩展为单独的历史记录表）
        const historyRecord = {
            materialCode: inventory.materialCode,
            warehouse: inventory.warehouse,
            type: adjustType === 'out' ? 'out' : 'in',
            quantity: adjustType === 'set' ? Math.abs(adjustQuantity - oldStock) : adjustQuantity,
            stockBefore: oldStock,
            stockAfter: inventory.currentStock,
            reason: reason,
            operator: operator || '系统',
            operatorId: operatorId,
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        }

        res.json({
            code: 200,
            message: '库存调整成功',
            data: {
                inventory,
                history: historyRecord
            }
        })
    } catch (error) {
        console.error('库存调整失败:', error)
        res.status(500).json({
            code: 500,
            message: '库存调整失败',
            error: error.message
        })
    }
})

// 获取出入库历史记录
router.get('/history', async (req, res) => {
    try {
        const { materialCode, warehouse, startDate, endDate } = req.query

        // 这里应该查询历史记录表，暂时返回模拟数据
        // 在实际项目中，需要创建一个专门的库存变动历史表
        const mockHistory = [
            {
                date: '2025-01-15 10:30:00',
                type: 'in',
                quantity: 100,
                reason: '采购入库',
                operator: '张三',
                stockAfter: 150
            },
            {
                date: '2025-01-14 14:20:00',
                type: 'out',
                quantity: 50,
                reason: '生产领料',
                operator: '李四',
                stockAfter: 50
            },
            {
                date: '2025-01-13 09:15:00',
                type: 'in',
                quantity: 100,
                reason: '初始入库',
                operator: '王五',
                stockAfter: 100
            }
        ]

        res.json({
            code: 200,
            message: '获取历史记录成功',
            data: mockHistory.filter(record => {
                // 这里可以根据查询条件过滤
                return true
            })
        })
    } catch (error) {
        console.error('获取历史记录失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取历史记录失败',
            error: error.message
        })
    }
})

// 批量更新安全库存和最大库存
router.put('/batch-update-limits', async (req, res) => {
    try {
        const { updates } = req.body // [{ materialCode, warehouse, safetyStock, maxStock }]

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({
                code: 400,
                message: '更新数据格式错误'
            })
        }

        const updatePromises = updates.map(async (update) => {
            const { materialCode, warehouse, safetyStock, maxStock } = update

            const inventory = await Inventory.findOne({
                materialCode,
                warehouse,
                enable_flag: 'Y'
            })

            if (inventory) {
                if (safetyStock !== undefined) {
                    inventory.safetyStock = safetyStock
                }
                if (maxStock !== undefined) {
                    inventory.maxStock = maxStock
                }
                inventory.lastUpdateTime = new Date(Date.now() + 60 * 60 * 8 * 1000)
                await inventory.save()
                return inventory
            }
            return null
        })

        const results = await Promise.all(updatePromises)
        const successCount = results.filter(r => r !== null).length

        res.json({
            code: 200,
            message: `批量更新成功，共更新${successCount}条记录`,
            data: { successCount, totalCount: updates.length }
        })
    } catch (error) {
        console.error('批量更新失败:', error)
        res.status(500).json({
            code: 500,
            message: '批量更新失败',
            error: error.message
        })
    }
})

// 删除库存记录（软删除）
router.delete('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)

        if (!inventory || inventory.enable_flag !== 'Y') {
            return res.status(404).json({
                code: 404,
                message: '库存记录不存在'
            })
        }

        if (inventory.currentStock > 0) {
            return res.status(400).json({
                code: 400,
                message: '库存大于0的记录不能删除'
            })
        }

        await Inventory.findByIdAndUpdate(req.params.id, { enable_flag: 'N' })

        res.json({
            code: 200,
            message: '删除库存记录成功'
        })
    } catch (error) {
        console.error('删除库存记录失败:', error)
        res.status(500).json({
            code: 500,
            message: '删除库存记录失败',
            error: error.message
        })
    }
})

// 获取库存预警列表
router.get('/alerts/list', async (req, res) => {
    try {
        const [shortageItems, overstockItems] = await Promise.all([
            Inventory.find({
                enable_flag: 'Y',
                status: 'shortage',
                currentStock: { $gt: 0 } // 排除零库存
            }).sort({ currentStock: 1 }),
            Inventory.find({
                enable_flag: 'Y',
                status: 'overstock'
            }).sort({ currentStock: -1 })
        ])

        res.json({
            code: 200,
            message: '获取预警列表成功',
            data: {
                shortageItems,
                overstockItems,
                shortageCount: shortageItems.length,
                overstockCount: overstockItems.length
            }
        })
    } catch (error) {
        console.error('获取预警列表失败:', error)
        res.status(500).json({
            code: 500,
            message: '获取预警列表失败',
            error: error.message
        })
    }
})

module.exports = router