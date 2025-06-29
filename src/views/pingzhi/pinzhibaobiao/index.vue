<template>
  <div class="quality-report">
    <!-- 优化的页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>质量管理</el-breadcrumb-item>
          <el-breadcrumb-item>统计分析</el-breadcrumb-item>
          <el-breadcrumb-item>品质报表</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">
          <i class="el-icon-pie-chart"></i>
          品质报表分析
        </h2>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" @click="loadAll" :loading="globalLoading">刷新数据</el-button>
          <el-button icon="el-icon-download" @click="exportReport">导出报表</el-button>
          <el-button icon="el-icon-setting" @click="showSettings">设置</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 优化的筛选面板 -->
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
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 260px"
            @change="handleFilterChange" />
        </el-form-item>
        <el-form-item label="产品线">
          <el-select v-model="filters.productLine" clearable placeholder="选择产品线" style="width: 160px" @change="handleFilterChange">
            <el-option v-for="item in productLines" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="检验类型">
          <el-select v-model="filters.inspectionType" clearable placeholder="选择类型" style="width: 140px" @change="handleFilterChange">
            <el-option label="来料检验" value="incoming" />
            <el-option label="首件检验" value="first" />
            <el-option label="过程检验" value="process" />
            <el-option label="成品检验" value="final" />
          </el-select>
        </el-form-item>
        <el-form-item label="工序">
          <el-select v-model="filters.process" clearable placeholder="选择工序" style="width: 120px" @change="handleFilterChange">
            <el-option label="装配" value="assembly" />
            <el-option label="测试" value="test" />
            <el-option label="包装" value="package" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="loadAll">查询分析</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 增强的指标卡片区域 -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <el-card v-for="(metric, index) in enhancedMetrics" :key="metric.key" class="metric-card" shadow="hover" :class="metric.type">
          <div class="metric-icon">
            <i :class="metric.icon"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-trend" :class="metric.trendType">
              <i :class="metric.trendIcon"></i>
              <span>{{ metric.trend }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 增强的图表区域 -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- 趋势分析图 -->
        <el-card class="chart-card trend-chart" shadow="never">
          <div slot="header" class="chart-header">
            <div class="header-title">
              <i class="el-icon-trend-charts"></i>
              质量趋势分析
            </div>
            <div class="header-controls">
              <el-radio-group v-model="trendType" size="mini" @change="updateTrendChart">
                <el-radio-button label="rate">合格率</el-radio-button>
                <el-radio-button label="defect">不良率</el-radio-button>
                <el-radio-button label="count">检验次数</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div ref="trendChart" class="chart-container" v-loading="loading.trend"></div>
        </el-card>

        <!-- 缺陷分析图 -->
        <el-card class="chart-card defect-chart" shadow="never">
          <div slot="header" class="chart-header">
            <div class="header-title">
              <i class="el-icon-warning-outline"></i>
              缺陷类型分析
            </div>
            <div class="header-controls">
              <el-switch v-model="defectChartType" active-text="饼图" inactive-text="柱图" @change="updateDefectChart" />
            </div>
          </div>
          <div ref="defectChart" class="chart-container" v-loading="loading.defect"></div>
        </el-card>

        <!-- 产品线对比图 -->
        <el-card class="chart-card product-chart" shadow="never">
          <div slot="header" class="chart-header">
            <div class="header-title">
              <i class="el-icon-goods"></i>
              产品线对比
            </div>
          </div>
          <div ref="productChart" class="chart-container" v-loading="loading.product"></div>
        </el-card>

        <!-- 检验员效率图 -->
        <el-card class="chart-card inspector-chart" shadow="never">
          <div slot="header" class="chart-header">
            <div class="header-title">
              <i class="el-icon-user"></i>
              检验员效率
            </div>
          </div>
          <div ref="inspectorChart" class="chart-container" v-loading="loading.inspector"></div>
        </el-card>
      </div>
    </div>

    <!-- 增强的数据表格 -->
    <el-card shadow="never" class="table-card">
      <div slot="header" class="table-header">
        <div class="header-title">
          <i class="el-icon-table"></i>
          详细数据
          <el-badge :value="tableData.length" class="item-count"></el-badge>
        </div>
        <div class="header-actions">
          <el-input
            v-model="searchText"
            placeholder="搜索..."
            prefix-icon="el-icon-search"
            size="small"
            style="width: 200px; margin-right: 10px"
            clearable />
          <el-button size="small" icon="el-icon-download" @click="exportTableData">导出数据</el-button>
        </div>
      </div>

      <el-table
        :data="filteredTableData"
        stripe
        border
        size="small"
        :default-sort="{ prop: 'date', order: 'descending' }"
        @sort-change="handleSortChange"
        style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="date" label="检验日期" width="120" sortable />
        <el-table-column prop="productLine" label="产品线" width="100">
          <template slot-scope="scope">
            <el-tag :type="getProductLineType(scope.row.productLine)" size="mini">
              {{ scope.row.productLine }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspectionType" label="检验类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getInspectionType(scope.row.inspectionType)" size="mini">
              {{ getInspectionLabel(scope.row.inspectionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualifiedRate" label="合格率" width="120" sortable>
          <template slot-scope="scope">
            <div class="rate-cell">
              <span :class="getRateClass(scope.row.qualifiedRate)">{{ scope.row.qualifiedRate }}%</span>
              <el-progress
                :percentage="scope.row.qualifiedRate"
                :color="getRateColor(scope.row.qualifiedRate)"
                :show-text="false"
                :stroke-width="4"
                style="margin-top: 2px" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="defectType" label="主要缺陷" min-width="120" />
        <el-table-column prop="inspector" label="检验员" width="100" />
        <el-table-column prop="batchNumber" label="批次号" width="120" />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="mini" @click="editRecord(scope.row)">编辑</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog title="检验详情" :visible.sync="detailDialogVisible" width="800px">
      <div class="detail-content">
        <!-- 详情内容将在这里显示 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="检验日期">{{ currentRecord.date }}</el-descriptions-item>
          <el-descriptions-item label="产品线">{{ currentRecord.productLine }}</el-descriptions-item>
          <el-descriptions-item label="检验类型">{{ currentRecord.inspectionType }}</el-descriptions-item>
          <el-descriptions-item label="合格率">{{ currentRecord.qualifiedRate }}%</el-descriptions-item>
          <el-descriptions-item label="检验员">{{ currentRecord.inspector }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentRecord.batchNumber }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'QualityReport',
  data() {
    return {
      globalLoading: false,
      searchText: '',
      trendType: 'rate',
      defectChartType: true, // true为饼图，false为柱图

      filters: {
        dateRange: [],
        productLine: '',
        inspectionType: '',
        process: ''
      },

      productLines: [
        { label: '产品线A', value: 'A' },
        { label: '产品线B', value: 'B' },
        { label: '产品线C', value: 'C' },
        { label: '产品线D', value: 'D' }
      ],

      enhancedMetrics: [
        {
          key: 'total',
          label: '总检验数',
          value: 0,
          icon: 'el-icon-document',
          type: 'primary',
          trend: '+12.5%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'pass',
          label: '合格率',
          value: '0%',
          icon: 'el-icon-success',
          type: 'success',
          trend: '+2.1%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'fail',
          label: '不良率',
          value: '0%',
          icon: 'el-icon-warning',
          type: 'warning',
          trend: '-0.8%',
          trendType: 'down',
          trendIcon: 'el-icon-arrow-down'
        },
        {
          key: 'efficiency',
          label: '检验效率',
          value: '0件/h',
          icon: 'el-icon-timer',
          type: 'info',
          trend: '+5.2%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        }
      ],

      tableData: [],
      pager: { current: 1, size: 20 },
      loading: { trend: false, defect: false, product: false, inspector: false },

      detailDialogVisible: false,
      currentRecord: {}
    }
  },

  computed: {
    filteredTableData() {
      let data = this.tableData
      if (this.searchText) {
        data = data.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(this.searchText.toLowerCase())))
      }
      return data
    }
  },

  watch: {
    filters: {
      deep: true,
      handler() {
        this.debounceLoad()
      }
    }
  },

  mounted() {
    window.addEventListener('resize', this.resizeCharts)
    this.loadAll()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    this.disposeCharts()
  },

  methods: {
    // 数据加载方法
    async loadAll() {
      this.globalLoading = true
      try {
        await Promise.all([this.loadMetrics(), this.loadTable(), this.renderAllCharts()])
      } finally {
        this.globalLoading = false
      }
    },

    async loadMetrics() {
      // 模拟API调用
      await this.delay(500)
      this.enhancedMetrics = [
        {
          key: 'total',
          label: '总检验数',
          value: '1,580',
          icon: 'el-icon-document',
          type: 'primary',
          trend: '+12.5%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'pass',
          label: '合格率',
          value: '97.3%',
          icon: 'el-icon-success',
          type: 'success',
          trend: '+2.1%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'fail',
          label: '不良率',
          value: '2.7%',
          icon: 'el-icon-warning',
          type: 'warning',
          trend: '-0.8%',
          trendType: 'down',
          trendIcon: 'el-icon-arrow-down'
        },
        {
          key: 'efficiency',
          label: '检验效率',
          value: '45件/h',
          icon: 'el-icon-timer',
          type: 'info',
          trend: '+5.2%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        }
      ]
    },

    async loadTable() {
      await this.delay(800)
      this.tableData = Array.from({ length: 100 }).map((_, i) => ({
        id: i + 1,
        date: `2024-06-${((i % 30) + 1).toString().padStart(2, '0')}`,
        productLine: ['产品线A', '产品线B', '产品线C', '产品线D'][i % 4],
        inspectionType: ['incoming', 'first', 'process', 'final'][i % 4],
        qualifiedRate: Math.floor(Math.random() * 10) + 90,
        defectType: ['尺寸不符', '外观缺陷', '功能故障', '材料问题', '工艺缺陷'][i % 5],
        inspector: ['张三', '李四', '王五', '赵六', '钱七'][i % 5],
        batchNumber: `B${(i + 1).toString().padStart(4, '0')}`
      }))
    },

    // 图表渲染方法
    async renderAllCharts() {
      await this.$nextTick()
      this.renderTrendChart()
      this.renderDefectChart()
      this.renderProductChart()
      this.renderInspectorChart()
    },

    renderTrendChart() {
      if (!this.$refs.trendChart) return
      this.loading.trend = true

      const chart = echarts.init(this.$refs.trendChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#409EFF',
          borderWidth: 1
        },
        legend: {
          data: ['合格率', '目标值'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value}%' },
          min: 90,
          max: 100
        },
        series: [
          {
            name: '合格率',
            type: 'line',
            data: [96.2, 97.1, 98.3, 97.8, 98.5, 97.9, 98.7, 98.1, 97.6, 98.4, 98.0, 97.8],
            smooth: true,
            lineStyle: { width: 3, color: '#409EFF' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            }
          },
          {
            name: '目标值',
            type: 'line',
            data: [98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98],
            lineStyle: { type: 'dashed', color: '#E6A23C' }
          }
        ]
      }

      chart.setOption(option)
      this.loading.trend = false
    },

    renderDefectChart() {
      if (!this.$refs.defectChart) return
      this.loading.defect = true

      const chart = echarts.init(this.$refs.defectChart)
      const data = [
        { value: 35, name: '尺寸不符' },
        { value: 28, name: '外观缺陷' },
        { value: 20, name: '功能故障' },
        { value: 12, name: '材料问题' },
        { value: 5, name: '其他' }
      ]

      const option = this.defectChartType
        ? {
            // 饼图配置
            tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
            legend: { orient: 'vertical', left: 'left' },
            series: [
              {
                name: '缺陷类型',
                type: 'pie',
                radius: ['50%', '70%'],
                center: ['60%', '50%'],
                data: data,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          }
        : {
            // 柱图配置
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: data.map((item) => item.name) },
            yAxis: { type: 'value' },
            series: [
              {
                name: '缺陷数量',
                type: 'bar',
                data: data.map((item) => item.value),
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#409EFF' },
                    { offset: 1, color: '#1890ff' }
                  ])
                }
              }
            ]
          }

      chart.setOption(option)
      this.loading.defect = false
    },

    renderProductChart() {
      if (!this.$refs.productChart) return
      this.loading.product = true

      const chart = echarts.init(this.$refs.productChart)
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['合格数', '不合格数'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['产品线A', '产品线B', '产品线C', '产品线D'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: '合格数',
            type: 'bar',
            stack: 'total',
            data: [420, 382, 456, 398],
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '不合格数',
            type: 'bar',
            stack: 'total',
            data: [12, 18, 14, 16],
            itemStyle: { color: '#F56C6C' }
          }
        ]
      }

      chart.setOption(option)
      this.loading.product = false
    },

    renderInspectorChart() {
      if (!this.$refs.inspectorChart) return
      this.loading.inspector = true

      const chart = echarts.init(this.$refs.inspectorChart)
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['张三', '李四', '王五', '赵六', '钱七'] },
        yAxis: { type: 'value', name: '检验效率(件/小时)' },
        series: [
          {
            name: '检验效率',
            type: 'bar',
            data: [45, 52, 38, 48, 43],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#9C27B0' },
                { offset: 1, color: '#673AB7' }
              ])
            },
            label: { show: true, position: 'top' }
          }
        ]
      }

      chart.setOption(option)
      this.loading.inspector = false
    },

    // 图表更新方法
    updateTrendChart() {
      this.renderTrendChart()
    },

    updateDefectChart() {
      this.renderDefectChart()
    },

    // 事件处理方法
    handleFilterChange() {
      this.debounceLoad()
    },

    resetFilters() {
      this.filters = {
        dateRange: [],
        productLine: '',
        inspectionType: '',
        process: ''
      }
      this.loadAll()
    },

    handleSortChange({ column, prop, order }) {
      // 处理表格排序
      console.log('排序:', prop, order)
    },

    handleSizeChange(size) {
      this.pager.size = size
      this.pager.current = 1
    },

    handleCurrentChange(current) {
      this.pager.current = current
    },

    viewDetail(row) {
      this.currentRecord = row
      this.detailDialogVisible = true
    },

    editRecord(row) {
      this.$message.info('编辑功能开发中...')
    },

    exportReport() {
      this.$message.success('报表导出功能开发中...')
    },

    exportTableData() {
      this.$message.success('数据导出功能开发中...')
    },

    showSettings() {
      this.$message.info('设置功能开发中...')
    },

    // 工具方法
    getProductLineType(productLine) {
      const types = { 产品线A: 'primary', 产品线B: 'success', 产品线C: 'warning', 产品线D: 'info' }
      return types[productLine] || 'info'
    },

    getInspectionType(type) {
      const types = { incoming: 'primary', first: 'success', process: 'warning', final: 'info' }
      return types[type] || 'info'
    },

    getInspectionLabel(type) {
      const labels = { incoming: '来料检验', first: '首件检验', process: '过程检验', final: '成品检验' }
      return labels[type] || type
    },

    getRateClass(rate) {
      if (rate >= 98) return 'rate-excellent'
      if (rate >= 95) return 'rate-good'
      if (rate >= 90) return 'rate-normal'
      return 'rate-poor'
    },

    getRateColor(rate) {
      if (rate >= 98) return '#67C23A'
      if (rate >= 95) return '#E6A23C'
      if (rate >= 90) return '#F56C6C'
      return '#909399'
    },

    resizeCharts() {
      const chartRefs = ['trendChart', 'defectChart', 'productChart', 'inspectorChart']
      chartRefs.forEach((ref) => {
        if (this.$refs[ref]) {
          const chart = echarts.getInstanceByDom(this.$refs[ref])
          if (chart) chart.resize()
        }
      })
    },

    disposeCharts() {
      const chartRefs = ['trendChart', 'defectChart', 'productChart', 'inspectorChart']
      chartRefs.forEach((ref) => {
        if (this.$refs[ref]) {
          const chart = echarts.getInstanceByDom(this.$refs[ref])
          if (chart) chart.dispose()
        }
      })
    },

    debounceLoad() {
      clearTimeout(this.loadTimer)
      this.loadTimer = setTimeout(() => {
        this.loadAll()
      }, 300)
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.quality-report {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
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

/* 筛选面板样式 */
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

/* 指标卡片样式 */
.metrics-section {
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.metric-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #36cfc9);
}

.metric-card.success::before {
  background: linear-gradient(90deg, #67c23a, #52c41a);
}

.metric-card.warning::before {
  background: linear-gradient(90deg, #e6a23c, #fa8c16);
}

.metric-card.info::before {
  background: linear-gradient(90deg, #909399, #722ed1);
}

.metric-card .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff, #36cfc9);
  color: white;
  font-size: 24px;
}

.metric-card.success .metric-icon {
  background: linear-gradient(135deg, #67c23a, #52c41a);
}

.metric-card.warning .metric-icon {
  background: linear-gradient(135deg, #e6a23c, #fa8c16);
}

.metric-card.info .metric-icon {
  background: linear-gradient(135deg, #909399, #722ed1);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.metric-trend.up {
  color: #67c23a;
}

.metric-trend.down {
  color: #f56c6c;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
}

.chart-card {
  border-radius: 8px;
}

.chart-card.trend-chart {
  grid-column: span 2;
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
  height: 320px;
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

.rate-cell {
  text-align: center;
}

.rate-excellent {
  color: #67c23a;
  font-weight: 600;
}
.rate-good {
  color: #e6a23c;
  font-weight: 600;
}
.rate-normal {
  color: #f56c6c;
  font-weight: 600;
}
.rate-poor {
  color: #909399;
  font-weight: 600;
}

.table-pagination {
  margin-top: 16px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-card.trend-chart {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
