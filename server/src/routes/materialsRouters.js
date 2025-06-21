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

// 物料管理路由
// 生成物料编码 - 放在其他路由之前
// 特殊路由放在前面，避免被通用路由匹配
router.get('/deleted', materialController.getDeletedMaterials)
router.get('/check-code', materialController.checkCode)
router.get('/template', materialController.downloadTemplate)
router.get('/export', materialController.exportMaterials)
router.post('/generate-code', materialController.generateMaterialCode)
router.post('/import', upload.single('file'), materialController.importMaterials)
router.post('/batch-delete', materialController.batchDeleteMaterials)
router.put('/:id/restore', materialController.restoreMaterial)
router.delete('/:id/permanent', materialController.permanentDeleteMaterial)

// 通用CRUD路由
router.get('/', materialController.getMaterials)
router.get('/:id', materialController.getMaterial)
router.post('/', materialController.createMaterial)
router.put('/:id', materialController.updateMaterial)
router.delete('/:id', materialController.deleteMaterial)

module.exports = router