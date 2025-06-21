<template>
  <div class="production-task-container">
    <!-- 头部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <i class="el-icon-s-order"></i>
          生产任务管理
        </h2>
        <el-badge :value="list.length" class="task-count">
          <span class="count-text">任务总数</span>
        </el-badge>
      </div>

      <div class="toolbar-right">
        <el-button-group class="action-group">
          <el-button size="small" icon="el-icon-search" @click="drawer = true">筛选</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </el-button-group>

        <el-dropdown class="more-actions" @command="handleCommand">
          <el-button size="small" type="primary">
            操作菜单
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="add" icon="el-icon-plus">新增任务</el-dropdown-item>
            <el-dropdown-item command="delete" icon="el-icon-delete">批量删除</el-dropdown-item>
            <el-dropdown-item command="print" icon="el-icon-printer">打印任务</el-dropdown-item>
            <el-dropdown-item command="label" icon="el-icon-price-tag">标签打印</el-dropdown-item>
            <el-dropdown-item command="material" icon="el-icon-plus">补料申请</el-dropdown-item>
            <el-dropdown-item command="tooling" icon="el-icon-view">查看工装</el-dropdown-item>
            <el-dropdown-item command="export" icon="el-icon-download">导出数据</el-dropdown-item>
            <el-dropdown-item command="deleted" icon="el-icon-delete">已删除数据</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon pending">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatusCount('pending') }}</div>
              <div class="stat-label">待开始</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon processing">
              <i class="el-icon-loading"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatusCount('processing') }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon completed">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatusCount('completed') }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon urgent">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getUrgentCount() }}</div>
              <div class="stat-label">紧急任务</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-title">任务列表</div>
        <div class="table-tools">
          <el-input
            v-model="searchText"
            placeholder="搜索任务号、客户、物料..."
            prefix-icon="el-icon-search"
            size="small"
            style="width: 300px"
            clearable
            @input="handleSearch"></el-input>

          <el-button-group style="margin-left: 10px">
            <el-button :class="{ active: viewMode === 'table' }" size="small" icon="el-icon-s-grid" @click="viewMode = 'table'"></el-button>
            <el-button :class="{ active: viewMode === 'card' }" size="small" icon="el-icon-menu" @click="viewMode = 'card'"></el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-show="viewMode === 'table'">
        <el-table
          ref="dragTable"
          v-loading="listLoading"
          :data="filteredList"
          row-key="id"
          highlight-current-row
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />

          <!-- 任务信息 -->
          <el-table-column label="任务信息" min-width="200" fixed="left">
            <template slot-scope="{ row }">
              <div class="task-info">
                <div class="task-header">
                  <el-link type="primary" @click="viewDetail(row)" class="task-number">
                    {{ row.Batch_number }}
                  </el-link>
                  <el-tag v-if="isUrgent(row)" type="danger" size="mini">紧急</el-tag>
                </div>
                <div class="task-meta">
                  <span class="meta-item">
                    <i class="el-icon-s-custom"></i>
                    {{ row.client }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 物料信息 -->
          <el-table-column label="物料信息" min-width="250">
            <template slot-scope="{ row }">
              <div class="material-info">
                <div class="material-image">
                  <img :src="row.image || '/shape_image.png'" alt="物料图片" />
                </div>
                <div class="material-details">
                  <div class="material-code">{{ row.Material_code }}</div>
                  <div class="material-name">{{ row.Material_name }}</div>
                  <div class="material-specs">
                    <el-tag size="mini" type="info">{{ row.versions }}</el-tag>
                    <el-tag size="mini">{{ row.count }}件</el-tag>
                    <el-tag size="mini" type="warning">{{ row.type }}</el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 工序进度 -->
          <el-table-column label="工序进度" min-width="350">
            <template slot-scope="{ row }">
              <div class="process-progress">
                <div class="progress-header">
                  <span>进度: {{ getProcessProgress(row.process) }}%</span>
                  <span class="work-hours">{{ getTotalWorkHours(row.process) }}H</span>
                </div>
                <el-progress :percentage="getProcessProgress(row.process)" :color="getProgressColor(row.process)" :stroke-width="6"></el-progress>
                <div class="process-tags">
                  <el-tooltip v-for="(item, index) in row.process" :key="index" placement="top">
                    <div slot="content">
                      <div>{{ item.submitter }}</div>
                      <div style="color: #999; font-size: 12px">{{ item.Submission_time }}</div>
                    </div>
                    <el-tag :type="getProcessTagType(item.status)" :effect="getProcessTagEffect(item.status)" size="mini" class="process-tag">
                      {{ item.process }}
                    </el-tag>
                  </el-tooltip>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 交期状态 -->
          <el-table-column label="交期状态" width="120" align="center">
            <template slot-scope="{ row }">
              <div class="delivery-status">
                <el-tag :type="getDeliveryTagType(row.Delivery_time)" size="small">
                  {{ formatDeliveryTime(row.Delivery_time) }}
                </el-tag>
                <div class="days-left">{{ getDaysLeft(row.Delivery_time) }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="getStatusTagType(row.status)" effect="dark">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template slot-scope="{ row }">
              <el-button-group>
                <el-button size="mini" type="primary" icon="el-icon-view" @click="viewDetail(row)">详情</el-button>
                <el-button size="mini" type="warning" icon="el-icon-edit" @click="editTask(row)">编辑</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-show="viewMode === 'card'" class="card-view">
        <el-row :gutter="20">
          <el-col v-for="item in filteredList" :key="item.id" :span="8" style="margin-bottom: 20px">
            <div class="task-card" @click="viewDetail(item)">
              <div class="task-card-header">
                <div class="task-number">{{ item.Batch_number }}</div>
                <el-tag v-if="isUrgent(item)" type="danger" size="mini">紧急</el-tag>
              </div>
              <div class="task-card-body">
                <div class="task-image">
                  <img :src="item.image || '/shape_image.png'" alt="任务图片" />
                </div>
                <div class="task-details">
                  <div class="detail-row">
                    <span class="label">客户:</span>
                    <span>{{ item.client }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">物料:</span>
                    <span>{{ item.Material_name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">数量:</span>
                    <span>{{ item.count }}件</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">交期:</span>
                    <span>{{ item.Delivery_time }}</span>
                  </div>
                </div>
              </div>
              <div class="task-card-footer">
                <el-progress :percentage="getProcessProgress(item.process)" :stroke-width="4"></el-progress>
                <div class="card-actions">
                  <el-button size="mini" type="text">详情</el-button>
                  <el-button size="mini" type="text">编辑</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"></el-pagination>
      </div>
    </el-card>

    <!-- 筛选抽屉 -->
    <el-drawer title="任务筛选" :visible.sync="drawer" direction="rtl" size="400px" class="filter-drawer">
      <div class="drawer-content">
        <el-form ref="filterForm" :model="filterForm" label-width="80px" size="small">
          <el-form-item label="关键字">
            <el-input v-model="filterForm.keyword" placeholder="任务号、客户、物料..." clearable />
          </el-form-item>

          <el-form-item label="客户">
            <el-select v-model="filterForm.client" placeholder="选择客户" clearable style="width: 100%">
              <el-option v-for="client in clientList" :key="client" :label="client" :value="client" />
            </el-select>
          </el-form-item>

          <el-form-item label="项目">
            <el-select v-model="filterForm.project" placeholder="选择项目" clearable style="width: 100%">
              <el-option v-for="project in projectList" :key="project" :label="project" :value="project" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 100%">
              <el-option label="待开始" value="pending" />
              <el-option label="进行中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已暂停" value="paused" />
            </el-select>
          </el-form-item>

          <el-form-item label="交期范围">
            <el-date-picker
              v-model="filterForm.deliveryDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"></el-date-picker>
          </el-form-item>

          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filterForm.createDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"></el-date-picker>
          </el-form-item>

          <el-form-item label="包含完成">
            <el-switch v-model="filterForm.includeCompleted" />
          </el-form-item>
        </el-form>

        <div class="drawer-actions">
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="applyFilter">应用筛选</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 新增任务对话框 -->
    <el-dialog title="新增生产任务" :visible.sync="addDialogVisible" width="1200px" :close-on-click-modal="false" class="add-task-dialog">
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="120px" size="small">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-info"></i>
            基本信息
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="任务编号" prop="Batch_number">
                <el-input v-model="addForm.Batch_number" placeholder="系统自动生成" :disabled="true">
                  <el-button slot="append" @click="generateTaskNumber">生成</el-button>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="客户名称" prop="client">
                <el-select v-model="addForm.client" placeholder="选择客户" filterable allow-create style="width: 100%">
                  <el-option v-for="client in clientOptions" :key="client" :label="client" :value="client"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="交货日期" prop="Delivery_time">
                <el-date-picker
                  v-model="addForm.Delivery_time"
                  type="date"
                  placeholder="选择交货日期"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="任务状态" prop="status">
                <el-select v-model="addForm.status" placeholder="选择状态" style="width: 100%">
                  <el-option label="待开始" value="pending"></el-option>
                  <el-option label="进行中" value="processing"></el-option>
                  <el-option label="已暂停" value="paused"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 物料信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-box"></i>
            物料信息
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="物料编码" prop="Material_code">
                <el-input v-model="addForm.Material_code" placeholder="请输入物料编码">
                  <el-button slot="append" icon="el-icon-search" @click="selectMaterial">选择</el-button>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="物料名称" prop="Material_name">
                <el-input v-model="addForm.Material_name" placeholder="请输入物料名称"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="物料类型" prop="type">
                <el-select v-model="addForm.type" placeholder="选择类型" style="width: 100%">
                  <el-option label="量产" value="量产"></el-option>
                  <el-option label="打样" value="打样"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="版本号" prop="versions">
                <el-input v-model="addForm.versions" placeholder="如：1.0"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="生产数量" prop="count">
                <el-input-number v-model="addForm.count" :min="1" :max="999999" controls-position="right" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="预计工时" prop="man_hour">
                <el-input-number v-model="addForm.man_hour" :min="0" :precision="1" controls-position="right" style="width: 100%"></el-input-number>
                <span class="unit-text">小时</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="物料图片">
                <el-upload
                  class="image-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :on-success="handleImageSuccess"
                  :before-upload="beforeImageUpload">
                  <img v-if="addForm.image" :src="addForm.image" class="image-preview" />
                  <i v-else class="el-icon-plus image-uploader-icon"></i>
                </el-upload>
                <div class="upload-tip">只能上传jpg/png文件，且不超过2MB</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 工序信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-s-operation"></i>
            工序配置
            <el-button type="text" size="small" icon="el-icon-plus" @click="addProcess" style="margin-left: 10px">添加工序</el-button>
          </div>

          <div class="process-list">
            <div v-for="(process, index) in addForm.process" :key="index" class="process-item">
              <div class="process-header">
                <span class="process-number">工序{{ index + 1 }}</span>
                <el-button type="text" size="mini" icon="el-icon-delete" @click="removeProcess(index)" style="color: #f56c6c">删除</el-button>
              </div>

              <el-row :gutter="15">
                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.process`" label="工序名称">
                    <el-input v-model="process.process" placeholder="请输入工序名称"></el-input>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.man_hour`" label="预计工时">
                    <el-input-number
                      v-model="process.man_hour"
                      :min="0"
                      :precision="1"
                      controls-position="right"
                      style="width: 100%"></el-input-number>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.status`" label="初始状态">
                    <el-select v-model="process.status" style="width: 100%">
                      <el-option label="未开始" :value="0"></el-option>
                      <el-option label="进行中" :value="1"></el-option>
                      <el-option label="已完成" :value="2"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.submitter`" label="负责人">
                    <el-select v-model="process.submitter" placeholder="选择负责人" filterable style="width: 100%">
                      <el-option v-for="user in userOptions" :key="user.id" :label="user.name" :value="user.name"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 备注信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-edit-outline"></i>
            备注信息
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建人" prop="author">
                <el-input v-model="addForm.author" placeholder="请输入创建人"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input :value="new Date().toLocaleString()" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="任务描述">
                <el-input v-model="addForm.description" type="textarea" :rows="3" placeholder="请输入任务描述或特殊要求..."></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button @click="saveAsDraft" type="info">保存草稿</el-button>
        <el-button @click="submitTask" type="primary" :loading="submitLoading">确认创建</el-button>
      </div>
    </el-dialog>

    <!-- 物料选择对话框 -->
    <el-dialog title="选择物料" :visible.sync="materialDialogVisible" width="800px" class="material-select-dialog">
      <div class="material-search">
        <el-input v-model="materialSearch" placeholder="搜索物料编码或名称..." prefix-icon="el-icon-search" style="width: 300px"></el-input>
      </div>

      <el-table :data="filteredMaterials" @row-click="selectMaterialRow" highlight-current-row style="width: 100%; margin-top: 15px">
        <el-table-column prop="code" label="物料编码" width="150"></el-table-column>
        <el-table-column prop="name" label="物料名称" width="200"></el-table-column>
        <el-table-column prop="type" label="类型" width="100"></el-table-column>
        <el-table-column prop="unit" label="单位" width="80"></el-table-column>
        <el-table-column prop="spec" label="规格" show-overflow-tooltip></el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="materialDialogVisible = false">取消</el-button>
        <el-button @click="confirmMaterialSelect" type="primary">确认选择</el-button>
      </div>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog title="编辑生产任务" :visible.sync="editDialogVisible" width="1200px" :close-on-click-modal="false" class="edit-task-dialog">
      <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="120px" size="small">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-info"></i>
            基本信息
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="任务编号" prop="Batch_number">
                <el-input v-model="editForm.Batch_number" placeholder="任务编号" :disabled="true"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="客户名称" prop="client">
                <el-select v-model="editForm.client" placeholder="选择客户" filterable allow-create style="width: 100%">
                  <el-option v-for="client in clientOptions" :key="client" :label="client" :value="client"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="交货日期" prop="Delivery_time">
                <el-date-picker
                  v-model="editForm.Delivery_time"
                  type="date"
                  placeholder="选择交货日期"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="任务状态" prop="status">
                <el-select v-model="editForm.status" placeholder="选择状态" style="width: 100%">
                  <el-option label="待开始" value="pending"></el-option>
                  <el-option label="进行中" value="processing"></el-option>
                  <el-option label="已完成" value="completed"></el-option>
                  <el-option label="已暂停" value="paused"></el-option>
                  <el-option label="已取消" value="cancelled"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 物料信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-box"></i>
            物料信息
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="物料编码" prop="Material_code">
                <el-input v-model="editForm.Material_code" placeholder="请输入物料编码">
                  <el-button slot="append" icon="el-icon-search" @click="selectMaterialForEdit">选择</el-button>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="物料名称" prop="Material_name">
                <el-input v-model="editForm.Material_name" placeholder="请输入物料名称"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="物料类型" prop="type">
                <el-select v-model="editForm.type" placeholder="选择类型" style="width: 100%">
                  <el-option label="量产" value="量产"></el-option>
                  <el-option label="打样" value="打样"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="版本号" prop="versions">
                <el-input v-model="editForm.versions" placeholder="如：1.0"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="生产数量" prop="count">
                <el-input-number v-model="editForm.count" :min="1" :max="999999" controls-position="right" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="预计工时" prop="man_hour">
                <el-input-number v-model="editForm.man_hour" :min="0" :precision="1" controls-position="right" style="width: 100%"></el-input-number>
                <span class="unit-text">小时</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="物料图片">
                <el-upload
                  class="image-uploader"
                  action="/api/upload"
                  :show-file-list="false"
                  :on-success="handleEditImageSuccess"
                  :before-upload="beforeImageUpload">
                  <img v-if="editForm.image" width="100" :src="editForm.image" class="image-preview" />
                  <i v-else class="el-icon-plus image-uploader-icon"></i>
                </el-upload>
                <div class="upload-tip">只能上传jpg/png文件，且不超过2MB</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 工序信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-s-operation"></i>
            工序配置
            <el-button type="text" size="small" icon="el-icon-plus" @click="addEditProcess" style="margin-left: 10px">添加工序</el-button>
          </div>

          <div class="process-list">
            <div v-for="(process, index) in editForm.process" :key="index" class="process-item">
              <div class="process-header">
                <span class="process-number">工序{{ index + 1 }}</span>
                <div class="process-status">
                  <el-tag :type="getProcessTagType(process.status)" size="mini">
                    {{ getProcessStatusText(process.status) }}
                  </el-tag>
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeEditProcess(index)"
                    style="color: #f56c6c; margin-left: 10px">
                    删除
                  </el-button>
                </div>
              </div>

              <el-row :gutter="15">
                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.process`" label="工序名称">
                    <el-input v-model="process.process" placeholder="请输入工序名称"></el-input>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.man_hour`" label="预计工时">
                    <el-input-number
                      v-model="process.man_hour"
                      :min="0"
                      :precision="1"
                      controls-position="right"
                      style="width: 100%"></el-input-number>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.status`" label="工序状态">
                    <el-select v-model="process.status" style="width: 100%">
                      <el-option label="未开始" :value="0"></el-option>
                      <el-option label="进行中" :value="1"></el-option>
                      <el-option label="已完成" :value="2"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item :prop="`process.${index}.submitter`" label="负责人">
                    <el-select v-model="process.submitter" placeholder="选择负责人" filterable style="width: 100%">
                      <el-option v-for="user in userOptions" :key="user.id" :label="user.name" :value="user.name"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 工序执行时间信息 -->
              <el-row :gutter="15" v-if="process.status > 0">
                <el-col :span="12">
                  <el-form-item label="开始时间">
                    <el-date-picker
                      v-model="process.start_time"
                      type="datetime"
                      placeholder="选择开始时间"
                      format="yyyy-MM-dd HH:mm:ss"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      style="width: 100%"></el-date-picker>
                  </el-form-item>
                </el-col>

                <el-col :span="12" v-if="process.status === 2">
                  <el-form-item label="完成时间">
                    <el-date-picker
                      v-model="process.Submission_time"
                      type="datetime"
                      placeholder="选择完成时间"
                      format="yyyy-MM-dd HH:mm:ss"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      style="width: 100%"></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 工序备注 -->
              <el-row>
                <el-col :span="24">
                  <el-form-item label="工序备注">
                    <el-input v-model="process.remark" type="textarea" :rows="2" placeholder="请输入工序备注..."></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 修改记录 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-time"></i>
            修改记录
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建人">
                <el-input :value="editForm.author" disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input :value="editForm.createTime" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="修改人" prop="modifier">
                <el-input v-model="editForm.modifier" placeholder="请输入修改人"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="修改时间">
                <el-input :value="new Date().toLocaleString()" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="修改说明" prop="modifyReason">
                <el-input v-model="editForm.modifyReason" type="textarea" :rows="3" placeholder="请输入修改原因或说明..."></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="任务描述">
                <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入任务描述或特殊要求..."></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button @click="saveEditAsDraft" type="info">保存草稿</el-button>
        <el-button @click="updateTask" type="primary" :loading="updateLoading">确认修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProductionTask',
  data() {
    return {
      isEditMode: false, // 添加编辑模式标识
      // 视图控制

      drawer: false,
      listLoading: false,
      viewMode: 'table', // table | card

      // 搜索和筛选
      searchText: '',
      filterForm: {
        keyword: '',
        client: '',
        project: '',
        status: '',
        urgency: 0,
        deliveryDateRange: [],
        createDateRange: [],
        includeCompleted: true
      },

      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,

      // 数据
      list: [
        // 示例数据
        {
          id: 1,
          Batch_number: 'PT202401001',
          client: '华为技术',
          porject: '5G基站项目',
          Material_code: 'MT-001-A',
          Material_name: '铝合金散热器',
          versions: '1.2',
          count: 500,
          type: '加工件',
          Delivery_time: '2024-02-15',
          status: '正在加工',
          image: '/shape_image.png',
          description: '用于5G基站的散热器，要求高精度加工',

          Difficulty: 4,
          man_hour: 120,
          author: '张工',
          process: [
            { process: '下料', status: 2, man_hour: 8, submitter: '李师傅', Submission_time: '2024-01-10 09:00' },
            { process: '粗加工', status: 1, man_hour: 24, submitter: '王师傅', Submission_time: '2024-01-11 14:00' },
            { process: '精加工', status: 0, man_hour: 16, submitter: '', Submission_time: '' },
            { process: '检验', status: 0, man_hour: 4, submitter: '', Submission_time: '' }
          ]
        }
        // ... 更多示例数据
      ],

      // 选中项
      multipleSelection: [],

      // 新增任务相关
      addDialogVisible: false,
      submitLoading: false,
      addForm: {
        Batch_number: '',
        client: '',
        porject: '',
        Material_code: '',
        Material_name: '',
        versions: '1.0',
        count: 1,
        type: '',
        Delivery_time: '',
        status: 'pending',
        Difficulty: 3,
        man_hour: 0,
        author: '',
        image: '',
        description: '',
        process: [
          {
            process: '下料',
            status: 0,
            man_hour: 0,
            submitter: '',
            Submission_time: ''
          }
        ]
      },

      // 编辑任务相关
      editDialogVisible: false,
      updateLoading: false,
      currentEditId: null,
      editForm: {
        Batch_number: '',
        client: '',
        porject: '',
        Material_code: '',
        Material_name: '',
        versions: '1.0',
        count: 1,
        type: '',
        Delivery_time: '',
        status: 'pending',
        Difficulty: 3,
        man_hour: 0,
        author: '',
        createTime: '',
        modifier: '',
        modifyReason: '',
        image: '',
        description: '',
        process: []
      },

      // 编辑表单验证规则
      editRules: {
        client: [{ required: true, message: '请选择客户', trigger: 'change' }],

        Material_code: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        Material_name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        count: [{ required: true, message: '请输入生产数量', trigger: 'blur' }],
        Delivery_time: [{ required: true, message: '请选择交货日期', trigger: 'change' }],
        modifier: [{ required: true, message: '请输入修改人', trigger: 'blur' }]
      },

      // 表单验证规则
      addRules: {
        Batch_number: [{ required: true, message: '请输入任务编号', trigger: 'blur' }],
        client: [{ required: true, message: '请选择客户', trigger: 'change' }],

        Material_code: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        Material_name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        count: [{ required: true, message: '请输入生产数量', trigger: 'blur' }],
        Delivery_time: [{ required: true, message: '请选择交货日期', trigger: 'change' }],
        author: [{ required: true, message: '请输入创建人', trigger: 'blur' }]
      },

      // 物料选择
      materialDialogVisible: false,
      materialSearch: '',
      selectedMaterial: null,
      materialList: [
        { code: 'MT-001-A', name: '铝合金散热器', type: '加工件', unit: '件', spec: '100x50x20mm' },
        { code: 'MT-002-B', name: '不锈钢支架', type: '加工件', unit: '件', spec: '200x100x30mm' },
        { code: 'MT-003-C', name: '铜制接头', type: '原材料', unit: '个', spec: 'φ20mm' }
      ],

      // 选项数据
      clientOptions: ['华为技术', '中兴通讯', '比亚迪', '宁德时代', '腾讯科技'],
      userOptions: [
        { id: 1, name: '张工' },
        { id: 2, name: '李师傅' },
        { id: 3, name: '王师傅' },
        { id: 4, name: '刘师傅' }
      ]
    }
  },

  computed: {
    filteredList() {
      let result = this.list

      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase()
        result = result.filter(
          (item) =>
            item.Batch_number.toLowerCase().includes(searchLower) ||
            item.client.toLowerCase().includes(searchLower) ||
            item.Material_name.toLowerCase().includes(searchLower) ||
            item.Material_code.toLowerCase().includes(searchLower)
        )
      }

      return result
    },

    clientList() {
      return [...new Set(this.list.map((item) => item.client))]
    },

    projectList() {
      return [...new Set(this.list.map((item) => item.porject))]
    },

    // 过滤物料列表
    filteredMaterials() {
      if (!this.materialSearch) return this.materialList

      const search = this.materialSearch.toLowerCase()
      return this.materialList.filter((item) => item.code.toLowerCase().includes(search) || item.name.toLowerCase().includes(search))
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    // 数据加载
    loadData() {
      this.listLoading = true
      // 模拟API调用
      setTimeout(() => {
        this.total = this.list.length
        this.listLoading = false
      }, 1000)
    },

    refreshData() {
      this.loadData()
      this.$message.success('数据已刷新')
    },

    // 统计方法
    getStatusCount(status) {
      return this.list.filter((item) => item.status === status).length
    },

    getUrgentCount() {
      return this.list.filter((item) => item.Difficulty >= 4).length
    },

    // 工序相关方法
    getProcessProgress(processes) {
      if (!processes || processes.length === 0) return 0
      const completed = processes.filter((p) => p.status === 2).length
      return Math.round((completed / processes.length) * 100)
    },

    getTotalWorkHours(processes) {
      if (!processes) return 0
      return processes.reduce((total, p) => total + (p.man_hour || 0), 0)
    },

    getProgressColor(processes) {
      const progress = this.getProcessProgress(processes)
      if (progress < 30) return '#f56c6c'
      if (progress < 70) return '#e6a23c'
      return '#67c23a'
    },

    getProcessTagType(status) {
      switch (status) {
        case 2:
          return 'success'
        case 1:
          return 'warning'
        default:
          return 'info'
      }
    },

    getProcessTagEffect(status) {
      switch (status) {
        case 2:
          return 'dark'
        case 1:
          return 'light'
        default:
          return 'plain'
      }
    },

    // 交期相关方法
    formatDeliveryTime(time) {
      return new Date(time).toLocaleDateString()
    },

    getDaysLeft(deliveryTime) {
      const today = new Date()
      const delivery = new Date(deliveryTime)
      const diffTime = delivery - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return '已超期'
      if (diffDays === 0) return '今天到期'
      if (diffDays === 1) return '明天到期'
      return `${diffDays}天后到期`
    },

    getDeliveryTagType(deliveryTime) {
      const today = new Date()
      const delivery = new Date(deliveryTime)
      const diffDays = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'danger'
      if (diffDays <= 3) return 'warning'
      return 'success'
    },

    // 状态相关方法
    getStatusTagType(status) {
      switch (status) {
        case 'completed':
          return 'success'
        case 'processing':
          return 'primary'
        case 'pending':
          return 'info'
        case 'paused':
          return 'warning'
        default:
          return 'info'
      }
    },

    isUrgent(row) {
      return row.Difficulty >= 4
    },

    // 事件处理
    handleCommand(command) {
      switch (command) {
        case 'add':
          this.addTask()
          break
        case 'delete':
          this.batchDelete()
          break
        case 'print':
          this.printTasks()
          break
        case 'export':
          this.exportData()
          break
        // ... 其他命令处理
      }
    },

    handleSearch() {
      // 搜索逻辑已在computed中处理
    },

    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.loadData()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },

    // 操作方法
    viewDetail(row) {
      this.$router.push({
        path: '/shengchan/renwuxiangqing',
        query: { id: row.id }
      })
    },

    editTask(row) {
      this.$message.info('编辑功能开发中...')
    },

    addTask() {
      this.resetAddForm()
      this.generateTaskNumber()
      this.addForm.author = this.$store.getters.name || '当前用户'
      this.addDialogVisible = true
    },

    // 重置新增表单
    resetAddForm() {
      this.addForm = {
        Batch_number: '',
        client: '',
        porject: '',
        Material_code: '',
        Material_name: '',
        versions: '1.0',
        count: 1,
        type: '',
        Delivery_time: '',
        status: 'pending',
        Difficulty: 3,
        man_hour: 0,
        author: '',
        image: '',
        description: '',
        process: [
          {
            process: '下料',
            status: 0,
            man_hour: 0,
            submitter: '',
            Submission_time: ''
          }
        ]
      }

      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.addForm) {
          this.$refs.addForm.clearValidate()
        }
      })
    },

    // 生成任务编号
    generateTaskNumber() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const sequence = String(this.list.length + 1).padStart(3, '0')

      this.addForm.Batch_number = `PT${year}${month}${day}${sequence}`
    },

    // 工序管理
    addProcess() {
      this.addForm.process.push({
        process: '',
        status: 0,
        man_hour: 0,
        submitter: '',
        Submission_time: ''
      })
    },

    removeProcess(index) {
      if (this.addForm.process.length > 1) {
        this.addForm.process.splice(index, 1)
      } else {
        this.$message.warning('至少保留一个工序')
      }
    },

    // 物料选择
    selectMaterial() {
      this.materialDialogVisible = true
    },

    selectMaterialRow(row) {
      this.selectedMaterial = row
    },

    confirmMaterialSelect() {
      if (this.selectedMaterial) {
        this.addForm.Material_code = this.selectedMaterial.code
        this.addForm.Material_name = this.selectedMaterial.name
        this.addForm.type = this.selectedMaterial.type
        this.materialDialogVisible = false
        this.selectedMaterial = null
      } else {
        this.$message.warning('请选择一个物料')
      }
    },

    // 图片上传
    handleImageSuccess(response, file) {
      this.addForm.image = URL.createObjectURL(file.raw)
    },

    beforeImageUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    // 保存草稿
    saveAsDraft() {
      this.addForm.status = 'draft'
      this.submitTask(false)
    },

    // 提交任务
    submitTask(showMessage = true) {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true

          // 计算总工时
          const totalHours = this.addForm.process.reduce((total, p) => total + (p.man_hour || 0), 0)
          this.addForm.man_hour = totalHours

          // 模拟API调用
          setTimeout(() => {
            const newTask = {
              id: Date.now(),
              ...this.addForm,
              createTime: new Date().toISOString()
            }

            this.list.unshift(newTask)
            this.total = this.list.length

            this.submitLoading = false
            this.addDialogVisible = false

            if (showMessage) {
              this.$message.success('任务创建成功')
            } else {
              this.$message.success('草稿保存成功')
            }
          }, 1000)
        } else {
          this.$message.error('请完善必填信息')
        }
      })
    },
    // 编辑任务相关方法
    editTask(row) {
      this.currentEditId = row.id
      this.fillEditForm(row)
      this.editForm.modifier = this.$store.getters.name || '当前用户'
      this.editDialogVisible = true
    },

    // 填充编辑表单
    fillEditForm(row) {
      this.editForm = {
        Batch_number: row.Batch_number,
        client: row.client,
        porject: row.porject,
        Material_code: row.Material_code,
        Material_name: row.Material_name,
        versions: row.versions,
        count: row.count,
        type: row.type,
        Delivery_time: row.Delivery_time,
        status: row.status,
        Difficulty: row.Difficulty,
        man_hour: row.man_hour,
        author: row.author,
        createTime: row.createTime ? new Date(row.createTime).toLocaleString() : '未知',
        modifier: '',
        modifyReason: '',
        image: row.image || '',
        description: row.description || '',
        process: row.process ? JSON.parse(JSON.stringify(row.process)) : []
      }

      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.editForm) {
          this.$refs.editForm.clearValidate()
        }
      })
    },

    // 编辑时的工序管理
    addEditProcess() {
      this.editForm.process.push({
        process: '',
        status: 0,
        man_hour: 0,
        submitter: '',
        start_time: '',
        Submission_time: '',
        remark: ''
      })
    },

    removeEditProcess(index) {
      if (this.editForm.process.length > 1) {
        this.$confirm('确认删除此工序？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.editForm.process.splice(index, 1)
          })
          .catch(() => {
            // 用户取消删除
          })
      } else {
        this.$message.warning('至少保留一个工序')
      }
    },

    // 编辑时的物料选择
    selectMaterialForEdit() {
      this.materialDialogVisible = true
      this.isEditMode = true
    },

    // 修改物料选择确认方法
    confirmMaterialSelect() {
      if (this.selectedMaterial) {
        if (this.isEditMode) {
          this.editForm.Material_code = this.selectedMaterial.code
          this.editForm.Material_name = this.selectedMaterial.name
          this.editForm.type = this.selectedMaterial.type
        } else {
          this.addForm.Material_code = this.selectedMaterial.code
          this.addForm.Material_name = this.selectedMaterial.name
          this.addForm.type = this.selectedMaterial.type
        }

        this.materialDialogVisible = false
        this.selectedMaterial = null
        this.isEditMode = false
      } else {
        this.$message.warning('请选择一个物料')
      }
    },

    // 编辑时的图片上传
    handleEditImageSuccess(response, file) {
      this.editForm.image = URL.createObjectURL(file.raw)
    },

    // 获取工序状态文本
    getProcessStatusText(status) {
      switch (status) {
        case 0:
          return '未开始'
        case 1:
          return '进行中'
        case 2:
          return '已完成'
        default:
          return '未知'
      }
    },

    // 保存编辑草稿
    saveEditAsDraft() {
      this.editForm.status = 'draft'
      this.updateTask(false)
    },

    // 更新任务
    updateTask(showMessage = true) {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.updateLoading = true

          // 计算总工时
          const totalHours = this.editForm.process.reduce((total, p) => total + (p.man_hour || 0), 0)
          this.editForm.man_hour = totalHours

          // 模拟API调用
          setTimeout(() => {
            // 找到要更新的任务
            const taskIndex = this.list.findIndex((item) => item.id === this.currentEditId)

            if (taskIndex !== -1) {
              // 创建修改记录
              const modifyRecord = {
                modifier: this.editForm.modifier,
                modifyTime: new Date().toISOString(),
                modifyReason: this.editForm.modifyReason,
                changes: this.getChanges(this.list[taskIndex], this.editForm)
              }

              // 更新任务数据
              const updatedTask = {
                ...this.list[taskIndex],
                ...this.editForm,
                modifyTime: new Date().toISOString(),
                modifyRecords: this.list[taskIndex].modifyRecords || []
              }

              // 添加修改记录
              updatedTask.modifyRecords.push(modifyRecord)

              // 更新列表中的任务
              this.$set(this.list, taskIndex, updatedTask)
            }

            this.updateLoading = false
            this.editDialogVisible = false
            this.currentEditId = null

            if (showMessage) {
              this.$message.success('任务修改成功')
            } else {
              this.$message.success('草稿保存成功')
            }
          }, 1000)
        } else {
          this.$message.error('请完善必填信息')
        }
      })
    },

    // 获取变更内容
    getChanges(oldData, newData) {
      const changes = []
      const compareFields = ['client', 'porject', 'Material_code', 'Material_name', 'count', 'Delivery_time', 'status', 'Difficulty']

      compareFields.forEach((field) => {
        if (oldData[field] !== newData[field]) {
          changes.push({
            field: field,
            oldValue: oldData[field],
            newValue: newData[field]
          })
        }
      })

      return changes
    }
  }
}
</script>

<style lang="scss" scoped>
.production-task-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

// 工具栏样式
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .page-title {
      margin: 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }

    .task-count {
      .count-text {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;

    .action-group {
      margin-right: 10px;
    }
  }
}

// 统计卡片样式
.stats-cards {
  margin-bottom: 20px;

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      i {
        font-size: 24px;
        color: white;
      }

      &.pending {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      }

      &.processing {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      }

      &.completed {
        background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
      }

      &.urgent {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
    }

    .stat-content {
      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 5px;
      }
    }
  }
}

// 表格卡片样式
.table-card {
  border-radius: 8px;
  overflow: hidden;

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;

    .table-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .table-tools {
      display: flex;
      align-items: center;

      .el-button-group .el-button.active {
        background-color: #409eff;
        color: white;
      }
    }
  }
}

// 表格内容样式
.task-info {
  .task-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .task-number {
      font-weight: 600;
      font-size: 16px;
    }
  }

  .task-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .meta-item {
      font-size: 12px;
      color: #909399;

      i {
        margin-right: 4px;
      }
    }
  }
}

.material-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .material-image {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .material-details {
    flex: 1;

    .material-code {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .material-name {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }

    .material-specs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
}

.process-progress {
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    color: #909399;

    .work-hours {
      font-weight: 600;
    }
  }

  .process-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .process-tag {
      font-size: 11px;
      padding: 2px 6px;
    }
  }
}

.delivery-status {
  text-align: center;

  .days-left {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

.difficulty-rating {
  .el-rate {
    justify-content: center;
  }
}

// 卡片视图样式
.card-view {
  padding: 20px 0;

  .task-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .task-card-header {
      padding: 15px;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .task-number {
        font-weight: 600;
        color: #303133;
      }
    }

    .task-card-body {
      padding: 15px;
      display: flex;
      gap: 15px;

      .task-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .task-details {
        flex: 1;

        .detail-row {
          display: flex;
          margin-bottom: 8px;

          .label {
            width: 50px;
            color: #909399;
            font-size: 14px;
          }
        }
      }
    }

    .task-card-footer {
      padding: 15px;
      border-top: 1px solid #ebeef5;

      .card-actions {
        margin-top: 10px;
        text-align: right;
      }
    }
  }
}

// 分页样式
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

// 筛选抽屉样式
.filter-drawer {
  .drawer-content {
    padding: 20px;
  }

  .drawer-actions {
    margin-top: 30px;
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }
}

// 新增任务对话框样式
.add-task-dialog {
  .form-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e4e7ed;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }

  .unit-text {
    margin-left: 8px;
    color: #909399;
    font-size: 12px;
  }

  .image-uploader {
    display: inline-block;

    .image-preview {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
    }

    .image-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      line-height: 100px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }

  .process-list {
    .process-item {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;

      .process-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .process-number {
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }
}

// 物料选择对话框样式
.material-select-dialog {
  .material-search {
    margin-bottom: 15px;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .add-task-dialog {
    width: 95% !important;

    .el-col {
      margin-bottom: 15px;
    }
  }
}

// 编辑任务对话框样式
.edit-task-dialog {
  .form-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e4e7ed;
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }

  .process-item {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid #409eff;

    .process-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .process-number {
        font-weight: 600;
        color: #303133;
      }

      .process-status {
        display: flex;
        align-items: center;
      }
    }
  }

  .unit-text {
    margin-left: 8px;
    color: #909399;
    font-size: 12px;
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }

  .dialog-footer {
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }
}

// 工序状态样式增强
.process-item {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .el-form-item {
    margin-bottom: 10px;
  }
}

// 状态标识样式
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;

  &.pending {
    background-color: #909399;
  }

  &.processing {
    background-color: #e6a23c;
  }

  &.completed {
    background-color: #67c23a;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .edit-task-dialog {
    width: 95% !important;

    .el-col {
      margin-bottom: 15px;
    }

    .process-item {
      padding: 10px;
    }
  }
}
</style>
