const express = require('express')
const router = express.Router()
const MaterialCategory = require('../models/materialCategoryModel')

// 获取物料类型列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, size = 20, name, code, status } = req.query

    const query = {}
    if (name) {
      query.name = { $regex: name, $options: 'i' }
    }
    if (code) {
      query.code = { $regex: code, $options: 'i' }
    }
    if (status !== undefined && status !== null && status !== '') {
      query.status = parseInt(status)
    }

    const total = await MaterialCategory.countDocuments(query)
    const list = await MaterialCategory.find(query)
      .sort({ createTime: -1 })
      .skip((page - 1) * size)
      .limit(parseInt(size))

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list,
        total,
        page: parseInt(page),
        size: parseInt(size)
      }
    })
  } catch (error) {
    console.error('获取物料类型列表失败:', error)
    res.json({
      code: 500,
      message: '获取物料类型列表失败',
      error: error.message
    })
  }
})

// 创建物料类型
router.post('/', async (req, res) => {
  try {
    const materialCategory = new MaterialCategory(req.body)
    await materialCategory.save()

    res.json({
      code: 200,
      message: '创建成功',
      data: materialCategory
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.json({
        code: 400,
        message: '物料类型名称或编码已存在'
      })
    }

    res.json({
      code: 500,
      message: '创建物料类型失败',
      error: error.message
    })
  }
})

// 更新物料类型
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updatedCategory = await MaterialCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

    if (!updatedCategory) {
      return res.json({
        code: 404,
        message: '物料类型不存在'
      })
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: updatedCategory
    })
  } catch (error) {
    res.json({
      code: 500,
      message: '更新物料类型失败',
      error: error.message
    })
  }
})

// 更新状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updatedCategory = await MaterialCategory.findByIdAndUpdate(id, { status }, { new: true })

    if (!updatedCategory) {
      return res.json({
        code: 404,
        message: '物料类型不存在'
      })
    }

    res.json({
      code: 200,
      message: '状态更新成功',
      data: updatedCategory
    })
  } catch (error) {
    res.json({
      code: 500,
      message: '状态更新失败',
      error: error.message
    })
  }
})

// 删除物料类型
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deletedCategory = await MaterialCategory.findByIdAndDelete(id)

    if (!deletedCategory) {
      return res.json({
        code: 404,
        message: '物料类型不存在'
      })
    }

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    res.json({
      code: 500,
      message: '删除物料类型失败',
      error: error.message
    })
  }
})

module.exports = router
