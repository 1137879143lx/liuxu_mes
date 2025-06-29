<template>
  <div class="xialiao-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>生产管理</el-breadcrumb-item>
          <el-breadcrumb-item>下料列表</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">
          <i class="el-icon-files"></i>
          下料列表管理
        </h2>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">新增下料</el-button>
        <el-button icon="el-icon-refresh" @click="refreshData">刷新</el-button>
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
          <div class="stat-trend" :class="stat.trendType">
            <i :class="stat.trendIcon"></i>
            <span>{{ stat.trend }}</span>
          </div>
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
        <el-form-item label="任务号">
          <el-input v-model="filters.batchNumber" placeholder="请输入任务号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="物料编码">
          <el-input v-model="filters.materialCode" placeholder="请输入物料编码" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="filters.materialName" placeholder="请输入物料名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="待下料" value="pending" />
            <el-option label="已下料" value="completed" />
            <el-option label="进行中" value="processing" />
          </el-select>
        </el-form-item>
        <el-form-item label="交期">
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
            下料状态分布
          </div>
        </div>
        <div ref="statusChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <div slot="header" class="chart-header">
          <div class="header-title">
            <i class="el-icon-trend-charts"></i>
            每日下料统计
          </div>
        </div>
        <div ref="dailyChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <div slot="header" class="chart-header">
          <div class="header-title">
            <i class="el-icon-s-data"></i>
            材料用量统计
          </div>
        </div>
        <div ref="materialChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <div slot="header" class="table-header">
        <div class="header-title">
          <i class="el-icon-table"></i>
          下料清单
          <el-badge :value="filteredTableData.length" class="item-count"></el-badge>
        </div>
        <div class="header-actions">
          <el-button size="small" type="primary" :disabled="!selectedRows.length" @click="batchProcess">批量下料</el-button>
          <el-button size="small" type="danger" :disabled="!selectedRows.length" @click="batchDelete">批量删除</el-button>
        </div>
      </div>

      <el-table :data="pagedTableData" stripe border size="small" @selection-change="handleSelectionChange" v-loading="loading.table" row-key="id">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="Batch_number" label="生产任务号" min-width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="viewDetail(scope.row)" class="task-link">
              <i class="el-icon-document"></i>
              {{ scope.row.Batch_number }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="Material_code" label="物料编码" min-width="140" align="center" />
        <el-table-column prop="Material_name" label="物料名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="versions" label="版本" width="80" align="center" />

        <el-table-column prop="material" label="下料名称" min-width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" type="info">{{ scope.row.material }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="count" label="下料数量" width="90" align="center">
          <template slot-scope="scope">
            <span class="quantity-text">{{ scope.row.count }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="Cutting_size" label="下料尺寸" min-width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" type="warning">{{ scope.row.Cutting_size }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="Theoretical_dosage" label="理论用量" width="90" align="center">
          <template slot-scope="scope">
            <span class="dosage-text">{{ scope.row.Theoretical_dosage }}kg</span>
          </template>
        </el-table-column>

        <el-table-column prop="Actual_dosage" label="实际用量" width="90" align="center">
          <template slot-scope="scope">
            <span class="dosage-text">{{ scope.row.Actual_dosage }}kg</span>
          </template>
        </el-table-column>

        <el-table-column prop="Delivery_time" label="客户交期" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getDeliveryType(scope.row.Delivery_time)">
              {{ scope.row.Delivery_time }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="getProcessStatusType(scope.row.process[0].status)">
              {{ getProcessStatusLabel(scope.row.process[0].status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.process[0].status === 0" placement="top" :content="`下料人: ${scope.row.process[0].submitter || '未指定'}`">
              <el-button type="primary" size="mini" @click="showProcessDialog(scope.row)">下料</el-button>
            </el-tooltip>
            <el-tag v-else size="mini" type="success">已下料</el-tag>

            <el-button type="text" size="mini" @click="editRecord(scope.row)">编辑</el-button>
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

    <!-- 下料确认对话框 -->
    <el-dialog title="下料确认" :visible.sync="processDialogVisible" width="500px" @close="resetProcessForm">
      <el-form :model="processForm" :rules="processRules" ref="processForm" label-width="120px">
        <el-form-item label="设备选择" prop="machine">
          <el-select v-model="processForm.machine" placeholder="请选择设备" style="width: 100%">
            <el-option label="一号下料机" value="machine_1" />
            <el-option label="二号下料机" value="machine_2" />
            <el-option label="三号下料机" value="machine_3" />
          </el-select>
        </el-form-item>

        <el-form-item label="下料数量" prop="quantity">
          <el-input-number v-model="processForm.quantity" :min="1" :max="currentRecord.count" style="width: 100%" />
        </el-form-item>

        <el-form-item label="单个重量(kg)" prop="weight">
          <el-input-number v-model="processForm.weight" :precision="3" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="单个长度(mm)" prop="length">
          <el-input-number v-model="processForm.length" :precision="1" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="操作员" prop="operator">
          <el-input v-model="processForm.operator" placeholder="请输入操作员姓名" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="processForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>

        <div class="form-tip">
          <i class="el-icon-info"></i>
          重量与长度二选一填写即可
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess" :loading="loading.submit">确认下料</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="detailVisible" width="800px">
      <div class="detail-content">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="任务号">{{ currentRecord.Batch_number }}</el-descriptions-item>
          <el-descriptions-item label="项目">{{ currentRecord.porject }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ currentRecord.client }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ currentRecord.Material_code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称" :span="2">{{ currentRecord.Material_name }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ currentRecord.versions }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ currentRecord.type }}</el-descriptions-item>
          <el-descriptions-item label="交期">{{ currentRecord.Delivery_time }}</el-descriptions-item>
          <el-descriptions-item label="下料尺寸">{{ currentRecord.Cutting_size }}</el-descriptions-item>
          <el-descriptions-item label="材料">{{ currentRecord.material }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ currentRecord.count }}</el-descriptions-item>
        </el-descriptions>

        <!-- 工艺流程 -->
        <div class="process-flow">
          <h4>工艺流程</h4>
          <el-steps :active="getActiveStep(currentRecord.process)" finish-status="success">
            <el-step v-for="(step, index) in currentRecord.process" :key="index" :title="step.process" :description="`工时: ${step.man_hour}h`" />
          </el-steps>
        </div>
      </div>
    </el-dialog>

    <!-- 新增对话框 -->
    <el-dialog title="新增下料任务" :visible.sync="addDialogVisible" width="600px" @close="resetAddForm">
      <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="100px">
        <!-- 添加表单内容 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务号" prop="batchNumber">
              <el-input v-model="addForm.batchNumber" placeholder="请输入任务号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目" prop="project">
              <el-input v-model="addForm.project" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料编码" prop="materialCode">
              <el-input v-model="addForm.materialCode" placeholder="请输入物料编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="materialName">
              <el-input v-model="addForm.materialName" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本" prop="versions">
              <el-input v-model="addForm.versions" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-input v-model="addForm.type" placeholder="请输入任务类型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="交期" prop="deliveryTime">
              <el-date-picker v-model="addForm.deliveryTime" type="date" placeholder="请选择交期" style="width: 100%" :disabled-date="disabledDate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下料尺寸" prop="cuttingSize">
              <el-input v-model="addForm.cuttingSize" placeholder="请输入下料尺寸" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="材料" prop="material">
              <el-input v-model="addForm.material" placeholder="请输入材料名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下料数量" prop="count">
              <el-input-number v-model="addForm.count" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="理论用量" prop="theoreticalDosage">
              <el-input-number v-model="addForm.theoreticalDosage" :precision="3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际用量" prop="actualDosage">
              <el-input-number v-model="addForm.actualDosage" :precision="3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd" :loading="loading.submit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑下料任务" :visible.sync="editDialogVisible" width="600px" @close="resetEditForm">
      <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="100px">
        <!-- 编辑表单内容 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务号" prop="batchNumber">
              <el-input v-model="editForm.batchNumber" placeholder="请输入任务号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目" prop="project">
              <el-input v-model="editForm.project" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料编码" prop="materialCode">
              <el-input v-model="editForm.materialCode" placeholder="请输入物料编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="materialName">
              <el-input v-model="editForm.materialName" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本" prop="versions">
              <el-input v-model="editForm.versions" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-input v-model="editForm.type" placeholder="请输入任务类型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="交期" prop="deliveryTime">
              <el-date-picker
                v-model="editForm.deliveryTime"
                type="date"
                placeholder="请选择交期"
                style="width: 100%"
                :disabled-date="disabledDate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下料尺寸" prop="cuttingSize">
              <el-input v-model="editForm.cuttingSize" placeholder="请输入下料尺寸" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="材料" prop="material">
              <el-input v-model="editForm.material" placeholder="请输入材料名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下料数量" prop="count">
              <el-input-number v-model="editForm.count" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="理论用量" prop="theoreticalDosage">
              <el-input-number v-model="editForm.theoreticalDosage" :precision="3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际用量" prop="actualDosage">
              <el-input-number v-model="editForm.actualDosage" :precision="3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="loading.submit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'XialiaoList',
  data() {
    return {
      loading: {
        table: false,
        chart: false,
        submit: false
      },

      filters: {
        batchNumber: '',
        materialCode: '',
        materialName: '',
        status: '',
        dateRange: []
      },

      statistics: [
        {
          key: 'total',
          label: '总任务数',
          value: 156,
          icon: 'el-icon-document',
          type: 'primary',
          trend: '+8',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'pending',
          label: '待下料',
          value: 45,
          icon: 'el-icon-time',
          type: 'warning',
          trend: '+5',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'processing',
          label: '下料中',
          value: 23,
          icon: 'el-icon-loading',
          type: 'info',
          trend: '-2',
          trendType: 'down',
          trendIcon: 'el-icon-arrow-down'
        },
        {
          key: 'completed',
          label: '已完成',
          value: 88,
          icon: 'el-icon-check',
          type: 'success',
          trend: '+12',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        }
      ],

      selectedRows: [],
      pager: { current: 1, size: 20 },

      processDialogVisible: false,
      detailVisible: false,
      addDialogVisible: false,
      editDialogVisible: false, // 新增编辑对话框控制
      currentRecord: {},

      processForm: {
        machine: '',
        quantity: 1,
        weight: 0,
        length: 0,
        operator: '',
        remark: ''
      },

      processRules: {
        machine: [{ required: true, message: '请选择设备', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        operator: [{ required: true, message: '请输入操作员', trigger: 'blur' }]
      },

      addForm: {
        batchNumber: '',
        project: '',
        materialCode: '',
        materialName: '',
        versions: '',
        type: '',
        deliveryTime: '',
        cuttingSize: '',
        material: '',
        count: 1,
        theoreticalDosage: 0,
        actualDosage: 0
      },

      editForm: {
        id: null,
        batchNumber: '',
        project: '',
        materialCode: '',
        materialName: '',
        versions: '',
        type: '',
        deliveryTime: '',
        cuttingSize: '',
        material: '',
        count: 1,
        theoreticalDosage: 0,
        actualDosage: 0
      },

      addRules: {
        batchNumber: [{ required: true, message: '请输入任务号', trigger: 'blur' }],
        project: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
      },

      editRules: {
        batchNumber: [{ required: true, message: '请输入任务号', trigger: 'blur' }],
        project: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
      },

      // 确保list初始化为数组
      list: []
    }
  },

  computed: {
    filteredTableData() {
      // 安全检查：确保list是数组
      if (!Array.isArray(this.list)) {
        return []
      }

      let data = [...this.list] // 创建副本避免直接修改原数组

      if (this.filters.batchNumber) {
        data = data.filter((item) => item.Batch_number && String(item.Batch_number).includes(this.filters.batchNumber))
      }
      if (this.filters.materialCode) {
        data = data.filter((item) => item.Material_code && item.Material_code.includes(this.filters.materialCode))
      }
      if (this.filters.materialName) {
        data = data.filter((item) => item.Material_name && item.Material_name.includes(this.filters.materialName))
      }
      if (this.filters.status) {
        data = data.filter((item) => {
          if (!item.process || !Array.isArray(item.process) || item.process.length === 0) {
            return false
          }
          const status = item.process[0].status === 0 ? 'pending' : item.process[0].status === 1 ? 'completed' : 'processing'
          return status === this.filters.status
        })
      }

      return data
    },

    pagedTableData() {
      const start = (this.pager.current - 1) * this.pager.size
      return this.filteredTableData.slice(start, start + this.pager.size)
    }
  },

  created() {
    // 在组件创建时初始化数据
    this.initializeData()
  },

  mounted() {
    this.renderCharts()
    window.addEventListener('resize', this.resizeCharts)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },

  methods: {
    // 初始化数据
    initializeData() {
      this.list = [
        {
          id: 1,
          Batch_number: 20240629001,
          porject: '天穹',
          Material_code: '02-62-00-0369-00',
          Material_name: '盖天腔体支撑架',
          versions: '02',
          type: '打样',
          Delivery_time: '2024-07-15',
          status: '待下料',
          Cutting_size: '100*100*25',
          client: '南天门研发所',
          material: 'AL6061',
          Theoretical_dosage: 0.25,
          Actual_dosage: 0.23,
          process: [
            { id: 1, process: '下料', status: 0, man_hour: 0.2, Submission_time: '', submitter: '' },
            { id: 2, process: 'CNC', status: 0, man_hour: 0.4, Submission_time: '', submitter: '' },
            { id: 3, process: '慢走丝', status: 0, man_hour: 1.6, Submission_time: '', submitter: '' },
            { id: 4, process: '后处理', status: 0, man_hour: 0.2, Submission_time: '', submitter: '' },
            { id: 5, process: '入库', status: 0, man_hour: 0.0, Submission_time: '', submitter: '' }
          ],
          count: 15,
          Difficulty: 3,
          man_hour: 7.5
        },
        {
          id: 2,
          Batch_number: 20240629002,
          porject: '神舟',
          Material_code: '02-62-00-0370-00',
          Material_name: '支撑臂组件',
          versions: '01',
          type: '量产',
          Delivery_time: '2024-07-20',
          status: '已下料',
          Cutting_size: 'D25*102',
          client: '航天科技集团',
          material: 'AL7075',
          Theoretical_dosage: 0.18,
          Actual_dosage: 0.2,
          process: [
            { id: 1, process: '下料', status: 1, man_hour: 0.2, Submission_time: '2024-06-29 10:30', submitter: '张三' },
            { id: 2, process: 'CNC', status: 0, man_hour: 0.4, Submission_time: '', submitter: '' },
            { id: 3, process: '慢走丝', status: 0, man_hour: 1.6, Submission_time: '', submitter: '' },
            { id: 4, process: '后处理', status: 0, man_hour: 0.2, Submission_time: '', submitter: '' },
            { id: 5, process: '入库', status: 0, man_hour: 0.0, Submission_time: '', submitter: '' }
          ],
          count: 25,
          Difficulty: 2,
          man_hour: 5.2
        },
        {
          id: 3,
          Batch_number: 20240629003,
          porject: '嫦娥',
          Material_code: '02-62-00-0371-00',
          Material_name: '推进器外壳',
          versions: '03',
          type: '批量',
          Delivery_time: '2024-07-25',
          status: '待下料',
          Cutting_size: '150*80*30',
          client: '中科院',
          material: 'TI6AL4V',
          Theoretical_dosage: 0.35,
          Actual_dosage: 0.32,
          process: [
            { id: 1, process: '下料', status: 0, man_hour: 0.3, Submission_time: '', submitter: '' },
            { id: 2, process: 'CNC', status: 0, man_hour: 0.8, Submission_time: '', submitter: '' },
            { id: 3, process: '表面处理', status: 0, man_hour: 1.2, Submission_time: '', submitter: '' },
            { id: 4, process: '检验', status: 0, man_hour: 0.4, Submission_time: '', submitter: '' },
            { id: 5, process: '入库', status: 0, man_hour: 0.0, Submission_time: '', submitter: '' }
          ],
          count: 8,
          Difficulty: 4,
          man_hour: 6.8
        }
      ]
    },

    // 数据操作
    refreshData() {
      this.loading.table = true
      setTimeout(() => {
        this.loading.table = false
        this.updateStatistics()
        this.$message.success('数据刷新成功')
      }, 1000)
    },

    updateStatistics() {
      if (!Array.isArray(this.list)) return

      const total = this.list.length
      const pending = this.list.filter((item) => item.process && item.process[0] && item.process[0].status === 0).length
      const completed = this.list.filter((item) => item.process && item.process[0] && item.process[0].status === 1).length
      const processing = total - pending - completed

      this.statistics = [
        {
          key: 'total',
          label: '总任务数',
          value: total,
          icon: 'el-icon-document',
          type: 'primary',
          trend: '+8',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'pending',
          label: '待下料',
          value: pending,
          icon: 'el-icon-time',
          type: 'warning',
          trend: '+5',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'processing',
          label: '下料中',
          value: processing,
          icon: 'el-icon-loading',
          type: 'info',
          trend: '-2',
          trendType: 'down',
          trendIcon: 'el-icon-arrow-down'
        },
        {
          key: 'completed',
          label: '已完成',
          value: completed,
          icon: 'el-icon-check',
          type: 'success',
          trend: '+12',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        }
      ]
    },

    exportData() {
      if (!Array.isArray(this.list) || this.list.length === 0) {
        this.$message.warning('暂无数据可导出')
        return
      }
      this.$message.info('导出功能开发中...')
    },

    // 筛选操作
    handleSearch() {
      this.pager.current = 1
    },

    resetFilters() {
      this.filters = {
        batchNumber: '',
        materialCode: '',
        materialName: '',
        status: '',
        dateRange: []
      }
      this.handleSearch()
    },

    // 表格操作
    handleSelectionChange(selection) {
      this.selectedRows = selection || []
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
      this.addDialogVisible = true
    },

    showProcessDialog(row) {
      if (!row) return
      this.currentRecord = { ...row }
      this.processForm.quantity = row.count || 1
      this.processDialogVisible = true
    },

    viewDetail(row) {
      if (!row) return
      this.currentRecord = { ...row }
      this.detailVisible = true
    },

    editRecord(row) {
      if (!row) return

      this.currentRecord = { ...row }
      this.editForm = {
        id: row.id,
        batchNumber: String(row.Batch_number || ''),
        project: row.porject || '',
        materialCode: row.Material_code || '',
        materialName: row.Material_name || '',
        versions: row.versions || '',
        type: row.type || '',
        deliveryTime: row.Delivery_time || '',
        cuttingSize: row.Cutting_size || '',
        material: row.material || '',
        count: row.count || 1,
        theoreticalDosage: row.Theoretical_dosage || 0,
        actualDosage: row.Actual_dosage || 0
      }
      this.editDialogVisible = true
    },

    async deleteRecord(row) {
      if (!row || !Array.isArray(this.list)) return

      try {
        await this.$confirm('确定删除此记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const index = this.list.findIndex((item) => item && item.id === row.id)
        if (index > -1) {
          this.list.splice(index, 1)
          this.updateStatistics()
          this.$message.success('删除成功')
        } else {
          this.$message.error('未找到要删除的记录')
        }
      } catch {
        // 用户取消
      }
    },

    // 表单提交
    submitProcess() {
      if (!this.$refs.processForm) return

      this.$refs.processForm.validate(async (valid) => {
        if (valid) {
          this.loading.submit = true
          try {
            await this.delay(1000)

            // 安全更新状态
            if (Array.isArray(this.list) && this.currentRecord && this.currentRecord.id) {
              const index = this.list.findIndex((item) => item && item.id === this.currentRecord.id)
              if (index > -1 && this.list[index].process && this.list[index].process[0]) {
                this.list[index].process[0].status = 1
                this.list[index].process[0].Submission_time = new Date().toLocaleString()
                this.list[index].process[0].submitter = this.processForm.operator
                this.updateStatistics()
              }
            }

            this.processDialogVisible = false
            this.$message.success('下料确认成功')
          } finally {
            this.loading.submit = false
          }
        }
      })
    },

    submitAdd() {
      if (!this.$refs.addForm) return

      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          this.loading.submit = true
          try {
            await this.delay(1000)

            // 确保list是数组
            if (!Array.isArray(this.list)) {
              this.list = []
            }

            const newId = Math.max(...this.list.map((item) => item.id || 0), 0) + 1
            const newRecord = {
              id: newId,
              Batch_number: parseInt(this.addForm.batchNumber) || Date.now(),
              porject: this.addForm.project,
              Material_code: this.addForm.materialCode,
              Material_name: this.addForm.materialName,
              versions: this.addForm.versions,
              type: this.addForm.type,
              Delivery_time: this.addForm.deliveryTime,
              Cutting_size: this.addForm.cuttingSize,
              client: '新客户',
              material: this.addForm.material,
              Theoretical_dosage: this.addForm.theoreticalDosage,
              Actual_dosage: this.addForm.actualDosage,
              process: [
                { id: 1, process: '下料', status: 0, man_hour: 0.2, Submission_time: '', submitter: '' },
                { id: 2, process: 'CNC', status: 0, man_hour: 0.4, Submission_time: '', submitter: '' },
                { id: 3, process: '后处理', status: 0, man_hour: 0.3, Submission_time: '', submitter: '' },
                { id: 4, process: '检验', status: 0, man_hour: 0.2, Submission_time: '', submitter: '' },
                { id: 5, process: '入库', status: 0, man_hour: 0.0, Submission_time: '', submitter: '' }
              ],
              count: this.addForm.count,
              Difficulty: 2,
              man_hour: 2.4
            }

            this.list.unshift(newRecord)
            this.updateStatistics()
            this.addDialogVisible = false
            this.$message.success('新增成功')
          } finally {
            this.loading.submit = false
          }
        }
      })
    },

    submitEdit() {
      if (!this.$refs.editForm) return

      this.$refs.editForm.validate(async (valid) => {
        if (valid) {
          this.loading.submit = true
          try {
            await this.delay(1000)

            if (Array.isArray(this.list) && this.editForm.id) {
              const index = this.list.findIndex((item) => item && item.id === this.editForm.id)
              if (index > -1) {
                // 更新记录，保留原有的process等数据
                const originalRecord = this.list[index]
                this.list[index] = {
                  ...originalRecord,
                  Batch_number: parseInt(this.editForm.batchNumber) || originalRecord.Batch_number,
                  porject: this.editForm.project,
                  Material_code: this.editForm.materialCode,
                  Material_name: this.editForm.materialName,
                  versions: this.editForm.versions,
                  type: this.editForm.type,
                  Delivery_time: this.editForm.deliveryTime,
                  Cutting_size: this.editForm.cuttingSize,
                  material: this.editForm.material,
                  Theoretical_dosage: this.editForm.theoreticalDosage,
                  Actual_dosage: this.editForm.actualDosage,
                  count: this.editForm.count
                }
                this.updateStatistics()
              }
            }

            this.editDialogVisible = false
            this.$message.success('编辑成功')
          } finally {
            this.loading.submit = false
          }
        }
      })
    },

    resetProcessForm() {
      if (this.$refs.processForm) {
        this.$refs.processForm.resetFields()
      }
      this.processForm = {
        machine: '',
        quantity: 1,
        weight: 0,
        length: 0,
        operator: '',
        remark: ''
      }
    },

    resetAddForm() {
      if (this.$refs.addForm) {
        this.$refs.addForm.resetFields()
      }
      this.addForm = {
        batchNumber: '',
        project: '',
        materialCode: '',
        materialName: '',
        versions: '',
        type: '',
        deliveryTime: '',
        cuttingSize: '',
        material: '',
        count: 1,
        theoreticalDosage: 0,
        actualDosage: 0
      }
    },

    resetEditForm() {
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields()
      }
      this.editForm = {
        id: null,
        batchNumber: '',
        project: '',
        materialCode: '',
        materialName: '',
        versions: '',
        type: '',
        deliveryTime: '',
        cuttingSize: '',
        material: '',
        count: 1,
        theoreticalDosage: 0,
        actualDosage: 0
      }
    },

    // 批量操作
    async batchProcess() {
      if (!this.selectedRows.length || !Array.isArray(this.list)) return

      try {
        await this.$confirm(`确认批量下料选中的 ${this.selectedRows.length} 个任务吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.selectedRows.forEach((row) => {
          if (!row) return
          const index = this.list.findIndex((item) => item && item.id === row.id)
          if (index > -1 && this.list[index].process && this.list[index].process[0] && this.list[index].process[0].status === 0) {
            this.list[index].process[0].status = 1
            this.list[index].process[0].Submission_time = new Date().toLocaleString()
            this.list[index].process[0].submitter = '批量操作'
          }
        })

        this.updateStatistics()
        this.$message.success('批量下料成功')
      } catch {
        // 用户取消
      }
    },

    async batchDelete() {
      if (!this.selectedRows.length || !Array.isArray(this.list)) return

      try {
        await this.$confirm(`确定删除选中的 ${this.selectedRows.length} 条记录吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.selectedRows.map((row) => row && row.id).filter((id) => id !== undefined)
        this.list = this.list.filter((item) => item && !ids.includes(item.id))
        this.updateStatistics()
        this.$message.success('批量删除成功')
      } catch {
        // 用户取消
      }
    },

    // 图表渲染相关方法保持不变...
    renderCharts() {
      this.$nextTick(() => {
        this.renderStatusChart()
        this.renderDailyChart()
        this.renderMaterialChart()
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
            name: '下料状态',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: this.statistics[1].value, name: '待下料' },
              { value: this.statistics[2].value, name: '下料中' },
              { value: this.statistics[3].value, name: '已完成' }
            ],
            itemStyle: {
              color: function (params) {
                const colors = ['#E6A23C', '#409EFF', '#67C23A']
                return colors[params.dataIndex]
              }
            }
          }
        ]
      }

      chart.setOption(option)
    },

    renderDailyChart() {
      if (!this.$refs.dailyChart) return

      const chart = echarts.init(this.$refs.dailyChart)
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['计划', '实际'] },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '计划',
            type: 'bar',
            data: [25, 30, 28, 32, 29, 15, 12],
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '实际',
            type: 'bar',
            data: [22, 28, 30, 28, 31, 18, 10],
            itemStyle: { color: '#67C23A' }
          }
        ]
      }

      chart.setOption(option)
    },

    renderMaterialChart() {
      if (!this.$refs.materialChart) return

      const chart = echarts.init(this.$refs.materialChart)
      const option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['AL6061', 'AL7075', '304不锈钢', '45#钢', '铜合金']
        },
        yAxis: { type: 'value', name: '用量(kg)' },
        series: [
          {
            name: '材料用量',
            type: 'bar',
            data: [120, 85, 65, 45, 32],
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
    },

    resizeCharts() {
      const charts = [this.$refs.statusChart, this.$refs.dailyChart, this.$refs.materialChart]
      charts.forEach((el) => {
        if (el) {
          const chart = echarts.getInstanceByDom(el)
          if (chart) chart.resize()
        }
      })
    },

    // 工具方法
    getProcessStatusType(status) {
      const types = { 0: 'warning', 1: 'success', 2: 'info' }
      return types[status] || 'info'
    },

    getProcessStatusLabel(status) {
      const labels = { 0: '待下料', 1: '已下料', 2: '进行中' }
      return labels[status] || '未知'
    },

    getDeliveryType(date) {
      if (!date) return 'info'
      const today = new Date()
      const deliveryDate = new Date(date)
      const diffDays = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'danger'
      if (diffDays <= 3) return 'warning'
      return 'success'
    },

    getActiveStep(processes) {
      if (!Array.isArray(processes)) return 0
      return processes.findIndex((p) => p && p.status === 0)
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.xialiao-list {
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
.stat-icon.info {
  background: linear-gradient(135deg, #909399, #722ed1);
}
.stat-icon.success {
  background: linear-gradient(135deg, #67c23a, #52c41a);
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
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.up {
  color: #67c23a;
}
.stat-trend.down {
  color: #f56c6c;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.task-link {
  font-weight: 600;
}

.quantity-text,
.dosage-text {
  font-weight: 600;
  color: #409eff;
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

.form-tip {
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-content .process-flow {
  margin-top: 20px;
}

.detail-content .process-flow h4 {
  margin-bottom: 16px;
  color: #303133;
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
