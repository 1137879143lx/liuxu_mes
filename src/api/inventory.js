import request from '@/utils/request'

// 获取库存列表
export function fetchInventoryList(query) {
    return request({
        url: 'api/inventory',
        method: 'get',
        params: query
    })
}

// 获取库存统计
export function fetchInventoryStatistics(query) {
    return request({
        url: 'api/inventory/stats/summary',
        method: 'get',
        params: query
    })
}

// 库存调整
export function adjustInventory(data) {
    return request({
        url: 'api/inventory/adjust',
        method: 'post',
        data
    })
}

// 获取出入库记录
export function fetchInventoryHistory(query) {
    return request({
        url: 'api/inventory/history',
        method: 'get',
        params: query
    })
}

// 更新库存（入库时调用）
export function updateInventoryFromInbound(data) {
    return request({
        url: 'api/inventory/update-from-inbound',
        method: 'post',
        data
    })
}

export function importInventory(data) {
    return request({
        url: '/api/inventory/import',
        method: 'post',
        data: {
            items: data
        }
    })
}

// 导出库存数据
export function exportInventory(params) {
    return request({
        url: '/api/inventory/export',
        method: 'get',
        params
    })
}