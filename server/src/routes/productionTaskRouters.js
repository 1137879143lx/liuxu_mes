const express = require('express')
const router = express.Router()
const ProductionTask = require('../models/productionTaskModel')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// 获取任务统计
router.get('/statistics', async (req, res) => {
  try {
    const pipeline = [
      { $match: { enable_flag: 'Y' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]

    const statusStats = await ProductionTask.aggregate(pipeline)

    // 统计紧急任务 (Difficulty >= 4)
    const urgentCount = await ProductionTask.countDocuments({
      enable_flag: 'Y',
      Difficulty: { $gte: 4 } // 修改查询条件
    })

    const statistics = {
      pending: 0,
      processing: 0,
      completed: 0,
      urgent: urgentCount
    }

    statusStats.forEach((stat) => {
      if (Object.prototype.hasOwnProperty.call(statistics, stat._id)) {
        statistics[stat._id] = stat.count
      }
    })

    res.json({
      code: 200,
      message: '获取统计成功',
      data: statistics
    })
  } catch (error) {
    console.error('获取任务统计失败:', error)
    res.json({
      code: 500,
      message: '获取统计失败',
      error: error.message
    })
  }
})

// 获取生产任务列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      keyword = '',
      client = '',
      project = '', // 对应前端的 project，后端查询 porject 字段
      status = '',
      urgency = '', // 对应前端的 urgency，后端查询 Difficulty 字段
      startDate = '',
      endDate = '',
      includeCompleted = 'true'
    } = req.query

    // 构建查询条件
    let filter = { enable_flag: 'Y' }

    if (keyword) {
      filter.$or = [
        { Batch_number: { $regex: keyword, $options: 'i' } }, // 修改字段名
        { client: { $regex: keyword, $options: 'i' } },
        { materialName: { $regex: keyword, $options: 'i' } },
        { materialCode: { $regex: keyword, $options: 'i' } },
        { porject: { $regex: keyword, $options: 'i' } } // 修改字段名
      ]
    }

    if (client) filter.client = client
    if (project) filter.porject = project // 修改字段名
    if (status) filter.status = status

    // 处理难度等级查询
    if (urgency && urgency !== '0') {
      if (urgency === 'urgent') {
        filter.Difficulty = { $gte: 4 } // 难度4-5级为紧急
      } else {
        // 可以根据需要映射其他级别
        const difficultyMap = {
          low: 1,
          normal: 2,
          high: 3,
          urgent: { $gte: 4 }
        }
        filter.Difficulty = difficultyMap[urgency] || 2
      }
    }

    // 处理 includeCompleted 参数
    if (includeCompleted === 'false') {
      filter.status = { $ne: 'completed' }
    }

    if (startDate && endDate) {
      filter.clientDeliveryDate = {
        // 修改字段名
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(pageSize),
      sort: { createTime: -1 } // 修改字段名
    }

    console.log('查询条件:', filter)
    console.log('查询选项:', options)

    const result = await ProductionTask.paginate(filter, options)

    console.log('查询结果:', {
      total: result.totalDocs,
      count: result.docs.length
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: result.docs,
        total: result.totalDocs,
        page: result.page,
        pageSize: result.limit,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    console.error('获取生产任务列表失败:', error)
    res.json({
      code: 500,
      message: '获取列表失败',
      error: error.message
    })
  }
})

// 获取生产任务详情
router.get('/:id', async (req, res) => {
  try {
    const task = await ProductionTask.findById(req.params.id)

    if (!task || task.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '生产任务不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: task
    })
  } catch (error) {
    console.error('获取生产任务详情失败:', error)
    res.json({
      code: 500,
      message: '获取详情失败',
      error: error.message
    })
  }
})

// 创建生产任务
router.post('/', async (req, res) => {
  try {
    const taskData = req.body

    // 检查任务编号是否重复
    const existingTask = await ProductionTask.findOne({
      Batch_number: taskData.Batch_number, // 修改字段名
      enable_flag: 'Y'
    })

    if (existingTask) {
      return res.json({
        code: 400,
        message: '任务编号已存在'
      })
    }

    // 数据转换
    const transformedData = {
      Batch_number: taskData.Batch_number || taskData.taskNumber,
      client: taskData.client,
      porject: taskData.project, // 前端 project -> 后端 porject
      materialCode: taskData.materialCode,
      materialName: taskData.materialName,
      versions: taskData.versions || taskData.version,
      count: taskData.count || taskData.quantity,
      type: taskData.type,
      clientDeliveryDate: taskData.clientDeliveryDate || taskData.customerDeliveryDate,
      status: taskData.status,
      Difficulty: taskData.Difficulty || (taskData.urgency === 'urgent' ? 4 : 2),
      man_hour: taskData.man_hour || taskData.estimatedHours,
      process: taskData.process || [],
      createdBy: taskData.createdBy,
      description: taskData.description,
      image: taskData.image,
      createTime: new Date(Date.now() + 60 * 60 * 8 * 1000),
      enable_flag: 'Y'
    }

    const task = new ProductionTask(transformedData)
    await task.save()

    res.json({
      code: 201,
      message: '创建成功',
      data: task
    })
  } catch (error) {
    console.error('创建生产任务失败:', error)

    let errorMessage = '创建失败'
    if (error.code === 11000) {
      errorMessage = '任务编号重复，请重新生成'
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

// 更新生产任务
router.put('/:id', async (req, res) => {
  try {
    const task = await ProductionTask.findById(req.params.id)

    if (!task || task.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '生产任务不存在'
      })
    }

    // 数据转换
    const transformedData = {
      client: req.body.client,
      porject: req.body.project || req.body.porject,
      materialCode: req.body.materialCode,
      materialName: req.body.materialName,
      versions: req.body.versions || req.body.version,
      count: req.body.count || req.body.quantity,
      type: req.body.type,
      clientDeliveryDate: req.body.clientDeliveryDate || req.body.customerDeliveryDate,
      status: req.body.status,
      Difficulty: req.body.Difficulty || (req.body.urgency === 'urgent' ? 4 : 2),
      man_hour: req.body.man_hour || req.body.estimatedHours,
      process: req.body.process || [],
      description: req.body.description,
      image: req.body.image,
      updateTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
    }

    const updatedTask = await ProductionTask.findByIdAndUpdate(req.params.id, transformedData, { new: true, runValidators: true })

    res.json({
      code: 200,
      message: '更新成功',
      data: updatedTask
    })
  } catch (error) {
    console.error('更新生产任务失败:', error)
    res.json({
      code: 500,
      message: '更新失败',
      error: error.message
    })
  }
})

// 删除生产任务
router.delete('/:id', async (req, res) => {
  try {
    const task = await ProductionTask.findById(req.params.id)

    if (!task || task.enable_flag !== 'Y') {
      return res.json({
        code: 404,
        message: '生产任务不存在'
      })
    }

    await ProductionTask.findByIdAndUpdate(req.params.id, {
      enable_flag: 'N',
      deleteTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
    })

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除生产任务失败:', error)
    res.json({
      code: 500,
      message: '删除失败',
      error: error.message
    })
  }
})

// 批量删除生产任务
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({
        code: 400,
        message: '请选择要删除的任务'
      })
    }

    const result = await ProductionTask.updateMany(
      { _id: { $in: ids }, enable_flag: 'Y' },
      {
        enable_flag: 'N',
        deleteTime: new Date(Date.now() + 60 * 60 * 8 * 1000)
      }
    )

    res.json({
      code: 200,
      message: `成功删除 ${result.modifiedCount} 个任务`
    })
  } catch (error) {
    console.error('批量删除生产任务失败:', error)
    res.json({
      code: 500,
      message: '批量删除失败',
      error: error.message
    })
  }
})

// 生成任务编号
router.post('/generate-number', async (req, res) => {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    const datePrefix = `PT${year}${month}${day}`

    // 查找今天已有的任务编号
    const existingTasks = await ProductionTask.find({
      Batch_number: { $regex: `^${datePrefix}` }, // 修改字段名
      enable_flag: 'Y'
    })
      .sort({ Batch_number: -1 })
      .limit(1) // 修改字段名

    let sequence = 1
    if (existingTasks.length > 0) {
      const lastNumber = existingTasks[0].Batch_number
      const lastSequence = parseInt(lastNumber.slice(-3))
      sequence = lastSequence + 1
    }

    const taskNumber = `${datePrefix}${String(sequence).padStart(3, '0')}`

    res.json({
      code: 200,
      message: '生成成功',
      data: { taskNumber }
    })
  } catch (error) {
    console.error('生成任务编号失败:', error)
    res.json({
      code: 500,
      message: '生成编号失败',
      error: error.message
    })
  }
})

// 导出任务数据
router.get('/export', async (req, res) => {
  try {
    const tasks = await ProductionTask.find({ enable_flag: 'Y' }).sort({ createTime: -1 }) // 修改字段名

    const exportData = tasks.map((task, index) => ({
      序号: index + 1,
      任务编号: task.Batch_number, // 修改字段名
      客户名称: task.client,
      项目名称: task.porject || '', // 修改字段名
      物料编码: task.materialCode,
      物料名称: task.materialName,
      版本: task.versions, // 修改字段名
      生产数量: task.count, // 修改字段名
      类型: task.type,
      交货日期: task.clientDeliveryDate?.toLocaleDateString('zh-CN') || '', // 修改字段名
      状态: task.status,
      难度等级: task.Difficulty, // 修改字段名
      预计工时: task.man_hour || 0, // 修改字段名
      创建人: task.createdBy,
      创建时间: task.createTime?.toLocaleString('zh-CN') || '' // 修改字段名
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '生产任务数据')

    const filename = `生产任务数据_${Date.now()}.xlsx`
    const filepath = path.join(__dirname, '../temp', filename)

    // 确保temp目录存在
    const tempDir = path.dirname(filepath)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    XLSX.writeFile(wb, filepath)

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('下载文件失败:', err)
      }
      // 删除临时文件
      fs.unlinkSync(filepath)
    })
  } catch (error) {
    console.error('导出任务数据失败:', error)
    res.json({
      code: 500,
      message: '导出失败',
      error: error.message
    })
  }
})

module.exports = router
