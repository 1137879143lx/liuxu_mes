<template>
  <div class="inspection-record">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="breadcrumb-section">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>质量管理</el-breadcrumb-item>
              <el-breadcrumb-item>检验管理</el-breadcrumb-item>
              <el-breadcrumb-item>检验记录</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <h1 class="page-title">
            <div class="title-icon">
              <i class="el-icon-notebook-2"></i>
            </div>
            <div class="title-text">
              <span class="main-title">检验记录</span>
              <span class="sub-title">Inspection Record</span>
            </div>
          </h1>
        </div>
        <div class="header-actions">
          <el-button-group>
            <el-button type="primary" icon="el-icon-refresh" @click="loadRecords">刷新数据</el-button>
            <el-button icon="el-icon-download" @click="exportRecords">导出记录</el-button>
            <el-button icon="el-icon-setting" @click="showSettings">设置</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-card total-records">
          <div class="stat-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.totalRecords }}</div>
            <div class="stat-label">总检验记录</div>
            <div class="stat-trend trend-up">
              <i class="el-icon-arrow-up"></i>
              <span>+{{ statistics.todayIncrease }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card pending-records">
          <div class="stat-icon">
            <i class="el-icon-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.pendingRecords }}</div>
            <div class="stat-label">待检验记录</div>
            <div class="stat-trend trend-down">
              <i class="el-icon-arrow-down"></i>
              <span>-{{ statistics.completedToday }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card qualified-rate">
          <div class="stat-icon">
            <i class="el-icon-success"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.qualifiedRate }}%</div>
            <div class="stat-label">合格率</div>
            <div class="stat-trend trend-up">
              <i class="el-icon-arrow-up"></i>
              <span>+{{ statistics.rateIncrease }}%</span>
            </div>
          </div>
        </div>

        <div class="stat-card avg-time">
          <div class="stat-icon">
            <i class="el-icon-timer"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.avgTime }}</div>
            <div class="stat-label">平均检验时长</div>
            <div class="stat-trend trend-down">
              <i class="el-icon-arrow-down"></i>
              <span>-{{ statistics.timeReduction }}min</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <el-card class="content-card" shadow="never">
        <!-- 卡片头部 -->
        <div slot="header" class="card-header">
          <div class="header-title">
            <i class="el-icon-list"></i>
            <span>检验记录列表</span>
            <el-badge :value="filteredRecords.length" class="record-count"></el-badge>
          </div>
          <div class="header-actions">
            <el-button-group size="small">
              <el-button :type="viewMode === 'list' ? 'primary' : ''" icon="el-icon-menu" @click="viewMode = 'list'">列表</el-button>
              <el-button :type="viewMode === 'card' ? 'primary' : ''" icon="el-icon-collection" @click="viewMode = 'card'">卡片</el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 搜索和筛选工具栏 -->
        <div class="toolbar">
          <div class="search-section">
            <div class="search-inputs">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索物料编码、名称、生产单号..."
                prefix-icon="el-icon-search"
                clearable
                @input="handleSearch"
                style="width: 280px"></el-input>

              <el-select v-model="searchForm.status" placeholder="检验状态" clearable @change="handleSearch" style="width: 120px">
                <el-option label="待检验" value="pending" />
                <el-option label="检验中" value="inspecting" />
                <el-option label="已完成" value="completed" />
                <el-option label="已免检" value="exempted" />
              </el-select>

              <el-select v-model="searchForm.inspectionType" placeholder="检验类型" clearable @change="handleSearch" style="width: 120px">
                <el-option label="首检" value="first" />
                <el-option label="过程检" value="process" />
                <el-option label="成品检" value="final" />
                <el-option label="来料检" value="incoming" />
              </el-select>

              <el-select v-model="searchForm.result" placeholder="检验结果" clearable @change="handleSearch" style="width: 120px">
                <el-option label="合格" value="qualified" />
                <el-option label="不合格" value="unqualified" />
                <el-option label="让步接收" value="concession" />
              </el-select>

              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                @change="handleSearch"
                style="width: 220px"></el-date-picker>
            </div>

            <div class="action-buttons">
              <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
              <el-button type="danger" icon="el-icon-delete" :disabled="selectedRecords.length === 0" @click="batchDelete">
                批量删除({{ selectedRecords.length }})
              </el-button>
              <el-button type="success" icon="el-icon-check" :disabled="selectedRecords.length === 0" @click="batchExempt">
                批量免检({{ selectedRecords.length }})
              </el-button>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="table-container">
          <el-table
            :data="paginatedRecords"
            v-loading="tableLoading"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            stripe
            border
            style="width: 100%">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="index" label="序号" width="60" align="center" />

            <el-table-column prop="materialCode" label="物料编码" width="120" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-link type="primary" @click="viewMaterialDetail(scope.row)">
                  {{ scope.row.materialCode }}
                </el-link>
              </template>
            </el-table-column>

            <el-table-column prop="materialName" label="物料名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="materialVersion" label="版本" width="80" align="center" />

            <el-table-column prop="quantity" label="数量" width="100" align="right">
              <template slot-scope="scope">
                <span>{{ scope.row.quantity }} {{ scope.row.unit }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="processName" label="工序" width="120" show-overflow-tooltip />
            <el-table-column prop="materialType" label="物料类型" width="100" />
            <el-table-column prop="productionType" label="生产类型" width="100" />
            <el-table-column prop="department" label="部门" width="100" />

            <el-table-column prop="submitter" label="送检人" width="100">
              <template slot-scope="scope">
                <div class="user-info">
                  <span>{{ scope.row.submitter }}</span>
                  <small>{{ scope.row.submitTime | formatTime }}</small>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="result" label="处理结果" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getResultColor(scope.row.result)" size="small">
                  {{ getResultLabel(scope.row.result) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="orderNo" label="生产单号" width="140" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-link type="primary" @click="viewOrderDetail(scope.row)">
                  {{ scope.row.orderNo }}
                </el-link>
              </template>
            </el-table-column>

            <el-table-column prop="inspectionType" label="检验类型" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getTypeColor(scope.row.inspectionType)" size="small">
                  {{ getTypeLabel(scope.row.inspectionType) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="inspectionTime" label="检验时间" width="150" sortable="custom">
              <template slot-scope="scope">
                <div class="time-info">
                  <i class="el-icon-time"></i>
                  <span>{{ scope.row.inspectionTime | formatDateTime }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getStatusColor(scope.row.status)" size="small" effect="plain">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right" align="center">
              <template slot-scope="scope">
                <div class="action-buttons">
                  <el-button v-if="scope.row.status === 'pending'" type="warning" size="mini" @click="exemptInspection(scope.row)">免检</el-button>
                  <el-button type="primary" size="mini" @click="viewInspectionResult(scope.row)">检验结果</el-button>
                  <el-button type="danger" size="mini" @click="deleteRecord(scope.row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="card-container">
          <div class="record-cards">
            <div v-for="record in paginatedRecords" :key="record.id" class="record-card" @click="viewInspectionResult(record)">
              <!-- 卡片头部 -->
              <div class="record-header">
                <div class="header-left">
                  <el-checkbox v-model="record.selected" @change="handleCardSelection(record)" @click.stop></el-checkbox>
                  <span class="material-code">{{ record.materialCode }}</span>
                  <el-tag :type="getStatusColor(record.status)" size="mini" effect="plain">
                    {{ getStatusLabel(record.status) }}
                  </el-tag>
                </div>
                <div class="header-right">
                  <span class="inspection-time">{{ record.inspectionTime | formatTime }}</span>
                </div>
              </div>

              <!-- 卡片内容 -->
              <div class="record-content">
                <div class="material-info">
                  <h4 class="material-name">{{ record.materialName }}</h4>
                  <div class="material-details">
                    <span class="detail-item">
                      <i class="el-icon-goods"></i>
                      版本: {{ record.materialVersion }}
                    </span>
                    <span class="detail-item">
                      <i class="el-icon-box"></i>
                      数量: {{ record.quantity }} {{ record.unit }}
                    </span>
                  </div>
                </div>

                <div class="inspection-info">
                  <div class="info-row">
                    <span class="label">生产单号:</span>
                    <span class="value">{{ record.orderNo }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">检验类型:</span>
                    <el-tag :type="getTypeColor(record.inspectionType)" size="mini">
                      {{ getTypeLabel(record.inspectionType) }}
                    </el-tag>
                  </div>
                  <div class="info-row">
                    <span class="label">工序:</span>
                    <span class="value">{{ record.processName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">送检人:</span>
                    <span class="value">{{ record.submitter }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">处理结果:</span>
                    <el-tag :type="getResultColor(record.result)" size="mini">
                      {{ getResultLabel(record.result) }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <!-- 卡片操作 -->
              <div class="record-actions">
                <el-button v-if="record.status === 'pending'" type="warning" size="mini" @click.stop="exemptInspection(record)">免检</el-button>
                <el-button type="primary" size="mini" @click.stop="viewInspectionResult(record)">检验结果</el-button>
                <el-button type="danger" size="mini" @click.stop="deleteRecord(record)">删除</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            :current-page="pagination.current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.size"
            :total="filteredRecords.length"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"></el-pagination>
        </div>
      </el-card>
    </div>

    <!-- 检验结果对话框 -->
    <el-dialog :title="inspectionDialogTitle" :visible.sync="inspectionDialogVisible" width="1200px" class="inspection-dialog">
      <div class="dialog-content">
        <!-- 基本信息 -->
        <div class="basic-info-section">
          <h3>基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label>物料编码:</label>
                <span>{{ currentRecord.materialCode }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>物料名称:</label>
                <span>{{ currentRecord.materialName }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>物料版本:</label>
                <span>{{ currentRecord.materialVersion }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>检验数量:</label>
                <span>{{ currentRecord.quantity }} {{ currentRecord.unit }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>检验类型:</label>
                <el-tag :type="getTypeColor(currentRecord.inspectionType)" size="small">
                  {{ getTypeLabel(currentRecord.inspectionType) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>送检人:</label>
                <span>{{ currentRecord.submitter }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 检验项目 -->
        <div class="inspection-items-section">
          <h3>检验项目</h3>
          <el-table :data="inspectionItems" border style="width: 100%">
            <el-table-column prop="itemName" label="检验项目" width="200" />
            <el-table-column prop="standard" label="检验标准" min-width="150" />
            <el-table-column prop="method" label="检验方法" width="120" />
            <el-table-column prop="sampleSize" label="抽样数量" width="100" align="center" />
            <el-table-column prop="actualValue" label="实际值" width="120">
              <template slot-scope="scope">
                <el-input v-model="scope.row.actualValue" size="mini" :disabled="isViewMode" placeholder="输入实际值"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="判定结果" width="120" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.result" size="mini" :disabled="isViewMode" placeholder="选择结果">
                  <el-option label="合格" value="qualified" />
                  <el-option label="不合格" value="unqualified" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.remark" size="mini" :disabled="isViewMode" placeholder="输入备注"></el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 检验结论 -->
        <div class="conclusion-section">
          <h3>检验结论</h3>
          <el-form :model="inspectionForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="总体结论:">
                  <el-select v-model="inspectionForm.overallResult" :disabled="isViewMode" style="width: 100%">
                    <el-option label="合格" value="qualified" />
                    <el-option label="不合格" value="unqualified" />
                    <el-option label="让步接收" value="concession" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="检验人员:">
                  <el-input v-model="inspectionForm.inspector" :disabled="isViewMode" placeholder="输入检验人员"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="检验说明:">
                  <el-input
                    v-model="inspectionForm.description"
                    type="textarea"
                    :rows="3"
                    :disabled="isViewMode"
                    placeholder="输入检验说明或不合格原因"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 附件上传 -->
        <div class="attachment-section" v-if="!isViewMode">
          <h3>检验附件</h3>
          <el-upload :action="uploadUrl" :file-list="attachments" :before-upload="beforeUpload" multiple :limit="5">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png/pdf文件，且不超过5MB</div>
          </el-upload>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="inspectionDialogVisible = false">取消</el-button>
        <el-button v-if="!isViewMode" type="primary" :loading="submitLoading" @click="submitInspectionResult">保存检验结果</el-button>
      </div>
    </el-dialog>

    <!-- 物料详情对话框 -->
    <el-dialog title="物料详情" :visible.sync="materialDialogVisible" width="800px">
      <!-- 物料详情内容 -->
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'InspectionRecord',

  data() {
    return {
      // 统计数据
      statistics: {
        totalRecords: 0,
        pendingRecords: 0,
        qualifiedRate: 0,
        avgTime: '0h',
        todayIncrease: 0,
        completedToday: 0,
        rateIncrease: 0,
        timeReduction: 0
      },

      // 视图模式
      viewMode: 'list', // list | card

      // 搜索表单
      searchForm: {
        keyword: '',
        status: '',
        inspectionType: '',
        result: '',
        dateRange: []
      },

      // 检验记录数据
      records: [],
      selectedRecords: [],

      // 表格加载状态
      tableLoading: false,

      // 分页
      pagination: {
        current: 1,
        size: 20,
        total: 0
      },

      // 排序
      sortConfig: {
        prop: '',
        order: ''
      },

      // 检验结果对话框
      inspectionDialogVisible: false,
      inspectionDialogTitle: '',
      currentRecord: {},
      isViewMode: false,

      // 检验表单
      inspectionForm: {
        overallResult: '',
        inspector: '',
        description: ''
      },

      // 检验项目
      inspectionItems: [],

      // 附件
      attachments: [],
      uploadUrl: '/api/upload',
      submitLoading: false,

      // 物料详情对话框
      materialDialogVisible: false
    }
  },

  computed: {
    // 过滤后的记录
    filteredRecords() {
      let filtered = [...this.records]

      // 关键词搜索
      if (this.searchForm.keyword) {
        const keyword = this.searchForm.keyword.toLowerCase()
        filtered = filtered.filter(
          (record) =>
            record.materialCode.toLowerCase().includes(keyword) ||
            record.materialName.toLowerCase().includes(keyword) ||
            record.orderNo.toLowerCase().includes(keyword)
        )
      }

      // 状态筛选
      if (this.searchForm.status) {
        filtered = filtered.filter((record) => record.status === this.searchForm.status)
      }

      // 检验类型筛选
      if (this.searchForm.inspectionType) {
        filtered = filtered.filter((record) => record.inspectionType === this.searchForm.inspectionType)
      }

      // 检验结果筛选
      if (this.searchForm.result) {
        filtered = filtered.filter((record) => record.result === this.searchForm.result)
      }

      // 日期范围筛选
      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        const [startDate, endDate] = this.searchForm.dateRange
        filtered = filtered.filter((record) => {
          const recordDate = record.inspectionTime.split(' ')[0]
          return recordDate >= startDate && recordDate <= endDate
        })
      }

      // 排序
      if (this.sortConfig.prop) {
        filtered.sort((a, b) => {
          const aValue = a[this.sortConfig.prop]
          const bValue = b[this.sortConfig.prop]

          if (this.sortConfig.order === 'ascending') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
      }

      return filtered
    },

    // 分页后的记录
    paginatedRecords() {
      const start = (this.pagination.current - 1) * this.pagination.size
      const end = start + this.pagination.size
      return this.filteredRecords.slice(start, end)
    }
  },

  mounted() {
    this.loadInitialData()
  },

  methods: {
    // 加载初始数据
    async loadInitialData() {
      await Promise.all([this.loadStatistics(), this.loadRecords()])
    },

    // 加载统计数据
    async loadStatistics() {
      try {
        // 模拟API调用
        this.statistics = {
          totalRecords: 1256,
          pendingRecords: 23,
          qualifiedRate: 96.8,
          avgTime: '2.5h',
          todayIncrease: 18,
          completedToday: 15,
          rateIncrease: 0.5,
          timeReduction: 15
        }
      } catch (error) {
        this.$message.error('加载统计数据失败')
      }
    },

    // 加载检验记录
    async loadRecords() {
      this.tableLoading = true
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.records = [
          {
            id: 1,
            materialCode: 'M001001',
            materialName: '高精度电子元件A',
            materialVersion: 'V2.1',
            quantity: 100,
            unit: 'PCS',
            processName: '表面贴装',
            materialType: '电子元件',
            productionType: '批量生产',
            department: '生产一部',
            submitter: '张三',
            submitTime: '2024-01-15 09:30:00',
            result: 'qualified',
            orderNo: 'PO202401001',
            inspectionType: 'first',
            inspectionTime: '2024-01-15 10:15:00',
            status: 'completed',
            selected: false
          },
          {
            id: 2,
            materialCode: 'M001002',
            materialName: '精密传感器B',
            materialVersion: 'V1.3',
            quantity: 50,
            unit: 'PCS',
            processName: '组装测试',
            materialType: '传感器',
            productionType: '小批量',
            department: '生产二部',
            submitter: '李四',
            submitTime: '2024-01-15 11:00:00',
            result: 'unqualified',
            orderNo: 'PO202401002',
            inspectionType: 'process',
            inspectionTime: '2024-01-15 11:45:00',
            status: 'completed',
            selected: false
          },
          {
            id: 3,
            materialCode: 'M001003',
            materialName: '控制模块C',
            materialVersion: 'V3.0',
            quantity: 200,
            unit: 'PCS',
            processName: '功能测试',
            materialType: '控制模块',
            productionType: '批量生产',
            department: '生产一部',
            submitter: '王五',
            submitTime: '2024-01-15 14:20:00',
            result: '',
            orderNo: 'PO202401003',
            inspectionType: 'final',
            inspectionTime: '',
            status: 'pending',
            selected: false
          }
        ]
      } catch (error) {
        this.$message.error('加载检验记录失败')
      } finally {
        this.tableLoading = false
      }
    },

    // 搜索处理
    handleSearch() {
      this.pagination.current = 1
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        keyword: '',
        status: '',
        inspectionType: '',
        result: '',
        dateRange: []
      }
      this.handleSearch()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRecords = selection
    },

    // 卡片选择
    handleCardSelection(record) {
      if (record.selected) {
        this.selectedRecords.push(record)
      } else {
        const index = this.selectedRecords.findIndex((r) => r.id === record.id)
        if (index > -1) {
          this.selectedRecords.splice(index, 1)
        }
      }
    },

    // 排序变化
    handleSortChange({ prop, order }) {
      this.sortConfig = { prop, order }
    },

    // 分页处理
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.current = 1
    },

    handleCurrentChange(page) {
      this.pagination.current = page
    },

    // 免检
    async exemptInspection(record) {
      try {
        await this.$confirm('确认对该记录进行免检处理？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        record.status = 'exempted'
        record.result = 'exempted'
        this.$message.success('免检处理成功')
        this.loadStatistics()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('免检处理失败')
        }
      }
    },

    // 查看检验结果
    viewInspectionResult(record) {
      this.currentRecord = { ...record }
      this.isViewMode = record.status === 'completed'
      this.inspectionDialogTitle = this.isViewMode ? '查看检验结果' : '录入检验结果'

      // 加载检验项目
      this.loadInspectionItems(record)

      this.inspectionDialogVisible = true
    },

    // 加载检验项目
    loadInspectionItems(record) {
      // 模拟根据物料和检验类型加载检验项目
      this.inspectionItems = [
        {
          itemName: '外观检查',
          standard: '无明显缺陷',
          method: '目视检查',
          sampleSize: 5,
          actualValue: '',
          result: '',
          remark: ''
        },
        {
          itemName: '尺寸测量',
          standard: '±0.1mm',
          method: '卡尺测量',
          sampleSize: 3,
          actualValue: '',
          result: '',
          remark: ''
        },
        {
          itemName: '功能测试',
          standard: '正常工作',
          method: '通电测试',
          sampleSize: 2,
          actualValue: '',
          result: '',
          remark: ''
        }
      ]
    },

    // 提交检验结果
    async submitInspectionResult() {
      try {
        this.submitLoading = true

        // 验证必填项
        if (!this.inspectionForm.overallResult) {
          this.$message.warning('请选择总体结论')
          return
        }

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 更新记录状态
        const recordIndex = this.records.findIndex((r) => r.id === this.currentRecord.id)
        if (recordIndex > -1) {
          this.records[recordIndex].status = 'completed'
          this.records[recordIndex].result = this.inspectionForm.overallResult
          this.records[recordIndex].inspectionTime = new Date().toLocaleString()
        }

        this.$message.success('检验结果保存成功')
        this.inspectionDialogVisible = false
        this.loadStatistics()
      } catch (error) {
        this.$message.error('保存检验结果失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 删除记录
    async deleteRecord(record) {
      try {
        await this.$confirm('确认删除该检验记录？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const index = this.records.findIndex((r) => r.id === record.id)
        if (index > -1) {
          this.records.splice(index, 1)
        }

        this.$message.success('删除成功')
        this.loadStatistics()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    // 批量删除
    async batchDelete() {
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedRecords.length} 条记录？`, '批量删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const selectedIds = this.selectedRecords.map((r) => r.id)
        this.records = this.records.filter((r) => !selectedIds.includes(r.id))
        this.selectedRecords = []

        this.$message.success('批量删除成功')
        this.loadStatistics()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },

    // 批量免检
    async batchExempt() {
      try {
        await this.$confirm(`确认对选中的 ${this.selectedRecords.length} 条记录进行免检？`, '批量免检', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.selectedRecords.forEach((record) => {
          const index = this.records.findIndex((r) => r.id === record.id)
          if (index > -1) {
            this.records[index].status = 'exempted'
            this.records[index].result = 'exempted'
          }
        })

        this.selectedRecords = []
        this.$message.success('批量免检成功')
        this.loadStatistics()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量免检失败')
        }
      }
    },

    // 导出记录
    exportRecords() {
      this.$message.info('导出功能开发中...')
    },

    // 设置
    showSettings() {
      this.$message.info('设置功能开发中...')
    },

    // 查看物料详情
    viewMaterialDetail(record) {
      this.materialDialogVisible = true
    },

    // 查看订单详情
    viewOrderDetail(record) {
      this.$message.info(`查看订单详情: ${record.orderNo}`)
    },

    // 文件上传前验证
    beforeUpload(file) {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isValidType) {
        this.$message.error('只能上传JPG/PNG/PDF格式的文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('上传文件大小不能超过5MB!')
        return false
      }
      return true
    },

    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        pending: 'warning',
        inspecting: 'primary',
        completed: 'success',
        exempted: 'info'
      }
      return colorMap[status] || 'info'
    },

    // 获取状态标签
    getStatusLabel(status) {
      const labelMap = {
        pending: '待检验',
        inspecting: '检验中',
        completed: '已完成',
        exempted: '已免检'
      }
      return labelMap[status] || '未知'
    },

    // 获取检验类型颜色
    getTypeColor(type) {
      const colorMap = {
        first: 'primary',
        process: 'warning',
        final: 'success',
        incoming: 'info'
      }
      return colorMap[type] || 'info'
    },

    // 获取检验类型标签
    getTypeLabel(type) {
      const labelMap = {
        first: '首检',
        process: '过程检',
        final: '成品检',
        incoming: '来料检'
      }
      return labelMap[type] || '未知'
    },

    // 获取结果颜色
    getResultColor(result) {
      const colorMap = {
        qualified: 'success',
        unqualified: 'danger',
        concession: 'warning',
        exempted: 'info'
      }
      return colorMap[result] || 'info'
    },

    // 获取结果标签
    getResultLabel(result) {
      const labelMap = {
        qualified: '合格',
        unqualified: '不合格',
        concession: '让步接收',
        exempted: '免检'
      }
      return labelMap[result] || '待检验'
    }
  },

  filters: {
    // 格式化时间
    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 格式化日期时间
    formatDateTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.inspection-record {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // 页面头部
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;

    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      .breadcrumb-section {
        margin-bottom: 8px;

        ::v-deep .el-breadcrumb {
          .el-breadcrumb__item {
            .el-breadcrumb__inner {
              color: rgba(255, 255, 255, 0.9);
              font-weight: 500;
              font-size: 13px;

              &:hover {
                color: white;
              }
            }

            .el-breadcrumb__separator {
              color: rgba(255, 255, 255, 0.6);
            }
          }

          .el-breadcrumb__item:last-child .el-breadcrumb__inner {
            color: white;
            font-weight: 600;
          }
        }
      }

      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;

        .title-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            font-size: 20px;
          }
        }

        .title-text {
          .main-title {
            display: block;
            font-size: 24px;
            font-weight: 700;
            line-height: 1.2;
          }

          .sub-title {
            display: block;
            font-size: 13px;
            opacity: 0.9;
            font-weight: 400;
          }
        }
      }
    }

    .header-actions {
      ::v-deep .el-button-group .el-button {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
        font-weight: 500;
        padding: 8px 16px;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }

  // 统计卡片
  .stats-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 16px 24px 0;
    flex-shrink: 0;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        &.total-records .stat-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.pending-records .stat-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.qualified-rate .stat-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.avg-time .stat-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          i {
            font-size: 18px;
          }
        }

        .stat-content {
          flex: 1;

          .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #2c3e50;
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 6px;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 600;

            &.trend-up {
              color: #27ae60;
            }

            &.trend-down {
              color: #e74c3c;
            }

            span {
              padding: 1px 4px;
              border-radius: 3px;
              background: currentColor;
              color: white;
              font-size: 10px;
            }
          }
        }
      }
    }
  }

  // 主内容
  .main-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 16px 24px;
    flex: 1;
    overflow: hidden;

    .content-card {
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      height: 100%;
      display: flex;
      flex-direction: column;

      ::v-deep .el-card__header {
        padding: 16px 20px;
        border-bottom: 1px solid #f5f7fa;
        background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
        flex-shrink: 0;
      }

      ::v-deep .el-card__body {
        padding: 0;
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;

          i {
            color: #3498db;
            font-size: 18px;
          }

          .record-count {
            ::v-deep .el-badge__content {
              background: #3498db;
              border: none;
              font-weight: 600;
              font-size: 10px;
            }
          }
        }
      }

      .toolbar {
        padding: 16px 20px;
        background: #fafbfc;
        border-bottom: 1px solid #ecf0f1;
        flex-shrink: 0;

        .search-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;

          .search-inputs {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
          }
        }
      }

      .table-container {
        flex: 1;
        overflow: auto;
        padding: 0 20px 20px;

        &::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        ::v-deep .el-table {
          .user-info {
            font-size: 12px;

            small {
              display: block;
              color: #999;
              margin-top: 2px;
            }
          }

          .time-info {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;

            i {
              color: #999;
            }
          }

          .action-buttons {
            display: flex;
            gap: 4px;
          }
        }
      }

      .card-container {
        flex: 1;
        overflow: auto;
        padding: 20px;

        .record-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 16px;

          .record-card {
            background: white;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              border-color: #3498db;
            }

            .record-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;

              .header-left {
                display: flex;
                align-items: center;
                gap: 8px;

                .material-code {
                  font-weight: 600;
                  color: #2c3e50;
                }
              }

              .inspection-time {
                font-size: 12px;
                color: #999;
              }
            }

            .record-content {
              .material-info {
                margin-bottom: 12px;

                .material-name {
                  font-size: 16px;
                  font-weight: 600;
                  color: #2c3e50;
                  margin: 0 0 8px 0;
                }

                .material-details {
                  display: flex;
                  gap: 16px;

                  .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #7f8c8d;

                    i {
                      color: #3498db;
                    }
                  }
                }
              }

              .inspection-info {
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 6px;
                  font-size: 13px;

                  .label {
                    color: #7f8c8d;
                    font-weight: 500;
                  }

                  .value {
                    color: #34495e;
                    font-weight: 500;
                  }
                }
              }
            }

            .record-actions {
              display: flex;
              gap: 8px;
              margin-top: 12px;
              padding-top: 12px;
              border-top: 1px solid #f5f7fa;
            }
          }
        }
      }

      .pagination-wrapper {
        padding: 16px 20px;
        background: #fafbfc;
        border-top: 1px solid #ecf0f1;
        flex-shrink: 0;

        ::v-deep .el-pagination {
          justify-content: center;
        }
      }
    }
  }

  // 检验结果对话框
  ::v-deep .inspection-dialog {
    .el-dialog {
      border-radius: 8px;

      .el-dialog__body {
        padding: 0;
      }
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 20px;

      h3 {
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #f5f7fa;
        color: #2c3e50;
        font-size: 16px;
      }

      .basic-info-section,
      .inspection-items-section,
      .conclusion-section,
      .attachment-section {
        margin-bottom: 24px;

        .info-item {
          margin-bottom: 8px;

          label {
            font-weight: 500;
            color: #7f8c8d;
            margin-right: 8px;
          }

          span {
            color: #2c3e50;
          }
        }
      }
    }

    .dialog-footer {
      padding: 12px 20px;
      background: #fafbfc;
      border-top: 1px solid #ecf0f1;
    }
  }

  // 响应式
  @media (max-width: 768px) {
    .page-header {
      padding: 12px 16px;

      .header-content {
        flex-direction: column;
        gap: 12px;
      }
    }

    .stats-container {
      padding: 12px 16px 0;

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }

    .main-content {
      padding: 12px 16px;

      .toolbar .search-section {
        flex-direction: column;
        align-items: stretch;

        .search-inputs {
          justify-content: stretch;

          > * {
            flex: 1;
            min-width: 0;
          }
        }
      }

      .card-container .record-cards {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
