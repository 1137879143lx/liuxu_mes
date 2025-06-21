const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

// 获取采购订单列表
router.get('/', (req, res) => purchaseOrderController.getList(req, res));

// 创建采购订单
router.post('/', (req, res) => purchaseOrderController.create(req, res));

// 生成订单编号
router.get('/generateNo', (req, res) => purchaseOrderController.generateNo(req, res));

// 获取采购订单详情
router.get('/:id', (req, res) => purchaseOrderController.getDetail(req, res));

// 更新采购订单
router.put('/:id', (req, res) => purchaseOrderController.update(req, res));

// 删除采购订单
router.delete('/:id', (req, res) => purchaseOrderController.delete(req, res));

// 确认采购订单
router.put('/:id/confirm', (req, res) => purchaseOrderController.confirm(req, res));

// 收货确认
router.put('/:id/receive', (req, res) => purchaseOrderController.receive(req, res));

// 取消采购订单
router.put('/:id/cancel', (req, res) => purchaseOrderController.cancel(req, res));

module.exports = router;