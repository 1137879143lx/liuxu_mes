<template>
  <div class="modern-dashboard">
    <!-- 顶部导航栏 -->
    <div class="dashboard-navbar">
      <div class="navbar-content">
        <div class="navbar-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path
                fill="currentColor"
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
            </svg>
          </div>
          <div class="brand-text">
            <h1>智能制造看板</h1>
            <span>Smart Manufacturing Dashboard</span>
          </div>
        </div>
        <div class="navbar-actions">
          <div class="time-display">
            <div class="time">{{ currentTime }}</div>
            <div class="date">{{ currentDate }}</div>
          </div>
          <div class="status-indicator online">
            <div class="indicator-dot"></div>
            <span>系统正常</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- KPI 指标卡片 -->
      <div class="kpi-section">
        <div class="kpi-card production-kpi">
          <div class="kpi-header">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
              </svg>
            </div>
            <div class="kpi-title">生产产量</div>
          </div>
          <div class="kpi-value">{{ metrics.todayProduction }}</div>
          <div class="kpi-subtitle">今日已完成</div>
          <div class="kpi-trend up">
            <span class="trend-icon">↗</span>
            <span>+15.8%</span>
          </div>
          <div class="kpi-chart">
            <div class="progress-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path
                  class="circle"
                  :stroke-dasharray="`${productionProgress}, 100`"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="percentage">{{ Math.round(productionProgress) }}%</div>
            </div>
          </div>
        </div>

        <div class="kpi-card efficiency-kpi">
          <div class="kpi-header">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
              </svg>
            </div>
            <div class="kpi-title">设备效率</div>
          </div>
          <div class="kpi-value">{{ metrics.efficiency }}%</div>
          <div class="kpi-subtitle">运行效率</div>
          <div class="kpi-trend up">
            <span class="trend-icon">↗</span>
            <span>+3.2%</span>
          </div>
          <div class="kpi-chart">
            <div class="gauge-container">
              <div class="gauge" :style="{ '--percentage': metrics.efficiency }"></div>
            </div>
          </div>
        </div>

        <div class="kpi-card quality-kpi">
          <div class="kpi-header">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
              </svg>
            </div>
            <div class="kpi-title">产品质量</div>
          </div>
          <div class="kpi-value">{{ metrics.qualityRate }}%</div>
          <div class="kpi-subtitle">合格率</div>
          <div class="kpi-trend up">
            <span class="trend-icon">↗</span>
            <span>+0.5%</span>
          </div>
          <div class="kpi-chart">
            <div class="quality-score excellent">A+</div>
          </div>
        </div>

        <div class="kpi-card orders-kpi">
          <div class="kpi-header">
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <div class="kpi-title">在产订单</div>
          </div>
          <div class="kpi-value">{{ metrics.orderCount }}</div>
          <div class="kpi-subtitle">活跃订单</div>
          <div class="kpi-trend down">
            <span class="trend-icon">↘</span>
            <span>-2</span>
          </div>
          <div class="kpi-chart">
            <div class="mini-bars">
              <div class="bar" style="height: 40%"></div>
              <div class="bar" style="height: 65%"></div>
              <div class="bar" style="height: 85%"></div>
              <div class="bar" style="height: 70%"></div>
              <div class="bar" style="height: 90%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要面板区域 -->
      <div class="panels-section">
        <!-- 设备状态面板 -->
        <div class="panel equipment-panel">
          <div class="panel-header">
            <h3>设备监控</h3>
            <div class="panel-filters">
              <button
                v-for="filter in statusFilters"
                :key="filter.value"
                :class="['filter-btn', { active: statusFilter === filter.value }]"
                @click="filterStatus(filter.value)">
                {{ filter.label }}
              </button>
            </div>
          </div>
          <div class="panel-content">
            <div class="equipment-grid">
              <div v-for="equipment in filteredEquipment" :key="equipment.id" :class="['equipment-item', equipment.status]">
                <div class="equipment-status-indicator"></div>
                <div class="equipment-info">
                  <div class="equipment-name">{{ equipment.name }}</div>
                  <div class="equipment-status-text">{{ getStatusText(equipment.status) }}</div>
                  <div class="equipment-task">{{ equipment.currentTask || '空闲中' }}</div>
                </div>
                <div class="equipment-progress">
                  <div class="progress-ring">
                    <svg class="ring-svg" viewBox="0 0 40 40">
                      <circle class="ring-bg" cx="20" cy="20" r="15" fill="none" stroke-width="3" />
                      <circle
                        class="ring-progress"
                        cx="20"
                        cy="20"
                        r="15"
                        fill="none"
                        stroke-width="3"
                        :stroke-dasharray="`${equipment.progress * 0.942} 94.2`" />
                    </svg>
                    <div class="progress-text">{{ equipment.progress }}%</div>
                  </div>
                </div>
                <div class="equipment-operator">
                  <div class="operator-avatar">{{ equipment.operator ? equipment.operator.charAt(0) : '?' }}</div>
                  <span>{{ equipment.operator || '未分配' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 生产任务面板 -->
        <div class="panel tasks-panel">
          <div class="panel-header">
            <h3>生产任务</h3>
            <button class="refresh-btn" @click="refreshTasks">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="currentColor"
                  d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
              </svg>
            </button>
          </div>
          <div class="panel-content">
            <div class="tasks-list">
              <div v-for="task in tasks" :key="task.id" :class="['task-item', task.priority, task.status]">
                <div class="task-priority-bar"></div>
                <div class="task-content">
                  <div class="task-header">
                    <div class="task-title">{{ task.title }}</div>
                    <div class="task-priority-badge">{{ getPriorityText(task.priority) }}</div>
                  </div>
                  <div class="task-meta">
                    <div class="meta-item">
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path
                          fill="currentColor"
                          d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                      </svg>
                      <span>{{ task.operator }}</span>
                    </div>
                    <div class="meta-item">
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path
                          fill="currentColor"
                          d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                      </svg>
                      <span>{{ task.estimatedTime }}h</span>
                    </div>
                    <div class="meta-item">
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path
                          fill="currentColor"
                          d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z" />
                      </svg>
                      <span>{{ task.equipment }}</span>
                    </div>
                  </div>
                  <div class="task-progress-bar">
                    <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 质量分析面板 -->
        <div class="panel quality-panel">
          <div class="panel-header">
            <h3>质量分析</h3>
            <select v-model="qualityPeriod" class="period-select">
              <option value="today">今日</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
          <div class="panel-content">
            <div class="quality-overview">
              <div class="quality-metric excellent">
                <div class="metric-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M5,16L3,14L9.5,7.5L13,11L22,2L23,3L13,13L9.5,9.5L5,16Z" />
                  </svg>
                </div>
                <div class="metric-data">
                  <div class="metric-value">{{ qualityData.excellent }}</div>
                  <div class="metric-label">优秀</div>
                </div>
              </div>
              <div class="quality-metric good">
                <div class="metric-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                </div>
                <div class="metric-data">
                  <div class="metric-value">{{ qualityData.good }}</div>
                  <div class="metric-label">良好</div>
                </div>
              </div>
              <div class="quality-metric defect">
                <div class="metric-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="currentColor"
                      d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <div class="metric-data">
                  <div class="metric-value">{{ qualityData.defect }}</div>
                  <div class="metric-label">待改进</div>
                </div>
              </div>
            </div>
            <div class="quality-chart-container">
              <canvas ref="qualityChart" class="quality-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- 告警中心面板 -->
        <div class="panel alerts-panel">
          <div class="panel-header">
            <h3>告警中心</h3>
            <div class="alert-count">{{ unreadAlerts }}</div>
          </div>
          <div class="panel-content">
            <div class="alerts-list">
              <div v-for="alert in alerts" :key="alert.id" :class="['alert-item', alert.level]">
                <div class="alert-icon">
                  <svg v-if="alert.level === 'error'" viewBox="0 0 24 24" width="16" height="16">
                    <path
                      fill="currentColor"
                      d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <svg v-else-if="alert.level === 'warning'" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="16" height="16">
                    <path
                      fill="currentColor"
                      d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-description">{{ alert.description }}</div>
                  <div class="alert-time">{{ formatTime(alert.time) }}</div>
                </div>
                <button class="alert-action" @click="handleAlert(alert)">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModernDashboard',
  data() {
    return {
      // 时间相关
      currentDate: '',
      currentTime: '',

      // 状态筛选
      statusFilter: 'all',
      statusFilters: [
        { label: '全部', value: 'all' },
        { label: '运行中', value: 'running' },
        { label: '待机', value: 'idle' },
        { label: '维护', value: 'maintenance' }
      ],

      qualityPeriod: 'today',

      // 核心指标
      metrics: {
        todayProduction: 1248,
        efficiency: 87.5,
        qualityRate: 98.2,
        orderCount: 24
      },

      // 设备数据
      equipment: [
        {
          id: 1,
          name: 'CNC-001',
          status: 'running',
          currentTask: 'PT20241201001',
          progress: 75,
          operator: '张师傅'
        },
        {
          id: 2,
          name: 'CNC-002',
          status: 'idle',
          currentTask: null,
          progress: 0,
          operator: null
        },
        {
          id: 3,
          name: 'CNC-003',
          status: 'running',
          currentTask: 'PT20241201002',
          progress: 45,
          operator: '李师傅'
        },
        {
          id: 4,
          name: 'CNC-004',
          status: 'maintenance',
          currentTask: null,
          progress: 0,
          operator: null
        },
        {
          id: 5,
          name: 'CNC-005',
          status: 'running',
          currentTask: 'PT20241201003',
          progress: 92,
          operator: '王师傅'
        },
        {
          id: 6,
          name: 'CNC-006',
          status: 'idle',
          currentTask: null,
          progress: 0,
          operator: null
        }
      ],

      // 任务数据
      tasks: [
        {
          id: 1,
          title: '轴承座精加工',
          priority: 'urgent',
          status: 'running',
          operator: '张师傅',
          estimatedTime: 4.5,
          equipment: 'CNC-001',
          progress: 75
        },
        {
          id: 2,
          title: '联轴器粗加工',
          priority: 'high',
          status: 'pending',
          operator: '李师傅',
          estimatedTime: 6.0,
          equipment: 'CNC-003',
          progress: 45
        },
        {
          id: 3,
          title: '法兰盘钻孔',
          priority: 'medium',
          status: 'waiting',
          operator: '王师傅',
          estimatedTime: 2.5,
          equipment: 'CNC-002',
          progress: 0
        },
        {
          id: 4,
          title: '齿轮齿面加工',
          priority: 'high',
          status: 'running',
          operator: '赵师傅',
          estimatedTime: 8.0,
          equipment: 'CNC-005',
          progress: 92
        }
      ],

      // 质量数据
      qualityData: {
        excellent: 1156,
        good: 78,
        defect: 14
      },

      // 告警数据
      unreadAlerts: 3,
      alerts: [
        {
          id: 1,
          level: 'error',
          title: '刀具磨损异常',
          description: 'CNC-001刀具磨损超出正常范围，需要立即更换',
          time: new Date(Date.now() - 1000 * 60 * 10)
        },
        {
          id: 2,
          level: 'warning',
          title: '设备维护提醒',
          description: 'CNC-004设备累计运行时间已达到维护周期',
          time: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: 3,
          level: 'info',
          title: '生产计划更新',
          description: '今日生产计划已更新，请查看最新任务安排',
          time: new Date(Date.now() - 1000 * 60 * 60)
        }
      ]
    }
  },

  computed: {
    productionProgress() {
      return 85 // 生产进度百分比
    },

    filteredEquipment() {
      if (this.statusFilter === 'all') {
        return this.equipment
      }
      return this.equipment.filter((eq) => eq.status === this.statusFilter)
    }
  },

  mounted() {
    this.updateTime()
    this.startTimeUpdate()
  },

  methods: {
    startTimeUpdate() {
      this.timeTimer = setInterval(() => {
        this.updateTime()
      }, 1000)
    },

    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('zh-CN', { hour12: false })
      this.currentDate = now.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    },

    filterStatus(status) {
      this.statusFilter = status
    },

    getStatusText(status) {
      const texts = {
        running: '运行中',
        idle: '待机',
        maintenance: '维护中',
        error: '故障'
      }
      return texts[status] || '未知'
    },

    getPriorityText(priority) {
      const texts = {
        urgent: '紧急',
        high: '高',
        medium: '中',
        low: '低'
      }
      return texts[priority] || '普通'
    },

    formatTime(time) {
      const now = new Date()
      const diff = now - time

      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return time.toLocaleDateString('zh-CN')
      }
    },

    refreshTasks() {
      this.$message.success('任务列表已刷新')
    },

    handleAlert(alert) {
      this.$message.success('告警已处理')
      this.alerts = this.alerts.filter((a) => a.id !== alert.id)
      this.unreadAlerts = Math.max(0, this.unreadAlerts - 1)
    }
  },

  beforeDestroy() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
    }
  }
}
</script>

<style lang="scss" scoped>
.modern-dashboard {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 顶部导航栏
.dashboard-navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 32px;
  height: 80px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;

  .navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1920px;
    margin: 0 auto;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 16px;

    .brand-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      backdrop-filter: blur(10px);
    }

    .brand-text {
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: white;
        letter-spacing: -0.5px;
      }

      span {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 24px;

    .time-display {
      text-align: right;
      color: white;

      .time {
        font-size: 20px;
        font-weight: 600;
        font-family: 'SF Mono', 'Monaco', monospace;
        margin-bottom: 2px;
      }

      .date {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 500;
      }
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(10px);

      .indicator-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }
  }
}

// 主要内容区域
.dashboard-content {
  padding: 32px;
  max-width: 1920px;
  margin: 0 auto;
}

// KPI 指标卡片
.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  .kpi-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .kpi-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .kpi-title {
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .kpi-value {
      font-size: 36px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
      font-family: 'SF Mono', 'Monaco', monospace;
    }

    .kpi-subtitle {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 16px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;

      .trend-icon {
        font-size: 16px;
      }

      &.up {
        color: #10b981;
      }

      &.down {
        color: #ef4444;
      }
    }

    .kpi-chart {
      position: absolute;
      top: 24px;
      right: 24px;
    }

    // 不同类型的卡片样式
    &.production-kpi {
      .kpi-icon {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      }
    }

    &.efficiency-kpi {
      .kpi-icon {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #10b981, #059669);
      }
    }

    &.quality-kpi {
      .kpi-icon {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }
    }

    &.orders-kpi {
      .kpi-icon {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #8b5cf6, #7c3aed);
      }
    }
  }
}

// 进度圆环
.progress-circle {
  position: relative;
  width: 60px;
  height: 60px;

  .circular-chart {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);

    .circle-bg {
      fill: none;
      stroke: #f1f5f9;
      stroke-width: 3;
    }

    .circle {
      fill: none;
      stroke: #3b82f6;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.6s ease;
    }
  }

  .percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 700;
    color: #3b82f6;
  }
}

// 仪表盘
.gauge-container {
  width: 60px;
  height: 30px;
  position: relative;

  .gauge {
    width: 100%;
    height: 100%;
    background: conic-gradient(from 0deg at 50% 100%, #ef4444 0deg, #f59e0b 90deg, #10b981 180deg);
    border-radius: 60px 60px 0 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 2px;
      height: 25px;
      background: #1e293b;
      transform-origin: bottom center;
      transform: translateX(-50%) rotate(calc(var(--percentage) * 1.8deg - 90deg));
      border-radius: 1px;
    }
  }
}

// 质量评分
.quality-score {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: white;

  &.excellent {
    background: linear-gradient(135deg, #10b981, #059669);
  }
}

// 迷你柱状图
.mini-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 40px;
  width: 60px;
  gap: 2px;

  .bar {
    flex: 1;
    background: linear-gradient(to top, #8b5cf6, #a78bfa);
    border-radius: 2px 2px 0 0;
    transition: height 0.3s ease;
  }
}

// 面板区域
.panels-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;

  .panel {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    }

    .panel-header {
      padding: 24px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(248, 250, 252, 0.5);

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .panel-content {
      padding: 24px;
    }
  }
}

// 面板筛选按钮
.panel-filters {
  display: flex;
  gap: 8px;

  .filter-btn {
    padding: 6px 12px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    &.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
  }
}

// 刷新按钮
.refresh-btn {
  padding: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #3b82f6;
  }
}

// 时间段选择
.period-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

// 设备网格
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;

  .equipment-item {
    background: #f8fafc;
    border-radius: 16px;
    padding: 20px;
    position: relative;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .equipment-status-indicator {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .equipment-info {
      margin-bottom: 16px;

      .equipment-name {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .equipment-status-text {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .equipment-task {
        font-size: 14px;
        color: #64748b;
      }
    }

    .equipment-progress {
      margin-bottom: 16px;

      .progress-ring {
        position: relative;
        width: 48px;
        height: 48px;

        .ring-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);

          .ring-bg {
            stroke: #e2e8f0;
          }

          .ring-progress {
            stroke-linecap: round;
            transition: stroke-dasharray 0.6s ease;
          }
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 700;
        }
      }
    }

    .equipment-operator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;

      .operator-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: #64748b;
      }
    }

    // 不同状态的样式
    &.running {
      border-color: #10b981;
      background: #f0fdf4;

      .equipment-status-indicator {
        background: #10b981;
        animation: pulse 2s infinite;
      }

      .equipment-status-text {
        color: #10b981;
      }

      .ring-progress {
        stroke: #10b981;
      }

      .progress-text {
        color: #10b981;
      }

      .operator-avatar {
        background: #10b981;
        color: white;
      }
    }

    &.idle {
      border-color: #f59e0b;
      background: #fffbeb;

      .equipment-status-indicator {
        background: #f59e0b;
      }

      .equipment-status-text {
        color: #f59e0b;
      }

      .ring-progress {
        stroke: #f59e0b;
      }

      .progress-text {
        color: #f59e0b;
      }
    }

    &.maintenance {
      border-color: #3b82f6;
      background: #eff6ff;

      .equipment-status-indicator {
        background: #3b82f6;
      }

      .equipment-status-text {
        color: #3b82f6;
      }

      .ring-progress {
        stroke: #3b82f6;
      }

      .progress-text {
        color: #3b82f6;
      }
    }
  }
}

// 任务列表
.tasks-list {
  .task-item {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    position: relative;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .task-priority-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-radius: 2px 0 0 2px;
    }

    .task-content {
      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .task-priority-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .task-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #64748b;

          svg {
            opacity: 0.7;
          }
        }
      }

      .task-progress-bar {
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.6s ease;
        }
      }
    }

    // 不同优先级的样式
    &.urgent {
      border-left-color: #ef4444;

      .task-priority-badge {
        background: #fef2f2;
        color: #ef4444;
      }

      .progress-fill {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }
    }

    &.high {
      border-left-color: #f59e0b;

      .task-priority-badge {
        background: #fffbeb;
        color: #f59e0b;
      }

      .progress-fill {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }
    }

    &.medium {
      border-left-color: #3b82f6;

      .task-priority-badge {
        background: #eff6ff;
        color: #3b82f6;
      }

      .progress-fill {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }
    }
  }
}

// 质量概览
.quality-overview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;

  .quality-metric {
    text-align: center;

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      color: white;
    }

    .metric-data {
      .metric-value {
        font-size: 24px;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
      }
    }

    &.excellent .metric-icon {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    &.good .metric-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    &.defect .metric-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
  }
}

// 质量图表
.quality-chart-container {
  .quality-chart {
    width: 100%;
    height: 120px;
    border-radius: 8px;
  }
}

// 告警列表
.alert-count {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.alerts-list {
  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
    }

    .alert-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .alert-content {
      flex: 1;

      .alert-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .alert-description {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .alert-time {
        font-size: 11px;
        color: #94a3b8;
      }
    }

    .alert-action {
      padding: 6px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #64748b;

      &:hover {
        background: #f8fafc;
        border-color: #10b981;
        color: #10b981;
      }
    }

    // 不同级别的样式
    &.error {
      background: #fef2f2;

      .alert-icon {
        background: #ef4444;
      }
    }

    &.warning {
      background: #fffbeb;

      .alert-icon {
        background: #f59e0b;
      }
    }

    &.info {
      background: #eff6ff;

      .alert-icon {
        background: #3b82f6;
      }
    }
  }
}

// 动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-content {
    padding: 24px;
  }

  .kpi-section {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .panels-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-navbar {
    padding: 0 16px;
    height: 70px;

    .navbar-brand {
      .brand-text h1 {
        font-size: 20px;
      }
    }

    .navbar-actions {
      gap: 16px;

      .time-display .time {
        font-size: 16px;
      }
    }
  }

  .dashboard-content {
    padding: 16px;
  }

  .kpi-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }

  .task-meta {
    flex-direction: column;
    gap: 8px;
  }

  .quality-overview {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
