import request from '@/utils/request'

const API_PREFIX = '/api/materialcategory'

export default {
  // 获取物料类型列表
  getList(params) {
    return request({
      url: `${API_PREFIX}`,
      method: 'get',
      params
    })
  },

  // 创建物料类型
  create(data) {
    return request({
      url: `${API_PREFIX}`,
      method: 'post',
      data
    })
  },

  // 更新物料类型
  update(id, data) {
    return request({
      url: `${API_PREFIX}/${id}`,
      method: 'put',
      data
    })
  },

  // 删除物料类型
  delete(id) {
    return request({
      url: `${API_PREFIX}/${id}`,
      method: 'delete'
    })
  },

  // 更新状态
  updateStatus(id, status) {
    return request({
      url: `${API_PREFIX}/${id}/status`,
      method: 'patch',
      data: { status }
    })
  },

  // 根据ID获取详情
  getById(id) {
    return request({
      url: `${API_PREFIX}/${id}`,
      method: 'get'
    })
  },

  // 批量删除
  batchDelete(ids) {
    return request({
      url: `${API_PREFIX}/batch`,
      method: 'delete',
      data: { ids }
    })
  }
}
