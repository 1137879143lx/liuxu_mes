import request from '@/utils/request'

// 获取采购申请列表
export function fetchPurchaseRequests(params) {
    return request({
        url: '/api/purchaseRequests',
        method: 'get',
        params
    })
}

// 创建采购申请
export function createPurchaseRequest(data) {
    return request({
        url: '/api/purchaseRequests',
        method: 'post',
        data
    })
}

// 更新采购申请
export function updatePurchaseRequest(id, data) {
    return request({
        url: `/api/purchaseRequests/${id}`,
        method: 'put',
        data
    })
}

// 删除采购申请
export function deletePurchaseRequest(id) {
    return request({
        url: `/api/purchaseRequests/${id}`,
        method: 'delete'
    })
}

// 审核通过
export function approvePurchaseRequest(id, data) {
    return request({
        url: `/api/purchaseRequests/${id}/approve`,
        method: 'put',
        data
    })
}

// 驳回申请
export function rejectPurchaseRequest(id, data) {
    return request({
        url: `/api/purchaseRequests/${id}/reject`,
        method: 'put',
        data
    })
}

// 获取申请详情
export function fetchPurchaseRequestDetail(id) {
    return request({
        url: `/api/purchaseRequests/${id}`,
        method: 'get'
    })
}


// 转为采购单
export function convertToPurchaseOrder(id, data) {
    return request({
        url: `/api/purchaseRequests/${id}/convert`,
        method: 'put',
        data
    })
}

// 获取物料信息
export function fetchMaterialInfo(materialCode) {
    return request({
        url: `/api/materials/info/${materialCode}`,
        method: 'get'
    })
}

// 获取采购申请详情
export function getPurchaseRequestDetail(id) {
    return request({
        url: `/api/purchaseRequests/${id}`,
        method: 'get'
    })
}