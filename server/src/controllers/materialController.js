const Material = require('../models/materialModel')
const MaterialCategory = require('../models/materialCategoryModel')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

class MaterialController {
    // 获取物料列表 - 修复版本
    async getMaterials(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                code,
                name,
                category,
                status
            } = req.query

            // 明确过滤已删除的数据
            const filter = { isDeleted: { $ne: true } }

            if (code) filter.code = new RegExp(code, 'i')
            if (name) filter.name = new RegExp(name, 'i')
            if (category) filter.category = category
            if (status) filter.status = status

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: -1 }
            }

            const result = await Material.paginate(filter, options)

            res.json({
                code: 200,
                message: '获取成功',
                data: {
                    list: result.docs,
                    total: result.totalDocs,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '获取物料列表失败',
                error: error.message
            })
        }
    }

    // 获取单个物料详情 - 修复版本
    async getMaterial(req, res) {
        try {
            const { id } = req.params

            // 默认只查找未删除的物料
            const material = await Material.findOne({
                _id: id,
                isDeleted: { $ne: true }
            })

            if (!material) {
                return res.json({
                    code: 404,
                    message: '物料不存在'
                })
            }

            res.json({
                code: 200,
                message: '获取成功',
                data: material
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '获取物料详情失败',
                error: error.message
            })
        }
    }

    // 创建物料
    async createMaterial(req, res) {
        try {
            const material = new Material(req.body)
            await material.save()

            res.json({
                code: 200,
                message: '创建成功',
                data: material
            })
        } catch (error) {
            if (error.code === 11000) {
                return res.json({
                    code: 400,
                    message: '物料编码已存在'
                })
            }

            res.json({
                code: 500,
                message: '创建物料失败',
                error: error.message
            })
        }
    }

    // 更新物料 - 修复版本
    async updateMaterial(req, res) {
        try {
            const { id } = req.params

            // 只更新未删除的物料
            const material = await Material.findOneAndUpdate(
                { _id: id, isDeleted: { $ne: true } },
                req.body,
                { new: true, runValidators: true }
            )

            if (!material) {
                return res.json({
                    code: 404,
                    message: '物料不存在或已被删除'
                })
            }

            res.json({
                code: 200,
                message: '更新成功',
                data: material
            })
        } catch (error) {
            if (error.code === 11000) {
                return res.json({
                    code: 400,
                    message: '物料编码已存在'
                })
            }

            res.json({
                code: 500,
                message: '更新物料失败',
                error: error.message
            })
        }
    }

    // 软删除物料 - 修复版本
    async deleteMaterial(req, res) {
        try {
            const { id } = req.params

            // 只能删除未删除的物料
            const material = await Material.findOne({
                _id: id,
                isDeleted: { $ne: true }
            })

            if (!material) {
                return res.json({
                    code: 404,
                    message: '物料不存在或已被删除'
                })
            }

            await material.softDelete(req.user?.username || 'system')

            res.json({
                code: 200,
                message: '删除成功'
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '删除物料失败',
                error: error.message
            })
        }
    }

    // 批量删除物料 - 修复版本
    async batchDeleteMaterials(req, res) {
        try {
            const { ids } = req.body

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.json({
                    code: 400,
                    message: '请选择要删除的物料'
                })
            }

            // 只查找未删除的物料
            const materials = await Material.find({
                _id: { $in: ids },
                isDeleted: { $ne: true }
            })

            if (materials.length === 0) {
                return res.json({
                    code: 404,
                    message: '未找到可删除的物料'
                })
            }

            for (const material of materials) {
                await material.softDelete(req.user?.username || 'system')
            }

            res.json({
                code: 200,
                message: `成功删除 ${materials.length} 个物料`
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '批量删除失败',
                error: error.message
            })
        }
    }

    // 获取已删除物料列表 - 修复版本
    async getDeletedMaterials(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                code,
                name,
                category
            } = req.query

            // 明确查询已删除的数据
            const filter = { isDeleted: true }

            if (code) filter.code = new RegExp(code, 'i')
            if (name) filter.name = new RegExp(name, 'i')
            if (category) filter.category = category

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { deletedAt: -1 }
            }

            // 直接使用 paginate，因为我们已经明确设置了 isDeleted: true
            const result = await Material.paginate(filter, options)

            res.json({
                code: 200,
                message: '获取成功',
                data: {
                    list: result.docs,
                    total: result.totalDocs,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '获取已删除物料列表失败',
                error: error.message
            })
        }
    }

    // 恢复已删除物料 - 修复版本
    async restoreMaterial(req, res) {
        try {
            const { id } = req.params

            // 明确查找已删除的物料
            const material = await Material.findOne({
                _id: id,
                isDeleted: true
            })

            if (!material) {
                return res.json({
                    code: 404,
                    message: '已删除物料不存在'
                })
            }

            // 检查恢复后是否会产生编码冲突
            const existingMaterial = await Material.findOne({
                code: material.code,
                isDeleted: { $ne: true },
                _id: { $ne: id }
            })

            if (existingMaterial) {
                return res.json({
                    code: 400,
                    message: '恢复失败：物料编码已存在于活动物料中'
                })
            }

            await material.restore()

            res.json({
                code: 200,
                message: '恢复成功'
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '恢复物料失败',
                error: error.message
            })
        }
    }

    // 彻底删除物料 - 修复版本
    async permanentDeleteMaterial(req, res) {
        try {
            const { id } = req.params

            // 首先查找已删除的物料
            const material = await Material.findOne({
                _id: id,
                isDeleted: true
            })

            if (!material) {
                return res.json({
                    code: 404,
                    message: '已删除物料不存在，只能彻底删除已被软删除的物料'
                })
            }

            // 彻底删除物料 - 从数据库中完全移除
            await Material.deleteOne({ _id: id })

            res.json({
                code: 200,
                message: '彻底删除成功'
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '彻底删除失败',
                error: error.message
            })
        }
    }

    // 检查物料编码 - 修复版本
    async checkCode(req, res) {
        try {
            const { code, id } = req.query

            if (!code) {
                return res.json({
                    code: 400,
                    message: '物料编码不能为空'
                })
            }

            // 构建查询条件：只检查未删除的物料
            let filter = {
                code: code,
                isDeleted: { $ne: true }
            }

            if (id) {
                filter._id = { $ne: id }
            }

            const existingMaterial = await Material.findOne(filter)

            res.json({
                code: 200,
                data: {
                    available: !existingMaterial,
                    message: existingMaterial ? '物料编码已存在' : '物料编码可用'
                }
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '检查编码失败',
                error: error.message
            })
        }
    }

    // 导入物料
    async importMaterials(req, res) {
        try {
            if (!req.file) {
                return res.json({
                    code: 400,
                    message: '请选择要导入的文件'
                })
            }

            const workbook = XLSX.readFile(req.file.path)
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const data = XLSX.utils.sheet_to_json(worksheet)

            if (data.length === 0) {
                return res.json({
                    code: 400,
                    message: '导入文件为空'
                })
            }

            const results = {
                success: 0,
                failed: 0,
                errors: []
            }

            for (let i = 0; i < data.length; i++) {
                try {
                    const row = data[i]
                    const material = new Material({
                        code: row['物料编码'],
                        name: row['物料名称'],
                        category: row['物料类别'],
                        specification: row['规格型号'],
                        unit: row['计量单位'],
                        price: row['单价'] || 0,
                        inventory: row['安全库存'] || 0,
                        maxInventory: row['最大库存'] || 0,
                        description: row['物料描述'],
                        version: row['版本'] || 'V1.0',
                        status: row['状态'] || '启用'
                    })

                    await material.save()
                    results.success++
                } catch (error) {
                    results.failed++
                    results.errors.push({
                        row: i + 2,
                        error: error.message
                    })
                }
            }

            // 删除上传的临时文件
            fs.unlinkSync(req.file.path)

            res.json({
                code: 200,
                message: '导入完成',
                data: results
            })
        } catch (error) {
            res.json({
                code: 500,
                message: '导入失败',
                error: error.message
            })
        }
    }

    // 下载导入模板
    async downloadTemplate(req, res) {
        try {
            const templateData = [
                {
                    '物料编码': 'MAT001',
                    '物料名称': '示例物料',
                    '物料类别': '原材料',
                    '规格型号': '100*200',
                    '计量单位': '个',
                    '单价': 10.5,
                    '安全库存': 100,
                    '最大库存': 1000,
                    '物料描述': '这是一个示例物料',
                    '版本': 'V1.0',
                    '状态': '启用'
                }
            ]

            const ws = XLSX.utils.json_to_sheet(templateData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, '物料导入模板')

            const filename = `物料导入模板_${Date.now()}.xlsx`
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
            res.json({
                code: 500,
                message: '下载模板失败',
                error: error.message
            })
        }
    }

    // 导出物料数据 - 修复版本
    async exportMaterials(req, res) {
        try {
            const { ids } = req.query
            let filter = { isDeleted: { $ne: true } } // 默认只导出未删除的物料

            if (ids) {
                const idArray = ids.split(',')
                filter._id = { $in: idArray }
            }

            const materials = await Material.find(filter).sort({ createdAt: -1 })

            if (materials.length === 0) {
                return res.json({
                    code: 404,
                    message: '没有可导出的物料数据'
                })
            }

            const exportData = materials.map(material => ({
                '物料编码': material.code,
                '物料名称': material.name,
                '物料类别': material.category,
                '规格型号': material.specification || '',
                '计量单位': material.unit,
                '单价': material.price || 0,
                '安全库存': material.inventory || 0,
                '最大库存': material.maxInventory || 0,
                '物料描述': material.description || '',
                '版本': material.version || 'V1.0',
                '状态': material.status,
                '创建时间': material.createdAt?.toLocaleString('zh-CN')
            }))

            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, '物料数据')

            const filename = `物料数据_${Date.now()}.xlsx`
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
            res.json({
                code: 500,
                message: '导出失败',
                error: error.message
            })
        }
    }


    // 生成物料编码 - 修复版本（完全避免与已删除物料编码重复）
    async generateMaterialCode(req, res) {
        try {
            const { category, categoryCode } = req.body

            if (!category) {
                return res.json({
                    code: 400,
                    message: '物料类别不能为空'
                })
            }

            // 获取类别前缀
            let prefix = categoryCode || category.substring(0, 2).toUpperCase()

            // 尝试从数据库中获取更准确的类别编码
            try {
                const categoryRecord = await MaterialCategory.findOne({ name: category })
                if (categoryRecord && categoryRecord.code) {
                    prefix = categoryRecord.code
                }
            } catch (error) {
                console.log('未找到物料类别记录，使用默认前缀')
            }

            // 获取当前日期
            const today = new Date()
            const dateStr = today.getFullYear().toString() +
                (today.getMonth() + 1).toString().padStart(2, '0') +
                today.getDate().toString().padStart(2, '0')

            const todayPrefix = `${prefix}${dateStr}`

            // 获取今天同类别所有物料的编码（包括已删除和未删除的）
            const allMaterials = await Material.find({
                code: { $regex: `^${todayPrefix}\\d{3}$` }
                // 移除 category 过滤条件，因为编码前缀已经包含了类别信息
                // 不过滤 isDeleted，包括所有物料（已删除和未删除的）
            }).select('code').sort({ code: 1 })

            console.log(`查找前缀 ${todayPrefix} 的所有物料:`, allMaterials.map(m => m.code))

            // 创建一个Set来存储所有已使用的序号
            const usedSequencesSet = new Set()

            allMaterials.forEach(material => {
                const code = material.code
                const sequencePart = code.slice(-3) // 取最后3位
                const sequence = parseInt(sequencePart)
                if (!isNaN(sequence)) {
                    usedSequencesSet.add(sequence)
                }
            })

            console.log('已使用的序号集合:', Array.from(usedSequencesSet).sort((a, b) => a - b))

            // 找到第一个未使用的序号
            let sequence = 1
            while (sequence <= 999 && usedSequencesSet.has(sequence)) {
                sequence++
            }

            // 确保序号不超过999
            if (sequence > 999) {
                return res.json({
                    code: 400,
                    message: `今日前缀 ${todayPrefix} 的物料编码已达上限(999个)`
                })
            }

            const newCode = `${todayPrefix}${sequence.toString().padStart(3, '0')}`

            // 最终双重检查：确保生成的编码不与任何现有物料冲突
            const existingMaterial = await Material.findOne({ code: newCode })

            if (existingMaterial) {
                console.error(`编码冲突检测: ${newCode} 已存在`, existingMaterial)
                return res.json({
                    code: 500,
                    message: `编码生成冲突: ${newCode} 已存在，请重试`
                })
            }

            console.log(`成功生成新编码: ${newCode}, 序号: ${sequence}`)

            res.json({
                code: 200,
                message: '编码生成成功',
                data: {
                    code: newCode,
                    rule: `${prefix} + ${dateStr} + 序号(3位)`,
                    sequence: sequence,
                    usedCount: usedSequencesSet.size,
                    availableCount: 999 - usedSequencesSet.size,
                    note: '已避开所有已使用的编码（包括已删除的物料）'
                }
            })
        } catch (error) {
            console.error('生成编码失败:', error)
            res.json({
                code: 500,
                message: '生成编码失败',
                error: error.message
            })
        }
    }
}

module.exports = new MaterialController()