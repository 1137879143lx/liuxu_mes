const PurchaseOrder = require('../models/purchaseOrderModel');

class PurchaseOrderController {
    // 获取采购订单列表
    async getList(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                orderNo,
                supplier,
                status,
                startDate,
                endDate
            } = req.query;

            const query = { enable_flag: 'Y' };

            // 构建查询条件
            if (orderNo) {
                query.orderNo = { $regex: orderNo, $options: 'i' };
            }
            if (supplier) {
                query.supplier = { $regex: supplier, $options: 'i' };
            }
            if (status) {
                query.status = status;
            }
            if (startDate && endDate) {
                query.orderDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate + ' 23:59:59')
                };
            }

            const total = await PurchaseOrder.countDocuments(query);
            const list = await PurchaseOrder.find(query)
                .sort({ orderDate: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            res.json({
                code: 200,
                message: '获取成功',
                data: {
                    list,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('获取采购订单列表失败:', error);
            res.json({
                code: 500,
                message: '获取采购订单列表失败',
                error: error.message
            });
        }
    }

    // 创建采购订单
    async create(req, res) {
        try {
            const orderData = req.body;

            // 直接在这里生成订单编号
            orderData.orderNo = await this.generateOrderNo();

            // 设置默认值
            orderData.orderDate = new Date();
            orderData.status = 'pending';
            orderData.creator = req.user?.name || '系统管理员';
            orderData.creatorId = req.user?.id || 'system';

            const order = new PurchaseOrder(orderData);
            await order.save();

            res.json({
                code: 200,
                message: '创建成功',
                data: order
            });
        } catch (error) {
            console.error('创建采购订单失败:', error);
            res.json({
                code: 500,
                message: '创建失败',
                error: error.message
            });
        }
    }

    // 更新采购订单
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const order = await PurchaseOrder.findById(id);
            if (!order || order.enable_flag !== 'Y') {
                return res.json({
                    code: 404,
                    message: '采购订单不存在'
                });
            }

            // 只有待确认状态才能修改
            if (order.status !== 'pending') {
                return res.json({
                    code: 400,
                    message: '只有待确认状态的订单才能修改'
                });
            }

            const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidation: true }
            );

            res.json({
                code: 200,
                message: '更新成功',
                data: updatedOrder
            });
        } catch (error) {
            console.error('更新采购订单失败:', error);
            res.json({
                code: 500,
                message: '更新失败',
                error: error.message
            });
        }
    }

    // 删除采购订单（软删除）
    async delete(req, res) {
        try {
            const { id } = req.params;

            const order = await PurchaseOrder.findById(id);
            if (!order || order.enable_flag !== 'Y') {
                return res.json({
                    code: 404,
                    message: '采购订单不存在'
                });
            }

            // 只有待确认状态才能删除
            if (order.status !== 'pending') {
                return res.json({
                    code: 400,
                    message: '只有待确认状态的订单才能删除'
                });
            }

            await PurchaseOrder.findByIdAndUpdate(id, { enable_flag: 'N' });

            res.json({
                code: 200,
                message: '删除成功'
            });
        } catch (error) {
            console.error('删除采购订单失败:', error);
            res.json({
                code: 500,
                message: '删除失败',
                error: error.message
            });
        }
    }

    // 获取采购订单详情
    async getDetail(req, res) {
        try {
            const { id } = req.params;

            const order = await PurchaseOrder.findById(id);
            if (!order || order.enable_flag !== 'Y') {
                return res.json({
                    code: 404,
                    message: '采购订单不存在'
                });
            }

            res.json({
                code: 200,
                message: '获取成功',
                data: order
            });
        } catch (error) {
            console.error('获取采购订单详情失败:', error);
            res.json({
                code: 500,
                message: '获取详情失败',
                error: error.message
            });
        }
    }

    // 确认采购订单
    async confirm(req, res) {
        try {
            const { id } = req.params;
            const { confirmer } = req.body;

            const order = await PurchaseOrder.findById(id);
            if (!order || order.enable_flag !== 'Y') {
                return res.json({
                    code: 404,
                    message: '采购订单不存在'
                });
            }

            if (order.status !== 'pending') {
                return res.json({
                    code: 400,
                    message: '只有待确认状态的订单才能确认'
                });
            }

            const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
                id,
                {
                    status: 'confirmed',
                    confirmer: confirmer || req.user?.name || '系统管理员',
                    confirmTime: new Date()
                },
                { new: true }
            );

            res.json({
                code: 200,
                message: '确认成功',
                data: updatedOrder
            });
        } catch (error) {
            console.error('确认采购订单失败:', error);
            res.json({
                code: 500,
                message: '确认失败',
                error: error.message
            });
        }
    }

    // 收货确认
    async receive(req, res) {
        try {
            const { id } = req.params;
            const { receiveDate, receiver, remark } = req.body;

            const order = await PurchaseOrder.findById(id);
            if (!order || order.enable_flag !== 'Y') {
                return res.json({
                    code: 404,
                    message: '采购订单不存在'
                });
            }

            if (!['confirmed', 'executing', 'partial'].includes(order.status)) {
                return res.json({
                    code: 400,
                    message: '订单状态不允许收货'
                });
            }

            // 添加收货记录
            const receiveRecord = {
                receiveDate: new Date(receiveDate),
                receiver,
                remark,
                createTime: new Date()
            };

            const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
                id,
                {
                    status: 'completed', // 简化处理，直接设为完成
                    $push: { receiveRecords: receiveRecord }
                },
                { new: true }
            );

            res.json({
                code: 200,
                message: '收货确认成功',
                data: updatedOrder
            });
        } catch (error) {
            console.error('收货确认失败:', error);
            res.json({
                code: 500,
                message: '收货确认失败',
                error: error.message
            });
        }
    }

    // 取消采购订单
    async cancel(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const order = await PurchaseOrder.findById(id);
            if (!order || order.enable_flag !== 'Y') {
                return res.json({
                    code: 404,
                    message: '采购订单不存在'
                });
            }

            if (order.status !== 'pending') {
                return res.json({
                    code: 400,
                    message: '只有待确认状态的订单才能取消'
                });
            }

            const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
                id,
                {
                    status: 'cancelled',
                    remark: (order.remark || '') + `\n取消原因：${reason || '无'}`
                },
                { new: true }
            );

            res.json({
                code: 200,
                message: '取消成功',
                data: updatedOrder
            });
        } catch (error) {
            console.error('取消采购订单失败:', error);
            res.json({
                code: 500,
                message: '取消失败',
                error: error.message
            });
        }
    }

    // 生成订单编号 - 确保方法正确绑定
    async generateOrderNo() {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
            const prefix = `PO${dateStr}`;

            // 查找今天最大的序号
            const lastOrder = await PurchaseOrder.findOne({
                orderNo: { $regex: `^${prefix}` },
                enable_flag: 'Y'
            }).sort({ orderNo: -1 });

            let sequence = 1;
            if (lastOrder && lastOrder.orderNo) {
                const lastSequence = parseInt(lastOrder.orderNo.substr(prefix.length));
                if (!isNaN(lastSequence)) {
                    sequence = lastSequence + 1;
                }
            }

            return `${prefix}${sequence.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('生成订单编号失败:', error);
            // 备用方案：使用时间戳
            const timestamp = Date.now().toString().slice(-6);
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            return `PO${dateStr}${timestamp}`;
        }
    }

    // 生成订单编号接口
    async generateNo(req, res) {
        try {
            const orderNo = await this.generateOrderNo();
            res.json({
                code: 200,
                message: '生成成功',
                data: { orderNo }
            });
        } catch (error) {
            console.error('生成订单编号失败:', error);
            res.json({
                code: 500,
                message: '生成编号失败',
                error: error.message
            });
        }
    }
}

const controller = new PurchaseOrderController();
module.exports = controller;