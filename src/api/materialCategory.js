import request from '@/utils/request'



export function add(data) {
  return request({
    url: '/api/materialCategory',
    method: 'post',
    data
  })
}

export function put(id, data) {
  return request({
    url: `/api/materialCategory/${id}`,
    method: 'put',
    data
  })
}

export function deletes(id) {
  return request({
    url: `/api/materialCategory/${id}`,
    method: 'delete'
  })
}


// 获取物料类别列表
export function getlist(params) {
  return request({
    url: '/api/material-categories',
    method: 'get',
    params
  })
}

// 获取物料类别列表（别名）
export function getMaterialCategories(params) {
  return request({
    url: '/api/material-categories',
    method: 'get',
    params
  })
}

// 获取物料类别详情
export function getMaterialCategory(id) {
  return request({
    url: `/api/material-categories/${id}`,
    method: 'get'
  })
}

// 创建物料类别
export function createMaterialCategory(data) {
  return request({
    url: '/api/material-categories',
    method: 'post',
    data
  })
}

// 更新物料类别
export function updateMaterialCategory(id, data) {
  return request({
    url: `/api/material-categories/${id}`,
    method: 'put',
    data
  })
}

// 删除物料类别
export function deleteMaterialCategory(id) {
  return request({
    url: `/api/material-categories/${id}`,
    method: 'delete'
  })
}

// 检查类别编码
export function checkCategoryCode(params) {
  return request({
    url: '/api/material-categories/check-code',
    method: 'get',
    params
  })
}

// 获取启用的类别列表（用于下拉选择）
export function getActiveCategories() {
  return request({
    url: '/api/material-categories/active',
    method: 'get'
  })
}