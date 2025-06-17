const express = require('express')
const router = express.Router()
const Inbound = require('../models/inboundSModel')
const moment = require('moment')

// 获取入库单列表（支持分页和搜索）
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            inboundNo,
            supplier,
            inboundType,
            status,
            startDate,
            endDate,
            warehouse
        } = req.query

        // 构建查询条件
        const query = { enable_flag: 'Y' }

        if (inboundNo) {
            query.inboundNo = { $regex: inboundNo, $options: 'i' }
        }

        if (supplier) {
            query.supplier = { $regex: supplier, $options: 'i' }
        }

        if (inboundType) {
            query.inboundType = inboundType
        }

        if (status) {
            query.status = status
        }

        if (warehouse) {
            query.warehouse = { $regex: warehouse, $options: 'i' }
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
            sort: { createTime: -1 }, // 按创建时间倒序
            customLabels: {
                totalDocs: 'total',
                docs: 'data',
                limit: 'pageSize',
                page: 'currentPage'
            }
        }

        const result = await Inbound.paginate(query, options)

        res.json({
            code: 200,
            message: '获取入库单列表成功',
            data: result
        })
    } catch (error) {
        console.error('获取入库单列表失败:', error)
        res.json({
            code: 500,
            message: '获取入库单列表失败',
            error: error.message
        })
    }
})

// 根据ID获取入库单详情
router.get('/:id', async (req, res) => {
    try {
        const inbound = await Inbound.findById(req.params.id)

        if (!inbound || inbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '入库单不存在'
            })
        }

        res.json({
            code: 200,
            message: '获取入库单详情成功',
            data: inbound
        })
    } catch (error) {
        console.error('获取入库单详情失败:', error)
        res.json({
            code: 500,
            message: '获取入库单详情失败',
            error: error.message
        })
    }
})

// 创建入库单
router.post('/', async (req, res) => {
    try {
        const {
            inboundType,
            supplier,
            warehouse,
            warehouseCode,
            materials,
            operator,
            operatorId,
            remark,
            purchaseOrderNo,
            deliveryNote
        } = req.body

        // 验证必填字段
        if (!inboundType || !supplier || !warehouse || !operator || !materials || materials.length === 0) {
            return res.json({
                code: 400,
                message: '缺少必填字段'
            })
        }

        // 生成入库单号
        const today = moment().format('YYYYMMDD')
        const count = await Inbound.countDocuments({
            inboundNo: { $regex: `^IN${today}` }
        })
        const inboundNo = `IN${today}${String(count + 1).padStart(4, '0')}`

        // 验证物料明细
        for (const material of materials) {
            if (!material.materialCode || !material.materialName || !material.unit || material.quantity <= 0) {
                return res.json({
                    code: 400,
                    message: '物料信息不完整或数量无效'
                })
            }
        }

        const inboundData = {
            inboundNo,
            inboundType,
            supplier,
            warehouse,
            warehouseCode,
            materials,
            operator,
            operatorId,
            remark,
            purchaseOrderNo,
            deliveryNote,
            status: 'pending'
        }

        const newInbound = new Inbound(inboundData)
        const savedInbound = await newInbound.save()

        res.json({
            code: 200,
            message: '创建入库单成功',
            data: savedInbound
        })
    } catch (error) {
        console.error('创建入库单失败:', error)
        res.json({
            code: 500,
            message: '创建入库单失败',
            error: error.message
        })
    }
})

// 更新入库单
router.put('/:id', async (req, res) => {
    try {
        const inbound = await Inbound.findById(req.params.id)

        if (!inbound || inbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '入库单不存在'
            })
        }
        // 已入库的单据不允许修改
        if (inbound.status === 'completed') {
            return res.json({
                code: 400,
                message: '已入库的单据不允许修改'
            })
        }
        const {
            inboundType,
            supplier,
            warehouse,
            warehouseCode,
            materials,
            remark,
            purchaseOrderNo,
            deliveryNote
        } = req.body

        // 验证物料明细
        if (materials && materials.length > 0) {
            for (const material of materials) {
                if (!material.materialCode || !material.materialName || !material.unit || material.quantity <= 0) {
                    return res.json({
                        code: 400,
                        message: '物料信息不完整或数量无效'
                    })
                }
            }
        }

        const updateData = {
            inboundType,
            supplier,
            warehouse,
            warehouseCode,
            materials,
            remark,
            purchaseOrderNo,
            deliveryNote
        }

        // 过滤掉undefined的字段
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key]
            }
        })

        const updatedInbound = await Inbound.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )

        res.json({
            code: 200,
            message: '更新入库单成功',
            data: updatedInbound
        })
    } catch (error) {
        console.error('更新入库单失败:', error)
        res.json({
            code: 500,
            message: '更新入库单失败',
            error: error.message
        })
    }
})

// 修改确认入库路由中的库存更新逻辑
router.put('/:id/confirm', async (req, res) => {
    try {
        const inbound = await Inbound.findById(req.params.id)

        if (!inbound || inbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '入库单不存在'
            })
        }

        if (inbound.status !== 'pending') {
            return res.json({
                code: 400,
                message: '只有待入库状态的单据才能确认入库'
            })
        }

        // 验证物料数据完整性
        if (!inbound.materials || inbound.materials.length === 0) {
            return res.json({
                code: 400,
                message: '入库单没有物料信息'
            })
        }

        // 验证每个物料的必要字段
        for (let i = 0; i < inbound.materials.length; i++) {
            const material = inbound.materials[i]
            if (!material.materialCode || !material.materialName || !material.unit || !material.quantity || material.quantity <= 0) {
                return res.json({
                    code: 400,
                    message: `第${i + 1}个物料信息不完整：${JSON.stringify(material)}`
                })
            }
        }

        // 更新库存 - 使用事务确保数据一致性
        const Inventory = require('../models/inventorySchema')

        try {
            // 串行处理每个物料，避免并发问题
            for (const material of inbound.materials) {
                const {
                    materialCode,
                    materialName,
                    specification = '',
                    unit,
                    quantity
                } = material

                console.log(`处理物料: ${materialCode}, 数量: ${quantity}`)

                // 查找是否已存在该物料的库存记录
                let inventory = await Inventory.findOne({
                    materialCode: materialCode,
                    warehouse: inbound.warehouse,
                    enable_flag: 'Y'
                })

                if (inventory) {
                    // 如果存在，增加库存
                    console.log(`更新现有库存: ${inventory.currentStock} + ${quantity}`)
                    inventory.currentStock += Number(quantity)
                    inventory.lastUpdateTime = new Date(Date.now() + 60 * 60 * 8 * 1000)

                    // 更新物料信息（可能有变化）
                    inventory.materialName = materialName
                    if (specification) {
                        inventory.specification = specification
                    }
                    inventory.unit = unit

                    await inventory.save()
                    console.log(`库存更新成功: ${inventory.materialCode}, 新库存: ${inventory.currentStock}`)
                } else {
                    // 如果不存在，创建新记录
                    console.log(`创建新库存记录: ${materialCode}`)
                    inventory = new Inventory({
                        materialCode: materialCode,
                        materialName: materialName,
                        specification: specification || '',
                        unit: unit,
                        warehouse: inbound.warehouse,
                        warehouseCode: inbound.warehouseCode || '',
                        currentStock: Number(quantity),
                        safetyStock: 10, // 默认安全库存
                        maxStock: 1000, // 默认最大库存
                        lastUpdateTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
                    })

                    await inventory.save()
                    console.log(`新库存记录创建成功: ${inventory.materialCode}, 库存: ${inventory.currentStock}`)
                }
            }

            // 库存更新成功后，更新入库单状态
            const updatedInbound = await Inbound.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'completed',
                    inboundTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
                },
                { new: true }
            )

            res.json({
                code: 200,
                message: '确认入库成功',
                data: updatedInbound
            })

        } catch (inventoryError) {
            console.error('更新库存失败:', inventoryError)
            console.error('错误详情:', inventoryError.message)
            console.error('错误堆栈:', inventoryError.stack)

            res.json({
                code: 500,
                message: `更新库存失败: ${inventoryError.message}`,
                error: inventoryError.message
            })
        }

    } catch (error) {
        console.error('确认入库失败:', error)
        console.error('错误详情:', error.message)
        console.error('错误堆栈:', error.stack)

        res.json({
            code: 500,
            message: '确认入库失败',
            error: error.message
        })
    }
})

// 取消入库单
router.put('/:id/cancel', async (req, res) => {
    try {
        const inbound = await Inbound.findById(req.params.id)

        if (!inbound || inbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '入库单不存在'
            })
        }

        if (inbound.status === 'completed') {
            return res.json({
                code: 400,
                message: '已入库的单据不能取消'
            })
        }

        const { reason } = req.body

        const updatedInbound = await Inbound.findByIdAndUpdate(
            req.params.id,
            {
                status: 'cancelled',
                remark: inbound.remark ? `${inbound.remark}\n取消原因：${reason}` : `取消原因：${reason}`
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '取消入库单成功',
            data: updatedInbound
        })
    } catch (error) {
        console.error('取消入库单失败:', error)
        res.status(500).json({
            code: 500,
            message: '取消入库单失败',
            error: error.message
        })
    }
})

// 删除入库单（软删除）
router.delete('/:id', async (req, res) => {
    try {
        const inbound = await Inbound.findById(req.params.id)

        if (!inbound || inbound.enable_flag !== 'Y') {
            return res.status(404).json({
                code: 404,
                message: '入库单不存在'
            })
        }

        if (inbound.status === 'completed') {
            return res.status(400).json({
                code: 400,
                message: '已入库的单据不能删除'
            })
        }

        await Inbound.findByIdAndUpdate(req.params.id, { enable_flag: 'N' })

        res.json({
            code: 200,
            message: '删除入库单成功'
        })
    } catch (error) {
        console.error('删除入库单失败:', error)
        res.json({
            code: 500,
            message: '删除入库单失败',
            error: error.message
        })
    }
})

// 批量删除入库单
router.delete('/batch/:ids', async (req, res) => {
    try {
        const ids = req.params.ids.split(',')

        // 检查是否有已入库的单据
        const completedInbounds = await Inbound.find({
            _id: { $in: ids },
            status: 'completed',
            enable_flag: 'Y'
        })

        if (completedInbounds.length > 0) {
            return res.status(400).json({
                code: 400,
                message: '选中的单据中包含已入库的单据，不能删除'
            })
        }

        await Inbound.updateMany(
            { _id: { $in: ids }, enable_flag: 'Y' },
            { enable_flag: 'N' }
        )

        res.json({
            code: 200,
            message: '批量删除入库单成功'
        })
    } catch (error) {
        console.error('批量删除入库单失败:', error)
        res.json({
            code: 500,
            message: '批量删除入库单失败',
            error: error.message
        })
    }
})

// 获取入库统计信息
router.get('/statistics/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        // 构建日期查询条件
        const dateQuery = { enable_flag: 'Y' }
        if (startDate || endDate) {
            dateQuery.createTime = {}
            if (startDate) {
                dateQuery.createTime.$gte = new Date(startDate)
            }
            if (endDate) {
                dateQuery.createTime.$lte = new Date(endDate + ' 23:59:59')
            }
        }

        const [
            totalCount,
            pendingCount,
            completedCount,
            cancelledCount,
            totalAmount
        ] = await Promise.all([
            Inbound.countDocuments(dateQuery),
            Inbound.countDocuments({ ...dateQuery, status: 'pending' }),
            Inbound.countDocuments({ ...dateQuery, status: 'completed' }),
            Inbound.countDocuments({ ...dateQuery, status: 'cancelled' }),
            Inbound.aggregate([
                { $match: { ...dateQuery, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ])

        res.json({
            code: 200,
            message: '获取统计信息成功',
            data: {
                totalCount,
                pendingCount,
                completedCount,
                cancelledCount,
                totalAmount: totalAmount[0]?.total || 0
            }
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

module.exports = router