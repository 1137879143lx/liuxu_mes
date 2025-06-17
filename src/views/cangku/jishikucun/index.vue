<template>
    <div class="inventory-container">
        <!-- 搜索和操作区域 -->
        <el-card class="search-card">
            <div slot="header" class="clearfix">
                <span>及时库存管理</span>
                <el-button style="float: right;" type="primary" icon="el-icon-refresh"
                    @click="refreshData">刷新</el-button>
            </div>

            <!-- 搜索表单 -->
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="物料编码">
                    <el-input v-model="searchForm.materialCode" placeholder="请输入物料编码" clearable />
                </el-form-item>
                <el-form-item label="物料名称">
                    <el-input v-model="searchForm.materialName" placeholder="请输入物料名称" clearable />
                </el-form-item>
                <el-form-item label="仓库">
                    <el-select v-model="searchForm.warehouse" placeholder="请选择仓库" clearable>
                        <el-option label="原料仓" value="raw" />
                        <el-option label="成品仓" value="finished" />
                        <el-option label="半成品仓" value="semi" />
                        <el-option label="耗材仓" value="耗材仓" />
                    </el-select>
                </el-form-item>
                <el-form-item label="库存状态">
                    <el-select v-model="searchForm.stockStatus" placeholder="请选择状态" clearable>
                        <el-option label="正常" value="normal" />
                        <el-option label="缺货" value="shortage" />
                        <el-option label="超储" value="overstock" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                    <el-button type="success" icon="el-icon-download" @click="exportData">导出</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
                <el-card class="stats-card">
                    <div class="stats-content">
                        <div class="stats-number">{{ stats.totalItems }}</div>
                        <div class="stats-label">总物料数</div>
                    </div>
                    <i class="el-icon-goods stats-icon" />
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stats-card normal">
                    <div class="stats-content">
                        <div class="stats-number">{{ stats.normalStock }}</div>
                        <div class="stats-label">正常库存</div>
                    </div>
                    <i class="el-icon-success stats-icon" />
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stats-card warning">
                    <div class="stats-content">
                        <div class="stats-number">{{ stats.shortageStock }}</div>
                        <div class="stats-label">缺货预警</div>
                    </div>
                    <i class="el-icon-warning stats-icon" />
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stats-card danger">
                    <div class="stats-content">
                        <div class="stats-number">{{ stats.overstockItems }}</div>
                        <div class="stats-label">超储物料</div>
                    </div>
                    <i class="el-icon-error stats-icon" />
                </el-card>
            </el-col>
        </el-row>

        <!-- 库存表格 -->
        <el-card class="table-card">
            <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%"
                :row-class-name="getRowClassName">
                <el-table-column prop="materialCode" label="物料编码" width="120" fixed="left">
                    <template slot-scope="scope">
                        <el-link type="primary" @click="viewDetail(scope.row)">{{ scope.row.materialCode }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="materialName" label="物料名称" width="200" show-overflow-tooltip />
                <el-table-column prop="specification" label="规格型号" width="150" show-overflow-tooltip />
                <el-table-column prop="unit" label="单位" width="80" align="center" />
                <el-table-column prop="warehouse" label="仓库" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="getWarehouseType(scope.row.warehouse)">{{ getWarehouseName(scope.row.warehouse)
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="currentStock" label="当前库存" width="120" align="right">
                    <template slot-scope="scope">
                        <span :class="getStockClass(scope.row)">{{ scope.row.currentStock }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="safetyStock" label="安全库存" width="120" align="right" />
                <el-table-column prop="maxStock" label="最大库存" width="120" align="right" />
                <el-table-column label="库存状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="lastUpdateTime" label="最后更新" width="160" align="center" />
                <el-table-column label="操作" width="200" fixed="right" align="center">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="adjustStock(scope.row)">库存调整</el-button>
                        <el-button size="mini" type="success" @click="viewHistory(scope.row)">出入库记录</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total" style="margin-top: 20px; text-align: center" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </el-card>

        <!-- 库存调整对话框 -->
        <el-dialog title="库存调整" :visible.sync="adjustDialogVisible" width="500px">
            <el-form ref="adjustForm" :model="adjustForm" :rules="adjustRules" label-width="100px">
                <el-form-item label="物料编码">
                    <el-input v-model="adjustForm.materialCode" disabled />
                </el-form-item>
                <el-form-item label="物料名称">
                    <el-input v-model="adjustForm.materialName" disabled />
                </el-form-item>
                <el-form-item label="当前库存">
                    <el-input v-model="adjustForm.currentStock" disabled />
                </el-form-item>
                <el-form-item label="调整类型" prop="adjustType">
                    <el-radio-group v-model="adjustForm.adjustType">
                        <el-radio label="in">入库</el-radio>
                        <el-radio label="out">出库</el-radio>
                        <el-radio label="set">设定</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="调整数量" prop="adjustQuantity">
                    <el-input-number v-model="adjustForm.adjustQuantity" :min="0" :precision="2"
                        controls-position="right" style="width: 100%" />
                </el-form-item>
                <el-form-item label="调整原因" prop="reason">
                    <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="adjustDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitAdjust">确定</el-button>
            </div>
        </el-dialog>

        <!-- 出入库记录对话框 -->
        <el-dialog title="出入库记录" :visible.sync="historyDialogVisible" width="800px">
            <el-table :data="historyData" border stripe>
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="type" label="类型" width="80" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.type === 'in' ? 'success' : 'warning'">
                            {{ scope.row.type === 'in' ? '入库' : '出库' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="100" align="right" />
                <el-table-column prop="reason" label="原因" show-overflow-tooltip />
                <el-table-column prop="operator" label="操作人" width="100" />
                <el-table-column prop="stockAfter" label="库存余量" width="120" align="right" />
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
import {
    fetchInventoryList,
    fetchInventoryStatistics,
    adjustInventory,
    fetchInventoryHistory
} from '@/api/inventory'

export default {
    name: 'InventoryRealTime',
    data() {
        return {
            loading: false,
            searchForm: {
                materialCode: '',
                materialName: '',
                warehouse: '',
                stockStatus: ''
            },
            stats: {
                totalItems: 0,
                normalStock: 0,
                shortageStock: 0,
                overstockItems: 0
            },
            tableData: [],
            pagination: {
                currentPage: 1,
                pageSize: 20,
                total: 0
            },
            adjustDialogVisible: false,
            adjustForm: {
                materialCode: '',
                materialName: '',
                currentStock: 0,
                adjustType: 'in',
                adjustQuantity: 0,
                reason: ''
            },
            adjustRules: {
                adjustType: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
                adjustQuantity: [{ required: true, message: '请输入调整数量', trigger: 'blur' }],
                reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
            },
            historyDialogVisible: false,
            historyData: []
        }
    },
    mounted() {
        this.loadData()
        this.loadStatistics()
    },
    methods: {
        // 加载库存数据
        async loadData() {
            this.loading = true
            try {
                const params = {
                    page: this.pagination.currentPage,
                    limit: this.pagination.pageSize,
                    ...this.searchForm
                }

                const response = await fetchInventoryList(params)
                this.tableData = response.data.data
                this.pagination.total = response.data.total
                this.pagination.currentPage = response.data.currentPage
                this.pagination.pageSize = response.data.pageSize
            } catch (error) {
                console.error('加载库存数据失败:', error)
                this.$message.error('获取库存数据失败')
            } finally {
                this.loading = false
            }
        },

        // 加载统计数据
        async loadStatistics() {
            try {
                const response = await fetchInventoryStatistics()
                this.stats = response.data
            } catch (error) {
                console.error('加载统计数据失败:', error)
                // 使用默认值，不显示错误
            }
        },

        // 搜索
        handleSearch() {
            this.pagination.currentPage = 1
            this.loadData()
        },

        // 重置搜索
        resetSearch() {
            this.searchForm = {
                materialCode: '',
                materialName: '',
                warehouse: '',
                stockStatus: ''
            }
            this.pagination.currentPage = 1
            this.loadData()
        },

        // 刷新数据
        refreshData() {
            this.loadData()
            this.loadStatistics()
            this.$message.success('数据已刷新')
        },

        // 导出数据
        exportData() {
            this.$message.success('导出功能开发中')
        },

        // 分页大小改变
        handleSizeChange(val) {
            this.pagination.pageSize = val
            this.pagination.currentPage = 1
            this.loadData()
        },

        // 当前页改变
        handleCurrentChange(val) {
            this.pagination.currentPage = val
            this.loadData()
        },

        // 获取行样式
        getRowClassName({ row }) {
            if (row.status === 'shortage') {
                return 'shortage-row'
            } else if (row.status === 'overstock') {
                return 'overstock-row'
            }
            return ''
        },

        // 获取库存数量样式
        getStockClass(row) {
            if (row.status === 'shortage') {
                return 'text-danger'
            } else if (row.status === 'overstock') {
                return 'text-warning'
            }
            return 'text-success'
        },

        // 获取仓库标签类型
        getWarehouseType(warehouse) {
            const typeMap = {
                raw: '',
                finished: 'success',
                semi: 'warning'
            }
            return typeMap[warehouse] || ''
        },

        // 获取仓库名称
        getWarehouseName(warehouse) {
            const nameMap = {
                raw: '原料仓',
                finished: '成品仓',
                semi: '半成品仓'
            }
            return nameMap[warehouse] || warehouse
        },

        // 获取状态标签类型
        getStatusType(status) {
            const typeMap = {
                normal: 'success',
                shortage: 'danger',
                overstock: 'warning'
            }
            return typeMap[status] || ''
        },

        // 获取状态文本
        getStatusText(status) {
            const textMap = {
                normal: '正常',
                shortage: '缺货',
                overstock: '超储'
            }
            return textMap[status] || status
        },

        // 查看详情
        viewDetail(row) {
            this.$message.info(`查看物料 ${row.materialCode} 的详细信息`)
        },

        // 库存调整
        adjustStock(row) {
            this.adjustForm = {
                materialCode: row.materialCode,
                materialName: row.materialName,
                currentStock: row.currentStock,
                adjustType: 'in',
                adjustQuantity: 0,
                reason: '',
                materialId: row.id || row._id
            }
            this.adjustDialogVisible = true
        },

        // 提交库存调整
        async submitAdjust() {
            this.$refs.adjustForm.validate(async (valid) => {
                if (valid) {
                    try {
                        const adjustData = {
                            materialId: this.adjustForm.materialId,
                            adjustType: this.adjustForm.adjustType,
                            adjustQuantity: this.adjustForm.adjustQuantity,
                            reason: this.adjustForm.reason,
                            operator: '当前用户', // 应该从用户状态中获取
                            operatorId: 'user_id' // 应该从用户状态中获取
                        }

                        await adjustInventory(adjustData)
                        this.$message.success('库存调整成功')
                        this.adjustDialogVisible = false
                        this.loadData()
                        this.loadStatistics()
                    } catch (error) {
                        console.error('库存调整失败:', error)
                        this.$message.error('库存调整失败')
                    }
                }
            })
        },

        // 查看出入库记录
        async viewHistory(row) {
            try {
                const response = await fetchInventoryHistory({
                    materialCode: row.materialCode,
                    warehouse: row.warehouse
                })
                this.historyData = response.data
                this.historyDialogVisible = true
            } catch (error) {
                console.error('获取出入库记录失败:', error)
                this.$message.error('获取出入库记录失败')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.inventory-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.search-form {
    .el-form-item {
        margin-bottom: 10px;
    }
}

.stats-row {
    margin-bottom: 20px;
}

.stats-card {
    position: relative;

    .stats-content {
        .stats-number {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
        }

        .stats-label {
            font-size: 14px;
            color: #909399;
            margin-top: 5px;
        }
    }

    .stats-icon {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 32px;
        color: #C0C4CC;
    }

    &.normal .stats-icon {
        color: #67C23A;
    }

    &.warning .stats-icon {
        color: #E6A23C;
    }

    &.danger .stats-icon {
        color: #F56C6C;
    }
}

.table-card {
    .el-table {
        ::v-deep .shortage-row {
            background-color: #fef0f0;
        }

        ::v-deep .overstock-row {
            background-color: #fdf6ec;
        }
    }
}

.text-danger {
    color: #F56C6C;
    font-weight: bold;
}

.text-warning {
    color: #E6A23C;
    font-weight: bold;
}

.text-success {
    color: #67C23A;
    font-weight: bold;
}
</style>