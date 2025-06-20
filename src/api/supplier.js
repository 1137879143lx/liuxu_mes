import request from '@/utils/request'

// 获取供应商列表
export function fetchSupplierList(query) {
    return request({
        url: '/api/suppliers',
        method: 'get',
        params: query
    })
}

// 获取供应商详情
export function fetchSupplier(id) {
    return request({
        url: `/api/suppliers/${id}`,
        method: 'get'
    })
}

// 创建供应商
export function createSupplier(data) {
    return request({
        url: '/api/suppliers',
        method: 'post',
        data
    })
}

// 更新供应商
export function updateSupplier(id, data) {
    return request({
        url: `/api/suppliers/${id}`,
        method: 'put',
        data
    })
}

// 删除供应商
export function deleteSupplier(id) {
    return request({
        url: `/api/suppliers/${id}`,
        method: 'delete'
    })
}

// 切换供应商状态
export function toggleSupplierStatus(id, data) {
    return request({
        url: `/api/suppliers/${id}/status`,
        method: 'put',
        data
    })
}

// 获取供应商统计信息
export function fetchSupplierStatistics(query) {
    return request({
        url: '/api/suppliers/statistics/summary',
        method: 'get',
        params: query
    })
}