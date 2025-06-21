const express = require('express')
const router = express.Router()
const PurchaseRequest = require('../models/purchaseRequestModel')
const moment = require('moment')
// 在文件顶部添加采购订单模型的引用
const PurchaseOrder = require('../models/purchaseOrderModel')

// 获取采购申请列表
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            requestNo,
            status,
            applicant,
            startDate,
            endDate
        } = req.query

        // 构建查询条件
        const query = { enable_flag: 'Y' }

        if (requestNo) {
            query.requestNo = { $regex: requestNo, $options: 'i' }
        }

        if (status) {
            query.applicationStatus = status
        }

        if (applicant) {
            query.applicant = { $regex: applicant, $options: 'i' }
        }

        // 日期范围查询
        if (startDate || endDate) {
            query.requestDate = {}
            if (startDate) {
                query.requestDate.$gte = new Date(startDate)
            }
            if (endDate) {
                query.requestDate.$lte = new Date(endDate + ' 23:59:59')
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

        const result = await PurchaseRequest.paginate(query, options)

        res.json({
            code: 200,
            message: '获取采购申请列表成功',
            data: result
        })
    } catch (error) {
        console.error('获取采购申请列表失败:', error)
        res.json({
            code: 500,
            message: '获取采购申请列表失败',
            error: error.message
        })
    }
})
// 创建采购申请 - 移除事务
router.post('/', async (req, res) => {
    try {
        const {
            applicant,
            department,
            urgency,
            expectedDate,
            requestDate,
            reason,
            items
        } = req.body

        // 验证必填字段
        if (!applicant || !department || !expectedDate || !requestDate || !reason || !items || items.length === 0) {
            return res.json({
                code: 400,
                message: '缺少必填字段或物料清单为空'
            })
        }

        // 验证物料数据
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (!item.materialCode || !item.materialName || !item.unit || !item.quantity || item.quantity <= 0) {
                return res.json({
                    code: 400,
                    message: `第${i + 1}个物料信息不完整`
                })
            }
        }

        // 生成申请单号（添加重试机制）
        let requestNo
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
            try {
                requestNo = await generateRequestNo()
                break
            } catch (error) {
                retryCount++
                if (retryCount >= maxRetries) {
                    throw new Error('生成申请单号失败，请稍后重试')
                }
                // 等待100ms后重试
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }

        // 计算总金额
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.estimatedAmount || 0)
        }, 0)

        const requestData = {
            requestNo,
            applicant,
            department,
            urgency: urgency || 'normal',
            expectedDate: new Date(expectedDate),
            requestDate: new Date(requestDate),
            reason,
            materialList: items.map(item => ({
                materialCode: item.materialCode,
                materialName: item.materialName,
                specification: item.specification || '',
                unit: item.unit,
                quantity: item.quantity,
                estimatedUnitPrice: item.estimatedPrice || 0,
                estimatedAmount: item.estimatedAmount || 0,
                note: item.remark || ''
            })),
            totalAmount,
            applicationStatus: 'pending'
        }

        const newRequest = new PurchaseRequest(requestData)
        const savedRequest = await newRequest.save()

        res.json({
            code: 200,
            message: '创建采购申请成功',
            data: savedRequest
        })
    } catch (error) {
        console.error('创建采购申请失败:', error)

        let errorMessage = '创建采购申请失败'
        if (error.message.includes('buffering timed out')) {
            errorMessage = '数据库连接超时，请检查网络连接后重试'
        } else if (error.message.includes('duplicate key')) {
            errorMessage = '申请单号重复，请重新提交'
        } else if (error.message) {
            errorMessage = error.message
        }

        res.json({
            code: 500,
            message: errorMessage,
            error: error.message
        })
    }
})
// 更新采购申请
router.put('/:id', async (req, res) => {
    try {
        const request = await PurchaseRequest.findById(req.params.id)

        if (!request || request.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '采购申请不存在'
            })
        }

        // 只有待审核状态才能修改
        if (request.applicationStatus !== 'pending') {
            return res.json({
                code: 400,
                message: '只有待审核状态的申请才能修改'
            })
        }

        const {
            applicant,
            department,
            urgency,
            expectedDate,
            requestDate,
            reason,
            items
        } = req.body

        // 重新计算总金额
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.estimatedAmount || 0)
        }, 0)

        const updateData = {
            applicant,
            department,
            urgency,
            expectedDate: new Date(expectedDate),
            requestDate: new Date(requestDate),
            reason,
            materialList: items.map(item => ({
                materialCode: item.materialCode,
                materialName: item.materialName,
                specification: item.specification || '',
                unit: item.unit,
                quantity: item.quantity,
                estimatedUnitPrice: item.estimatedPrice || 0,
                estimatedAmount: item.estimatedAmount || 0,
                note: item.remark || ''
            })),
            totalAmount
        }

        const updatedRequest = await PurchaseRequest.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )

        res.json({
            code: 200,
            message: '更新采购申请成功',
            data: updatedRequest
        })
    } catch (error) {
        console.error('更新采购申请失败:', error)
        res.json({
            code: 500,
            message: '更新采购申请失败',
            error: error.message
        })
    }
})

// 审核通过
router.put('/:id/approve', async (req, res) => {
    try {
        const { comment, operator, operatorId } = req.body

        const request = await PurchaseRequest.findById(req.params.id)

        if (!request || request.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '采购申请不存在'
            })
        }

        if (request.applicationStatus !== 'pending') {
            return res.json({
                code: 400,
                message: '该申请已处理，无法重复审核'
            })
        }

        // 添加审核记录
        const approvalRecord = {
            action: 'approve',
            operator: operator || '系统管理员',
            operatorId: operatorId || 'system',
            comment: comment || '',
            createTime: new Date()
        }

        const updatedRequest = await PurchaseRequest.findByIdAndUpdate(
            req.params.id,
            {
                applicationStatus: 'approved',
                approver: operator || '系统管理员',
                $push: { approvalHistory: approvalRecord }
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '审核通过成功',
            data: updatedRequest
        })
    } catch (error) {
        console.error('审核通过失败:', error)
        res.json({
            code: 500,
            message: '审核通过失败',
            error: error.message
        })
    }
})

// 驳回申请
router.put('/:id/reject', async (req, res) => {
    try {
        const { comment, operator, operatorId } = req.body

        const request = await PurchaseRequest.findById(req.params.id)

        if (!request || request.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '采购申请不存在'
            })
        }

        if (request.applicationStatus !== 'pending') {
            return res.json({
                code: 400,
                message: '该申请已处理，无法重复审核'
            })
        }

        // 添加审核记录
        const approvalRecord = {
            action: 'reject',
            operator: operator || '系统管理员',
            operatorId: operatorId || 'system',
            comment: comment || '',
            createTime: new Date()
        }

        const updatedRequest = await PurchaseRequest.findByIdAndUpdate(
            req.params.id,
            {
                applicationStatus: 'rejected',
                approver: operator || '系统管理员',
                $push: { approvalHistory: approvalRecord }
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '驳回成功',
            data: updatedRequest
        })
    } catch (error) {
        console.error('驳回申请失败:', error)
        res.json({
            code: 500,
            message: '驳回申请失败',
            error: error.message
        })
    }
})

// 删除采购申请（软删除）
router.delete('/:id', async (req, res) => {
    try {
        const request = await PurchaseRequest.findById(req.params.id)

        if (!request || request.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '采购申请不存在'
            })
        }

        // 只有待审核状态才能删除
        if (request.applicationStatus !== 'pending') {
            return res.json({
                code: 400,
                message: '只有待审核状态的申请才能删除'
            })
        }

        await PurchaseRequest.findByIdAndUpdate(
            req.params.id,
            { enable_flag: 'N' }
        )

        res.json({
            code: 200,
            message: '删除成功'
        })
    } catch (error) {
        console.error('删除采购申请失败:', error)
        res.json({
            code: 500,
            message: '删除失败',
            error: error.message
        })
    }
})

// 优化生成申请单号函数
async function generateRequestNo() {
    const today = moment().format('YYYYMMDD')
    const prefix = `PR${today}`

    try {
        // 添加超时和错误处理
        const lastRequest = await PurchaseRequest.findOne({
            requestNo: { $regex: `^${prefix}` }
        })
            .sort({ requestNo: -1 })
            .lean() // 使用lean查询提高性能
            .maxTimeMS(5000) // 设置查询超时时间为5秒

        let sequence = 1
        if (lastRequest && lastRequest.requestNo) {
            const lastSequence = parseInt(lastRequest.requestNo.substring(prefix.length))
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1
            }
        }

        return `${prefix}${sequence.toString().padStart(3, '0')}`
    } catch (error) {
        console.error('生成申请单号失败:', error)
        // 如果查询失败，使用时间戳作为备用方案
        const timestamp = Date.now().toString().slice(-6)
        return `${prefix}${timestamp}`
    }
}

// 改进创建采购申请路由
router.post('/', async (req, res) => {
    const session = await PurchaseRequest.startSession()

    try {
        await session.withTransaction(async () => {
            const {
                applicant,
                department,
                urgency,
                expectedDate,
                requestDate,
                reason,
                items
            } = req.body

            // 验证必填字段
            if (!applicant || !department || !expectedDate || !requestDate || !reason || !items || items.length === 0) {
                throw new Error('缺少必填字段或物料清单为空')
            }

            // 验证物料数据
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (!item.materialCode || !item.materialName || !item.unit || !item.quantity || item.quantity <= 0) {
                    throw new Error(`第${i + 1}个物料信息不完整`)
                }
            }

            // 生成申请单号（添加重试机制）
            let requestNo
            let retryCount = 0
            const maxRetries = 3

            while (retryCount < maxRetries) {
                try {
                    requestNo = await generateRequestNo()
                    break
                } catch (error) {
                    retryCount++
                    if (retryCount >= maxRetries) {
                        throw new Error('生成申请单号失败，请稍后重试')
                    }
                    // 等待100ms后重试
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            }

            // 计算总金额
            const totalAmount = items.reduce((sum, item) => {
                return sum + (item.estimatedAmount || 0)
            }, 0)

            const requestData = {
                requestNo,
                applicant,
                department,
                urgency: urgency || 'normal',
                expectedDate: new Date(expectedDate),
                requestDate: new Date(requestDate),
                reason,
                materialList: items.map(item => ({
                    materialCode: item.materialCode,
                    materialName: item.materialName,
                    specification: item.specification || '',
                    unit: item.unit,
                    quantity: item.quantity,
                    estimatedUnitPrice: item.estimatedPrice || 0,
                    estimatedAmount: item.estimatedAmount || 0,
                    note: item.remark || ''
                })),
                totalAmount,
                applicationStatus: 'pending'
            }

            const newRequest = new PurchaseRequest(requestData)
            const savedRequest = await newRequest.save({ session })

            res.json({
                code: 200,
                message: '创建采购申请成功',
                data: savedRequest
            })
        })
    } catch (error) {
        console.error('创建采购申请失败:', error)

        let errorMessage = '创建采购申请失败'
        if (error.message.includes('buffering timed out')) {
            errorMessage = '数据库连接超时，请检查网络连接后重试'
        } else if (error.message.includes('duplicate key')) {
            errorMessage = '申请单号重复，请重新提交'
        } else if (error.message) {
            errorMessage = error.message
        }

        res.json({
            code: 500,
            message: errorMessage,
            error: error.message
        })
    } finally {
        await session.endSession()
    }
})

// 生成采购订单编号的函数
async function generatePurchaseOrderNo() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `PO${dateStr}`;

    // 查找今天最大的序号
    const lastOrder = await PurchaseOrder.findOne({
        orderNo: { $regex: `^${prefix}` }
    }).sort({ orderNo: -1 });

    let sequence = 1;
    if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderNo.substr(prefix.length));
        sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
}



// 转为采购单
router.put('/:id/convert', async (req, res) => {
    try {
        const { operator, operatorId, remark } = req.body

        const request = await PurchaseRequest.findById(req.params.id)

        if (!request || request.enable_flag !== 'Y') {
            return res.json({
                code: 404,
                message: '采购申请不存在'
            })
        }

        if (request.applicationStatus !== 'approved') {
            return res.json({
                code: 400,
                message: '只有已审核通过的申请才能转为采购单'
            })
        }

        if (request.applicationStatus === 'converted') {
            return res.json({
                code: 400,
                message: '该申请已经转为采购单'
            })
        }

        // 生成采购订单编号
        const orderNo = await generatePurchaseOrderNo()

        // 创建采购订单数据
        const orderData = {
            orderNo,
            supplier: '', // 待填写
            contact: '', // 待填写
            contactPhone: '', // 待填写
            status: 'pending',
            urgency: request.urgency || 'normal',
            expectedDate: request.expectedDate,
            deliveryAddress: '', // 待填写

            // 物料明细从申请转换
            items: request.materialList.map(item => ({
                materialCode: item.materialCode,
                materialName: item.materialName,
                specification: item.specification,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.estimatedUnitPrice || 0,
                amount: item.estimatedAmount || 0,
                remark: item.note || ''
            })),

            totalAmount: request.totalAmount,
            orderDate: new Date(),
            creator: operator || '系统管理员',
            creatorId: operatorId || 'system',

            // 关联原始申请
            sourceRequestId: request._id,
            sourceRequestNo: request.requestNo,

            remark: remark || `由采购申请 ${request.requestNo} 转换而来`
        }

        // 先创建采购订单
        const newOrder = new PurchaseOrder(orderData)
        const savedOrder = await newOrder.save()

        // 再更新申请状态
        const conversionRecord = {
            action: 'convert',
            operator: operator || '系统管理员',
            operatorId: operatorId || 'system',
            comment: `转为采购单，订单号：${orderNo}`,
            createTime: new Date()
        }

        const updatedRequest = await PurchaseRequest.findByIdAndUpdate(
            req.params.id,
            {
                applicationStatus: 'converted',
                converter: operator || '系统管理员',
                convertTime: new Date(),
                purchaseOrderNo: orderNo,
                $push: { approvalHistory: conversionRecord }
            },
            { new: true }
        )

        res.json({
            code: 200,
            message: '转为采购单成功',
            data: {
                request: updatedRequest,
                order: savedOrder,
                orderNo: orderNo
            }
        })
    } catch (error) {
        console.error('转为采购单失败:', error)
        res.json({
            code: 500,
            message: error.message || '转为采购单失败',
            error: error.message
        })
    }
})


module.exports = router