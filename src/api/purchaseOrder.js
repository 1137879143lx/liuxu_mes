import request from '@/utils/request'

// 获取采购订单列表
export function fetchPurchaseOrders(params) {
    return request({
        url: '/api/purchaseOrders',
        method: 'get',
        params
    })
}

// 创建采购订单
export function createPurchaseOrder(data) {
    return request({
        url: '/api/purchaseOrders',
        method: 'post',
        data
    })
}

// 更新采购订单
export function updatePurchaseOrder(id, data) {
    return request({
        url: `/api/purchaseOrders/${id}`,
        method: 'put',
        data
    })
}

// 删除采购订单
export function deletePurchaseOrder(id) {
    return request({
        url: `/api/purchaseOrders/${id}`,
        method: 'delete'
    })
}

// 获取采购订单详情
export function getPurchaseOrderDetail(id) {
    return request({
        url: `/api/purchaseOrders/${id}`,
        method: 'get'
    })
}

// 确认采购订单
export function confirmPurchaseOrder(id, data = {}) {
    return request({
        url: `/api/purchaseOrders/${id}/confirm`,
        method: 'put',
        data
    })
}

// 收货确认
export function receivePurchaseOrder(id, data) {
    return request({
        url: `/api/purchaseOrders/${id}/receive`,
        method: 'put',
        data
    })
}

// 取消采购订单
export function cancelPurchaseOrder(id, data = {}) {
    return request({
        url: `/api/purchaseOrders/${id}/cancel`,
        method: 'put',
        data
    })
}

// 导出采购订单
export function exportPurchaseOrders(params) {
    return request({
        url: '/api/purchaseOrders/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

// 生成采购订单编号
export function generateOrderNo() {
    return request({
        url: '/api/purchaseOrders/generateNo',
        method: 'get'
    })
}