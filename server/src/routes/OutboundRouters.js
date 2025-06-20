const express = require('express')
const router = express.Router()
const Outbound = require('../models/outboundSchema')
const Inventory = require('../models/inventorySchema')
const moment = require('moment')

// 获取出库单列表（支持分页和搜索）
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            outboundNo,
            department,
            outboundType,
            status,
            startDate,
            endDate,
            warehouse
        } = req.query

        // 构建查询条件
        const query = { enable_flag: 'Y' }

        if (outboundNo) {
            query.outboundNo = { $regex: outboundNo, $options: 'i' }
        }

        if (department) {
            query.department = { $regex: department, $options: 'i' }
        }

        if (outboundType) {
            query.outboundType = outboundType
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
            sort: { createTime: -1 },
            customLabels: {
                totalDocs: 'total',
                docs: 'data',
                limit: 'pageSize',
                page: 'currentPage'
            }
        }

        const result = await Outbound.paginate(query, options)

        res.json({
            code: 200,
            message: '获取出库单列表成功',
            data: result
        })
    } catch (error) {
        console.error('获取出库单列表失败:', error)
        res.json({
            code: 500,
            message: '获取出库单列表失败',
            error: error.message
        })
    }
})

// 根据ID获取出库单详情
router.get('/:id', async (req, res) => {
    try {
        const outbound = await Outbound.findById(req.params.id)

        if (!outbound || outbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '出库单不存在'
            })
        }

        res.json({
            code: 200,
            message: '获取出库单详情成功',
            data: outbound
        })
    } catch (error) {
        console.error('获取出库单详情失败:', error)
        res.json({
            code: 500,
            message: '获取出库单详情失败',
            error: error.message
        })
    }
})

// 创建出库单
router.post('/', async (req, res) => {
    try {
        const {
            outboundType,
            department,
            applicant,
            warehouse,
            warehouseCode,
            materials,
            operator,
            operatorId,
            remark,
            urgentLevel
        } = req.body

        // 验证必填字段
        if (!outboundType || !department || !applicant || !warehouse || !operator || !materials || materials.length === 0) {
            return res.json({
                code: 400,
                message: '缺少必填字段'
            })
        }

        // 生成出库单号
        const today = moment().format('YYYYMMDD')
        const count = await Outbound.countDocuments({
            outboundNo: { $regex: `^OUT${today}` }
        })
        const outboundNo = `OUT${today}${String(count + 1).padStart(4, '0')}`

        // 验证物料明细
        for (const material of materials) {
            if (!material.materialCode || !material.materialName || !material.unit || material.requestQuantity <= 0) {
                return res.json({
                    code: 400,
                    message: '物料信息不完整或申请数量无效'
                })
            }
        }

        // 检查库存是否充足
        for (const material of materials) {
            const inventory = await Inventory.findOne({
                materialCode: material.materialCode,
                warehouse: warehouse,
                enable_flag: 'Y'
            })

            if (!inventory) {
                return res.json({
                    code: 400,
                    message: `物料 ${material.materialCode} 在仓库 ${warehouse} 中不存在库存记录`
                })
            }

            if (inventory.currentStock < material.requestQuantity) {
                return res.json({
                    code: 400,
                    message: `物料 ${material.materialCode} 库存不足，当前库存：${inventory.currentStock}，申请数量：${material.requestQuantity}`
                })
            }
        }

        const outboundData = {
            outboundNo,
            outboundType,
            department,
            applicant,
            warehouse,
            warehouseCode,
            materials,
            operator,
            operatorId,
            remark,
            urgentLevel: urgentLevel || 'normal',
            status: 'pending'
        }

        const newOutbound = new Outbound(outboundData)
        const savedOutbound = await newOutbound.save()

        res.json({
            code: 200,
            message: '创建出库单成功',
            data: savedOutbound
        })
    } catch (error) {
        console.error('创建出库单失败:', error)
        res.json({
            code: 500,
            message: '创建出库单失败',
            error: error.message
        })
    }
})

// 更新出库单
router.put('/:id', async (req, res) => {
    try {
        const outbound = await Outbound.findById(req.params.id)

        if (!outbound || outbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '出库单不存在'
            })
        }

        // 已出库的单据不允许修改
        if (outbound.status === 'completed') {
            return res.json({
                code: 400,
                message: '已出库的单据不允许修改'
            })
        }

        const {
            outboundType,
            department,
            applicant,
            warehouse,
            warehouseCode,
            materials,
            remark,
            urgentLevel
        } = req.body

        // 验证物料明细
        if (materials && materials.length > 0) {
            for (const material of materials) {
                if (!material.materialCode || !material.materialName || !material.unit || material.requestQuantity <= 0) {
                    return res.json({
                        code: 400,
                        message: '物料信息不完整或申请数量无效'
                    })
                }
            }
        }

        const updateData = {
            outboundType,
            department,
            applicant,
            warehouse,
            warehouseCode,
            materials,
            remark,
            urgentLevel
        }

        // 过滤掉undefined的字段
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key]
            }
        })

        const updatedOutbound = await Outbound.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )

        res.json({
            code: 200,
            message: '更新出库单成功',
            data: updatedOutbound
        })
    } catch (error) {
        console.error('更新出库单失败:', error)
        res.json({
            code: 500,
            message: '更新出库单失败',
            error: error.message
        })
    }
})

// 审核出库单
router.put('/:id/approve', async (req, res) => {
    try {
        const outbound = await Outbound.findById(req.params.id)

        if (!outbound || outbound.enable_flag !== 'Y') {
            return res.json(404).json({
                code: 404,
                message: '出库单不存在'
            })
        }

        if (outbound.status !== 'pending') {
            return res.json({
                code: 400,
                message: '只有待审核状态的单据才能审核'
            })
        }

        const { approver, approverId } = req.body

        const updatedOutbound = await Outbound.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                approver: approver || '系统管理员',
                approverId: approverId,
                approveTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '审核出库单成功',
            data: updatedOutbound
        })
    } catch (error) {
        console.error('审核出库单失败:', error)
        res.json({
            code: 500,
            message: '审核出库单失败',
            error: error.message
        })
    }
})

// 确认出库
router.put('/:id/confirm', async (req, res) => {
    try {
        const outbound = await Outbound.findById(req.params.id)

        if (!outbound || outbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '出库单不存在'
            })
        }

        if (outbound.status !== 'approved') {
            return res.json({
                code: 400,
                message: '只有已审核状态的单据才能确认出库'
            })
        }

        const { actualQuantities } = req.body // 实际出库数量

        // 更新实际出库数量
        if (actualQuantities) {
            outbound.materials.forEach((material, index) => {
                if (actualQuantities[index] !== undefined) {
                    material.actualQuantity = actualQuantities[index]
                } else {
                    material.actualQuantity = material.requestQuantity // 默认等于申请数量
                }
            })
        } else {
            // 如果没有提供实际数量，默认等于申请数量
            outbound.materials.forEach(material => {
                material.actualQuantity = material.requestQuantity
            })
        }

        // 检查库存是否充足
        for (const material of outbound.materials) {
            const inventory = await Inventory.findOne({
                materialCode: material.materialCode,
                warehouse: outbound.warehouse,
                enable_flag: 'Y'
            })

            if (!inventory) {
                return res.json({
                    code: 400,
                    message: `物料 ${material.materialCode} 在仓库中不存在库存记录`
                })
            }

            if (inventory.currentStock < material.actualQuantity) {
                return res.json({
                    code: 400,
                    message: `物料 ${material.materialCode} 库存不足，当前库存：${inventory.currentStock}，出库数量：${material.actualQuantity}`
                })
            }
        }

        // 更新库存并记录交易记录
        const InventoryTransaction = require('../models/inventoryTransactionModel')

        try {
            for (const material of outbound.materials) {
                // 获取当前库存信息
                const inventory = await Inventory.findOne({
                    materialCode: material.materialCode,
                    warehouse: outbound.warehouse,
                    enable_flag: 'Y'
                })

                const stockBefore = inventory.currentStock
                const stockAfter = stockBefore - material.actualQuantity

                // 更新库存
                await Inventory.findOneAndUpdate(
                    {
                        materialCode: material.materialCode,
                        warehouse: outbound.warehouse,
                        enable_flag: 'Y'
                    },
                    {
                        $inc: { currentStock: -material.actualQuantity },
                        lastUpdateTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
                    }
                )

                // 记录出库交易记录
                const transaction = new InventoryTransaction({
                    materialCode: material.materialCode,
                    materialName: material.materialName,
                    warehouse: outbound.warehouse,
                    transactionType: 'out',
                    businessType: outbound.outboundType,
                    quantity: -material.actualQuantity, // 负数表示减少
                    stockBefore: stockBefore,
                    stockAfter: stockAfter,
                    reason: `${getOutboundBusinessTypeText(outbound.outboundType)}出库`,
                    operator: outbound.operator,
                    operatorId: outbound.operatorId,
                    referenceNo: outbound.outboundNo,
                    remark: `出库单号：${outbound.outboundNo}，申请部门：${outbound.department}`
                })

                await transaction.save()
            }
        } catch (inventoryError) {
            console.error('更新库存失败:', inventoryError)
            throw inventoryError
        }

        // 更新出库单状态
        const updatedOutbound = await Outbound.findByIdAndUpdate(
            req.params.id,
            {
                materials: outbound.materials,
                status: 'completed',
                outboundTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '确认出库成功',
            data: updatedOutbound
        })
    } catch (error) {
        console.error('确认出库失败:', error)
        res.json({
            code: 500,
            message: '确认出库失败',
            error: error.message
        })
    }
})

// 工具函数：获取出库业务类型文本
function getOutboundBusinessTypeText(businessType) {
    const typeMap = {
        production: '生产领料',
        sale: '销售',
        transfer: '调拨',
        return: '退货',
        scrap: '报废'
    }
    return typeMap[businessType] || businessType
}

// 取消出库单
router.put('/:id/cancel', async (req, res) => {
    try {
        const outbound = await Outbound.findById(req.params.id)

        if (!outbound || outbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '出库单不存在'
            })
        }

        if (outbound.status === 'completed') {
            return res.json({
                code: 400,
                message: '已出库的单据不能取消'
            })
        }

        const { reason } = req.body

        const updatedOutbound = await Outbound.findByIdAndUpdate(
            req.params.id,
            {
                status: 'cancelled',
                remark: outbound.remark ? `${outbound.remark}\n取消原因：${reason}` : `取消原因：${reason}`
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '取消出库单成功',
            data: updatedOutbound
        })
    } catch (error) {
        console.error('取消出库单失败:', error)
        res.json({
            code: 500,
            message: '取消出库单失败',
            error: error.message
        })
    }
})

// 删除出库单（软删除）
router.delete('/:id', async (req, res) => {
    try {
        const outbound = await Outbound.findById(req.params.id)

        if (!outbound || outbound.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '出库单不存在'
            })
        }

        if (outbound.status === 'completed') {
            return res.json({
                code: 400,
                message: '已出库的单据不能删除'
            })
        }

        await Outbound.findByIdAndUpdate(req.params.id, { enable_flag: 'N' })

        res.json({
            code: 200,
            message: '删除出库单成功'
        })
    } catch (error) {
        console.error('删除出库单失败:', error)
        res.json({
            code: 500,
            message: '删除出库单失败',
            error: error.message
        })
    }
})

// 获取出库统计信息
router.get('/statistics/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query

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
            approvedCount,
            completedCount,
            cancelledCount,
            totalAmount
        ] = await Promise.all([
            Outbound.countDocuments(dateQuery),
            Outbound.countDocuments({ ...dateQuery, status: 'pending' }),
            Outbound.countDocuments({ ...dateQuery, status: 'approved' }),
            Outbound.countDocuments({ ...dateQuery, status: 'completed' }),
            Outbound.countDocuments({ ...dateQuery, status: 'cancelled' }),
            Outbound.aggregate([
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
                approvedCount,
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