const express = require('express')
const router = express.Router()
const Customer = require('../models/customerModel')

// 获取客户列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, name, status, type } = req.query

    const query = { enable_flag: 'Y' }

    if (name) {
      query.$or = [{ name: { $regex: name, $options: 'i' } }, { companyName: { $regex: name, $options: 'i' } }]
    }

    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createTime: -1 }
    }

    const result = await Customer.paginate(query, options)

    res.json({
      code: 200,
      message: '获取客户列表成功',
      data: {
        list: result.docs,
        total: result.totalDocs,
        page: result.page,
        pageSize: result.limit,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    console.error('获取客户列表失败:', error)
    res.json({
      code: 500,
      message: '获取客户列表失败',
      error: error.message
    })
  }
})

// 获取客户选项（用于下拉框）
router.get('/options', async (req, res) => {
  try {
    console.log('获取客户选项请求')

    const customers = await Customer.find(
      {
        enable_flag: 'Y',
        status: 'active' // 只获取活跃客户
      },
      'name companyName' // 只选择需要的字段
    ).sort({ name: 1 })

    console.log('查询到的客户数据:', customers)

    // 构建选项数据
    const options = customers.map((customer) => ({
      value: customer.name || customer.companyName,
      label: customer.name || customer.companyName,
      name: customer.name || customer.companyName
    }))

    res.json({
      code: 200,
      message: '获取客户选项成功',
      data: options
    })
  } catch (error) {
    console.error('获取客户选项失败:', error)
    res.json({
      code: 500,
      message: '获取客户选项失败',
      error: error.message
    })
  }
})

// 获取单个客户详情
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)

    if (!customer || customer.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '客户不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取客户详情成功',
      data: customer
    })
  } catch (error) {
    console.error('获取客户详情失败:', error)
    res.json({
      code: 500,
      message: '获取客户详情失败',
      error: error.message
    })
  }
})

// 创建客户
router.post('/', async (req, res) => {
  try {
    // console.log('创建客户请求数据:', req.body)
    const customerData = {
      ...req.body,
      createTime: new Date(Date.now() + 60 * 60 * 8 * 1000),
      enable_flag: 'Y'
    }

    const customer = new Customer(customerData)
    await customer.save()

    res.json({
      code: 200,
      message: '创建客户成功',
      data: customer
    })
  } catch (error) {
    console.error('创建客户失败:', error)

    let errorMessage = '创建客户失败'
    if (error.code === 11000) {
      errorMessage = '客户名称或公司名称已存在'
    } else if (error.message) {
      errorMessage = error.message
    }

    res.json({
      code: 500,
      message: errorMessage,
      error: error.message
    })
  }
})

// 更新客户
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)

    if (!customer || customer.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '客户不存在'
      })
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updateTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
      },
      { new: true, runValidators: true }
    )

    res.json({
      code: 200,
      message: '更新客户成功',
      data: updatedCustomer
    })
  } catch (error) {
    console.error('更新客户失败:', error)
    res.json({
      code: 500,
      message: '更新客户失败',
      error: error.message
    })
  }
})

// 删除客户
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)

    if (!customer || customer.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '客户不存在'
      })
    }

    await Customer.findByIdAndUpdate(req.params.id, {
      enable_flag: 'N',
      deleteTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
    })

    res.json({
      code: 200,
      message: '删除客户成功'
    })
  } catch (error) {
    console.error('删除客户失败:', error)
    res.json({
      code: 500,
      message: '删除客户失败',
      error: error.message
    })
  }
})

module.exports = router
