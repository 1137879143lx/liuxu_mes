// 新文件: server/src/routes/materialCategoryRoutes.js
const express = require('express')
const router = express.Router()
const MaterialCategory = require('../models/materialCategoryModel')

// 获取物料类别列表
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 100, status } = req.query

        const query = { isDeleted: { $ne: true } }
        if (status) {
            query.status = status
        }

        const categories = await MaterialCategory.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await MaterialCategory.countDocuments(query)

        res.json({
            code: 200,
            message: '获取成功',
            data: categories,
            total
        })
    } catch (error) {
        res.json({
            code: 500,
            message: '获取物料类别失败',
            error: error.message
        })
    }
})

// 获取启用的类别列表
router.get('/active', async (req, res) => {
    try {
        const categories = await MaterialCategory.find({
            status: '启用',
            isDeleted: { $ne: true }
        }).sort({ name: 1 })

        res.json({
            code: 200,
            message: '获取成功',
            data: categories
        })
    } catch (error) {
        res.json({
            code: 500,
            message: '获取启用类别失败',
            error: error.message
        })
    }
})

// 创建物料类别
router.post('/', async (req, res) => {
    try {
        const category = new MaterialCategory(req.body)
        await category.save()

        res.json({
            code: 200,
            message: '创建成功',
            data: category
        })
    } catch (error) {
        res.json({
            code: 500,
            message: '创建失败',
            error: error.message
        })
    }
})

module.exports = router