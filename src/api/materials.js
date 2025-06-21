import request from '@/utils/request'

// 获取物料列表
export function getMaterials(params) {
  return request({
    url: '/api/materials',
    method: 'get',
    params
  })
}

// 搜索物料
export function getMaterialsSearch(params) {
  return request({
    url: '/api/materials/search',
    method: 'get',
    params
  })
}

// 新增物料
export function addMaterial(data) {
  return request({
    url: '/api/materials',
    method: 'post',
    data
  })
}

// 创建物料 (别名)
export function createMaterial(data) {
  return addMaterial(data)
}

// 编辑物料
export function editMaterial(id, data) {
  return request({
    url: `/api/materials/${id}`,
    method: 'put',
    data
  })
}

// 更新物料 (别名)
export function updateMaterial(id, data) {
  return editMaterial(id, data)
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

// 生成物料编码
export function generateCode(data) {
  return request({
    url: '/api/materials/generateCode',
    method: 'post',
    data
  })
}

// 检查编码可用性
export function checkCodeAvailability(data) {
  return request({
    url: '/api/materials/checkCode',
    method: 'post',
    data
  })
}

// 检查物料编码 (别名)
export function checkMaterialCode(params) {
  return request({
    url: '/api/materials/check-code',
    method: 'get',
    params
  })
}

// 获取已删除物料
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
    method: 'post'
  })
}

// 永久删除物料
export function permanentDelete(id) {
  return request({
    url: `/api/materials/${id}/permanent`,
    method: 'delete'
  })
}

// 彻底删除物料 (别名)
export function permanentDeleteMaterial(id) {
  return permanentDelete(id)
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

// 获取物料详情
export function getMaterial(id) {
  return request({
    url: `/api/materials/${id}`,
    method: 'get'
  })
}

// 获取物料类别列表 (如果需要)
export function getClassOfMaterials(params) {
  return request({
    url: '/api/material-categories',
    method: 'get',
    params
  })
}


// 生成物料编码
export function generateMaterialCode(data) {
  return request({
    url: '/api/materials/generate-code',
    method: 'post',
    data
  })
}