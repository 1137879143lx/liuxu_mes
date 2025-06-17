import request from '@/utils/request'

// 获取入库单列表
export function fetchInboundList(query) {
    return request({
        url: 'api/inbounds',
        method: 'get',
        params: query
    })
}

// 获取入库单详情
export function fetchInbound(id) {
    return request({
        url: `api/inbounds/${id}`,
        method: 'get'
    })
}

// 创建入库单
export function createInbound(data) {
    return request({
        url: 'api/inbounds',
        method: 'post',
        data
    })
}

// 更新入库单
export function updateInbound(id, data) {
    return request({
        url: `api/inbounds/${id}`,
        method: 'put',
        data
    })
}

// 删除入库单
export function deleteInbound(id) {
    return request({
        url: `api/inbounds/${id}`,
        method: 'delete'
    })
}

// 批量删除入库单
export function batchDeleteInbound(ids) {
    return request({
        url: `api/inbounds/batch/${ids}`,
        method: 'delete'
    })
}

// 确认入库
export function confirmInbound(id) {
    return request({
        url: `api/inbounds/${id}/confirm`,
        method: 'put'
    })
}

// 取消入库单
export function cancelInbound(id, data) {
    return request({
        url: `api/inbounds/${id}/cancel`,
        method: 'put',
        data
    })
}

// 获取入库统计信息
export function fetchInboundStatistics(query) {
    return request({
        url: 'api/inbounds/statistics/summary',
        method: 'get',
        params: query
    })
}

// 导出入库单
export function exportInbound(query) {
    return request({
        url: 'api/inbounds/export',
        method: 'get',
        params: query,
        responseType: 'blob'
    })
}