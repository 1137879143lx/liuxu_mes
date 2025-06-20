<template>
  <div class="inventory-container">
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div slot="header" class="clearfix">
        <span>即时库存管理</span>
        <div style="float: right">
          <el-button type="success" icon="el-icon-upload2" @click="showImportDialog">导入库存</el-button>
          <el-button type="primary" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </div>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="物料编码">
          <el-input v-model="searchForm.materialCode" placeholder="请输入物料编码" clearable />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="searchForm.materialName" placeholder="请输入物料名称" clearable />
        </el-form-item>
        <!-- 新增版本搜索 -->
        <el-form-item label="版本">
          <el-input v-model="searchForm.version" placeholder="请输入版本" clearable />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouse" placeholder="请选择仓库" clearable>
            <el-option label="原料仓" value="原料仓" />
            <el-option label="成品仓" value="成品仓" />
            <el-option label="半成品仓" value="半成品仓" />
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
          <!-- 添加下拉导出选项 -->
          <el-dropdown @command="handleExportCommand">
            <el-button type="success" icon="el-icon-download">
              导出
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="current">导出当前搜索结果</el-dropdown-item>
              <el-dropdown-item command="all">导出所有数据</el-dropdown-item>
              <el-dropdown-item command="template">下载导入模板</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" :row-class-name="getRowClassName">
        <el-table-column prop="materialCode" label="物料编码" width="120" fixed="left">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewDetail(scope.row)">{{ scope.row.materialCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="200" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格型号" width="150" show-overflow-tooltip />
        <!-- 新增版本列 -->
        <el-table-column prop="version" label="版本" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.version" size="small" type="info">{{ scope.row.version }}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="warehouse" label="仓库" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getWarehouseType(scope.row.warehouse)">{{ getWarehouseName(scope.row.warehouse) }}</el-tag>
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
      <el-pagination
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        style="margin-top: 20px; text-align: center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>

    <!-- 导入库存对话框 -->
    <el-dialog title="导入库存数据" :visible.sync="importDialogVisible" width="900px" :before-close="resetImport">
      <div class="import-container">
        <!-- 操作步骤提示 -->
        <el-steps :active="importStep" align-center class="import-steps">
          <el-step title="上传文件" description="选择Excel文件" />
          <el-step title="数据预览" description="检查导入数据" />
          <el-step title="导入结果" description="查看导入结果" />
        </el-steps>

        <!-- 步骤1: 文件上传 -->
        <div v-if="importStep === 0" class="upload-section">
          <el-upload
            ref="upload"
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            accept=".xlsx,.xls"
            :limit="1">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将Excel文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              <p>只能上传xlsx/xls文件，文件大小不超过10MB</p>
              <p>请确保Excel文件包含以下列：物料编码、物料名称、规格型号、版本、单位、仓库、当前库存、安全库存、最大库存</p>
            </div>
          </el-upload>

          <div class="upload-actions">
            <el-button type="info" @click="downloadTemplate">下载导入模板</el-button>
            <el-button type="primary" @click="parseFile" :disabled="fileList.length === 0" :loading="parsing">解析文件</el-button>
          </div>
        </div>

        <!-- 步骤2: 数据预览 -->
        <div v-if="importStep === 1" class="preview-section">
          <div class="preview-header">
            <h4>数据预览 (共{{ previewData.length }}条记录)</h4>
            <div class="preview-stats">
              <el-tag type="success">有效: {{ validCount }}</el-tag>
              <el-tag type="danger">无效: {{ invalidCount }}</el-tag>
            </div>
          </div>

          <el-table :data="previewData.slice(0, 20)" border size="small" max-height="400" class="preview-table">
            <el-table-column type="index" label="行号" width="60" />
            <el-table-column prop="materialCode" label="物料编码" width="120" />
            <el-table-column prop="materialName" label="物料名称" width="150" />
            <el-table-column prop="specification" label="规格型号" width="120" />
            <!-- 新增版本列 -->
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="warehouse" label="仓库" width="100" />
            <el-table-column prop="currentStock" label="当前库存" width="100" />
            <el-table-column prop="safetyStock" label="安全库存" width="100" />
            <el-table-column prop="maxStock" label="最大库存" width="100" />
            <el-table-column label="状态" width="80" fixed="right">
              <template slot-scope="scope">
                <el-tag :type="scope.row.isValid ? 'success' : 'danger'" size="mini">
                  {{ scope.row.isValid ? '有效' : '无效' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="previewData.length > 20" class="preview-more">还有 {{ previewData.length - 20 }} 条数据未显示...</div>

          <!-- 错误数据列表 -->
          <div v-if="invalidItems.length > 0" class="error-section">
            <h4>数据错误详情：</h4>
            <el-table :data="invalidItems.slice(0, 10)" border size="small" max-height="200">
              <el-table-column prop="rowIndex" label="行号" width="80" />
              <el-table-column prop="materialCode" label="物料编码" width="120" />
              <el-table-column prop="errors" label="错误信息" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span class="error-text">{{ scope.row.errors.join(', ') }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="preview-actions">
            <el-button @click="importStep = 0">上一步</el-button>
            <el-button type="primary" @click="confirmImport" :disabled="validCount === 0" :loading="importing">
              确认导入 ({{ validCount }}条)
            </el-button>
          </div>
        </div>

        <!-- 步骤3: 导入结果 -->
        <div v-if="importStep === 2" class="result-section">
          <el-result :icon="importResult.success ? 'success' : 'error'" :title="importResult.title" :subTitle="importResult.description">
            <template slot="extra">
              <div class="result-details">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="总记录数">{{ importResult.totalCount }}</el-descriptions-item>
                  <el-descriptions-item label="成功导入">
                    <span class="success-text">{{ importResult.successCount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="失败记录">
                    <span class="error-text">{{ importResult.failCount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="导入时间">{{ importResult.importTime }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <!-- 失败记录详情 -->
              <div v-if="importResult.errors && importResult.errors.length > 0" class="error-details">
                <h4>失败记录详情：</h4>
                <el-table :data="importResult.errors" border size="small" max-height="200">
                  <el-table-column prop="row" label="行号" width="80" />
                  <el-table-column prop="materialCode" label="物料编码" width="120" />
                  <el-table-column prop="message" label="失败原因" show-overflow-tooltip />
                </el-table>
              </div>

              <div class="result-actions">
                <el-button type="primary" @click="finishImport">完成</el-button>
                <el-button @click="restartImport">重新导入</el-button>
              </div>
            </template>
          </el-result>
        </div>
      </div>
    </el-dialog>

    <!-- 库存调整对话框 -->
    <el-dialog title="库存调整" :visible.sync="adjustDialogVisible" width="500px">
      <el-form ref="adjustForm" :model="adjustForm" :rules="adjustRules" label-width="100px">
        <el-form-item label="物料编码">
          <el-input v-model="adjustForm.materialCode" disabled />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="adjustForm.materialName" disabled />
        </el-form-item>
        <!-- 新增版本显示 -->
        <el-form-item label="版本">
          <el-input v-model="adjustForm.version" disabled />
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
          <el-input-number v-model="adjustForm.adjustQuantity" :min="0" :precision="2" controls-position="right" style="width: 100%" />
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

    <!-- 出入库记录对话框 - 不变 -->
    <!-- 出入库记录对话框 -->
    <el-dialog
      :title="`${currentHistoryMaterial ? currentHistoryMaterial.materialName : ''} - 出入库记录`"
      :visible.sync="historyDialogVisible"
      width="1200px">
      <div v-if="currentHistoryMaterial" class="history-container">
        <!-- 物料基本信息 -->
        <el-card class="material-info" shadow="never">
          <div class="info-content">
            <div class="info-item">
              <label>物料编码：</label>
              <span>{{ currentHistoryMaterial.materialCode }}</span>
            </div>
            <div class="info-item">
              <label>物料名称：</label>
              <span>{{ currentHistoryMaterial.materialName }}</span>
            </div>
            <div class="info-item">
              <label>规格型号：</label>
              <span>{{ currentHistoryMaterial.specification || '--' }}</span>
            </div>
            <div class="info-item">
              <label>版本：</label>
              <span>{{ currentHistoryMaterial.version || '--' }}</span>
            </div>
            <div class="info-item">
              <label>仓库：</label>
              <span>{{ currentHistoryMaterial.warehouse }}</span>
            </div>
            <div class="info-item">
              <label>当前库存：</label>
              <span class="stock-value">{{ currentHistoryMaterial.currentStock }} {{ currentHistoryMaterial.unit }}</span>
            </div>
          </div>
        </el-card>

        <!-- 筛选条件 -->
        <el-card class="filter-card" shadow="never">
          <el-form :inline="true" :model="historyFilter" class="filter-form">
            <el-form-item label="交易类型">
              <el-select v-model="historyFilter.transactionType" placeholder="全部" clearable>
                <el-option label="入库" value="in" />
                <el-option label="出库" value="out" />
                <el-option label="调整" value="adjust" />
              </el-select>
            </el-form-item>
            <el-form-item label="业务类型">
              <el-select v-model="historyFilter.businessType" placeholder="全部" clearable>
                <el-option label="采购入库" value="purchase" />
                <el-option label="生产入库" value="production" />
                <el-option label="销售出库" value="sale" />
                <el-option label="生产出库" value="production" />
                <el-option label="调拨" value="transfer" />
                <el-option label="退货" value="return" />
                <el-option label="库存调整" value="adjust" />
                <el-option label="报废" value="scrap" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="filterHistory">查询</el-button>
              <el-button @click="resetHistoryFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 出入库记录表格 -->
        <el-card class="table-card" shadow="never">
          <el-table v-loading="historyLoading" :data="historyData" border stripe style="width: 100%" empty-text="暂无出入库记录">
            <el-table-column prop="createTime" label="交易时间" width="160" align="center">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>

            <el-table-column prop="transactionType" label="交易类型" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getTransactionTypeColor(scope.row.transactionType)" size="small">
                  {{ getTransactionTypeName(scope.row.transactionType) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="businessType" label="业务类型" width="120" align="center">
              <template slot-scope="scope">
                <el-tag :type="getBusinessTypeColor(scope.row.businessType)" size="small">
                  {{ getBusinessTypeName(scope.row.businessType) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="quantity" label="变动数量" width="120" align="right">
              <template slot-scope="scope">
                <span :class="scope.row.quantity > 0 ? 'text-success' : 'text-danger'">
                  {{ scope.row.quantity > 0 ? '+' : '' }}{{ scope.row.quantity }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="stockBefore" label="变动前库存" width="120" align="right">
              <template slot-scope="scope">
                {{ scope.row.stockBefore }}
              </template>
            </el-table-column>

            <el-table-column prop="stockAfter" label="变动后库存" width="120" align="right">
              <template slot-scope="scope">
                {{ scope.row.stockAfter }}
              </template>
            </el-table-column>

            <el-table-column prop="reason" label="变动原因" min-width="200" show-overflow-tooltip />

            <el-table-column prop="operator" label="操作人" width="100" align="center" />

            <el-table-column prop="referenceNo" label="关联单据" width="150" align="center">
              <template slot-scope="scope">
                <el-link v-if="scope.row.referenceNo" type="primary" @click="viewReference(scope.row)">
                  {{ scope.row.referenceNo }}
                </el-link>
                <span v-else>--</span>
              </template>
            </el-table-column>

            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          </el-table>

          <!-- 分页 -->
          <el-pagination
            :current-page="historyPagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="historyPagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="historyPagination.total"
            style="margin-top: 20px; text-align: center"
            @size-change="
              (val) => {
                historyPagination.pageSize = val
                historyPagination.currentPage = 1
                loadHistoryData()
              }
            "
            @current-change="handleHistoryPageChange" />
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchInventoryList,
  fetchInventoryStatistics,
  adjustInventory,
  fetchInventoryHistory,
  importInventory,
  exportInventory
} from '@/api/inventory'
import * as XLSX from 'xlsx'

export default {
  name: 'InventoryRealTime',
  data() {
    return {
      // 导入相关
      importDialogVisible: false,
      importStep: 0, // 0: 上传, 1: 预览, 2: 结果
      fileList: [],
      parsing: false,
      importing: false,
      previewData: [],
      importResult: null,

      // 统计信息
      validCount: 0,
      invalidCount: 0,
      invalidItems: [],

      loading: false,
      searchForm: {
        materialCode: '',
        materialName: '',
        version: '', // 新增版本搜索字段
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
        version: '', // 新增版本字段
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
      // 出入库记录相关
      historyDialogVisible: false,
      historyData: [],
      historyLoading: false,
      currentHistoryMaterial: null, // 当前查看记录的物料信息
      historyFilter: {
        transactionType: '',
        businessType: ''
      },
      historyPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }
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

    // 加载统计数据 - 修复错误处理
    async loadStatistics() {
      try {
        console.log('开始加载统计数据...')
        const response = await fetchInventoryStatistics()

        console.log('统计数据响应:', response)

        if (response.code === 200) {
          this.stats = {
            totalItems: response.data.totalItems || 0,
            normalStock: response.data.normalStock || 0,
            shortageStock: response.data.shortageStock || 0,
            overstockItems: response.data.overstockItems || 0
          }
          console.log('统计数据更新成功:', this.stats)
        } else {
          console.warn('获取统计数据失败:', response.message)
          // 使用默认值
          this.stats = {
            totalItems: 0,
            normalStock: 0,
            shortageStock: 0,
            overstockItems: 0
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 使用默认值，不显示错误消息
        this.stats = {
          totalItems: 0,
          normalStock: 0,
          shortageStock: 0,
          overstockItems: 0
        }
      }
    },

    // 刷新数据 - 确保统计数据也被刷新
    refreshData() {
      Promise.all([this.loadData(), this.loadStatistics()])
        .then(() => {
          this.$message.success('数据已刷新')
        })
        .catch((error) => {
          console.error('刷新数据失败:', error)
          this.$message.error('刷新数据失败')
        })
    },

    // 在导入成功后刷新统计数据
    async confirmImport() {
      const validItems = this.previewData.filter((item) => item.isValid)

      if (validItems.length === 0) {
        this.$message.warning('没有有效的数据可以导入')
        return
      }

      this.importing = true
      try {
        const response = await importInventory(validItems)

        this.importResult = {
          success: response.code === 200,
          title: response.code === 200 ? '导入成功' : '导入失败',
          description: response.message,
          totalCount: validItems.length,
          successCount: response.data?.successCount || 0,
          failCount: response.data?.failCount || 0,
          errors: response.data?.errors || [],
          importTime: new Date().toLocaleString()
        }

        this.importStep = 2

        // 刷新页面数据和统计数据
        if (response.code === 200) {
          await Promise.all([this.loadData(), this.loadStatistics()])
        }
      } catch (error) {
        console.error('导入失败:', error)
        this.importResult = {
          success: false,
          title: '导入失败',
          description: error.message || '导入过程中发生错误',
          totalCount: validItems.length,
          successCount: 0,
          failCount: validItems.length,
          errors: [],
          importTime: new Date().toLocaleString()
        }
        this.importStep = 2
      } finally {
        this.importing = false
      }
    },

    // 在库存调整成功后刷新统计数据
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

            // 刷新数据和统计
            await Promise.all([this.loadData(), this.loadStatistics()])
          } catch (error) {
            console.error('库存调整失败:', error)
            this.$message.error('库存调整失败: ' + (error.message || '未知错误'))
          }
        }
      })
    },

    // ...existing methods...

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
        version: '', // 重置版本字段
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

    // 处理导出命令
    handleExportCommand(command) {
      switch (command) {
        case 'current':
          this.exportData()
          break
        case 'all':
          this.exportAllData()
          break
        case 'template':
          this.downloadTemplate()
          break
        default:
          break
      }
    },

    // 导出数据 - 完善实现
    async exportData() {
      try {
        this.$message.info('正在导出数据，请稍候...')

        // 使用当前搜索条件导出数据
        const params = {
          materialCode: this.searchForm.materialCode,
          materialName: this.searchForm.materialName,
          version: this.searchForm.version,
          warehouse: this.searchForm.warehouse,
          stockStatus: this.searchForm.stockStatus
        }

        // 调用后端导出API
        const response = await exportInventory(params)

        if (response.code === 200) {
          const exportData = response.data

          if (!exportData || exportData.length === 0) {
            this.$message.warning('没有数据可以导出')
            return
          }

          // 创建Excel工作簿
          const wb = XLSX.utils.book_new()

          // 转换数据格式，确保所有字段都包含
          const formattedData = exportData.map((item, index) => ({
            序号: index + 1,
            物料编码: item['物料编码'] || item.materialCode || '',
            物料名称: item['物料名称'] || item.materialName || '',
            规格型号: item['规格型号'] || item.specification || '',
            版本: item['版本'] || item.version || '',
            单位: item['单位'] || item.unit || '',
            仓库: item['仓库'] || item.warehouse || '',
            当前库存: item['当前库存'] || item.currentStock || 0,
            安全库存: item['安全库存'] || item.safetyStock || 0,
            最大库存: item['最大库存'] || item.maxStock || 0,
            库存状态: item['库存状态'] || this.getStatusText(item.status) || '',
            最后更新时间: item['最后更新时间'] || this.formatDateTime(item.lastUpdateTime) || ''
          }))

          // 创建工作表
          const ws = XLSX.utils.json_to_sheet(formattedData)

          // 设置列宽
          const colWidths = [
            { wch: 8 }, // 序号
            { wch: 15 }, // 物料编码
            { wch: 25 }, // 物料名称
            { wch: 20 }, // 规格型号
            { wch: 12 }, // 版本
            { wch: 8 }, // 单位
            { wch: 12 }, // 仓库
            { wch: 12 }, // 当前库存
            { wch: 12 }, // 安全库存
            { wch: 12 }, // 最大库存
            { wch: 12 }, // 库存状态
            { wch: 20 } // 最后更新时间
          ]
          ws['!cols'] = colWidths

          // 设置表头样式
          const headerRow = 1
          const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1']

          headerCells.forEach((cell) => {
            if (ws[cell]) {
              ws[cell].s = {
                font: { bold: true, sz: 12 },
                fill: { fgColor: { rgb: 'E6F3FF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                  top: { style: 'thin' },
                  bottom: { style: 'thin' },
                  left: { style: 'thin' },
                  right: { style: 'thin' }
                }
              }
            }
          })

          // 添加工作表到工作簿
          XLSX.utils.book_append_sheet(wb, ws, '库存数据')

          // 生成文件名
          const now = new Date()
          const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-')
          let fileName = `库存数据导出_${timestamp}.xlsx`

          // 如果有搜索条件，在文件名中体现
          const searchConditions = []
          if (this.searchForm.materialCode) searchConditions.push(`物料编码_${this.searchForm.materialCode}`)
          if (this.searchForm.materialName) searchConditions.push(`物料名称_${this.searchForm.materialName}`)
          if (this.searchForm.version) searchConditions.push(`版本_${this.searchForm.version}`)
          if (this.searchForm.warehouse) searchConditions.push(`仓库_${this.searchForm.warehouse}`)
          if (this.searchForm.stockStatus) searchConditions.push(`状态_${this.getStatusText(this.searchForm.stockStatus)}`)

          if (searchConditions.length > 0) {
            const conditionStr = searchConditions.join('_')
            fileName = `库存数据导出_${conditionStr}_${timestamp}.xlsx`
          }

          // 下载文件
          XLSX.writeFile(wb, fileName)

          this.$message.success(`导出成功！共导出 ${formattedData.length} 条数据`)

          // 记录导出日志（可选）
          console.log('库存数据导出完成:', {
            fileName,
            recordCount: formattedData.length,
            exportTime: now.toISOString(),
            searchConditions: this.searchForm
          })
        } else {
          this.$message.error(response.message || '导出失败')
        }
      } catch (error) {
        console.error('导出数据失败:', error)
        this.$message.error('导出失败：' + (error.message || '网络错误'))
      }
    },

    // 批量导出（可选：导出所有数据而不仅仅是当前页）
    async exportAllData() {
      try {
        this.$confirm('是否导出所有库存数据？这可能需要较长时间。', '确认导出', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            this.$message.info('正在导出所有数据，请稍候...')

            // 导出所有数据（不分页）
            const params = {
              materialCode: this.searchForm.materialCode,
              materialName: this.searchForm.materialName,
              version: this.searchForm.version,
              warehouse: this.searchForm.warehouse,
              stockStatus: this.searchForm.stockStatus,
              exportAll: true // 标识导出所有数据
            }

            const response = await exportInventory(params)

            if (response.code === 200) {
              // 使用相同的导出逻辑
              await this.processExportData(response.data, '全部库存数据导出')
            } else {
              this.$message.error(response.message || '导出失败')
            }
          })
          .catch(() => {
            this.$message.info('已取消导出')
          })
      } catch (error) {
        console.error('批量导出失败:', error)
        this.$message.error('批量导出失败：' + (error.message || '网络错误'))
      }
    },

    // 处理导出数据的通用方法
    async processExportData(exportData, filePrefix = '库存数据导出') {
      if (!exportData || exportData.length === 0) {
        this.$message.warning('没有数据可以导出')
        return
      }

      // 创建Excel工作簿和工作表
      const wb = XLSX.utils.book_new()

      // 格式化数据
      const formattedData = exportData.map((item, index) => ({
        序号: index + 1,
        物料编码: item['物料编码'] || item.materialCode || '',
        物料名称: item['物料名称'] || item.materialName || '',
        规格型号: item['规格型号'] || item.specification || '',
        版本: item['版本'] || item.version || '',
        单位: item['单位'] || item.unit || '',
        仓库: item['仓库'] || item.warehouse || '',
        当前库存: item['当前库存'] || item.currentStock || 0,
        安全库存: item['安全库存'] || item.safetyStock || 0,
        最大库存: item['最大库存'] || item.maxStock || 0,
        库存状态: item['库存状态'] || this.getStatusText(item.status) || '',
        最后更新时间: item['最后更新时间'] || this.formatDateTime(item.lastUpdateTime) || ''
      }))

      const ws = XLSX.utils.json_to_sheet(formattedData)

      // 设置列宽和样式（与之前相同）
      const colWidths = [
        { wch: 8 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 }
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, '库存数据')

      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const fileName = `${filePrefix}_${timestamp}.xlsx`

      // 下载文件
      XLSX.writeFile(wb, fileName)
      this.$message.success(`导出成功！共导出 ${formattedData.length} 条数据`)
    },

    // 格式化日期时间（如果之前没有的话）
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    // ...existing methods...

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
        version: row.version || '', // 包含版本信息
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
      this.currentHistoryMaterial = row
      this.historyDialogVisible = true
      this.historyPagination.currentPage = 1
      this.resetHistoryFilter()
      await this.loadHistoryData()
    },

    // 加载出入库记录数据
    async loadHistoryData() {
      if (!this.currentHistoryMaterial) return

      this.historyLoading = true
      try {
        const params = {
          materialCode: this.currentHistoryMaterial.materialCode,
          warehouse: this.currentHistoryMaterial.warehouse,
          page: this.historyPagination.currentPage,
          limit: this.historyPagination.pageSize,
          ...this.historyFilter
        }

        const response = await fetchInventoryHistory(params)

        if (response.code === 200) {
          this.historyData = response.data.data || []
          this.historyPagination.total = response.data.total || 0
          this.historyPagination.currentPage = response.data.currentPage || 1
          this.historyPagination.pageSize = response.data.pageSize || 20
        } else {
          this.$message.error(response.message || '获取出入库记录失败')
          this.historyData = []
        }
      } catch (error) {
        console.error('获取出入库记录失败:', error)
        this.$message.error('获取出入库记录失败')
        this.historyData = []
      } finally {
        this.historyLoading = false
      }
    },

    // 筛选历史记录
    filterHistory() {
      this.historyPagination.currentPage = 1
      this.loadHistoryData()
    },

    // 重置历史记录筛选
    resetHistoryFilter() {
      this.historyFilter = {
        transactionType: '',
        businessType: ''
      }
      this.historyPagination.currentPage = 1
      this.loadHistoryData()
    },

    // 历史记录分页改变
    handleHistoryPageChange(page) {
      this.historyPagination.currentPage = page
      this.loadHistoryData()
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    // 获取交易类型名称
    getTransactionTypeName(type) {
      const nameMap = {
        in: '入库',
        out: '出库',
        adjust: '调整'
      }
      return nameMap[type] || type
    },

    // 获取交易类型颜色
    getTransactionTypeColor(type) {
      const colorMap = {
        in: 'success',
        out: 'warning',
        adjust: 'info'
      }
      return colorMap[type] || ''
    },

    // 获取业务类型名称
    getBusinessTypeName(type) {
      const nameMap = {
        purchase: '采购',
        production: '生产',
        sale: '销售',
        transfer: '调拨',
        return: '退货',
        adjust: '调整',
        scrap: '报废'
      }
      return nameMap[type] || type
    },

    // 获取业务类型颜色
    getBusinessTypeColor(type) {
      const colorMap = {
        purchase: 'success',
        production: 'primary',
        sale: 'warning',
        transfer: 'info',
        return: 'danger',
        adjust: '',
        scrap: 'danger'
      }
      return colorMap[type] || ''
    },

    // 查看关联单据
    viewReference(row) {
      if (!row.referenceNo) return

      // 根据业务类型跳转到对应页面
      const businessTypeRouteMap = {
        purchase: '/warehouse/inbound',
        production: '/warehouse/inbound',
        sale: '/warehouse/outbound',
        transfer: '/warehouse/transfer',
        return: '/warehouse/return'
      }

      const route = businessTypeRouteMap[row.businessType]
      if (route) {
        // 这里可以实现跳转到对应单据详情页
        this.$message.info(`查看关联单据：${row.referenceNo}`)
        // this.$router.push(`${route}?no=${row.referenceNo}`)
      } else {
        this.$message.info(`关联单据：${row.referenceNo}`)
      }
    },

    // 显示导入对话框
    showImportDialog() {
      this.importDialogVisible = true
      this.resetImport()
    },

    // 重置导入状态
    resetImport() {
      this.importStep = 0
      this.fileList = []
      this.previewData = []
      this.importResult = null
      this.parsing = false
      this.importing = false
      this.validCount = 0
      this.invalidCount = 0
      this.invalidItems = []
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },

    // 下载导入模板
    downloadTemplate() {
      // 创建模板数据
      const templateData = [
        {
          物料编码: 'M001',
          物料名称: '电阻器10K',
          规格型号: '0603',
          版本: 'V1.0', // 新增版本字段
          单位: '个',
          仓库: '原料仓',
          当前库存: 100,
          安全库存: 10,
          最大库存: 1000,
          备注: '示例数据'
        },
        {
          物料编码: 'M002',
          物料名称: '电容器100uF',
          规格型号: '贴片',
          版本: 'V2.1', // 新增版本字段
          单位: '个',
          仓库: '原料仓',
          当前库存: 50,
          安全库存: 5,
          最大库存: 500,
          备注: '示例数据'
        },
        {
          物料编码: 'M003',
          物料名称: 'PCB板',
          规格型号: '双层板',
          版本: 'V1.5', // 新增版本字段
          单位: '片',
          仓库: '半成品仓',
          当前库存: 20,
          安全库存: 2,
          最大库存: 200,
          备注: '示例数据'
        }
      ]

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(templateData)

      // 设置列宽 - 包含版本列
      const colWidths = [
        { wch: 15 }, // 物料编码
        { wch: 20 }, // 物料名称
        { wch: 15 }, // 规格型号
        { wch: 10 }, // 版本
        { wch: 8 }, // 单位
        { wch: 12 }, // 仓库
        { wch: 12 }, // 当前库存
        { wch: 12 }, // 安全库存
        { wch: 12 }, // 最大库存
        { wch: 20 } // 备注
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, '库存导入模板')

      // 下载文件
      const fileName = `库存导入模板_${new Date().getTime()}.xlsx`
      XLSX.writeFile(wb, fileName)
      this.$message.success('模板下载成功')
    },

    // 文件选择改变
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },

    // 文件移除
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      this.previewData = []
    },

    // 解析文件
    parseFile() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先选择要导入的文件')
        return
      }

      const file = this.fileList[0].raw

      // 检查文件类型和大小
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传 Excel 文件!')
        return
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        return
      }

      this.parsing = true

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          this.processImportData(jsonData)
        } catch (error) {
          console.error('解析Excel文件失败:', error)
          this.$message.error('解析Excel文件失败，请检查文件格式')
        } finally {
          this.parsing = false
        }
      }
      reader.readAsArrayBuffer(file)
    },

    // 处理导入数据 - 更新包含版本字段
    processImportData(jsonData) {
      if (!jsonData || jsonData.length === 0) {
        this.$message.warning('Excel文件中没有数据')
        return
      }

      this.previewData = jsonData.map((row, index) => {
        const item = {
          materialCode: this.getFieldValue(row, ['物料编码', 'materialCode']),
          materialName: this.getFieldValue(row, ['物料名称', 'materialName']),
          specification: this.getFieldValue(row, ['规格型号', 'specification']) || '',
          version: this.getFieldValue(row, ['版本', 'version']) || '', // 新增版本字段处理
          unit: this.getFieldValue(row, ['单位', 'unit']),
          warehouse: this.getFieldValue(row, ['仓库', 'warehouse']),
          currentStock: Number(this.getFieldValue(row, ['当前库存', 'currentStock'])) || 0,
          safetyStock: Number(this.getFieldValue(row, ['安全库存', 'safetyStock'])) || 0,
          maxStock: Number(this.getFieldValue(row, ['最大库存', 'maxStock'])) || 0,
          remark: this.getFieldValue(row, ['备注', 'remark']) || '',
          rowIndex: index + 2, // Excel行号从2开始（第1行是表头）
          errors: []
        }

        // 数据验证
        this.validateImportItem(item)
        return item
      })

      // 统计有效和无效数据
      this.validCount = this.previewData.filter((item) => item.isValid).length
      this.invalidCount = this.previewData.filter((item) => !item.isValid).length
      this.invalidItems = this.previewData.filter((item) => !item.isValid)

      if (this.previewData.length > 0) {
        this.importStep = 1
        this.$message.success(`成功解析 ${this.previewData.length} 条数据`)
      }
    },

    // 获取字段值（支持多种字段名）
    getFieldValue(row, fieldNames) {
      for (const fieldName of fieldNames) {
        if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
          return row[fieldName]
        }
      }
      return ''
    },

    // 验证导入数据项
    validateImportItem(item) {
      item.errors = []

      // 必填字段验证
      if (!item.materialCode) {
        item.errors.push('物料编码不能为空')
      }
      if (!item.materialName) {
        item.errors.push('物料名称不能为空')
      }
      if (!item.unit) {
        item.errors.push('单位不能为空')
      }
      if (!item.warehouse) {
        item.errors.push('仓库不能为空')
      }

      // 数值验证
      if (item.currentStock < 0) {
        item.errors.push('当前库存不能为负数')
      }
      if (item.safetyStock < 0) {
        item.errors.push('安全库存不能为负数')
      }
      if (item.maxStock < 0) {
        item.errors.push('最大库存不能为负数')
      }
      if (item.maxStock > 0 && item.safetyStock > item.maxStock) {
        item.errors.push('安全库存不能大于最大库存')
      }

      // 仓库值验证
      const validWarehouses = ['原料仓', '成品仓', '半成品仓', '耗材仓']
      if (item.warehouse && !validWarehouses.includes(item.warehouse)) {
        item.errors.push('仓库值无效，请选择：' + validWarehouses.join('、'))
      }

      item.isValid = item.errors.length === 0
    },

    // 确认导入
    async confirmImport() {
      const validItems = this.previewData.filter((item) => item.isValid)

      if (validItems.length === 0) {
        this.$message.warning('没有有效的数据可以导入')
        return
      }

      this.importing = true
      try {
        const response = await importInventory(validItems)

        this.importResult = {
          success: response.code === 200,
          title: response.code === 200 ? '导入成功' : '导入失败',
          description: response.message,
          totalCount: validItems.length,
          successCount: response.data?.successCount || 0,
          failCount: response.data?.failCount || 0,
          errors: response.data?.errors || [],
          importTime: new Date().toLocaleString()
        }

        this.importStep = 2

        // 刷新页面数据
        if (response.code === 200) {
          this.loadData()
          this.loadStatistics()
        }
      } catch (error) {
        console.error('导入失败:', error)
        this.importResult = {
          success: false,
          title: '导入失败',
          description: error.message || '导入过程中发生错误',
          totalCount: validItems.length,
          successCount: 0,
          failCount: validItems.length,
          errors: [],
          importTime: new Date().toLocaleString()
        }
        this.importStep = 2
      } finally {
        this.importing = false
      }
    },

    // 完成导入
    finishImport() {
      this.importDialogVisible = false
      this.resetImport()
    },

    // 重新导入
    restartImport() {
      this.resetImport()
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
    color: #c0c4cc;
  }

  &.normal .stats-icon {
    color: #67c23a;
  }

  &.warning .stats-icon {
    color: #e6a23c;
  }

  &.danger .stats-icon {
    color: #f56c6c;
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
  color: #f56c6c;
  font-weight: bold;
}

.text-warning {
  color: #e6a23c;
  font-weight: bold;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.import-container {
  .import-steps {
    margin-bottom: 30px;
  }

  .upload-section {
    text-align: center;

    .upload-demo {
      margin-bottom: 20px;
    }

    .upload-actions {
      margin-top: 20px;

      .el-button {
        margin: 0 10px;
      }
    }
  }

  .preview-section {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h4 {
        margin: 0;
        color: #303133;
      }

      .preview-stats {
        .el-tag {
          margin-left: 10px;
        }
      }
    }

    .preview-table {
      margin-bottom: 15px;
    }

    .preview-more {
      text-align: center;
      color: #909399;
      padding: 10px;
      background-color: #f5f7fa;
      margin-bottom: 20px;
    }

    .error-section {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #f56c6c;
      }

      .error-text {
        color: #f56c6c;
      }
    }

    .preview-actions {
      text-align: center;
      margin-top: 20px;

      .el-button {
        margin: 0 10px;
      }
    }
  }

  .result-section {
    .result-details {
      margin: 20px 0;
    }

    .success-text {
      color: #67c23a;
      font-weight: bold;
    }

    .error-text {
      color: #f56c6c;
      font-weight: bold;
    }

    .error-details {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #f56c6c;
      }
    }

    .result-actions {
      margin-top: 20px;

      .el-button {
        margin: 0 10px;
      }
    }
  }
}
// 在<style>标签中添加以下样式
.history-container {
  .material-info {
    margin-bottom: 20px;

    .info-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;

      .info-item {
        display: flex;
        align-items: center;

        label {
          font-weight: bold;
          color: #606266;
          margin-right: 8px;
          min-width: 80px;
        }

        span {
          color: #303133;

          &.stock-value {
            font-weight: bold;
            color: #409eff;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    .el-table {
      .text-success {
        color: #67c23a;
        font-weight: bold;
      }

      .text-danger {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
}
</style>
