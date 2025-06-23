<template>
  <div class="production-detail-container">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button icon="el-icon-arrow-left" type="text" @click="goBack" class="back-btn">返回列表</el-button>
        <div class="page-title">
          <h1>生产任务详情</h1>
          <span class="task-id">{{ taskInfo.taskId }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="primary" icon="el-icon-edit" @click="editTask">编辑</el-button>
          <el-button type="success" icon="el-icon-printer" @click="printTask">打印</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteTask">删除</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 任务概览卡片 -->
    <el-card class="task-overview-card" shadow="never">
      <div class="overview-header">
        <div class="task-status">
          <el-tag :type="getStatusType(taskInfo.status)" size="large" class="status-tag">
            <i :class="getStatusIcon(taskInfo.status)"></i>
            {{ getStatusText(taskInfo.status) }}
          </el-tag>
          <div class="task-progress">
            <span class="progress-text">完成进度</span>
            <el-progress
              :percentage="taskInfo.progress"
              :status="taskInfo.progress === 100 ? 'success' : 'active'"
              :stroke-width="8"
              class="progress-bar" />
          </div>
        </div>
        <div class="task-priority">
          <el-tag :type="getPriorityType(taskInfo.priority)" size="medium">
            <i class="el-icon-flag"></i>
            {{ taskInfo.priority }}
          </el-tag>
        </div>
      </div>

      <el-row :gutter="20" class="task-details">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">物料编码</span>
            <span class="detail-value material-code">{{ taskInfo.materialCode }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">物料名称</span>
            <span class="detail-value">{{ taskInfo.materialName }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">版本</span>
            <span class="detail-value version">{{ taskInfo.version }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">数量</span>
            <span class="detail-value quantity">{{ taskInfo.quantity }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">材质</span>
            <span class="detail-value">{{ taskInfo.material }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">毛坯尺寸</span>
            <span class="detail-value">{{ taskInfo.blankSize }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">客户交期</span>
            <span class="detail-value delivery-date">{{ formatDate(taskInfo.deliveryDate) }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">加工类型</span>
            <span class="detail-value">{{ taskInfo.processType }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">制单人</span>
            <span class="detail-value">{{ taskInfo.creator }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="detail-item">
            <span class="detail-label">制单日期</span>
            <span class="detail-value">{{ formatDateTime(taskInfo.createTime) }}</span>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="16" :lg="12">
          <div class="detail-item">
            <span class="detail-label">描述</span>
            <span class="detail-value">{{ taskInfo.description || '--' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 详细信息选项卡 -->
    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeName" @tab-click="handleTabClick" class="custom-tabs">
        <!-- 工序流程 -->
        <el-tab-pane name="process">
          <span slot="label">
            <i class="el-icon-cpu"></i>
            工序流程
          </span>
          <div class="process-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(process, index) in processData"
                :key="index"
                :timestamp="process.name"
                placement="top"
                :type="getProcessType(process.status)"
                :color="getProcessColor(process.status)"
                size="large">
                <div class="process-card">
                  <div class="process-header">
                    <span class="process-name">{{ process.name }}</span>
                    <el-tag :type="getProcessStatusType(process.status)" size="small">
                      {{ getProcessStatusText(process.status) }}
                    </el-tag>
                  </div>

                  <el-row :gutter="16" class="process-details" v-if="process.details">
                    <el-col :span="8">
                      <div class="process-detail-item">
                        <i class="el-icon-time"></i>
                        <div class="detail-content">
                          <span class="detail-label">进站时间</span>
                          <span class="detail-value">{{ formatDateTime(process.details.startTime) }}</span>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="process-detail-item">
                        <i class="el-icon-finished"></i>
                        <div class="detail-content">
                          <span class="detail-label">出站时间</span>
                          <span class="detail-value">{{ formatDateTime(process.details.endTime) }}</span>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="process-detail-item">
                        <i class="el-icon-timer"></i>
                        <div class="detail-content">
                          <span class="detail-label">用时</span>
                          <span class="detail-value duration">{{ process.details.duration }}</span>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="process-detail-item">
                        <i class="el-icon-user"></i>
                        <div class="detail-content">
                          <span class="detail-label">操作人员</span>
                          <span class="detail-value">{{ process.details.operator }}</span>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="process-detail-item">
                        <i class="el-icon-goods"></i>
                        <div class="detail-content">
                          <span class="detail-label">完成数量</span>
                          <span class="detail-value">{{ process.details.quantity }}</span>
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="process-detail-item">
                        <i class="el-icon-setting"></i>
                        <div class="detail-content">
                          <span class="detail-label">设备机台</span>
                          <span class="detail-value">{{ process.details.equipment }}</span>
                        </div>
                      </div>
                    </el-col>
                  </el-row>

                  <div v-if="process.status === 'pending'" class="pending-info">
                    <i class="el-icon-warning-outline"></i>
                    <span>等待上一工序完成</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>

        <!-- 操作记录 -->
        <el-tab-pane name="records">
          <span slot="label">
            <i class="el-icon-document"></i>
            操作记录
          </span>
          <div class="records-content">
            <el-table :data="recordsData" border stripe>
              <el-table-column prop="time" label="时间" width="160" align="center">
                <template slot-scope="scope">
                  {{ formatDateTime(scope.row.time) }}
                </template>
              </el-table-column>
              <el-table-column prop="operator" label="操作人" width="120" align="center"></el-table-column>
              <el-table-column prop="action" label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getActionType(scope.row.action)" size="small">
                    {{ scope.row.action }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 零件明细 -->
        <el-tab-pane name="parts">
          <span slot="label">
            <i class="el-icon-menu"></i>
            零件明细
          </span>
          <div class="parts-content">
            <el-table :data="partsData" border stripe>
              <el-table-column prop="partNo" label="零件编号" width="160" align="center"></el-table-column>
              <el-table-column prop="partName" label="零件名称" min-width="200"></el-table-column>
              <el-table-column prop="quantity" label="数量" width="100" align="center"></el-table-column>
              <el-table-column prop="material" label="材质" width="120" align="center"></el-table-column>
              <el-table-column prop="size" label="尺寸" width="150" align="center"></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getPartStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 工时记录 -->
        <el-tab-pane name="workhours">
          <span slot="label">
            <i class="el-icon-time"></i>
            工时记录
          </span>
          <div class="workhours-content">
            <div class="workhours-summary">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="summary-item">
                    <span class="summary-label">计划工时</span>
                    <span class="summary-value">{{ workhoursData.plannedHours }}H</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="summary-item">
                    <span class="summary-label">实际工时</span>
                    <span class="summary-value">{{ workhoursData.actualHours }}H</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="summary-item">
                    <span class="summary-label">效率</span>
                    <span class="summary-value efficiency">{{ workhoursData.efficiency }}%</span>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="summary-item">
                    <span class="summary-label">状态</span>
                    <el-tag :type="workhoursData.efficiency >= 100 ? 'success' : 'warning'">
                      {{ workhoursData.efficiency >= 100 ? '高效' : '正常' }}
                    </el-tag>
                  </div>
                </el-col>
              </el-row>
            </div>
            <el-table :data="workhoursData.details" border stripe>
              <el-table-column prop="process" label="工序" width="120" align="center"></el-table-column>
              <el-table-column prop="operator" label="操作人" width="100" align="center"></el-table-column>
              <el-table-column prop="startTime" label="开始时间" width="160" align="center">
                <template slot-scope="scope">
                  {{ formatDateTime(scope.row.startTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="endTime" label="结束时间" width="160" align="center">
                <template slot-scope="scope">
                  {{ formatDateTime(scope.row.endTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="duration" label="用时" width="100" align="center"></el-table-column>
              <el-table-column prop="equipment" label="设备" width="120" align="center"></el-table-column>
              <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 物料需求 -->
        <el-tab-pane name="materials">
          <span slot="label">
            <i class="el-icon-box"></i>
            物料需求
          </span>
          <div class="materials-content">
            <el-table :data="materialsData" border stripe>
              <el-table-column prop="materialCode" label="物料编码" width="160" align="center"></el-table-column>
              <el-table-column prop="materialName" label="物料名称" min-width="200"></el-table-column>
              <el-table-column prop="specification" label="规格" width="150" align="center"></el-table-column>
              <el-table-column prop="requiredQty" label="需求数量" width="100" align="center"></el-table-column>
              <el-table-column prop="actualQty" label="实际数量" width="100" align="center"></el-table-column>
              <el-table-column prop="unit" label="单位" width="80" align="center"></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getMaterialStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 质量检验 -->
        <el-tab-pane name="quality">
          <span slot="label">
            <i class="el-icon-medal"></i>
            质量检验
          </span>
          <div class="quality-content">
            <el-collapse v-model="qualityActiveNames">
              <el-collapse-item title="过程检验" name="process-quality">
                <el-table :data="qualityData.processQuality" border stripe>
                  <el-table-column prop="checkPoint" label="检验点" width="120" align="center"></el-table-column>
                  <el-table-column prop="checkTime" label="检验时间" width="160" align="center">
                    <template slot-scope="scope">
                      {{ formatDateTime(scope.row.checkTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="inspector" label="检验员" width="100" align="center"></el-table-column>
                  <el-table-column prop="result" label="检验结果" width="100" align="center">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.result === '合格' ? 'success' : 'danger'" size="small">
                        {{ scope.row.result }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
                </el-table>
              </el-collapse-item>

              <el-collapse-item title="成品检验" name="final-quality">
                <el-table :data="qualityData.finalQuality" border stripe>
                  <el-table-column prop="checkItem" label="检验项目" width="150" align="center"></el-table-column>
                  <el-table-column prop="standard" label="标准值" width="120" align="center"></el-table-column>
                  <el-table-column prop="actualValue" label="实测值" width="120" align="center"></el-table-column>
                  <el-table-column prop="result" label="结果" width="80" align="center">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.result === '合格' ? 'success' : 'danger'" size="small">
                        {{ scope.row.result }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="inspector" label="检验员" width="100" align="center"></el-table-column>
                  <el-table-column prop="checkTime" label="检验时间" width="160" align="center">
                    <template slot-scope="scope">
                      {{ formatDateTime(scope.row.checkTime) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>

        <!-- 问题记录 -->
        <el-tab-pane name="issues">
          <span slot="label">
            <i class="el-icon-warning"></i>
            问题记录
          </span>
          <div class="issues-content">
            <el-table :data="issuesData" border stripe>
              <el-table-column prop="issueTime" label="发现时间" width="160" align="center">
                <template slot-scope="scope">
                  {{ formatDateTime(scope.row.issueTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="issueType" label="问题类型" width="120" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getIssueType(scope.row.issueType)" size="small">
                    {{ scope.row.issueType }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="问题描述" min-width="200"></el-table-column>
              <el-table-column prop="reporter" label="报告人" width="100" align="center"></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === '已解决' ? 'success' : 'warning'" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="solution" label="解决方案" min-width="200"></el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ProductionDetail',
  data() {
    return {
      activeName: 'process',
      qualityActiveNames: ['process-quality'],

      // 任务基本信息
      taskInfo: {
        taskId: 'M20230923',
        materialCode: '02-62-00-0369-00',
        materialName: '盖天腔体支撑架',
        version: '02',
        quantity: 15,
        material: 'AL6061',
        blankSize: '100*100*25',
        deliveryDate: '2023-09-29',
        processType: '打样',
        creator: '刘旭',
        createTime: '2023-09-23 15:56',
        description: '高精度加工件，注意表面处理',
        priority: '正常',
        status: 'processing',
        progress: 65
      },

      // 工序数据
      processData: [
        {
          name: '下料',
          status: 'completed',
          details: {
            startTime: '2023-09-23 20:08',
            endTime: '2023-09-24 08:08',
            duration: '12H',
            operator: '刘旭',
            quantity: 15,
            equipment: '锯床1号'
          }
        },
        {
          name: 'CNC加工',
          status: 'processing',
          details: {
            startTime: '2023-09-24 08:30',
            endTime: null,
            duration: '进行中',
            operator: '张三',
            quantity: 15,
            equipment: '瑞星37'
          }
        },
        {
          name: '慢走丝',
          status: 'pending',
          details: null
        },
        {
          name: '后处理',
          status: 'pending',
          details: null
        },
        {
          name: '入库',
          status: 'pending',
          details: null
        }
      ],

      // 操作记录数据
      recordsData: [
        {
          time: '2023-09-23 15:56',
          operator: '刘旭',
          action: '创建任务',
          description: '创建生产任务M20230923'
        },
        {
          time: '2023-09-23 16:10',
          operator: '刘旭',
          action: '分配工序',
          description: '分配下料工序给锯床1号'
        },
        {
          time: '2023-09-23 20:08',
          operator: '王五',
          action: '开始生产',
          description: '下料工序开始生产'
        }
      ],

      // 零件明细数据
      partsData: [
        {
          partNo: 'P001',
          partName: '主体支撑架',
          quantity: 1,
          material: 'AL6061',
          size: '100*100*25',
          status: '加工中'
        }
      ],

      // 工时记录数据
      workhoursData: {
        plannedHours: 20,
        actualHours: 18,
        efficiency: 111,
        details: [
          {
            process: '下料',
            operator: '王五',
            startTime: '2023-09-23 20:08',
            endTime: '2023-09-24 08:08',
            duration: '12H',
            equipment: '锯床1号',
            remark: '正常完成'
          }
        ]
      },

      // 物料需求数据
      materialsData: [
        {
          materialCode: 'AL6061-001',
          materialName: '铝合金板材',
          specification: '100*100*25',
          requiredQty: 1,
          actualQty: 1,
          unit: '件',
          status: '已发料'
        }
      ],

      // 质量检验数据
      qualityData: {
        processQuality: [
          {
            checkPoint: '下料完成',
            checkTime: '2023-09-24 08:15',
            inspector: '李四',
            result: '合格',
            remark: '尺寸符合要求'
          }
        ],
        finalQuality: [
          {
            checkItem: '外观质量',
            standard: '无划痕',
            actualValue: '无划痕',
            result: '合格',
            inspector: '李四',
            checkTime: '2023-09-24 08:15'
          }
        ]
      },

      // 问题记录数据
      issuesData: [
        {
          issueTime: '2023-09-24 10:30',
          issueType: '质量问题',
          description: '发现表面有轻微划痕',
          reporter: '张三',
          status: '已解决',
          solution: '重新抛光处理'
        }
      ]
    }
  },

  methods: {
    // 返回列表
    goBack() {
      this.$router.go(-1)
    },

    // 编辑任务
    editTask() {
      this.$message.info('编辑功能开发中')
    },

    // 打印任务
    printTask() {
      this.$message.info('打印功能开发中')
    },

    // 删除任务
    deleteTask() {
      this.$confirm('确定要删除该生产任务吗？', '确认删除', {
        type: 'warning'
      })
        .then(() => {
          this.$message.success('删除成功')
        })
        .catch(() => {})
    },

    // 处理选项卡点击
    handleTabClick(tab) {
      console.log('切换到选项卡:', tab.name)
    },

    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
        cancelled: 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        pending: 'el-icon-time',
        processing: 'el-icon-loading',
        completed: 'el-icon-success',
        cancelled: 'el-icon-error'
      }
      return iconMap[status] || 'el-icon-info'
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        pending: '待开始',
        processing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return textMap[status] || '未知'
    },

    // 获取优先级类型
    getPriorityType(priority) {
      const typeMap = {
        紧急: 'danger',
        高: 'warning',
        正常: 'success',
        低: 'info'
      }
      return typeMap[priority] || 'info'
    },

    // 获取工序类型
    getProcessType(status) {
      return status === 'completed' ? 'success' : status === 'processing' ? 'warning' : 'info'
    },

    // 获取工序颜色
    getProcessColor(status) {
      const colorMap = {
        completed: '#67c23a',
        processing: '#e6a23c',
        pending: '#909399'
      }
      return colorMap[status] || '#909399'
    },

    // 获取工序状态类型
    getProcessStatusType(status) {
      const typeMap = {
        completed: 'success',
        processing: 'warning',
        pending: 'info'
      }
      return typeMap[status] || 'info'
    },

    // 获取工序状态文本
    getProcessStatusText(status) {
      const textMap = {
        completed: '已完成',
        processing: '进行中',
        pending: '待开始'
      }
      return textMap[status] || '未知'
    },

    // 获取操作类型
    getActionType(action) {
      const typeMap = {
        创建任务: 'primary',
        分配工序: 'success',
        开始生产: 'warning',
        完成工序: 'success',
        暂停: 'info',
        取消: 'danger'
      }
      return typeMap[action] || 'info'
    },

    // 获取零件状态类型
    getPartStatusType(status) {
      const typeMap = {
        待加工: 'info',
        加工中: 'warning',
        已完成: 'success',
        不合格: 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 获取物料状态类型
    getMaterialStatusType(status) {
      const typeMap = {
        待发料: 'info',
        已发料: 'success',
        缺料: 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 获取问题类型
    getIssueType(type) {
      const typeMap = {
        质量问题: 'danger',
        设备故障: 'warning',
        物料问题: 'info',
        工艺问题: 'primary'
      }
      return typeMap[type] || 'info'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleDateString('zh-CN')
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      return new Date(dateTime).toLocaleString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.production-detail-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .back-btn {
        color: #606266;
        font-size: 14px;

        &:hover {
          color: #409eff;
        }
      }

      .page-title {
        h1 {
          margin: 0;
          font-size: 24px;
          color: #303133;
          font-weight: 600;
        }

        .task-id {
          font-size: 14px;
          color: #909399;
          margin-left: 8px;
        }
      }
    }
  }

  // 任务概览卡片
  .task-overview-card {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e4e7ed;

      .task-status {
        display: flex;
        align-items: center;
        gap: 20px;

        .status-tag {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;

          i {
            margin-right: 6px;
          }
        }

        .task-progress {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .progress-text {
            font-size: 12px;
            color: #909399;
          }

          .progress-bar {
            width: 200px;
          }
        }
      }
    }

    .task-details {
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 12px;

        .detail-label {
          font-size: 12px;
          color: #909399;
          font-weight: 500;
        }

        .detail-value {
          font-size: 14px;
          color: #303133;
          font-weight: 600;

          &.material-code {
            font-family: 'Courier New', monospace;
            color: #409eff;
          }

          &.version {
            color: #e6a23c;
          }

          &.quantity {
            color: #67c23a;
            font-size: 16px;
          }

          &.delivery-date {
            color: #f56c6c;
          }
        }
      }
    }
  }

  // 选项卡卡片
  .tabs-card {
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .custom-tabs {
      ::v-deep .el-tabs__header {
        background: #f8f9fa;
        margin: 0;
        padding: 0 20px;
        border-radius: 12px 12px 0 0;

        .el-tabs__nav-wrap {
          &::after {
            display: none;
          }
        }

        .el-tabs__item {
          padding: 0 20px;
          height: 50px;
          line-height: 50px;
          font-size: 14px;
          font-weight: 500;

          i {
            margin-right: 6px;
          }

          &.is-active {
            color: #409eff;
            background: #ffffff;
            border-radius: 8px 8px 0 0;
            margin-top: 4px;
            border-bottom: 2px solid #409eff;
          }
        }
      }

      ::v-deep .el-tabs__content {
        padding: 20px;
      }
    }
  }

  // 工序时间线
  .process-timeline {
    ::v-deep .el-timeline {
      .el-timeline-item__wrapper {
        padding-left: 40px;
      }

      .el-timeline-item__node {
        width: 16px;
        height: 16px;
        border-width: 2px;
      }

      .el-timeline-item__timestamp {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }
    }

    .process-card {
      background: #ffffff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      .process-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .process-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .process-details {
        .process-detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 8px;

          i {
            color: #409eff;
            font-size: 16px;
          }

          .detail-content {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .detail-label {
              font-size: 12px;
              color: #909399;
            }

            .detail-value {
              font-size: 14px;
              color: #303133;
              font-weight: 500;

              &.duration {
                color: #e6a23c;
                font-weight: 600;
              }
            }
          }
        }
      }

      .pending-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #fdf6ec;
        border-radius: 6px;
        color: #e6a23c;
        font-size: 14px;

        i {
          font-size: 16px;
        }
      }
    }
  }

  // 工时汇总
  .workhours-summary {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .summary-label {
        font-size: 14px;
        color: #909399;
      }

      .summary-value {
        font-size: 24px;
        font-weight: 700;
        color: #303133;

        &.efficiency {
          color: #67c23a;
        }
      }
    }
  }

  // 表格样式
  ::v-deep .el-table {
    border-radius: 8px;
    overflow: hidden;

    .el-table__header-wrapper {
      th {
        background: #f8f9fa;
        color: #606266;
        font-weight: 600;
      }
    }

    .el-table__body-wrapper {
      tr:hover {
        background: #f0f9ff;
      }
    }
  }

  // 折叠面板样式
  ::v-deep .el-collapse {
    border: none;

    .el-collapse-item__header {
      background: #f8f9fa;
      border: none;
      padding: 0 16px;
      font-weight: 600;
      color: #303133;
    }

    .el-collapse-item__content {
      padding: 16px;
      background: #ffffff;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .production-detail-container {
    .task-details {
      .el-col {
        margin-bottom: 12px;
      }
    }

    .overview-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
  }
}

@media (max-width: 768px) {
  .production-detail-container {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .process-details {
      .el-col {
        margin-bottom: 8px;
      }
    }

    .workhours-summary {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
