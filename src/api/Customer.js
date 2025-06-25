import request from '@/utils/request'

// 获取客户列表
export function getlist(params) {
  return request({
    url: '/api/customers', // 修改为复数形式，与后端路由保持一致
    method: 'get',
    params
  })
}

// 获取客户选项（用于下拉框）
export function getCustomerOptions() {
  return request({
    url: '/api/customers/options',
    method: 'get'
  })
}

// 新增客户
export function add(data) {
  return request({
    url: '/api/customers', // 修改为复数形式
    method: 'post',
    data
  })
}

// 编辑客户
export function update(id, data) {
  return request({
    url: `/api/customers/${id}`, // 修改为复数形式
    method: 'put',
    data
  })
}

// 删除客户
export function deletes(id) {
  return request({
    url: `/api/customers/${id}`, // 修改为复数形式
    method: 'delete'
  })
}

// 获取客户详情
export function getCustomerDetail(id) {
  return request({
    url: `/api/customers/${id}`,
    method: 'get'
  })
}
