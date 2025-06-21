// 新文件: server/src/scripts/initMaterialCategories.js
const MaterialCategory = require('../models/materialCategoryModel')
const db = require('../config/db')

async function initMaterialCategories() {
    try {
        const categories = [
            {
                name: '原材料',
                code: 'RAW',
                unit: '千克',
                description: '生产用原材料',
                codePrefix: 'RAW'
            },
            {
                name: '半成品',
                code: 'SEMI',
                unit: '个',
                description: '半成品物料',
                codePrefix: 'SEMI'
            },
            {
                name: '成品',
                code: 'PROD',
                unit: '个',
                description: '最终产品',
                codePrefix: 'PROD'
            },
            {
                name: '包装材料',
                code: 'PACK',
                unit: '个',
                description: '包装用材料',
                codePrefix: 'PACK'
            },
            {
                name: '辅料',
                code: 'AUX',
                unit: '个',
                description: '辅助材料',
                codePrefix: 'AUX'
            }
        ]

        for (const category of categories) {
            const existing = await MaterialCategory.findOne({ code: category.code })
            if (!existing) {
                await MaterialCategory.create(category)
                console.log(`创建物料类别: ${category.name}`)
            }
        }

        console.log('物料类别初始化完成')
    } catch (error) {
        console.error('初始化物料类别失败:', error)
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    initMaterialCategories().then(() => {
        process.exit(0)
    })
}

module.exports = initMaterialCategories