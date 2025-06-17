import request from '@/utils/request'

// 获取出库单列表
export function fetchOutboundList(query) {
    return request({
        url: '/api/outbounds',
        method: 'get',
        params: query
    })
}

// 获取出库单详情
export function fetchOutbound(id) {
    return request({
        url: `/api/outbounds/${id}`,
        method: 'get'
    })
}

// 创建出库单
export function createOutbound(data) {
    return request({
        url: '/api/outbounds',
        method: 'post',
        data
    })
}

// 更新出库单
export function updateOutbound(id, data) {
    return request({
        url: `/api/outbounds/${id}`,
        method: 'put',
        data
    })
}

// 删除出库单
export function deleteOutbound(id) {
    return request({
        url: `/api/outbounds/${id}`,
        method: 'delete'
    })
}

// 审核出库单
export function approveOutbound(id, data) {
    return request({
        url: `/api/outbounds/${id}/approve`,
        method: 'put',
        data
    })
}

// 确认出库
export function confirmOutbound(id, data) {
    return request({
        url: `/api/outbounds/${id}/confirm`,
        method: 'put',
        data
    })
}

// 取消出库单
export function cancelOutbound(id, data) {
    return request({
        url: `/api/outbounds/${id}/cancel`,
        method: 'put',
        data
    })
}

// 获取出库统计信息
export function fetchOutboundStatistics(query) {
    return request({
        url: '/api/outbounds/statistics/summary',
        method: 'get',
        params: query
    })
}