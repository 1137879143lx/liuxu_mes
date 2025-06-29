<template>
  <div class="liangjujieyong">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>质量管理</el-breadcrumb-item>
          <el-breadcrumb-item>设备管理</el-breadcrumb-item>
          <el-breadcrumb-item>量具借用</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">
          <i class="el-icon-box"></i>
          量具借用管理
        </h2>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">新增借用</el-button>
        <el-button icon="el-icon-refresh" @click="loadData">刷新</el-button>
        <el-button icon="el-icon-download" @click="exportData">导出</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-card class="stat-card" v-for="stat in statistics" :key="stat.key" shadow="hover">
        <div class="stat-icon" :class="stat.type">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-card>
    </div>

    <!-- 筛选面板 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-header">
        <span class="filter-title">
          <i class="el-icon-search"></i>
          筛选条件
        </span>
        <el-button type="text" @click="resetFilters" size="small">
          <i class="el-icon-refresh-left"></i>
          重置
        </el-button>
      </div>
      <el-form :inline="true" :model="filters" size="small" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="借出中" value="borrowed" />
            <el-option label="已归还" value="returned" />
            <el-option label="逾期" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item label="量具名称">
          <el-input v-model="filters.toolName" placeholder="请输入" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="借用人">
          <el-input v-model="filters.borrower" placeholder="请输入" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="借出时间">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表统计 -->
    <div class="charts-section">
      <el-card class="chart-card" shadow="never">
        <div slot="header" class="chart-header">
          <div class="header-title">
            <i class="el-icon-pie-chart"></i>
            借用状态分布
          </div>
        </div>
        <div ref="statusChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <div slot="header" class="chart-header">
          <div class="header-title">
            <i class="el-icon-trend-charts"></i>
            月度借用趋势
          </div>
        </div>
        <div ref="trendChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div slot="header" class="table-header">
        <div class="header-title">
          <i class="el-icon-table"></i>
          借用记录
          <el-badge :value="tableData.length" class="item-count"></el-badge>
        </div>
        <div class="header-actions">
          <el-button size="small" type="warning" :disabled="!selectedRows.length" @click="batchReturn">批量归还</el-button>
          <el-button size="small" type="danger" :disabled="!selectedRows.length" @click="batchDelete">批量删除</el-button>
        </div>
      </div>

      <el-table :data="filteredTableData" stripe border size="small" @selection-change="handleSelectionChange" v-loading="loading.table">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="mini">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="toolName" label="量具名称" min-width="120" />
        <el-table-column prop="specifications" label="规格" width="100" />
        <el-table-column prop="toolCode" label="量具编码" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />

        <el-table-column prop="borrowDate" label="借出时间" width="120" align="center" />
        <el-table-column prop="expectedReturnDate" label="预计归还" width="120" align="center">
          <template slot-scope="scope">
            <span :class="{ 'overdue-text': isOverdue(scope.row) }">
              {{ scope.row.expectedReturnDate }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="borrower" label="借用人" width="100" />
        <el-table-column prop="confirmer" label="确认人" width="100" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />

        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 'borrowed'" type="text" size="mini" @click="returnTool(scope.row)">归还</el-button>
            <el-button type="text" size="mini" @click="editRecord(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="mini" class="danger-text" @click="deleteRecord(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTableData.length"
          :page-size.sync="pager.size"
          :current-page.sync="pager.current"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogType === 'add' ? '新增借用' : '编辑借用'" :visible.sync="dialogVisible" width="600px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="量具名称" prop="toolName">
              <el-input v-model="form.toolName" placeholder="请输入量具名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="specifications">
              <el-input v-model="form.specifications" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="量具编码" prop="toolCode">
              <el-input v-model="form.toolCode" placeholder="请输入量具编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="借用人" prop="borrower">
              <el-input v-model="form.borrower" placeholder="请输入借用人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认人" prop="confirmer">
              <el-input v-model="form.confirmer" placeholder="请输入确认人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="借出时间" prop="borrowDate">
              <el-date-picker v-model="form.borrowDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计归还" prop="expectedReturnDate">
              <el-date-picker v-model="form.expectedReturnDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading.submit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="借用详情" :visible.sync="detailVisible" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="量具名称">{{ currentRecord.toolName }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ currentRecord.specifications }}</el-descriptions-item>
        <el-descriptions-item label="量具编码">{{ currentRecord.toolCode }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ currentRecord.quantity }}</el-descriptions-item>
        <el-descriptions-item label="借用人">{{ currentRecord.borrower }}</el-descriptions-item>
        <el-descriptions-item label="确认人">{{ currentRecord.confirmer }}</el-descriptions-item>
        <el-descriptions-item label="借出时间">{{ currentRecord.borrowDate }}</el-descriptions-item>
        <el-descriptions-item label="预计归还">{{ currentRecord.expectedReturnDate }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ getStatusLabel(currentRecord.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Liangjujieyong',
  data() {
    return {
      loading: {
        table: false,
        chart: false,
        submit: false
      },

      filters: {
        status: '',
        toolName: '',
        borrower: '',
        dateRange: []
      },

      statistics: [
        { key: 'total', label: '总借用数', value: 0, icon: 'el-icon-box', type: 'primary' },
        { key: 'borrowed', label: '借出中', value: 0, icon: 'el-icon-top', type: 'warning' },
        { key: 'returned', label: '已归还', value: 0, icon: 'el-icon-check', type: 'success' },
        { key: 'overdue', label: '逾期未还', value: 0, icon: 'el-icon-warning', type: 'danger' }
      ],

      tableData: [],
      selectedRows: [],
      pager: { current: 1, size: 20 },

      dialogVisible: false,
      detailVisible: false,
      dialogType: 'add', // add | edit
      currentRecord: {},

      form: {
        toolName: '',
        specifications: '',
        toolCode: '',
        quantity: 1,
        borrower: '',
        confirmer: '',
        borrowDate: '',
        expectedReturnDate: '',
        remark: ''
      },

      rules: {
        toolName: [{ required: true, message: '请输入量具名称', trigger: 'blur' }],
        toolCode: [{ required: true, message: '请输入量具编码', trigger: 'blur' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        borrower: [{ required: true, message: '请输入借用人', trigger: 'blur' }],
        borrowDate: [{ required: true, message: '请选择借出时间', trigger: 'change' }],
        expectedReturnDate: [{ required: true, message: '请选择预计归还时间', trigger: 'change' }]
      }
    }
  },

  computed: {
    filteredTableData() {
      let data = this.tableData

      if (this.filters.status) {
        data = data.filter((item) => item.status === this.filters.status)
      }
      if (this.filters.toolName) {
        data = data.filter((item) => item.toolName.includes(this.filters.toolName))
      }
      if (this.filters.borrower) {
        data = data.filter((item) => item.borrower.includes(this.filters.borrower))
      }

      return data
    }
  },

  mounted() {
    this.loadData()
    this.renderCharts()
    window.addEventListener('resize', this.resizeCharts)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },

  methods: {
    // 数据加载
    async loadData() {
      this.loading.table = true
      try {
        // 模拟API调用
        await this.delay(800)
        this.tableData = this.generateMockData()
        this.updateStatistics()
      } finally {
        this.loading.table = false
      }
    },

    generateMockData() {
      return Array.from({ length: 50 }).map((_, i) => ({
        id: i + 1,
        toolName: ['游标卡尺', '千分尺', '高度尺', '深度尺', '内径表'][i % 5],
        specifications: ['0-150mm', '0-25mm', '0-300mm', '0-100mm', '10-18mm'][i % 5],
        toolCode: `TC${(i + 1).toString().padStart(4, '0')}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        borrowDate: this.formatDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
        expectedReturnDate: this.formatDate(new Date(Date.now() + Math.random() * 15 * 24 * 60 * 60 * 1000)),
        borrower: ['张三', '李四', '王五', '赵六', '钱七'][i % 5],
        confirmer: ['管理员A', '管理员B', '管理员C'][i % 3],
        status: ['borrowed', 'returned', 'overdue'][Math.floor(Math.random() * 3)],
        remark: i % 3 === 0 ? '紧急使用' : ''
      }))
    },

    updateStatistics() {
      const total = this.tableData.length
      const borrowed = this.tableData.filter((item) => item.status === 'borrowed').length
      const returned = this.tableData.filter((item) => item.status === 'returned').length
      const overdue = this.tableData.filter((item) => item.status === 'overdue').length

      this.statistics = [
        { key: 'total', label: '总借用数', value: total, icon: 'el-icon-box', type: 'primary' },
        { key: 'borrowed', label: '借出中', value: borrowed, icon: 'el-icon-top', type: 'warning' },
        { key: 'returned', label: '已归还', value: returned, icon: 'el-icon-check', type: 'success' },
        { key: 'overdue', label: '逾期未还', value: overdue, icon: 'el-icon-warning', type: 'danger' }
      ]
    },

    // 图表渲染
    renderCharts() {
      this.$nextTick(() => {
        this.renderStatusChart()
        this.renderTrendChart()
      })
    },

    renderStatusChart() {
      if (!this.$refs.statusChart) return

      const chart = echarts.init(this.$refs.statusChart)
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: '0%' },
        series: [
          {
            name: '借用状态',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            data: [
              { value: 20, name: '借出中' },
              { value: 25, name: '已归还' },
              { value: 5, name: '逾期未还' }
            ],
            itemStyle: {
              color: function (params) {
                const colors = ['#E6A23C', '#67C23A', '#F56C6C']
                return colors[params.dataIndex]
              }
            }
          }
        ]
      }

      chart.setOption(option)
    },

    renderTrendChart() {
      if (!this.$refs.trendChart) return

      const chart = echarts.init(this.$refs.trendChart)
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['借出', '归还'] },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '借出',
            type: 'line',
            data: [12, 8, 15, 10, 18, 14],
            smooth: true,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '归还',
            type: 'line',
            data: [10, 9, 12, 12, 16, 15],
            smooth: true,
            itemStyle: { color: '#67C23A' }
          }
        ]
      }

      chart.setOption(option)
    },

    resizeCharts() {
      const charts = [this.$refs.statusChart, this.$refs.trendChart]
      charts.forEach((el) => {
        if (el) {
          const chart = echarts.getInstanceByDom(el)
          if (chart) chart.resize()
        }
      })
    },

    // 表格操作
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    handleSearch() {
      this.pager.current = 1
    },

    resetFilters() {
      this.filters = {
        status: '',
        toolName: '',
        borrower: '',
        dateRange: []
      }
      this.handleSearch()
    },

    handleSizeChange(size) {
      this.pager.size = size
      this.pager.current = 1
    },

    handleCurrentChange(current) {
      this.pager.current = current
    },

    // 对话框操作
    showAddDialog() {
      this.dialogType = 'add'
      this.dialogVisible = true
    },

    editRecord(row) {
      this.dialogType = 'edit'
      this.currentRecord = row
      this.form = { ...row }
      this.dialogVisible = true
    },

    viewDetail(row) {
      this.currentRecord = row
      this.detailVisible = true
    },

    resetForm() {
      this.$refs.form?.resetFields()
      this.form = {
        toolName: '',
        specifications: '',
        toolCode: '',
        quantity: 1,
        borrower: '',
        confirmer: '',
        borrowDate: '',
        expectedReturnDate: '',
        remark: ''
      }
    },

    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading.submit = true
          try {
            await this.delay(1000)
            if (this.dialogType === 'add') {
              this.tableData.unshift({
                id: this.tableData.length + 1,
                ...this.form,
                status: 'borrowed',
                borrowDate: this.formatDate(this.form.borrowDate),
                expectedReturnDate: this.formatDate(this.form.expectedReturnDate)
              })
            } else {
              const index = this.tableData.findIndex((item) => item.id === this.currentRecord.id)
              if (index > -1) {
                this.tableData.splice(index, 1, {
                  ...this.currentRecord,
                  ...this.form,
                  borrowDate: this.formatDate(this.form.borrowDate),
                  expectedReturnDate: this.formatDate(this.form.expectedReturnDate)
                })
              }
            }
            this.updateStatistics()
            this.dialogVisible = false
            this.$message.success('操作成功')
          } finally {
            this.loading.submit = false
          }
        }
      })
    },

    // 业务操作
    async returnTool(row) {
      try {
        await this.$confirm('确认归还此量具吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const index = this.tableData.findIndex((item) => item.id === row.id)
        if (index > -1) {
          this.tableData[index].status = 'returned'
          this.updateStatistics()
          this.$message.success('归还成功')
        }
      } catch {
        // 用户取消
      }
    },

    async deleteRecord(row) {
      try {
        await this.$confirm('确定删除此记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const index = this.tableData.findIndex((item) => item.id === row.id)
        if (index > -1) {
          this.tableData.splice(index, 1)
          this.updateStatistics()
          this.$message.success('删除成功')
        }
      } catch {
        // 用户取消
      }
    },

    async batchReturn() {
      if (!this.selectedRows.length) return

      try {
        await this.$confirm(`确认归还选中的 ${this.selectedRows.length} 个量具吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.selectedRows.forEach((row) => {
          const index = this.tableData.findIndex((item) => item.id === row.id)
          if (index > -1) {
            this.tableData[index].status = 'returned'
          }
        })
        this.updateStatistics()
        this.$message.success('批量归还成功')
      } catch {
        // 用户取消
      }
    },

    async batchDelete() {
      if (!this.selectedRows.length) return

      try {
        await this.$confirm(`确定删除选中的 ${this.selectedRows.length} 条记录吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.selectedRows.map((row) => row.id)
        this.tableData = this.tableData.filter((item) => !ids.includes(item.id))
        this.updateStatistics()
        this.$message.success('批量删除成功')
      } catch {
        // 用户取消
      }
    },

    exportData() {
      this.$message.info('导出功能开发中...')
    },

    // 工具方法
    getStatusType(status) {
      const types = { borrowed: 'warning', returned: 'success', overdue: 'danger' }
      return types[status] || 'info'
    },

    getStatusLabel(status) {
      const labels = { borrowed: '借出中', returned: '已归还', overdue: '逾期' }
      return labels[status] || status
    },

    isOverdue(row) {
      if (row.status !== 'borrowed') return false
      return new Date(row.expectedReturnDate) < new Date()
    },

    formatDate(date) {
      if (!date) return ''
      if (typeof date === 'string') return date
      return date.toISOString().split('T')[0]
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.liangjujieyong {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left .page-title {
  margin: 8px 0 0 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left .page-title i {
  color: #409eff;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #409eff, #36cfc9);
}
.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #fa8c16);
}
.stat-icon.success {
  background: linear-gradient(135deg, #67c23a, #52c41a);
}
.stat-icon.danger {
  background: linear-gradient(135deg, #f56c6c, #ff4d4f);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

/* 筛选面板 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-form {
  gap: 16px;
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.header-title i {
  color: #409eff;
  font-size: 16px;
}

.chart-container {
  height: 250px;
}

/* 表格样式 */
.table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-count {
  margin-left: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.overdue-text {
  color: #f56c6c;
  font-weight: 600;
}

.danger-text {
  color: #f56c6c;
}

.table-pagination {
  margin-top: 16px;
  text-align: center;
}

/* 对话框 */
.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
