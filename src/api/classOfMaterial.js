import request from '@/utils/request'

// 获取物料类别列表
export function getClassOfMaterials(params) {
    return request({
        url: '/api/material-categories',
        method: 'get',
        params
    })
}

// 获取物料类别详情
export function getClassOfMaterial(id) {
    return request({
        url: `/api/material-categories/${id}`,
        method: 'get'
    })
}

// 创建物料类别
export function createClassOfMaterial(data) {
    return request({
        url: '/api/material-categories',
        method: 'post',
        data
    })
}

// 更新物料类别
export function updateClassOfMaterial(id, data) {
    return request({
        url: `/api/material-categories/${id}`,
        method: 'put',
        data
    })
}

// 删除物料类别
export function deleteClassOfMaterial(id) {
    return request({
        url: `/api/material-categories/${id}`,
        method: 'delete'
    })
}

// 检查类别编码是否存在
export function checkCategoryCode(params) {
    return request({
        url: '/api/material-categories/check-code',
        method: 'get',
        params
    })
}

// 获取所有启用的物料类别 (用于下拉选择)
export function getActiveCategoriesList() {
    return request({
        url: '/api/material-categories/active',
        method: 'get'
    })
}

// 如果你的现有系统中有其他命名，也可以添加别名
export function getlist(params) {
    return getClassOfMaterials(params)
}

// 获取物料列表 (如果这个文件确实需要包含物料操作)
export function getMaterials(params) {
    return request({
        url: '/api/materials',
        method: 'get',
        params
    })
}

// 获取物料详情
export function getMaterial(id) {
    return request({
        url: `/api/materials/${id}`,
        method: 'get'
    })
}

// 创建物料
export function createMaterial(data) {
    return request({
        url: '/api/materials',
        method: 'post',
        data
    })
}

// 更新物料
export function updateMaterial(id, data) {
    return request({
        url: `/api/materials/${id}`,
        method: 'put',
        data
    })
}

// 删除物料
export function deleteMaterial(id) {
    return request({
        url: `/api/materials/${id}`,
        method: 'delete'
    })
}

// 批量删除物料
export function batchDeleteMaterials(data) {
    return request({
        url: '/api/materials/batch-delete',
        method: 'post',
        data
    })
}

// 获取已删除物料列表
export function getDeletedMaterials(params) {
    return request({
        url: '/api/materials/deleted',
        method: 'get',
        params
    })
}

// 恢复物料
export function restoreMaterial(id) {
    return request({
        url: `/api/materials/${id}/restore`,
        method: 'put'
    })
}

// 彻底删除物料
export function permanentDeleteMaterial(id) {
    return request({
        url: `/api/materials/${id}/permanent`,
        method: 'delete'
    })
}

// 检查物料编码
export function checkMaterialCode(params) {
    return request({
        url: '/api/materials/check-code',
        method: 'get',
        params
    })
}

// 导入物料
export function importMaterials(data, config) {
    return request({
        url: '/api/materials/import',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        ...config
    })
}

// 导出物料
export function exportMaterials(params) {
    return request({
        url: '/api/materials/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}