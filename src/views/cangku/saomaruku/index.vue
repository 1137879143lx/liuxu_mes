<template></template>
<template>
  <div class="material-card-container">
    <!-- 顶部操作栏 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-header">
        <div class="header-left">
          <i class="el-icon-price-tag header-icon"></i>
          <span class="header-title">物料标识卡管理</span>
        </div>
        <div class="header-right">
          <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog">新建标识卡</el-button>
          <el-button type="success" icon="el-icon-camera" @click="showScanDialog">扫码入库</el-button>
          <el-button type="warning" icon="el-icon-printer" @click="batchPrint">批量打印</el-button>
        </div>
      </div>
    </el-card>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="物料编码">
          <el-input
            v-model="searchForm.materialCode"
            @keyup.enter="handleSearch"
            placeholder="请输入物料编码"
            clearable
            prefix-icon="el-icon-goods" />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input
            v-model="searchForm.materialName"
            @keyup.enter="handleSearch"
            placeholder="请输入物料名称"
            clearable
            prefix-icon="el-icon-collection-tag" />
        </el-form-item>
        <el-form-item label="批号">
          <el-input v-model="searchForm.batchNo" @keyup.enter="handleSearch" placeholder="请输入批号" clearable prefix-icon="el-icon-postcard" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh-left" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 标识卡列表 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="table-header">
        <span class="table-title">标识卡列表</span>
        <el-tag v-if="pagination.total > 0" type="info" size="small">共 {{ pagination.total }} 张标识卡</el-tag>
      </div>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>

        <el-table-column prop="materialName" label="物料品名" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="material-name-cell">
              <span class="material-name">{{ scope.row.materialName }}</span>
              <el-tag v-if="scope.row.isUrgent" size="mini" type="danger">紧急</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="materialCode" label="物料编码" width="160" align="center">
          <template slot-scope="scope">
            <span class="material-code">{{ scope.row.materialCode }}</span>
          </template>
        </el-table-column>

        <el-table-column label="版本信息" width="200" align="center">
          <template slot-scope="scope">
            <div class="version-info">
              <span class="version">版本: {{ scope.row.version }}</span>
              <span class="batch-no">批号: {{ scope.row.batchNo }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="outDate" label="出货日期" width="120" align="center">
          <template slot-scope="scope">
            <span class="date-text">{{ formatDate(scope.row.outDate) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="quantity" label="数量" width="100" align="center">
          <template slot-scope="scope">
            <span class="quantity-text">{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160" align="center">
          <template slot-scope="scope">
            <span class="create-time">{{ formatDateTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="previewCard(scope.row)">预览</el-button>
            <el-button size="mini" type="success" icon="el-icon-printer" @click="printCard(scope.row)">打印</el-button>
            <el-button size="mini" type="info" icon="el-icon-edit" @click="editCard(scope.row)">编辑</el-button>
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

    <!-- 扫码入库对话框 -->
    <el-dialog title="扫码入库" :visible.sync="scanDialogVisible" width="800px">
      <div class="scan-container">
        <div class="scan-left">
          <div class="scan-area">
            <div v-if="!scanResult" class="scan-placeholder">
              <i class="el-icon-camera scan-icon"></i>
              <p>请扫描物料二维码或条形码</p>
              <el-button type="primary" @click="startScan">开始扫描</el-button>
            </div>
            <div v-else class="scan-result">
              <i class="el-icon-success scan-success-icon"></i>
              <p>扫描成功！</p>
              <div class="scan-info">{{ scanResult }}</div>
            </div>
          </div>
          <div class="scan-actions">
            <el-button @click="clearScan">清除</el-button>
            <el-button type="primary" @click="confirmScan" :disabled="!scanResult">确认入库</el-button>
          </div>
        </div>
        <div class="scan-right">
          <h4>扫描历史</h4>
          <div class="scan-history">
            <div v-for="(item, index) in scanHistory" :key="index" class="history-item">
              <span class="history-code">{{ item.code }}</span>
              <span class="history-time">{{ formatTime(item.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新建/编辑标识卡对话框 -->
    <el-dialog :title="isEdit ? '编辑标识卡' : '新建标识卡'" :visible.sync="cardDialogVisible" width="1000px">
      <el-form ref="cardForm" :model="cardForm" :rules="cardRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料品名" prop="materialName">
              <el-input v-model="cardForm.materialName" placeholder="请输入物料品名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料编码" prop="materialCode">
              <el-input v-model="cardForm.materialCode" placeholder="请输入物料编码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="版本" prop="version">
              <el-input v-model="cardForm.version" placeholder="请输入版本" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="批号" prop="batchNo">
              <el-input v-model="cardForm.batchNo" placeholder="请输入批号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出货日期" prop="outDate">
              <el-date-picker
                v-model="cardForm.outDate"
                type="date"
                placeholder="选择出货日期"
                format="yyyy/MM/dd"
                value-format="yyyy-MM-dd"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="cardForm.quantity" :min="1" placeholder="请输入数量" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="cardForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cardDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCard">保存</el-button>
        <el-button type="success" @click="previewAndSave">预览并保存</el-button>
      </div>
    </el-dialog>

    <!-- 标识卡预览对话框 -->
    <el-dialog title="标识卡预览" :visible.sync="previewDialogVisible" width="600px">
      <div class="card-preview">
        <div class="material-card" ref="printCard">
          <div class="card-header">
            <h2>重庆梅杰电子有限公司</h2>
            <h3>物料标识卡</h3>
          </div>
          <table class="card-table">
            <tr>
              <td class="label-cell">物料品名</td>
              <td class="value-cell" colspan="3">{{ previewData.materialName }}</td>
            </tr>
            <tr>
              <td class="label-cell">物料编码</td>
              <td class="value-cell" colspan="3">{{ previewData.materialCode }}</td>
            </tr>
            <tr>
              <td class="label-cell">版本</td>
              <td class="value-cell">{{ previewData.version }}</td>
              <td class="label-cell">批号</td>
              <td class="value-cell">{{ previewData.batchNo }}</td>
            </tr>
            <tr>
              <td class="label-cell">出货日期</td>
              <td class="value-cell">{{ formatDate(previewData.outDate) }}</td>
              <td class="label-cell">数量</td>
              <td class="value-cell">{{ previewData.quantity }}</td>
            </tr>
          </table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="printPreviewCard">打印</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MaterialCard',
  data() {
    return {
      loading: false,

      // 搜索表单
      searchForm: {
        materialCode: '',
        materialName: '',
        batchNo: '',
        dateRange: null
      },

      // 表格数据
      tableData: [],
      selectedRows: [],

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 对话框控制
      scanDialogVisible: false,
      cardDialogVisible: false,
      previewDialogVisible: false,

      // 扫码相关
      scanResult: '',
      scanHistory: [],

      // 表单数据
      isEdit: false,
      cardForm: {
        materialName: '',
        materialCode: '',
        version: '',
        batchNo: '',
        outDate: '',
        quantity: 1,
        remark: ''
      },

      // 预览数据
      previewData: {},

      // 表单验证规则
      cardRules: {
        materialName: [{ required: true, message: '请输入物料品名', trigger: 'blur' }],
        materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        version: [{ required: true, message: '请输入版本', trigger: 'blur' }],
        batchNo: [{ required: true, message: '请输入批号', trigger: 'blur' }],
        outDate: [{ required: true, message: '请选择出货日期', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
      }
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        // 模拟API调用
        await this.delay(500)
        this.tableData = this.generateMockData()
        this.pagination.total = 100
      } catch (error) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    // 生成模拟数据
    generateMockData() {
      const data = []
      for (let i = 1; i <= this.pagination.pageSize; i++) {
        data.push({
          id: i,
          materialName: `CS08-夹紧开盖底板${i}`,
          materialCode: `02-62-09-0382-0${i}`,
          version: `0${i}`,
          batchNo: `VAP20250618022(0${i})`,
          outDate: '2025-06-18',
          quantity: Math.floor(Math.random() * 100) + 1,
          status: ['draft', 'printed', 'used'][Math.floor(Math.random() * 3)],
          createTime: new Date().toISOString(),
          isUrgent: Math.random() > 0.8
        })
      }
      return data
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
        batchNo: '',
        dateRange: null
      }
      this.handleSearch()
    },

    // 分页处理
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.loadData()
    },

    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.loadData()
    },

    // 选择处理
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 显示创建对话框
    showCreateDialog() {
      this.isEdit = false
      this.cardForm = {
        materialName: '',
        materialCode: '',
        version: '',
        batchNo: '',
        outDate: '',
        quantity: 1,
        remark: ''
      }
      this.cardDialogVisible = true
    },

    // 编辑标识卡
    editCard(row) {
      this.isEdit = true
      this.cardForm = { ...row }
      this.cardDialogVisible = true
    },

    // 保存标识卡
    saveCard() {
      this.$refs.cardForm.validate((valid) => {
        if (valid) {
          this.loading = true
          setTimeout(() => {
            this.loading = false
            this.cardDialogVisible = false
            this.$message.success(this.isEdit ? '编辑成功' : '创建成功')
            this.loadData()
          }, 1000)
        }
      })
    },

    // 预览并保存
    previewAndSave() {
      this.$refs.cardForm.validate((valid) => {
        if (valid) {
          this.previewData = { ...this.cardForm }
          this.previewDialogVisible = true
        }
      })
    },

    // 预览标识卡
    previewCard(row) {
      this.previewData = { ...row }
      this.previewDialogVisible = true
    },

    // 打印标识卡
    printCard(row) {
      this.$confirm('确定要打印这张标识卡吗？', '确认打印', {
        type: 'info'
      }).then(() => {
        this.previewData = { ...row }
        this.$nextTick(() => {
          this.printPreviewCard()
        })
      })
    },

    // 打印预览卡片
    printPreviewCard() {
      const printContent = this.$refs.printCard.innerHTML
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>物料标识卡打印</title>
            <style>
              body { margin: 0; padding: 20px; }
              .material-card { 
                border: 2px solid #000; 
                font-family: Arial, sans-serif;
                max-width: 400px;
                margin: 0 auto;
              }
              .card-header { 
                text-align: center; 
                padding: 10px;
                border-bottom: 2px solid #000;
              }
              .card-header h2 { 
                margin: 0 0 5px 0; 
                font-size: 18px;
              }
              .card-header h3 { 
                margin: 0; 
                font-size: 16px;
              }
              .card-table { 
                width: 100%; 
                border-collapse: collapse;
              }
              .card-table td { 
                border: 1px solid #000; 
                padding: 8px;
                font-size: 14px;
              }
              .label-cell { 
                background: #f5f5f5; 
                font-weight: bold;
                width: 25%;
              }
              .value-cell { 
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    },

    // 批量打印
    batchPrint() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要打印的标识卡')
        return
      }

      this.$confirm(`确定要批量打印 ${this.selectedRows.length} 张标识卡吗？`, '确认打印', {
        type: 'info'
      }).then(() => {
        this.$message.success(`已发送 ${this.selectedRows.length} 张标识卡到打印机`)
      })
    },

    // 显示扫码对话框
    showScanDialog() {
      this.scanDialogVisible = true
      this.scanResult = ''
    },

    // 开始扫描
    startScan() {
      // 模拟扫描结果
      setTimeout(() => {
        this.scanResult = '02-62-09-0382-00'
        this.scanHistory.unshift({
          code: this.scanResult,
          time: new Date()
        })
        // 限制历史记录数量
        if (this.scanHistory.length > 10) {
          this.scanHistory = this.scanHistory.slice(0, 10)
        }
      }, 2000)
    },

    // 清除扫描
    clearScan() {
      this.scanResult = ''
    },

    // 确认扫描入库
    confirmScan() {
      if (!this.scanResult) return

      this.$message.success('扫码入库成功')
      this.scanDialogVisible = false
      this.loadData()
    },

    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        draft: 'info',
        printed: 'success',
        used: 'warning'
      }
      return typeMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        draft: '草稿',
        printed: '已打印',
        used: '已使用'
      }
      return textMap[status] || '未知'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN')
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      return new Date(dateTime).toLocaleString('zh-CN')
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleTimeString('zh-CN')
    },

    // 延迟函数
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}
</script>

<style lang="scss" scoped>
.material-card-container {
  padding: 20px;

  .operation-card,
  .search-card,
  .table-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .operation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-icon {
        font-size: 20px;
        color: #409eff;
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-right {
      display: flex;
      gap: 10px;
    }
  }

  .search-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .table-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  // 表格单元格样式
  .material-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .material-name {
      font-weight: 600;
    }
  }

  .material-code {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #409eff;
  }

  .version-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .version,
    .batch-no {
      font-size: 12px;
      color: #606266;
    }
  }

  .date-text,
  .create-time {
    font-size: 13px;
    color: #909399;
  }

  .quantity-text {
    font-weight: 600;
    color: #67c23a;
  }
}

// 扫码对话框样式
.scan-container {
  display: flex;
  gap: 20px;
  height: 400px;

  .scan-left {
    flex: 1;
    display: flex;
    flex-direction: column;

    .scan-area {
      flex: 1;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;

      .scan-placeholder {
        text-align: center;
        color: #909399;

        .scan-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        p {
          margin: 10px 0;
          font-size: 14px;
        }
      }

      .scan-result {
        text-align: center;

        .scan-success-icon {
          font-size: 48px;
          color: #67c23a;
          margin-bottom: 10px;
        }

        p {
          margin: 10px 0;
          font-size: 16px;
          color: #67c23a;
          font-weight: 600;
        }

        .scan-info {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #409eff;
          background: #f0f9ff;
          padding: 8px;
          border-radius: 4px;
          margin-top: 10px;
        }
      }
    }

    .scan-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
  }

  .scan-right {
    width: 200px;

    h4 {
      margin: 0 0 10px 0;
      color: #303133;
    }

    .scan-history {
      max-height: 350px;
      overflow-y: auto;

      .history-item {
        display: flex;
        flex-direction: column;
        padding: 8px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        margin-bottom: 8px;

        .history-code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #409eff;
          margin-bottom: 4px;
        }

        .history-time {
          font-size: 10px;
          color: #c0c4cc;
        }
      }
    }
  }
}

// 标识卡预览样式
.card-preview {
  display: flex;
  justify-content: center;

  .material-card {
    border: 2px solid #000;
    max-width: 400px;
    font-family: Arial, sans-serif;

    .card-header {
      text-align: center;
      padding: 15px;
      border-bottom: 2px solid #000;

      h2 {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: #303133;
      }

      h3 {
        margin: 0;
        font-size: 18px;
        color: #606266;
      }
    }

    .card-table {
      width: 100%;
      border-collapse: collapse;

      td {
        border: 1px solid #000;
        padding: 12px 8px;
        font-size: 14px;

        &.label-cell {
          background: #f5f5f5;
          font-weight: bold;
          width: 25%;
          text-align: center;
        }

        &.value-cell {
          text-align: center;
          font-weight: 600;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .operation-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;

    .header-right {
      justify-content: center;
    }
  }

  .scan-container {
    flex-direction: column;
    height: auto;

    .scan-right {
      width: 100%;
    }
  }
}
</style>
