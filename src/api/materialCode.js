import request from '@/utils/request'

// 根据物料编码获取物料信息
export function fetchMaterialInfo(materialCode) {
    return request({
        url: '/api/materials/info',
        method: 'get',
        params: { materialCode }
    })
}

// 搜索物料
export function searchMaterials(params) {
    return request({
        url: '/api/materials/search',
        method: 'get',
        params
    })
}