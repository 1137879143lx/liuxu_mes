const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const materialController = require('../controllers/materialController')

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp')
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `import_${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 Excel 文件格式'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

// 基础CRUD路由
router.get('/', materialController.getMaterials)
router.get('/:id', materialController.getMaterial)
router.post('/', materialController.createMaterial)
router.put('/:id', materialController.updateMaterial)
router.delete('/:id', materialController.deleteMaterial)

// 批量操作路由
router.post('/batch-delete', materialController.batchDeleteMaterials)
router.post('/batch', materialController.batchCreateMaterials) // 新增批量创建路由

// 回收站相关路由
router.get('/deleted/list', materialController.getDeletedMaterials)
router.put('/:id/restore', materialController.restoreMaterial)
router.delete('/:id/permanent', materialController.permanentDeleteMaterial)

// 工具路由
router.get('/check/code', materialController.checkCode)
router.post('/generate-code', materialController.generateMaterialCode)
router.post('/batch-generate-codes', materialController.batchGenerateMaterialCodes) // 新增批量生成编码路由

// 导入导出路由
router.post('/import', upload.single('file'), materialController.importMaterials)
router.get('/export', materialController.exportMaterials)
router.get('/template/download', materialController.downloadTemplate)

module.exports = router
