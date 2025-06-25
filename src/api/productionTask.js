import request from '@/utils/request'

// 获取生产任务列表
export function fetchProductionTasks(params) {
  return request({
    url: '/api/production-tasks',
    method: 'get',
    params
  })
}

// 获取生产任务详情
export function fetchProductionTask(id) {
  return request({
    url: `/api/production-tasks/${id}`,
    method: 'get'
  })
}

// 创建生产任务
export function createProductionTask(data) {
  return request({
    url: '/api/production-tasks',
    method: 'post',
    data
  })
}

// 更新生产任务
export function updateProductionTask(id, data) {
  return request({
    url: `/api/production-tasks/${id}`,
    method: 'put',
    data
  })
}

// 删除生产任务
export function deleteProductionTask(id) {
  return request({
    url: `/api/production-tasks/${id}`,
    method: 'delete'
  })
}

// 批量删除生产任务
export function batchDeleteProductionTasks(data) {
  return request({
    url: '/api/production-tasks/batch-delete',
    method: 'post',
    data
  })
}

// 获取任务统计
export function fetchTaskStatistics() {
  return request({
    url: '/api/production-tasks/statistics',
    method: 'get'
  })
}

// 生成任务编号
export function generateTaskNumber() {
  return request({
    url: '/api/production-tasks/generate-number',
    method: 'post'
  })
}

// 导出任务数据
export function exportTasks(params) {
  return request({
    url: '/api/production-tasks/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
