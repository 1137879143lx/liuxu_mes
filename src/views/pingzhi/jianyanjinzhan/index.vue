<template>
  <div class="inspection-station">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="breadcrumb-section">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>质量管理</el-breadcrumb-item>
              <el-breadcrumb-item>检验管理</el-breadcrumb-item>
              <el-breadcrumb-item>检验进站</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <h1 class="page-title">
            <div class="title-icon">
              <i class="el-icon-data-analysis"></i>
            </div>
            <div class="title-text">
              <span class="main-title">检验进站</span>
              <span class="sub-title">Inspection Station</span>
            </div>
          </h1>
        </div>
        <div class="header-actions">
          <el-button-group>
            <el-button type="primary" icon="el-icon-refresh" @click="refreshAll">刷新数据</el-button>
            <el-button icon="el-icon-setting" @click="showSettings">设置</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-container">
      <div class="stats-grid">
        <div class="stat-card today-total">
          <div class="stat-icon">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.todayTotal }}</div>
            <div class="stat-label">今日检验总数</div>
            <div class="stat-trend">
              <i class="el-icon-arrow-up trend-up"></i>
              <span>+12%</span>
            </div>
          </div>
        </div>

        <div class="stat-card pending-count">
          <div class="stat-icon">
            <i class="el-icon-timer"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.pendingCount }}</div>
            <div class="stat-label">待检验任务</div>
            <div class="stat-trend">
              <i class="el-icon-arrow-down trend-down"></i>
              <span>-5%</span>
            </div>
          </div>
        </div>

        <div class="stat-card pass-rate">
          <div class="stat-icon">
            <i class="el-icon-success"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.passRate }}%</div>
            <div class="stat-label">合格率</div>
            <div class="stat-trend">
              <i class="el-icon-arrow-up trend-up"></i>
              <span>+2.3%</span>
            </div>
          </div>
        </div>

        <div class="stat-card efficiency">
          <div class="stat-icon">
            <i class="el-icon-odometer"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.efficiency }}%</div>
            <div class="stat-label">检验效率</div>
            <div class="stat-trend">
              <i class="el-icon-arrow-up trend-up"></i>
              <span>+8.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="content-grid">
        <!-- 左侧：快速进站区域 -->
        <div class="quick-station-section">
          <el-card class="quick-station-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="header-title">
                <i class="el-icon-plus"></i>
                <span>快速进站</span>
              </div>
              <div class="header-actions">
                <el-button type="text" icon="el-icon-refresh" @click="refreshForm">重置</el-button>
              </div>
            </div>

            <div class="quick-station-form">
              <!-- 扫码区域 -->
              <div class="scan-section">
                <div class="scan-input-group">
                  <div class="scan-input">
                    <el-input
                      v-model="scanCode"
                      placeholder="扫描二维码或条形码进行快速进站"
                      prefix-icon="el-icon-camera"
                      size="large"
                      @keyup.enter.native="handleScanCode"
                      clearable>
                      <el-button slot="append" type="primary" @click="handleScanCode">
                        <i class="el-icon-search"></i>
                      </el-button>
                    </el-input>
                  </div>
                  <div class="scan-tips">
                    <i class="el-icon-info"></i>
                    <span>支持员工工号、生产单号的扫码识别</span>
                  </div>
                </div>
              </div>

              <!-- 表单区域 -->
              <el-form ref="stationFormRef" :model="stationForm" :rules="stationFormRules" label-width="100px" class="station-form">
                <!-- 员工信息 -->
                <div class="form-group">
                  <div class="group-header">
                    <i class="el-icon-user"></i>
                    <span>员工信息</span>
                  </div>
                  <div class="group-content">
                    <el-row :gutter="16">
                      <el-col :span="12">
                        <el-form-item label="员工工号" prop="employeeCode">
                          <el-input
                            v-model="stationForm.employeeCode"
                            placeholder="工号"
                            @blur="loadEmployeeInfo"
                            @keyup.enter.native="loadEmployeeInfo">
                            <el-button slot="append" icon="el-icon-search" @click="showEmployeeDialog"></el-button>
                          </el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="员工姓名">
                          <el-input v-model="employeeInfo.name" placeholder="自动获取" readonly></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="16">
                      <el-col :span="12">
                        <el-form-item label="所属部门">
                          <el-input v-model="employeeInfo.department" placeholder="自动获取" readonly></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="检验资质">
                          <div class="certifications">
                            <el-tag
                              v-for="cert in employeeInfo.certifications"
                              :key="cert.id"
                              :type="cert.status === 'valid' ? 'success' : 'warning'"
                              size="small"
                              class="cert-tag">
                              {{ cert.name }}
                            </el-tag>
                            <span v-if="!employeeInfo.certifications?.length" class="no-data">暂无资质信息</span>
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </div>

                <!-- 生产信息 -->
                <div class="form-group">
                  <div class="group-header">
                    <i class="el-icon-goods"></i>
                    <span>生产信息</span>
                  </div>
                  <div class="group-content">
                    <el-row :gutter="16">
                      <el-col :span="24">
                        <el-form-item label="生产单号" prop="productionOrderNo">
                          <el-input
                            v-model="stationForm.productionOrderNo"
                            placeholder="生产单号"
                            @blur="loadProductionInfo"
                            @keyup.enter.native="loadProductionInfo">
                            <el-button slot="append" icon="el-icon-search" @click="showProductionDialog"></el-button>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="16">
                      <el-col :span="12">
                        <el-form-item label="物料编码">
                          <el-input v-model="productionInfo.materialCode" readonly></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="物料名称">
                          <el-input v-model="productionInfo.materialName" readonly></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="16">
                      <el-col :span="8">
                        <el-form-item label="计划数量">
                          <el-input v-model="productionInfo.plannedQty" readonly>
                            <template slot="append">{{ productionInfo.unit }}</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item label="已完成">
                          <el-input v-model="productionInfo.completedQty" readonly>
                            <template slot="append">{{ productionInfo.unit }}</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item label="送检数量" prop="inspectionQty">
                          <el-input-number
                            v-model="stationForm.inspectionQty"
                            :min="1"
                            :max="maxInspectionQty"
                            :precision="0"
                            style="width: 100%"></el-input-number>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </div>

                <!-- 检验类型 -->
                <div class="form-group">
                  <div class="group-header">
                    <i class="el-icon-menu"></i>
                    <span>检验类型</span>
                  </div>
                  <div class="group-content">
                    <el-form-item prop="inspectionType">
                      <div class="inspection-types">
                        <div
                          v-for="type in inspectionTypes"
                          :key="type.value"
                          :class="['type-option', { active: stationForm.inspectionType === type.value, disabled: !type.enabled }]"
                          @click="selectInspectionType(type)">
                          <div class="type-icon">
                            <i :class="type.icon"></i>
                          </div>
                          <div class="type-content">
                            <div class="type-name">{{ type.label }}</div>
                            <div class="type-desc">{{ type.description }}</div>
                          </div>
                          <div v-if="stationForm.inspectionType === type.value" class="type-check">
                            <i class="el-icon-check"></i>
                          </div>
                        </div>
                      </div>
                    </el-form-item>
                  </div>
                </div>

                <!-- 备注信息 -->
                <div class="form-group">
                  <div class="group-header">
                    <i class="el-icon-edit-outline"></i>
                    <span>备注信息</span>
                  </div>
                  <div class="group-content">
                    <el-form-item>
                      <el-input
                        v-model="stationForm.remark"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入备注信息（可选）"
                        maxlength="200"
                        show-word-limit></el-input>
                    </el-form-item>
                  </div>
                </div>

                <!-- 提交按钮 -->
                <div class="form-actions">
                  <el-button type="primary" size="large" :loading="submitLoading" @click="handleSubmit" class="submit-btn">
                    <i class="el-icon-circle-check"></i>
                    <span>确认进站</span>
                  </el-button>
                </div>
              </el-form>
            </div>
          </el-card>
        </div>

        <!-- 右侧：进站列表区域 -->
        <div class="station-list-section">
          <el-card class="station-list-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="header-title">
                <i class="el-icon-list"></i>
                <span>进站列表</span>
                <el-badge :value="stationList.length" class="list-count"></el-badge>
              </div>
              <div class="header-actions">
                <el-button-group size="small">
                  <el-button icon="el-icon-refresh" @click="loadStationList">刷新</el-button>
                  <el-button icon="el-icon-download" @click="exportStationList">导出</el-button>
                </el-button-group>
              </div>
            </div>

            <!-- 筛选工具栏 -->
            <div class="filter-toolbar">
              <div class="filter-left">
                <el-input
                  v-model="searchForm.keyword"
                  placeholder="搜索生产单号、物料编码..."
                  prefix-icon="el-icon-search"
                  size="small"
                  clearable
                  @input="handleSearch"
                  style="width: 240px"></el-input>
              </div>
              <div class="filter-right">
                <el-select
                  v-model="searchForm.inspectionType"
                  placeholder="检验类型"
                  size="small"
                  clearable
                  @change="handleSearch"
                  style="width: 110px">
                  <el-option v-for="type in inspectionTypes" :key="type.value" :label="type.label" :value="type.value"></el-option>
                </el-select>
                <el-select
                  v-model="searchForm.status"
                  placeholder="状态"
                  size="small"
                  clearable
                  @change="handleSearch"
                  style="width: 100px; margin-left: 8px">
                  <el-option label="待检验" value="pending" />
                  <el-option label="检验中" value="inspecting" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </div>
            </div>

            <!-- 列表内容 -->
            <div class="list-content">
              <div v-if="stationList.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="el-icon-box"></i>
                </div>
                <div class="empty-text">暂无进站记录</div>
                <div class="empty-desc">完成进站操作后，记录将显示在这里</div>
              </div>

              <div v-else class="list-items">
                <div v-for="item in stationList" :key="item.id" class="list-item" @click="viewDetail(item)">
                  <div class="item-header">
                    <div class="item-title">
                      <span class="order-no">{{ item.productionOrderNo }}</span>
                      <el-tag :type="getStatusColor(item.status)" size="mini" class="status-tag">
                        {{ getStatusLabel(item.status) }}
                      </el-tag>
                    </div>
                    <div class="item-time">{{ formatDateTime(item.stationTime) }}</div>
                  </div>

                  <div class="item-content">
                    <div class="content-row">
                      <div class="content-item">
                        <span class="label">物料：</span>
                        <span class="value">{{ item.materialCode }} - {{ item.materialName }}</span>
                      </div>
                    </div>
                    <div class="content-row">
                      <div class="content-item">
                        <span class="label">检验类型：</span>
                        <el-tag :type="getInspectionTypeColor(item.inspectionType)" size="mini">
                          {{ getInspectionTypeLabel(item.inspectionType) }}
                        </el-tag>
                      </div>
                      <div class="content-item">
                        <span class="label">送检数量：</span>
                        <span class="value">{{ item.inspectionQty }} {{ item.unit }}</span>
                      </div>
                    </div>
                    <div class="content-row">
                      <div class="content-item">
                        <span class="label">检验员：</span>
                        <span class="value">{{ item.inspectorName }}({{ item.inspectorCode }})</span>
                      </div>
                    </div>
                  </div>

                  <div class="item-actions">
                    <el-button v-if="item.status === 'pending'" type="primary" size="mini" @click.stop="startInspection(item)">开始检验</el-button>
                    <el-button type="info" size="mini" @click.stop="viewDetail(item)">查看详情</el-button>
                    <el-button v-if="item.status === 'pending'" type="danger" size="mini" @click.stop="cancelStation(item)">取消进站</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="stationList.length > 0">
              <el-pagination
                :current-page="pagination.current"
                :page-sizes="[10, 20, 50]"
                :page-size="pagination.size"
                :total="pagination.total"
                layout="total, sizes, prev, pager, next"
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"></el-pagination>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 员工选择对话框 -->
    <el-dialog title="选择员工" :visible.sync="employeeDialogVisible" width="700px" class="custom-dialog">
      <div class="dialog-search">
        <el-input
          v-model="employeeSearchKeyword"
          placeholder="搜索员工工号或姓名"
          prefix-icon="el-icon-search"
          @input="searchEmployees"
          clearable></el-input>
      </div>
      <el-table :data="employeeList" @row-click="selectEmployee" highlight-current-row max-height="400" class="dialog-table">
        <el-table-column prop="code" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column label="检验资质" min-width="150">
          <template slot-scope="scope">
            <el-tag v-for="cert in scope.row.certifications" :key="cert.id" size="mini" class="cert-tag">
              {{ cert.name }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 生产单选择对话框 -->
    <el-dialog title="选择生产单" :visible.sync="productionDialogVisible" width="900px" class="custom-dialog">
      <div class="dialog-search">
        <el-input
          v-model="productionSearchKeyword"
          placeholder="搜索生产单号或物料编码"
          prefix-icon="el-icon-search"
          @input="searchProductions"
          clearable></el-input>
      </div>
      <el-table :data="productionList" @row-click="selectProduction" highlight-current-row max-height="400" class="dialog-table">
        <el-table-column prop="orderNo" label="生产单号" width="140" />
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" min-width="180" />
        <el-table-column prop="plannedQty" label="计划数量" width="100" align="right" />
        <el-table-column prop="completedQty" label="已完成" width="100" align="right" />
        <el-table-column label="剩余数量" width="100" align="right">
          <template slot-scope="scope">
            <span :class="{ 'text-danger': scope.row.plannedQty - scope.row.completedQty <= 0 }">
              {{ scope.row.plannedQty - scope.row.completedQty }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
              {{ scope.row.status === 'active' ? '进行中' : '已完成' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'InspectionStation',

  data() {
    return {
      // 扫码输入
      scanCode: '',

      // 统计数据
      statistics: {
        todayTotal: 0,
        pendingCount: 0,
        passRate: 95.8,
        efficiency: 87.5
      },

      // 表单数据
      stationForm: {
        employeeCode: '',
        productionOrderNo: '',
        inspectionQty: null,
        inspectionType: '',
        remark: ''
      },

      // 员工信息
      employeeInfo: {
        name: '',
        department: '',
        certifications: []
      },

      // 生产信息
      productionInfo: {
        materialCode: '',
        materialName: '',
        materialVersion: '',
        plannedQty: 0,
        completedQty: 0,
        unit: 'PCS'
      },

      // 检验类型
      inspectionTypes: [
        {
          value: 'first',
          label: '首检',
          description: '生产开始时的首件检验',
          icon: 'el-icon-star-on',
          enabled: true
        },
        {
          value: 'process',
          label: '过程检',
          description: '生产过程中的抽样检验',
          icon: 'el-icon-refresh',
          enabled: true
        },
        {
          value: 'final',
          label: '成品检',
          description: '生产完成后的最终检验',
          icon: 'el-icon-check',
          enabled: true
        }
      ],

      // 表单验证规则
      stationFormRules: {
        employeeCode: [{ required: true, message: '请输入员工工号', trigger: 'blur' }],
        productionOrderNo: [{ required: true, message: '请输入生产单号', trigger: 'blur' }],
        inspectionQty: [
          { required: true, message: '请输入送检数量', trigger: 'blur' },
          { type: 'number', min: 1, message: '送检数量必须大于0', trigger: 'blur' }
        ],
        inspectionType: [{ required: true, message: '请选择检验类型', trigger: 'change' }]
      },

      // 加载状态
      submitLoading: false,
      tableLoading: false,

      // 进站列表
      stationList: [],
      searchForm: {
        keyword: '',
        inspectionType: '',
        status: ''
      },

      // 分页
      pagination: {
        current: 1,
        size: 10,
        total: 0
      },

      // 对话框
      employeeDialogVisible: false,
      productionDialogVisible: false,
      employeeSearchKeyword: '',
      productionSearchKeyword: '',
      employeeList: [],
      productionList: []
    }
  },

  computed: {
    maxInspectionQty() {
      return this.productionInfo.plannedQty - this.productionInfo.completedQty
    }
  },

  mounted() {
    this.loadInitialData()
  },

  methods: {
    // 加载初始数据
    async loadInitialData() {
      await Promise.all([this.loadStatistics(), this.loadStationList()])
    },

    // 加载统计数据
    async loadStatistics() {
      try {
        this.statistics = {
          todayTotal: 156,
          pendingCount: 8,
          passRate: 95.8,
          efficiency: 87.5
        }
      } catch (error) {
        this.$message.error('加载统计数据失败')
      }
    },

    // 处理扫码
    handleScanCode() {
      if (!this.scanCode.trim()) return

      // 根据扫码内容判断类型
      const code = this.scanCode.trim()
      if (code.startsWith('E') || code.startsWith('U')) {
        // 员工工号
        this.stationForm.employeeCode = code
        this.loadEmployeeInfo()
      } else if (code.startsWith('PO') || code.startsWith('WO')) {
        // 生产单号
        this.stationForm.productionOrderNo = code
        this.loadProductionInfo()
      } else {
        this.$message.warning('无法识别的扫码内容')
      }

      this.scanCode = ''
    },

    // 选择检验类型
    selectInspectionType(type) {
      if (!type.enabled) return
      this.stationForm.inspectionType = type.value
    },

    // 加载员工信息
    async loadEmployeeInfo() {
      if (!this.stationForm.employeeCode) return

      try {
        const response = {
          name: '张三',
          department: '质量部',
          certifications: [
            { id: 1, name: '质检员', status: 'valid' },
            { id: 2, name: '首检员', status: 'valid' }
          ]
        }
        this.employeeInfo = response
      } catch (error) {
        this.$message.error('获取员工信息失败')
        this.employeeInfo = { name: '', department: '', certifications: [] }
      }
    },

    // 加载生产信息
    async loadProductionInfo() {
      if (!this.stationForm.productionOrderNo) return

      try {
        const response = {
          materialCode: 'M001',
          materialName: '电子产品A',
          materialVersion: 'V1.0',
          plannedQty: 1000,
          completedQty: 800,
          unit: 'PCS'
        }

        this.productionInfo = response
        const remainingQty = response.plannedQty - response.completedQty
        this.stationForm.inspectionQty = Math.min(remainingQty, 50)
      } catch (error) {
        this.$message.error('获取生产信息失败')
        this.productionInfo = {
          materialCode: '',
          materialName: '',
          materialVersion: '',
          plannedQty: 0,
          completedQty: 0,
          unit: 'PCS'
        }
      }
    },

    // 提交进站
    async handleSubmit() {
      try {
        await this.$refs.stationFormRef.validate()
        this.submitLoading = true

        const submitData = {
          ...this.stationForm,
          employeeName: this.employeeInfo.name,
          materialCode: this.productionInfo.materialCode,
          materialName: this.productionInfo.materialName,
          materialVersion: this.productionInfo.materialVersion,
          unit: this.productionInfo.unit
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.$message.success('检验进站成功')
        this.refreshForm()
        this.loadStationList()
        this.loadStatistics()
      } catch (error) {
        if (error !== 'validation failed') {
          this.$message.error('进站失败，请重试')
        }
      } finally {
        this.submitLoading = false
      }
    },

    // 重置表单
    refreshForm() {
      this.stationForm = {
        employeeCode: '',
        productionOrderNo: '',
        inspectionQty: null,
        inspectionType: '',
        remark: ''
      }
      this.employeeInfo = { name: '', department: '', certifications: [] }
      this.productionInfo = {
        materialCode: '',
        materialName: '',
        materialVersion: '',
        plannedQty: 0,
        completedQty: 0,
        unit: 'PCS'
      }
      this.scanCode = ''
      this.$refs.stationFormRef && this.$refs.stationFormRef.clearValidate()
    },

    // 刷新所有数据
    refreshAll() {
      this.loadInitialData()
    },

    // 显示设置
    showSettings() {
      this.$message.info('设置功能开发中...')
    },

    // 加载进站列表
    async loadStationList() {
      this.tableLoading = true
      try {
        const mockData = [
          {
            id: 1,
            productionOrderNo: 'PO202312001',
            materialCode: 'M001',
            materialName: '电子产品A',
            inspectionType: 'first',
            inspectionQty: 50,
            unit: 'PCS',
            inspectorCode: 'E001',
            inspectorName: '张三',
            stationTime: new Date(),
            status: 'pending'
          },
          {
            id: 2,
            productionOrderNo: 'PO202312002',
            materialCode: 'M002',
            materialName: '电子产品B',
            inspectionType: 'process',
            inspectionQty: 30,
            unit: 'PCS',
            inspectorCode: 'E002',
            inspectorName: '李四',
            stationTime: new Date(Date.now() - 30 * 60 * 1000),
            status: 'inspecting'
          }
        ]

        this.stationList = mockData
        this.pagination.total = mockData.length
      } catch (error) {
        this.$message.error('加载进站列表失败')
      } finally {
        this.tableLoading = false
      }
    },

    // 搜索处理
    handleSearch() {
      this.pagination.current = 1
      this.loadStationList()
    },

    // 分页处理
    handleSizeChange(size) {
      this.pagination.size = size
      this.loadStationList()
    },

    handleCurrentChange(page) {
      this.pagination.current = page
      this.loadStationList()
    },

    // 显示员工选择对话框
    showEmployeeDialog() {
      this.employeeDialogVisible = true
      this.searchEmployees()
    },

    // 搜索员工
    async searchEmployees() {
      try {
        this.employeeList = [
          {
            code: 'E001',
            name: '张三',
            department: '质量部',
            certifications: [
              { id: 1, name: '质检员' },
              { id: 2, name: '首检员' }
            ]
          },
          {
            code: 'E002',
            name: '李四',
            department: '质量部',
            certifications: [{ id: 1, name: '质检员' }]
          }
        ]
      } catch (error) {
        this.$message.error('搜索员工失败')
      }
    },

    // 选择员工
    selectEmployee(row) {
      this.stationForm.employeeCode = row.code
      this.employeeInfo = {
        name: row.name,
        department: row.department,
        certifications: row.certifications
      }
      this.employeeDialogVisible = false
    },

    // 显示生产单选择对话框
    showProductionDialog() {
      this.productionDialogVisible = true
      this.searchProductions()
    },

    // 搜索生产单
    async searchProductions() {
      try {
        this.productionList = [
          {
            orderNo: 'PO202312001',
            materialCode: 'M001',
            materialName: '电子产品A',
            plannedQty: 1000,
            completedQty: 800,
            status: 'active'
          },
          {
            orderNo: 'PO202312002',
            materialCode: 'M002',
            materialName: '电子产品B',
            plannedQty: 500,
            completedQty: 500,
            status: 'completed'
          }
        ]
      } catch (error) {
        this.$message.error('搜索生产单失败')
      }
    },

    // 选择生产单
    selectProduction(row) {
      this.stationForm.productionOrderNo = row.orderNo
      this.productionInfo = {
        materialCode: row.materialCode,
        materialName: row.materialName,
        materialVersion: 'V1.0',
        plannedQty: row.plannedQty,
        completedQty: row.completedQty,
        unit: 'PCS'
      }

      const remainingQty = row.plannedQty - row.completedQty
      this.stationForm.inspectionQty = Math.min(remainingQty, 50)
      this.productionDialogVisible = false
    },

    // 开始检验
    async startInspection(row) {
      try {
        await this.$confirm('确认开始检验？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        row.status = 'inspecting'
        this.$message.success('检验已开始')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
        }
      }
    },

    // 查看详情
    viewDetail(row) {
      this.$message.info(`查看详情: ${row.productionOrderNo}`)
    },

    // 取消进站
    async cancelStation(row) {
      try {
        await this.$confirm('确认取消进站？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loadStationList()
        this.$message.success('已取消进站')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
        }
      }
    },

    // 导出进站列表
    exportStationList() {
      this.$message.info('导出功能开发中...')
    },

    // 获取检验类型颜色
    getInspectionTypeColor(type) {
      const colorMap = {
        first: 'primary',
        process: 'warning',
        final: 'success'
      }
      return colorMap[type] || 'info'
    },

    // 获取检验类型标签
    getInspectionTypeLabel(type) {
      const labelMap = {
        first: '首检',
        process: '过程检',
        final: '成品检'
      }
      return labelMap[type] || '未知'
    },

    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        pending: 'warning',
        inspecting: 'primary',
        completed: 'success'
      }
      return colorMap[status] || 'info'
    },

    // 获取状态标签
    getStatusLabel(status) {
      const labelMap = {
        pending: '待检验',
        inspecting: '检验中',
        completed: '已完成'
      }
      return labelMap[status] || '未知'
    },

    // 格式化日期时间
    formatDateTime(date) {
      return new Date(date).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.inspection-station {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  // 页面头部样式
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 32px 40px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="3" fill="rgba(255,255,255,0.05)"/><circle cx="40" cy="70" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
      opacity: 0.3;
    }

    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .header-left {
      .breadcrumb-section {
        margin-bottom: 16px;

        ::v-deep .el-breadcrumb {
          .el-breadcrumb__item {
            .el-breadcrumb__inner {
              color: rgba(255, 255, 255, 0.9);
              font-weight: 500;
              font-size: 14px;
              transition: color 0.3s ease;

              &:hover {
                color: white;
              }
            }

            .el-breadcrumb__separator {
              color: rgba(255, 255, 255, 0.6);
              margin: 0 8px;
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
        gap: 20px;
        margin: 0;

        .title-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);

          i {
            font-size: 28px;
            color: white;
          }
        }

        .title-text {
          .main-title {
            display: block;
            font-size: 32px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 4px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .sub-title {
            display: block;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
        }
      }
    }

    .header-actions {
      ::v-deep .el-button-group {
        .el-button {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 500;
          padding: 12px 20px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }

          &:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }

          &:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }
        }
      }
    }
  }

  // 统计卡片区域
  .stats-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 32px 40px 0;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .stat-card {
        background: white;
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          transition: opacity 0.3s ease;
          opacity: 0;
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

          &::before {
            opacity: 1;
          }
        }

        &.today-total {
          .stat-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          &::before {
            background: linear-gradient(90deg, #667eea, #764ba2);
          }
        }

        &.pending-count {
          .stat-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          &::before {
            background: linear-gradient(90deg, #f093fb, #f5576c);
          }
        }

        &.pass-rate {
          .stat-icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          &::before {
            background: linear-gradient(90deg, #4facfe, #00f2fe);
          }
        }

        &.efficiency {
          .stat-icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
          &::before {
            background: linear-gradient(90deg, #43e97b, #38f9d7);
          }
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

          i {
            font-size: 24px;
          }
        }

        .stat-content {
          flex: 1;

          .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #2c3e50;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;

            &.trend-up {
              color: #27ae60;
            }

            &.trend-down {
              color: #e74c3c;
            }

            i {
              font-size: 14px;
            }

            span {
              padding: 2px 6px;
              border-radius: 4px;
              background: currentColor;
              color: white;
              font-size: 11px;
            }
          }
        }
      }
    }
  }

  // 主内容区域
  .main-content {
    max-width: 1600px;
    margin: 0 auto;
    padding: 32px 40px;

    .content-grid {
      display: grid;
      grid-template-columns: 520px 1fr;
      gap: 32px;
      align-items: start;

      @media (max-width: 1400px) {
        grid-template-columns: 480px 1fr;
      }

      @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  }

  // 快速进站区域
  .quick-station-section {
    .quick-station-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.8);
      overflow: hidden;

      ::v-deep .el-card__header {
        padding: 24px 28px;
        border-bottom: 1px solid #f5f7fa;
        background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
      }

      ::v-deep .el-card__body {
        padding: 28px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;

          i {
            color: #3498db;
            font-size: 20px;
          }
        }

        .header-actions {
          ::v-deep .el-button--text {
            color: #7f8c8d;
            padding: 8px 12px;
            font-size: 13px;
            transition: all 0.3s ease;

            &:hover {
              color: #3498db;
              background: rgba(52, 152, 219, 0.1);
            }
          }
        }
      }

      .quick-station-form {
        .scan-section {
          margin-bottom: 32px;
          padding: 24px;
          background: linear-gradient(135deg, #e8f4fd 0%, #e3f2fd 100%);
          border-radius: 12px;
          border: 2px dashed #3498db;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #3498db, #2980b9);
            border-radius: 12px;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          &:hover::before {
            opacity: 0.1;
          }

          .scan-input-group {
            .scan-input {
              margin-bottom: 12px;

              ::v-deep .el-input {
                .el-input__inner {
                  height: 52px;
                  font-size: 16px;
                  border: 2px solid transparent;
                  border-radius: 8px;
                  background: white;
                  transition: all 0.3s ease;

                  &:focus {
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                  }
                }

                .el-input__prefix {
                  left: 16px;

                  i {
                    color: #3498db;
                    font-size: 18px;
                  }
                }

                .el-input-group__append {
                  border: none;
                  background: none;
                  padding: 0;

                  .el-button {
                    height: 52px;
                    padding: 0 24px;
                    border-radius: 0 6px 6px 0;
                    background: #3498db;
                    border: none;
                    font-weight: 600;

                    &:hover {
                      background: #2980b9;
                    }
                  }
                }
              }
            }

            .scan-tips {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              color: #7f8c8d;

              i {
                color: #3498db;
                font-size: 14px;
              }
            }
          }
        }

        .station-form {
          .form-group {
            margin-bottom: 32px;
            border: 1px solid #ecf0f1;
            border-radius: 12px;
            overflow: hidden;
            background: white;

            .group-header {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px 20px;
              background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
              border-bottom: 1px solid #ecf0f1;
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;

              i {
                color: #3498db;
                font-size: 18px;
              }
            }

            .group-content {
              padding: 24px 20px;

              ::v-deep .el-form-item {
                margin-bottom: 20px;

                &:last-child {
                  margin-bottom: 0;
                }

                .el-form-item__label {
                  font-weight: 500;
                  color: #34495e;
                  font-size: 14px;
                  line-height: 1.6;
                }

                .el-input,
                .el-input-number {
                  .el-input__inner {
                    height: 40px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    transition: all 0.3s ease;

                    &:focus {
                      border-color: #3498db;
                      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
                    }
                  }

                  .el-input-group__append {
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-left: none;

                    .el-button {
                      background: transparent;
                      border: none;
                      color: #7f8c8d;

                      &:hover {
                        color: #3498db;
                      }
                    }
                  }
                }

                .el-textarea {
                  .el-textarea__inner {
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    resize: none;
                    transition: all 0.3s ease;

                    &:focus {
                      border-color: #3498db;
                      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
                    }
                  }
                }
              }

              .certifications {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 32px;
                align-items: center;

                .cert-tag {
                  margin: 0;
                }

                .no-data {
                  color: #bdc3c7;
                  font-size: 13px;
                  font-style: italic;
                }
              }

              .inspection-types {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;

                .type-option {
                  padding: 16px;
                  border: 2px solid #ecf0f1;
                  border-radius: 8px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  gap: 16px;
                  background: white;
                  position: relative;

                  &:hover {
                    border-color: #3498db;
                    background: rgba(52, 152, 219, 0.02);
                  }

                  &.active {
                    border-color: #3498db;
                    background: rgba(52, 152, 219, 0.05);
                    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
                  }

                  &.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f8f9fa;
                  }

                  .type-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
                    color: #7f8c8d;

                    i {
                      font-size: 18px;
                    }
                  }

                  &.active .type-icon {
                    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                    color: white;
                  }

                  .type-content {
                    flex: 1;

                    .type-name {
                      font-size: 16px;
                      font-weight: 600;
                      color: #2c3e50;
                      margin-bottom: 4px;
                    }

                    .type-desc {
                      font-size: 13px;
                      color: #7f8c8d;
                      line-height: 1.4;
                    }
                  }

                  .type-check {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #27ae60;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    i {
                      font-size: 12px;
                    }
                  }
                }
              }
            }
          }

          .form-actions {
            text-align: center;
            padding-top: 8px;

            .submit-btn {
              padding: 16px 48px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 8px;
              background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
              border: none;
              box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
              }

              &:active {
                transform: translateY(0);
              }

              i {
                margin-right: 8px;
                font-size: 18px;
              }
            }
          }
        }
      }
    }
  }

  // 进站列表区域
  .station-list-section {
    .station-list-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.8);
      overflow: hidden;

      ::v-deep .el-card__header {
        padding: 24px 28px;
        border-bottom: 1px solid #f5f7fa;
        background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
      }

      ::v-deep .el-card__body {
        padding: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;

          i {
            color: #e67e22;
            font-size: 20px;
          }

          .list-count {
            ::v-deep .el-badge__content {
              background: #e67e22;
              border: none;
              font-weight: 600;
              font-size: 11px;
            }
          }
        }

        .header-actions {
          ::v-deep .el-button-group {
            .el-button {
              padding: 8px 16px;
              font-size: 13px;
              border: 1px solid #ddd;
              color: #7f8c8d;
              background: white;

              &:hover {
                color: #3498db;
                border-color: #3498db;
                background: rgba(52, 152, 219, 0.05);
              }

              &:first-child {
                border-top-left-radius: 6px;
                border-bottom-left-radius: 6px;
              }

              &:last-child {
                border-top-right-radius: 6px;
                border-bottom-right-radius: 6px;
                border-left: none;
              }
            }
          }
        }
      }

      .filter-toolbar {
        padding: 20px 28px;
        background: #fafbfc;
        border-bottom: 1px solid #ecf0f1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;

        .filter-left,
        .filter-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        ::v-deep .el-input,
        ::v-deep .el-select {
          .el-input__inner {
            height: 36px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 13px;

            &:focus {
              border-color: #3498db;
            }
          }
        }
      }

      .list-content {
        max-height: 600px;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;

          &:hover {
            background: #a8a8a8;
          }
        }

        .empty-state {
          padding: 60px 28px;
          text-align: center;
          color: #bdc3c7;

          .empty-icon {
            margin-bottom: 16px;

            i {
              font-size: 48px;
              color: #ecf0f1;
            }
          }

          .empty-text {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 8px;
            color: #95a5a6;
          }

          .empty-desc {
            font-size: 13px;
            color: #bdc3c7;
          }
        }

        .list-items {
          .list-item {
            padding: 20px 28px;
            border-bottom: 1px solid #f5f7fa;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;

            &:hover {
              background: rgba(52, 152, 219, 0.02);
              border-left: 4px solid #3498db;
              padding-left: 24px;
            }

            &:last-child {
              border-bottom: none;
            }

            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;

              .item-title {
                display: flex;
                align-items: center;
                gap: 12px;

                .order-no {
                  font-size: 16px;
                  font-weight: 600;
                  color: #2c3e50;
                }

                .status-tag {
                  font-weight: 500;
                }
              }

              .item-time {
                font-size: 12px;
                color: #95a5a6;
                font-weight: 500;
              }
            }

            .item-content {
              margin-bottom: 16px;

              .content-row {
                display: flex;
                margin-bottom: 8px;
                gap: 24px;

                &:last-child {
                  margin-bottom: 0;
                }

                .content-item {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;

                  .label {
                    color: #7f8c8d;
                    font-weight: 500;
                    min-width: 60px;
                  }

                  .value {
                    color: #34495e;
                    font-weight: 500;
                  }

                  ::v-deep .el-tag {
                    font-size: 11px;
                    padding: 2px 8px;
                    font-weight: 500;
                  }
                }
              }
            }

            .item-actions {
              display: flex;
              gap: 8px;

              ::v-deep .el-button {
                padding: 6px 12px;
                font-size: 12px;
                border-radius: 4px;
                font-weight: 500;
              }
            }
          }
        }
      }

      .pagination-wrapper {
        padding: 20px 28px;
        background: #fafbfc;
        border-top: 1px solid #ecf0f1;

        ::v-deep .el-pagination {
          justify-content: center;

          .el-pagination__total {
            color: #7f8c8d;
            font-weight: 500;
          }

          .btn-prev,
          .btn-next {
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            color: #7f8c8d;

            &:hover {
              color: #3498db;
              border-color: #3498db;
            }

            &.disabled {
              background: #f8f9fa;
              border-color: #ecf0f1;
              color: #bdc3c7;
            }
          }

          .el-pager li {
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            margin: 0 4px;
            color: #7f8c8d;
            font-weight: 500;

            &:hover {
              color: #3498db;
              border-color: #3498db;
            }

            &.active {
              background: #3498db;
              border-color: #3498db;
              color: white;
            }
          }

          .el-pagination__sizes {
            .el-select .el-input .el-input__inner {
              height: 32px;
              border: 1px solid #ddd;
              border-radius: 6px;
            }
          }
        }
      }
    }
  }

  // 对话框样式
  ::v-deep .custom-dialog {
    .el-dialog {
      border-radius: 12px;
      overflow: hidden;

      .el-dialog__header {
        padding: 20px 24px;
        background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
        border-bottom: 1px solid #ecf0f1;

        .el-dialog__title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .el-dialog__close {
          color: #7f8c8d;
          font-size: 16px;

          &:hover {
            color: #e74c3c;
          }
        }
      }

      .el-dialog__body {
        padding: 24px;
      }
    }

    .dialog-search {
      margin-bottom: 20px;

      .el-input .el-input__inner {
        height: 40px;
        border: 1px solid #ddd;
        border-radius: 6px;

        &:focus {
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
        }
      }
    }

    .dialog-table {
      border: 1px solid #ecf0f1;
      border-radius: 8px;
      overflow: hidden;

      ::v-deep .el-table__header {
        background: #f8f9fa;

        th {
          background: #f8f9fa;
          color: #34495e;
          font-weight: 600;
          border-bottom: 1px solid #ecf0f1;
        }
      }

      ::v-deep .el-table__body {
        tr {
          cursor: pointer;
          transition: background-color 0.3s ease;

          &:hover {
            background: rgba(52, 152, 219, 0.05);
          }

          td {
            border-bottom: 1px solid #f5f7fa;
          }
        }
      }

      .cert-tag {
        margin-right: 6px;
        font-size: 11px;
      }

      .text-danger {
        color: #e74c3c;
        font-weight: 600;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .page-header {
      padding: 20px 16px;

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .header-left .page-title {
        justify-content: center;

        .title-icon {
          width: 48px;
          height: 48px;
        }

        .title-text .main-title {
          font-size: 24px;
        }
      }
    }

    .stats-container {
      padding: 20px 16px 0;

      .stats-grid {
        gap: 16px;
      }
    }

    .main-content {
      padding: 20px 16px;

      .content-grid {
        gap: 20px;
      }
    }

    .quick-station-card,
    .station-list-card {
      ::v-deep .el-card__header,
      ::v-deep .el-card__body,
      .filter-toolbar,
      .pagination-wrapper {
        padding-left: 16px;
        padding-right: 16px;
      }

      .list-content .list-items .list-item {
        padding-left: 16px;
        padding-right: 16px;

        &:hover {
          padding-left: 12px;
        }

        .item-content .content-row {
          flex-direction: column;
          gap: 8px;
        }

        .item-actions {
          flex-wrap: wrap;
        }
      }
    }

    .filter-toolbar {
      flex-direction: column;
      gap: 12px;

      .filter-left,
      .filter-right {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
