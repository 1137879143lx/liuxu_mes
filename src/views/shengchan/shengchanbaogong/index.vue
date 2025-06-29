<template>
  <div class="shengchanbaogong">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>生产管理</el-breadcrumb-item>
          <el-breadcrumb-item>生产报工</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">
          <i class="el-icon-user-solid"></i>
          生产报工管理
        </h2>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-refresh" @click="refreshData">刷新数据</el-button>
        <el-button icon="el-icon-download" @click="exportData">导出报表</el-button>
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

    <!-- 主要内容区域 -->
    <el-card shadow="never" class="main-card">
      <div slot="header" class="card-header">
        <span class="header-title">
          <i class="el-icon-menu"></i>
          报工操作
        </span>
        <div class="header-info">
          <el-tag type="info" size="small">当前工位: {{ currentStation }}</el-tag>
          <el-tag type="success" size="small">操作员: {{ currentOperator }}</el-tag>
        </div>
      </div>

      <el-tabs v-model="activeName" @tab-click="handleTabClick" class="work-tabs">
        <!-- 进站 -->
        <el-tab-pane label="进站" name="enter">
          <div class="tab-content">
            <el-form :model="enterForm" :rules="enterRules" ref="enterForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="工单号" prop="workOrder">
                    <el-input v-model="enterForm.workOrder" placeholder="请输入工单号">
                      <el-button slot="append" icon="el-icon-search" @click="searchWorkOrder"></el-button>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="产品编码" prop="productCode">
                    <el-input v-model="enterForm.productCode" placeholder="请输入产品编码" readonly />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="enterForm.productName" placeholder="产品名称" readonly />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="工艺路线" prop="processRoute">
                    <el-select v-model="enterForm.processRoute" placeholder="选择工艺路线" style="width: 100%">
                      <el-option v-for="route in processRoutes" :key="route.value" :label="route.label" :value="route.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="当前工序" prop="currentProcess">
                    <el-select v-model="enterForm.currentProcess" placeholder="选择工序" style="width: 100%">
                      <el-option v-for="process in currentProcesses" :key="process.value" :label="process.label" :value="process.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="数量" prop="quantity">
                    <el-input-number v-model="enterForm.quantity" :min="1" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item>
                <el-button type="primary" @click="submitEnter" :loading="loading.enter">确认进站</el-button>
                <el-button @click="resetEnterForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 上机 -->
        <el-tab-pane label="上机" name="mount">
          <div class="tab-content">
            <el-form :model="mountForm" :rules="mountRules" ref="mountForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="设备编号" prop="equipmentCode">
                    <el-select v-model="mountForm.equipmentCode" placeholder="选择设备" style="width: 100%">
                      <el-option v-for="eq in equipmentList" :key="eq.code" :label="eq.name" :value="eq.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="设备状态" prop="equipmentStatus">
                    <el-input v-model="mountForm.equipmentStatus" readonly>
                      <el-tag slot="append" :type="getEquipmentStatusType(mountForm.equipmentStatus)">
                        {{ mountForm.equipmentStatus }}
                      </el-tag>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="操作员" prop="operator">
                    <el-input v-model="mountForm.operator" placeholder="请输入操作员" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker v-model="mountForm.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="备注">
                    <el-input v-model="mountForm.remark" placeholder="请输入备注信息" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item>
                <el-button type="primary" @click="submitMount" :loading="loading.mount">确认上机</el-button>
                <el-button @click="resetMountForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 下机 -->
        <el-tab-pane label="下机" name="unmount">
          <div class="tab-content">
            <el-form :model="unmountForm" :rules="unmountRules" ref="unmountForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="设备编号" prop="equipmentCode">
                    <el-select v-model="unmountForm.equipmentCode" placeholder="选择设备" style="width: 100%">
                      <el-option v-for="eq in runningEquipment" :key="eq.code" :label="eq.name" :value="eq.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="完成数量" prop="completedQuantity">
                    <el-input-number v-model="unmountForm.completedQuantity" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="不良数量" prop="defectQuantity">
                    <el-input-number v-model="unmountForm.defectQuantity" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker v-model="unmountForm.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="质量状态" prop="qualityStatus">
                    <el-select v-model="unmountForm.qualityStatus" placeholder="选择质量状态" style="width: 100%">
                      <el-option label="合格" value="qualified" />
                      <el-option label="不合格" value="unqualified" />
                      <el-option label="返工" value="rework" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="下机原因">
                <el-input v-model="unmountForm.reason" type="textarea" :rows="3" placeholder="请输入下机原因" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitUnmount" :loading="loading.unmount">确认下机</el-button>
                <el-button @click="resetUnmountForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 自检 -->
        <el-tab-pane label="自检" name="inspect">
          <div class="tab-content">
            <el-form :model="inspectForm" :rules="inspectRules" ref="inspectForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="检验项目" prop="inspectItem">
                    <el-select v-model="inspectForm.inspectItem" placeholder="选择检验项目" style="width: 100%">
                      <el-option v-for="item in inspectItems" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="检验数量" prop="inspectQuantity">
                    <el-input-number v-model="inspectForm.inspectQuantity" :min="1" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="检验结果" prop="inspectResult">
                    <el-select v-model="inspectForm.inspectResult" placeholder="选择结果" style="width: 100%">
                      <el-option label="合格" value="pass" />
                      <el-option label="不合格" value="fail" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="检验时间" prop="inspectTime">
                    <el-date-picker v-model="inspectForm.inspectTime" type="datetime" placeholder="选择检验时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="检验员" prop="inspector">
                    <el-input v-model="inspectForm.inspector" placeholder="请输入检验员" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="检验备注">
                <el-input v-model="inspectForm.remark" type="textarea" :rows="3" placeholder="请输入检验备注" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitInspect" :loading="loading.inspect">提交检验</el-button>
                <el-button @click="resetInspectForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 日常报工 -->
        <el-tab-pane label="日常报工" name="daily">
          <div class="tab-content">
            <el-form :model="dailyForm" :rules="dailyRules" ref="dailyForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="报工类型" prop="workType">
                    <el-select v-model="dailyForm.workType" placeholder="选择报工类型" style="width: 100%">
                      <el-option label="正常生产" value="normal" />
                      <el-option label="设备维修" value="maintenance" />
                      <el-option label="质量问题" value="quality" />
                      <el-option label="物料短缺" value="material" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="工作时长" prop="workHours">
                    <el-input-number v-model="dailyForm.workHours" :min="0" :precision="1" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="产出数量" prop="outputQuantity">
                    <el-input-number v-model="dailyForm.outputQuantity" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="报工时间" prop="reportTime">
                    <el-date-picker v-model="dailyForm.reportTime" type="datetime" placeholder="选择报工时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="报工人" prop="reporter">
                    <el-input v-model="dailyForm.reporter" placeholder="请输入报工人" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="工作内容">
                <el-input v-model="dailyForm.workContent" type="textarea" :rows="3" placeholder="请详细描述工作内容" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitDaily" :loading="loading.daily">提交报工</el-button>
                <el-button @click="resetDailyForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 图表统计 -->
    <div class="charts-section">
      <el-card class="chart-card" shadow="never">
        <div slot="header" class="chart-header">
          <div class="header-title">
            <i class="el-icon-pie-chart"></i>
            生产效率统计
          </div>
        </div>
        <div ref="efficiencyChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <div slot="header" class="chart-header">
          <div class="header-title">
            <i class="el-icon-trend-charts"></i>
            设备利用率
          </div>
        </div>
        <div ref="utilizationChart" class="chart-container" v-loading="loading.chart"></div>
      </el-card>
    </div>

    <!-- 最近报工记录 -->
    <el-card shadow="never" class="table-card">
      <div slot="header" class="table-header">
        <div class="header-title">
          <i class="el-icon-document"></i>
          最近报工记录
        </div>
        <div class="header-actions">
          <el-button size="small" @click="viewAllRecords">查看全部</el-button>
        </div>
      </div>

      <el-table :data="recentRecords" stripe size="small">
        <el-table-column prop="time" label="时间" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getWorkTypeTag(scope.row.type)" size="mini">
              {{ getWorkTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="200" />
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="mini">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Shengchanbaogong',
  data() {
    return {
      activeName: 'enter',
      currentStation: '工位001',
      currentOperator: '张三',

      loading: {
        enter: false,
        mount: false,
        unmount: false,
        inspect: false,
        daily: false,
        chart: false
      },

      statistics: [
        {
          key: 'todayOutput',
          label: '今日产量',
          value: 1580,
          icon: 'el-icon-goods',
          type: 'primary',
          trend: '+12%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'efficiency',
          label: '生产效率',
          value: '92%',
          icon: 'el-icon-circle-check',
          type: 'success',
          trend: '+5%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'onlineEquipment',
          label: '在线设备',
          value: 8,
          icon: 'el-icon-monitor',
          type: 'warning',
          trend: '+2',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        },
        {
          key: 'qualityRate',
          label: '合格率',
          value: '98.5%',
          icon: 'el-icon-medal',
          type: 'info',
          trend: '+1.2%',
          trendType: 'up',
          trendIcon: 'el-icon-arrow-up'
        }
      ],

      // 进站表单
      enterForm: {
        workOrder: '',
        productCode: '',
        productName: '',
        processRoute: '',
        currentProcess: '',
        quantity: 1
      },
      enterRules: {
        workOrder: [{ required: true, message: '请输入工单号', trigger: 'blur' }],
        processRoute: [{ required: true, message: '请选择工艺路线', trigger: 'change' }],
        currentProcess: [{ required: true, message: '请选择当前工序', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
      },

      // 上机表单
      mountForm: {
        equipmentCode: '',
        equipmentStatus: '',
        operator: '',
        startTime: new Date(),
        remark: ''
      },
      mountRules: {
        equipmentCode: [{ required: true, message: '请选择设备', trigger: 'change' }],
        operator: [{ required: true, message: '请输入操作员', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }]
      },

      // 下机表单
      unmountForm: {
        equipmentCode: '',
        completedQuantity: 0,
        defectQuantity: 0,
        endTime: new Date(),
        qualityStatus: '',
        reason: ''
      },
      unmountRules: {
        equipmentCode: [{ required: true, message: '请选择设备', trigger: 'change' }],
        completedQuantity: [{ required: true, message: '请输入完成数量', trigger: 'blur' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        qualityStatus: [{ required: true, message: '请选择质量状态', trigger: 'change' }]
      },

      // 自检表单
      inspectForm: {
        inspectItem: '',
        inspectQuantity: 1,
        inspectResult: '',
        inspectTime: new Date(),
        inspector: '',
        remark: ''
      },
      inspectRules: {
        inspectItem: [{ required: true, message: '请选择检验项目', trigger: 'change' }],
        inspectQuantity: [{ required: true, message: '请输入检验数量', trigger: 'blur' }],
        inspectResult: [{ required: true, message: '请选择检验结果', trigger: 'change' }],
        inspector: [{ required: true, message: '请输入检验员', trigger: 'blur' }]
      },

      // 日常报工表单
      dailyForm: {
        workType: '',
        workHours: 0,
        outputQuantity: 0,
        reportTime: new Date(),
        reporter: '',
        workContent: ''
      },
      dailyRules: {
        workType: [{ required: true, message: '请选择报工类型', trigger: 'change' }],
        workHours: [{ required: true, message: '请输入工作时长', trigger: 'blur' }],
        reporter: [{ required: true, message: '请输入报工人', trigger: 'blur' }],
        workContent: [{ required: true, message: '请输入工作内容', trigger: 'blur' }]
      },

      // 下拉选项数据
      processRoutes: [
        { label: '标准工艺路线A', value: 'route_a' },
        { label: '标准工艺路线B', value: 'route_b' },
        { label: '特殊工艺路线C', value: 'route_c' }
      ],

      currentProcesses: [
        { label: '铣削加工', value: 'milling' },
        { label: '车削加工', value: 'turning' },
        { label: '钻孔加工', value: 'drilling' },
        { label: '装配', value: 'assembly' }
      ],

      equipmentList: [
        { code: 'EQ001', name: '数控铣床001', status: '运行中' },
        { code: 'EQ002', name: '数控车床002', status: '空闲' },
        { code: 'EQ003', name: '钻床003', status: '维修中' }
      ],

      inspectItems: [
        { label: '尺寸检验', value: 'dimension' },
        { label: '外观检验', value: 'appearance' },
        { label: '功能检验', value: 'function' }
      ],

      recentRecords: [
        { time: '2024-06-29 14:30', type: 'enter', content: '工单WO001进站', operator: '张三', quantity: 100, status: '完成' },
        { time: '2024-06-29 14:25', type: 'mount', content: '设备EQ001上机', operator: '李四', quantity: 50, status: '进行中' },
        { time: '2024-06-29 14:20', type: 'inspect', content: '尺寸检验', operator: '王五', quantity: 30, status: '合格' }
      ]
    }
  },

  computed: {
    runningEquipment() {
      return this.equipmentList.filter((eq) => eq.status === '运行中')
    }
  },

  mounted() {
    this.renderCharts()
    window.addEventListener('resize', this.resizeCharts)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },

  methods: {
    // Tab切换
    handleTabClick(tab) {
      console.log('切换到标签页:', tab.name)
    },

    // 数据刷新
    refreshData() {
      this.loadStatistics()
      this.loadRecentRecords()
      this.renderCharts()
      this.$message.success('数据刷新成功')
    },

    exportData() {
      this.$message.info('导出功能开发中...')
    },

    // 工单搜索
    searchWorkOrder() {
      if (!this.enterForm.workOrder) {
        this.$message.warning('请输入工单号')
        return
      }

      // 模拟搜索工单信息
      this.enterForm.productCode = 'P001'
      this.enterForm.productName = '测试产品A'
      this.$message.success('工单信息获取成功')
    },

    // 表单提交
    submitEnter() {
      this.$refs.enterForm.validate(async (valid) => {
        if (valid) {
          this.loading.enter = true
          try {
            await this.delay(1000)
            this.$message.success('进站成功')
            this.resetEnterForm()
          } finally {
            this.loading.enter = false
          }
        }
      })
    },

    submitMount() {
      this.$refs.mountForm.validate(async (valid) => {
        if (valid) {
          this.loading.mount = true
          try {
            await this.delay(1000)
            this.$message.success('上机成功')
            this.resetMountForm()
          } finally {
            this.loading.mount = false
          }
        }
      })
    },

    submitUnmount() {
      this.$refs.unmountForm.validate(async (valid) => {
        if (valid) {
          this.loading.unmount = true
          try {
            await this.delay(1000)
            this.$message.success('下机成功')
            this.resetUnmountForm()
          } finally {
            this.loading.unmount = false
          }
        }
      })
    },

    submitInspect() {
      this.$refs.inspectForm.validate(async (valid) => {
        if (valid) {
          this.loading.inspect = true
          try {
            await this.delay(1000)
            this.$message.success('检验提交成功')
            this.resetInspectForm()
          } finally {
            this.loading.inspect = false
          }
        }
      })
    },

    submitDaily() {
      this.$refs.dailyForm.validate(async (valid) => {
        if (valid) {
          this.loading.daily = true
          try {
            await this.delay(1000)
            this.$message.success('报工提交成功')
            this.resetDailyForm()
          } finally {
            this.loading.daily = false
          }
        }
      })
    },

    // 表单重置
    resetEnterForm() {
      this.$refs.enterForm?.resetFields()
    },

    resetMountForm() {
      this.$refs.mountForm?.resetFields()
    },

    resetUnmountForm() {
      this.$refs.unmountForm?.resetFields()
    },

    resetInspectForm() {
      this.$refs.inspectForm?.resetFields()
    },

    resetDailyForm() {
      this.$refs.dailyForm?.resetFields()
    },

    // 图表渲染
    renderCharts() {
      this.$nextTick(() => {
        this.renderEfficiencyChart()
        this.renderUtilizationChart()
      })
    },

    renderEfficiencyChart() {
      if (!this.$refs.efficiencyChart) return

      const chart = echarts.init(this.$refs.efficiencyChart)
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['目标效率', '实际效率'] },
        xAxis: {
          type: 'category',
          data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
        },
        yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
        series: [
          {
            name: '目标效率',
            type: 'line',
            data: [85, 85, 85, 85, 85, 85],
            lineStyle: { type: 'dashed', color: '#E6A23C' }
          },
          {
            name: '实际效率',
            type: 'line',
            data: [82, 88, 90, 87, 92, 89],
            smooth: true,
            itemStyle: { color: '#409EFF' }
          }
        ]
      }

      chart.setOption(option)
    },

    renderUtilizationChart() {
      if (!this.$refs.utilizationChart) return

      const chart = echarts.init(this.$refs.utilizationChart)
      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
        series: [
          {
            name: '设备利用率',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 75, name: '运行中' },
              { value: 15, name: '空闲' },
              { value: 10, name: '维修中' }
            ],
            itemStyle: {
              color: function (params) {
                const colors = ['#67C23A', '#E6A23C', '#F56C6C']
                return colors[params.dataIndex]
              }
            }
          }
        ]
      }

      chart.setOption(option)
    },

    resizeCharts() {
      const charts = [this.$refs.efficiencyChart, this.$refs.utilizationChart]
      charts.forEach((el) => {
        if (el) {
          const chart = echarts.getInstanceByDom(el)
          if (chart) chart.resize()
        }
      })
    },

    // 工具方法
    getEquipmentStatusType(status) {
      const types = { 运行中: 'success', 空闲: 'warning', 维修中: 'danger' }
      return types[status] || 'info'
    },

    getWorkTypeTag(type) {
      const tags = { enter: 'primary', mount: 'success', unmount: 'warning', inspect: 'info', daily: '' }
      return tags[type] || 'info'
    },

    getWorkTypeLabel(type) {
      const labels = { enter: '进站', mount: '上机', unmount: '下机', inspect: '自检', daily: '报工' }
      return labels[type] || type
    },

    getStatusTag(status) {
      const tags = { 完成: 'success', 进行中: 'warning', 合格: 'success' }
      return tags[status] || 'info'
    },

    viewAllRecords() {
      this.$message.info('跳转到报工记录页面...')
    },

    loadStatistics() {
      // 模拟统计数据加载
    },

    loadRecentRecords() {
      // 模拟最近记录加载
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.shengchanbaogong {
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
.stat-icon.success {
  background: linear-gradient(135deg, #67c23a, #52c41a);
}
.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #fa8c16);
}
.stat-icon.info {
  background: linear-gradient(135deg, #909399, #722ed1);
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
  color: #67c23a;
}

/* 主卡片 */
.main-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
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

.header-info {
  display: flex;
  gap: 8px;
}

/* 标签页 */
.work-tabs {
  margin-top: 20px;
}

.tab-content {
  padding: 20px 0;
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
}
</style>
