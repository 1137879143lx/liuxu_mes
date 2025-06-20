const express = require('express')
const router = express.Router()
const Supplier = require('../models/SupplierModel')
const moment = require('moment')

// 获取供应商列表（支持分页和搜索）
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      supplierCode,
      supplierName,
      contactPerson,
      status,
      supplierType
    } = req.query

    // 构建查询条件
    const query = { enable_flag: 'Y' }

    if (supplierCode) {
      query.supplierCode = { $regex: supplierCode, $options: 'i' }
    }

    if (supplierName) {
      query.$or = [
        { shortName: { $regex: supplierName, $options: 'i' } },
        { fullName: { $regex: supplierName, $options: 'i' } }
      ]
    }

    if (contactPerson) {
      query.contactPerson = { $regex: contactPerson, $options: 'i' }
    }

    if (status) {
      query.status = status
    }

    if (supplierType) {
      query.supplierType = supplierType
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createTime: -1 },
      customLabels: {
        totalDocs: 'total',
        docs: 'data',
        limit: 'pageSize',
        page: 'currentPage'
      }
    }

    const result = await Supplier.paginate(query, options)

    res.json({
      code: 200,
      message: '获取供应商列表成功',
      data: result
    })
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    res.json({
      code: 500,
      message: '获取供应商列表失败',
      error: error.message
    })
  }
})

// 根据ID获取供应商详情
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)

    if (!supplier || supplier.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '供应商不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取供应商详情成功',
      data: supplier
    })
  } catch (error) {
    console.error('获取供应商详情失败:', error)
    res.json({
      code: 500,
      message: '获取供应商详情失败',
      error: error.message
    })
  }
})

// 创建供应商
router.post('/', async (req, res) => {
  try {
    const {
      supplierCode,
      shortName,
      fullName,
      supplierType,
      contactPerson,
      telephone,
      email,
      address,
      taxRate,
      currency,
      creditLevel,
      fax,
      bankName,
      bankAccount,
      remark
    } = req.body

    // 验证必填字段
    if (!supplierCode || !shortName || !fullName || !supplierType || !contactPerson || !telephone || !address) {
      return res.json({
        code: 400,
        message: '缺少必填字段'
      })
    }

    // 检查供应商编号是否已存在
    const existingSupplier = await Supplier.findOne({
      supplierCode: supplierCode,
      enable_flag: 'Y'
    })

    if (existingSupplier) {
      return res.json({
        code: 400,
        message: '供应商编号已存在'
      })
    }

    const supplierData = {
      supplierCode,
      shortName,
      fullName,
      supplierType,
      contactPerson,
      telephone,
      email,
      address,
      taxRate: taxRate || 13,
      currency: currency || 'RMB',
      creditLevel: creditLevel || 3,
      fax,
      bankName,
      bankAccount,
      remark
    }

    const newSupplier = new Supplier(supplierData)
    const savedSupplier = await newSupplier.save()

    res.json({
      code: 201,
      message: '创建供应商成功',
      data: savedSupplier
    })
  } catch (error) {
    console.error('创建供应商失败:', error)
    res.json({
      code: 500,
      message: '创建供应商失败',
      error: error.message
    })
  }
})

// 更新供应商
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)

    if (!supplier || supplier.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '供应商不存在'
      })
    }

    const updateData = { ...req.body }
    delete updateData._id

    // 如果更新供应商编号，检查是否重复
    if (updateData.supplierCode && updateData.supplierCode !== supplier.supplierCode) {
      const existingSupplier = await Supplier.findOne({
        supplierCode: updateData.supplierCode,
        enable_flag: 'Y',
        _id: { $ne: req.params.id }
      })

      if (existingSupplier) {
        return res.json({
          code: 400,
          message: '供应商编号已存在'
        })
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      code: 200,
      message: '更新供应商成功',
      data: updatedSupplier
    })
  } catch (error) {
    console.error('更新供应商失败:', error)
    res.json({
      code: 500,
      message: '更新供应商失败',
      error: error.message
    })
  }
})

// 切换供应商状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    if (!['active', 'inactive'].includes(status)) {
      return res.json({
        code: 400,
        message: '状态值无效'
      })
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!updatedSupplier || updatedSupplier.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '供应商不存在'
      })
    }

    res.json({
      code: 200,
      message: '更新状态成功',
      data: updatedSupplier
    })
  } catch (error) {
    console.error('更新供应商状态失败:', error)
    res.status(500).json({
      code: 500,
      message: '更新状态失败',
      error: error.message
    })
  }
})

// 删除供应商（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)

    if (!supplier || supplier.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '供应商不存在'
      })
    }

    await Supplier.findByIdAndUpdate(req.params.id, { enable_flag: 'N' })

    res.json({
      code: 200,
      message: '删除供应商成功'
    })
  } catch (error) {
    console.error('删除供应商失败:', error)
    res.json({
      code: 500,
      message: '删除供应商失败',
      error: error.message
    })
  }
})

// 获取供应商统计信息
router.get('/statistics/summary', async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      inactiveCount,
      materialSuppliers,
      equipmentSuppliers,
      serviceSuppliers
    ] = await Promise.all([
      Supplier.countDocuments({ enable_flag: 'Y' }),
      Supplier.countDocuments({ enable_flag: 'Y', status: 'active' }),
      Supplier.countDocuments({ enable_flag: 'Y', status: 'inactive' }),
      Supplier.countDocuments({ enable_flag: 'Y', supplierType: 'material' }),
      Supplier.countDocuments({ enable_flag: 'Y', supplierType: 'equipment' }),
      Supplier.countDocuments({ enable_flag: 'Y', supplierType: 'service' })
    ])

    res.json({
      code: 200,
      message: '获取统计信息成功',
      data: {
        totalCount,
        activeCount,
        inactiveCount,
        materialSuppliers,
        equipmentSuppliers,
        serviceSuppliers
      }
    })
  } catch (error) {
    console.error('获取统计信息失败:', error)
    res.json({
      code: 500,
      message: '获取统计信息失败',
      error: error.message
    })
  }
})

module.exports = router