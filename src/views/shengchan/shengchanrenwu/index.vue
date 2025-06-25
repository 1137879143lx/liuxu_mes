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
          <!-- 修改物料信息列中的图片部分 -->
          <el-table-column label="物料信息" min-width="250">
            <template slot-scope="{ row }">
              <div class="material-info">
                <div class="material-image" @click="previewMaterialImage(row.image)" v-if="row.image">
                  <img :src="row.image" alt="物料图片" />
                  <div class="image-hover-overlay">
                    <i class="el-icon-zoom-in"></i>
                  </div>
                </div>
                <div class="material-image no-image" v-else>
                  <i class="el-icon-picture-outline"></i>
                </div>
                <div class="material-details">
                  <div class="material-code">{{ row.materialCode }}</div>
                  <div class="material-name">{{ row.materialName }}</div>
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
          <!-- 修改工序标签显示 -->
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
                      <div>负责人: {{ item.submitter || '未分配' }}</div>
                      <div>状态: {{ getProcessStatusText(item.status) }}</div>
                      <div v-if="item.Submission_time" style="color: #999; font-size: 12px">完成时间: {{ item.Submission_time }}</div>
                    </div>
                    <el-tag :type="getProcessTagType(item.status)" :effect="getProcessTagEffect(item.status)" size="mini" class="process-tag">
                      {{ item.process }} ({{ getProcessStatusText(item.status) }})
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
                <el-tag :type="getDeliveryTagType(row.clientDeliveryDate)" size="small">
                  {{ formatDeliveryTime(row.clientDeliveryDate) }}
                </el-tag>
                <div class="days-left">{{ getDaysLeft(row.clientDeliveryDate) }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <!-- 修改状态显示 -->
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="getStatusTagType(row.status)" effect="dark">
                {{ getStatusText(row.status) }}
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
              <!-- 修改卡片视图中的任务图片 -->
              <div class="task-card-body">
                <div class="task-image" @click="previewMaterialImage(item.image)" v-if="item.image">
                  <img :src="item.image || '/shape_image.png'" alt="任务图片" />
                  <div class="image-hover-overlay">
                    <i class="el-icon-zoom-in"></i>
                  </div>
                </div>
                <div class="task-image no-image" v-else>
                  <i class="el-icon-picture-outline"></i>
                </div>
                <div class="task-details">
                  <div class="detail-row">
                    <span class="label">客户:</span>
                    <span>{{ item.client }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">物料:</span>
                    <span>{{ item.materialName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">数量:</span>
                    <span>{{ item.count }}件</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">交期:</span>
                    <span>{{ item.clientDeliveryDate }}</span>
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

          <!-- <el-form-item label="项目">
            <el-select v-model="filterForm.project" placeholder="选择项目" clearable style="width: 100%">
              <el-option v-for="project in projectList" :key="project" :label="project" :value="project" />
            </el-select>
          </el-form-item> -->

          <!-- 修改筛选器中的状态选择 -->
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 100%">
              <el-option label="待开始" value="pending" />
              <el-option label="进行中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已暂停" value="paused" />
              <el-option label="已取消" value="cancelled" />
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
              <el-form-item label="交货日期" prop="clientDeliveryDate">
                <el-date-picker
                  v-model="addForm.clientDeliveryDate"
                  type="date"
                  placeholder="选择交货日期"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <!-- 修改编辑表单中的状态选择 -->
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
              <el-form-item label="物料编码" prop="materialCode">
                <el-input v-model="addForm.materialCode" placeholder="请输入物料编码">
                  <el-button slot="append" icon="el-icon-search" @click="selectMaterial">选择</el-button>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="物料名称" prop="materialName">
                <el-input v-model="addForm.materialName" placeholder="请输入物料名称"></el-input>
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
                <div class="image-upload-container">
                  <!-- 图片预览区域 -->
                  <div class="image-preview-area" @click="handleImageClick" @paste="handlePaste" tabindex="0">
                    <div v-if="addForm.image" class="image-preview-wrapper">
                      <img :src="addForm.image" class="image-preview" alt="物料图片" />
                      <div class="image-overlay">
                        <div class="image-actions">
                          <el-button size="mini" type="primary" icon="el-icon-view" @click.stop="previewImage(addForm.image)">预览</el-button>
                          <el-button size="mini" type="warning" icon="el-icon-edit" @click.stop="selectImage">更换</el-button>
                          <el-button size="mini" type="danger" icon="el-icon-delete" @click.stop="removeImage">删除</el-button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="image-upload-placeholder">
                      <i class="el-icon-plus"></i>
                      <div class="upload-text">
                        <p>点击上传图片</p>
                        <p class="paste-tip">或按 Ctrl+V 粘贴图片</p>
                      </div>
                    </div>
                  </div>

                  <!-- 隐藏的文件输入 -->
                  <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileSelect" />

                  <!-- 上传提示 -->
                  <div class="upload-tips">
                    <p class="tip-text">支持 JPG、PNG、GIF 格式，文件大小不超过 5MB</p>
                    <p class="tip-text">可以直接粘贴剪贴板中的图片 (Ctrl+V)</p>
                  </div>
                </div>
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
                  <!-- 修改工序状态选择 -->
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
              <el-form-item label="创建人" prop="createdBy">
                <el-input v-model="addForm.createdBy" placeholder="请输入创建人"></el-input>
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
              <el-form-item label="交货日期" prop="clientDeliveryDate">
                <el-date-picker
                  v-model="editForm.clientDeliveryDate"
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
              <el-form-item label="物料编码" prop="materialCode">
                <el-input v-model="editForm.materialCode" placeholder="请输入物料编码">
                  <el-button slot="append" icon="el-icon-search" @click="selectMaterialForEdit">选择</el-button>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="物料名称" prop="materialName">
                <el-input v-model="editForm.materialName" placeholder="请输入物料名称"></el-input>
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

          <!-- 在编辑任务对话框中也添加相同的图片上传组件 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="物料图片">
                <div class="image-upload-container">
                  <!-- 图片预览区域 -->
                  <div class="image-preview-area" @click="handleEditImageClick" @paste="handleEditPaste" tabindex="0">
                    <div v-if="editForm.image" class="image-preview-wrapper">
                      <img :src="editForm.image" class="image-preview" alt="物料图片" />
                      <div class="image-overlay">
                        <div class="image-actions">
                          <el-button size="mini" type="primary" icon="el-icon-view" @click.stop="previewImage(editForm.image)">预览</el-button>
                          <el-button size="mini" type="warning" icon="el-icon-edit" @click.stop="selectEditImage">更换</el-button>
                          <el-button size="mini" type="danger" icon="el-icon-delete" @click.stop="removeEditImage">删除</el-button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="image-upload-placeholder">
                      <i class="el-icon-plus"></i>
                      <div class="upload-text">
                        <p>点击上传图片</p>
                        <p class="paste-tip">或按 Ctrl+V 粘贴图片</p>
                      </div>
                    </div>
                  </div>

                  <!-- 隐藏的文件输入 -->
                  <input ref="editFileInput" type="file" accept="image/*" style="display: none" @change="handleEditFileSelect" />

                  <!-- 上传提示 -->
                  <div class="upload-tips">
                    <p class="tip-text">支持 JPG、PNG、GIF 格式，文件大小不超过 5MB</p>
                    <p class="tip-text">可以直接粘贴剪贴板中的图片 (Ctrl+V)</p>
                  </div>
                </div>
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
                <el-input :value="editForm.createdBy" disabled></el-input>
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

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="imagePreviewVisible" width="60%" class="image-preview-dialog">
      <div class="image-preview-container">
        <img :src="previewImageUrl" alt="预览图片" class="preview-image" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="imagePreviewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadImage">下载图片</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchProductionTasks,
  createProductionTask,
  updateProductionTask,
  deleteProductionTask,
  batchDeleteProductionTasks,
  fetchTaskStatistics,
  generateTaskNumber,
  exportTasks
} from '@/api/productionTask'
import { getMaterialsSearch } from '@/api/materials'
import { getCustomerOptions } from '@/api/Customer' // 新增导入

export default {
  name: 'ProductionTask',
  data() {
    return {
      // 图片预览相关
      imagePreviewVisible: false,
      previewImageUrl: '',
      // 状态选项
      statusOptions: [
        { label: '待开始', value: 'pending' },
        { label: '进行中', value: 'processing' },
        { label: '已完成', value: 'completed' },
        { label: '已暂停', value: 'paused' },
        { label: '已取消', value: 'cancelled' }
      ],

      // 工序状态选项
      processStatusOptions: [
        { label: '未开始', value: 0 },
        { label: '进行中', value: 1 },
        { label: '已完成', value: 2 }
      ],

      // 难度等级选项
      difficultyOptions: [
        { label: '低', value: 1 },
        { label: '普通', value: 2 },
        { label: '较高', value: 3 },
        { label: '紧急', value: 4 },
        { label: '非常紧急', value: 5 }
      ],

      isEditMode: false,
      drawer: false,
      listLoading: false,
      viewMode: 'table',

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
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 数据
      list: [],
      statistics: {
        pending: 0,
        processing: 0,
        completed: 0,
        urgent: 0
      },

      // 选中项
      multipleSelection: [],

      // 新增任务相关
      addDialogVisible: false,
      submitLoading: false,
      // 修改 addForm 初始化
      addForm: {
        Batch_number: '', // 修改字段名
        client: '',
        porject: '', // 修改字段名 (注意拼写)
        materialCode: '',
        materialName: '',
        versions: '1.0', // 修改字段名
        count: 1, // 修改字段名
        type: '',
        clientDeliveryDate: '',
        status: 'pending',
        Difficulty: 2, // 修改字段名
        man_hour: 0, // 修改字段名
        createdBy: '',
        image: '',
        description: '',
        process: [
          // 修改工序字段结构
          {
            process: '下料', // 修改字段名
            status: 0,
            man_hour: 0, // 修改字段名
            submitter: '', // 修改字段名
            Submission_time: ''
          }
        ]
      },

      // 编辑任务相关
      editDialogVisible: false,
      updateLoading: false,
      currentEditId: null,
      editForm: {},

      // 表单验证规则
      // 在 data() 中修改表单验证规则
      addRules: {
        client: [{ required: true, message: '请选择客户', trigger: 'change' }],
        materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        count: [{ required: true, message: '请输入生产数量', trigger: 'blur' }], // 修改字段名
        clientDeliveryDate: [{ required: true, message: '请选择交货日期', trigger: 'change' }],
        createdBy: [{ required: true, message: '请输入创建人', trigger: 'blur' }]
      },

      editRules: {
        client: [{ required: true, message: '请选择客户', trigger: 'change' }],
        materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        count: [{ required: true, message: '请输入生产数量', trigger: 'blur' }], // 修改字段名
        clientDeliveryDate: [{ required: true, message: '请选择交货日期', trigger: 'change' }]
      },

      // 物料选择
      materialDialogVisible: false,
      materialSearch: '',
      selectedMaterial: null,
      materialList: [],

      // 选项数据
      clientOptions: [],
      userOptions: [
        { id: 1, name: '张工' },
        { id: 2, name: '李师傅' },
        { id: 3, name: '王师傅' },
        { id: 4, name: '刘师傅' }
      ]
    }
  },

  computed: {
    // 修改 filteredList，现在主要用于本地搜索辅助
    filteredList() {
      let result = this.list

      // 本地搜索（作为服务器筛选的补充）
      if (this.searchText && this.searchText !== this.filterForm.keyword) {
        const searchLower = this.searchText.toLowerCase()
        result = result.filter(
          (item) =>
            (item.Batch_number && item.Batch_number.toLowerCase().includes(searchLower)) ||
            (item.client && item.client.toLowerCase().includes(searchLower)) ||
            (item.materialName && item.materialName.toLowerCase().includes(searchLower)) ||
            (item.materialCode && item.materialCode.toLowerCase().includes(searchLower)) ||
            (item.statusText && item.statusText.includes(this.searchText)) ||
            (item.difficultyText && item.difficultyText.includes(this.searchText))
        )
      }

      return result
    },

    clientList() {
      return [...new Set(this.list.map((item) => item.client).filter(Boolean))]
    },

    projectList() {
      return [...new Set(this.list.map((item) => item.porject).filter(Boolean))]
    },

    filteredMaterials() {
      if (!this.materialSearch) return this.materialList

      const search = this.materialSearch.toLowerCase()
      return this.materialList.filter(
        (item) => (item.code && item.code.toLowerCase().includes(search)) || (item.name && item.name.toLowerCase().includes(search))
      )
    },
    // 筛选条件数量
    filterCount() {
      return this.getFilterCount()
    },

    // 是否有激活的筛选条件
    hasActiveFilters() {
      return this.filterCount > 0
    },

    // 物料筛选列表
    filteredMaterials() {
      if (!this.materialSearch) return this.materialList

      const search = this.materialSearch.toLowerCase()
      return this.materialList.filter(
        (item) => (item.code && item.code.toLowerCase().includes(search)) || (item.name && item.name.toLowerCase().includes(search))
      )
    }
  },

  mounted() {
    this.loadData()
    this.loadStatistics()
    this.loadClientOptions() // 新增调用
  },

  methods: {
    // 应用筛选
    applyFilter() {
      // 重置到第一页
      this.pagination.currentPage = 1

      // 执行筛选数据加载
      this.loadData()

      // 关闭筛选抽屉
      this.drawer = false

      // 显示筛选结果提示
      this.showFilterResult()
    },

    // 重置筛选
    resetFilter() {
      this.filterForm = {
        keyword: '',
        client: '',
        project: '',
        status: '',
        urgency: 0,
        deliveryDateRange: [],
        createDateRange: [],
        includeCompleted: true
      }

      // 立即应用重置后的筛选
      this.applyFilter()
    },

    // 显示筛选结果
    showFilterResult() {
      const activeFilters = this.getActiveFilters()
      if (activeFilters.length > 0) {
        const filterText = activeFilters.join('、')
        this.$message.success(`已应用筛选条件：${filterText}`)
      } else {
        this.$message.info('已清除所有筛选条件')
      }
    },

    // 获取激活的筛选条件
    getActiveFilters() {
      const filters = []

      if (this.filterForm.keyword) {
        filters.push(`关键字: ${this.filterForm.keyword}`)
      }

      if (this.filterForm.client) {
        filters.push(`客户: ${this.filterForm.client}`)
      }

      if (this.filterForm.project) {
        filters.push(`项目: ${this.filterForm.project}`)
      }

      if (this.filterForm.status) {
        const statusText = this.getStatusText(this.filterForm.status)
        filters.push(`状态: ${statusText}`)
      }

      if (this.filterForm.urgency > 0) {
        filters.push(`紧急程度: ${this.getDifficultyText(this.filterForm.urgency)}`)
      }

      if (this.filterForm.deliveryDateRange && this.filterForm.deliveryDateRange.length === 2) {
        filters.push(`交期: ${this.filterForm.deliveryDateRange[0]} ~ ${this.filterForm.deliveryDateRange[1]}`)
      }

      if (this.filterForm.createDateRange && this.filterForm.createDateRange.length === 2) {
        filters.push(`创建时间: ${this.filterForm.createDateRange[0]} ~ ${this.filterForm.createDateRange[1]}`)
      }

      if (!this.filterForm.includeCompleted) {
        filters.push('排除已完成任务')
      }

      return filters
    },

    // 新增方法：加载客户选项
    async loadClientOptions() {
      try {
        const response = await getCustomerOptions()
        if (response.code === 200) {
          // 根据后端返回的数据结构调整
          this.clientOptions = response.data.map((item) => item.name || item.companyName || item)
        }
      } catch (error) {
        console.error('加载客户选项失败:', error)
        // 降级方案：使用默认客户列表
        //this.clientOptions = ['华为技术', '中兴通讯', '比亚迪', '宁德时代', '腾讯科技']
      }
    },

    // 预览物料图片
    previewMaterialImage(imageUrl) {
      if (!imageUrl) {
        this.$message.warning('暂无图片')
        return
      }
      this.previewImage(imageUrl)
    },

    // 新增任务的图片处理方法
    handleImageClick() {
      if (!this.addForm.image) {
        this.selectImage()
      }
    },

    selectImage() {
      this.$refs.fileInput.click()
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processImageFile(file, 'add')
      }
      // 清空input值，允许重复选择同一文件
      event.target.value = ''
    },

    // 处理粘贴事件
    handlePaste(event) {
      const items = (event.clipboardData || window.clipboardData).items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          this.processImageFile(blob, 'add')
          event.preventDefault()
          break
        }
      }
    },

    // 编辑任务的图片处理方法
    handleEditImageClick() {
      if (!this.editForm.image) {
        this.selectEditImage()
      }
    },

    selectEditImage() {
      this.$refs.editFileInput.click()
    },

    handleEditFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.processImageFile(file, 'edit')
      }
      // 清空input值，允许重复选择同一文件
      event.target.value = ''
    },

    // 处理编辑时的粘贴事件
    handleEditPaste(event) {
      const items = (event.clipboardData || window.clipboardData).items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          this.processImageFile(blob, 'edit')
          event.preventDefault()
          break
        }
      }
    },

    // 统一的图片文件处理方法
    async processImageFile(file, mode = 'add') {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        this.$message.error('只支持 JPG、PNG、GIF 格式的图片!')
        return false
      }

      // 验证文件大小 (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }

      try {
        // 显示加载状态
        const loadingMessage = this.$message({
          message: '正在处理图片...',
          type: 'info',
          duration: 0
        })

        // 压缩图片（如果需要）
        const processedFile = await this.compressImage(file)

        // 转换为base64或上传到服务器
        const imageUrl = await this.convertToImageUrl(processedFile)

        // 更新对应的表单数据
        if (mode === 'add') {
          this.addForm.image = imageUrl
        } else if (mode === 'edit') {
          this.editForm.image = imageUrl
        }

        loadingMessage.close()
        this.$message.success('图片上传成功!')

        return true
      } catch (error) {
        console.error('图片处理失败:', error)
        this.$message.error('图片处理失败: ' + (error.message || '未知错误'))
        return false
      }
    },

    // 图片压缩方法
    compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          // 计算压缩后的尺寸
          let { width, height } = img

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }

          canvas.width = width
          canvas.height = height

          // 绘制压缩后的图片
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为blob
          canvas.toBlob(resolve, file.type, quality)
        }

        img.src = URL.createObjectURL(file)
      })
    },

    // 转换图片为URL
    convertToImageUrl(file) {
      return new Promise((resolve, reject) => {
        // 方式1: 转换为base64 (适合小图片)
        if (file.size < 1024 * 1024) {
          // 小于1MB用base64
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.onerror = (e) => reject(new Error('文件读取失败'))
          reader.readAsDataURL(file)
        } else {
          // 方式2: 上传到服务器 (适合大图片)
          this.uploadImageToServer(file).then(resolve).catch(reject)
        }
      })
    },

    // 上传图片到服务器
    async uploadImageToServer(file) {
      const formData = new FormData()
      formData.append('image', file)

      try {
        // 这里需要你的后端上传接口
        const response = await this.$http.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data.code === 200) {
          return response.data.data.url
        } else {
          throw new Error(response.data.message || '上传失败')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        throw new Error('图片上传失败: ' + (error.message || '网络错误'))
      }
    },

    // 删除图片
    removeImage() {
      this.$confirm('确定要删除这张图片吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.addForm.image = ''
          this.$message.success('图片已删除')
        })
        .catch(() => {
          // 用户取消
        })
    },

    removeEditImage() {
      this.$confirm('确定要删除这张图片吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.editForm.image = ''
          this.$message.success('图片已删除')
        })
        .catch(() => {
          // 用户取消
        })
    },

    // 预览图片
    previewImage(imageUrl) {
      this.previewImageUrl = imageUrl
      this.imagePreviewVisible = true
    },

    // 下载图片
    downloadImage() {
      if (this.previewImageUrl) {
        const link = document.createElement('a')
        link.href = this.previewImageUrl
        link.download = `物料图片_${Date.now()}.jpg`
        link.click()
      }
    },

    // 修改原有的上传成功回调（保持兼容性）
    handleImageSuccess(response, file) {
      // 如果使用原有的上传组件
      if (response && response.url) {
        this.addForm.image = response.url
      } else {
        this.addForm.image = URL.createObjectURL(file.raw)
      }
    },

    handleEditImageSuccess(response, file) {
      // 如果使用原有的上传组件
      if (response && response.url) {
        this.editForm.image = response.url
      } else {
        this.editForm.image = URL.createObjectURL(file.raw)
      }
    },

    // 修改原有的上传前验证
    beforeImageUpload(file) {
      return this.processImageFile(file, 'add')
    },

    // 修改数据加载方法，支持筛选参数
    async loadData() {
      this.listLoading = true
      try {
        // 构建筛选参数
        const params = {
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          ...this.buildFilterParams()
        }

        console.log('筛选参数:', params)

        const response = await fetchProductionTasks(params)
        if (response.code === 200) {
          // 转换后端数据为前端显示格式
          this.list = (response.data.list || []).map((item) => ({
            ...item,
            statusText: this.getStatusText(item.status),
            difficultyText: this.getDifficultyText(item.Difficulty),
            // 转换工序状态为中文
            process: (item.process || []).map((proc) => ({
              ...proc,
              statusText: this.getProcessStatusText(proc.status)
            }))
          }))
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载任务列表失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.listLoading = false
      }
    },

    // 构建筛选参数
    buildFilterParams() {
      const params = {}

      // 关键字搜索
      if (this.filterForm.keyword) {
        params.keyword = this.filterForm.keyword.trim()
      }

      // 客户筛选
      if (this.filterForm.client) {
        params.client = this.filterForm.client
      }

      // 项目筛选
      if (this.filterForm.project) {
        params.project = this.filterForm.project
      }

      // 状态筛选
      if (this.filterForm.status) {
        params.status = this.filterForm.status
      }

      // 紧急程度筛选
      if (this.filterForm.urgency > 0) {
        params.urgency = this.filterForm.urgency
      }

      // 交期范围筛选
      if (this.filterForm.deliveryDateRange && this.filterForm.deliveryDateRange.length === 2) {
        params.deliveryStartDate = this.filterForm.deliveryDateRange[0]
        params.deliveryEndDate = this.filterForm.deliveryDateRange[1]
      }

      // 创建时间范围筛选
      if (this.filterForm.createDateRange && this.filterForm.createDateRange.length === 2) {
        params.createStartDate = this.filterForm.createDateRange[0]
        params.createEndDate = this.filterForm.createDateRange[1]
      }

      // 是否包含已完成任务
      params.includeCompleted = this.filterForm.includeCompleted

      return params
    },

    async loadStatistics() {
      try {
        const response = await fetchTaskStatistics()
        if (response.code === 200) {
          this.statistics = response.data
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    async refreshData() {
      await Promise.all([this.loadData(), this.loadStatistics()])
      this.$message.success('数据已刷新')
    },

    // 统计方法
    getStatusCount(status) {
      // 支持英文和中文状态查询
      const statusMap = {
        pending: ['pending', '待开始'],
        processing: ['processing', '进行中'],
        completed: ['completed', '已完成'],
        paused: ['paused', '已暂停'],
        cancelled: ['cancelled', '已取消']
      }

      let count = 0
      if (statusMap[status]) {
        statusMap[status].forEach((statusKey) => {
          count += this.list.filter((item) => item.status === statusKey).length
        })
      }

      return this.statistics[status] || count
    },

    getUrgentCount() {
      return this.statistics.urgent || 0
    },

    // 工序相关方法
    getProcessProgress(process) {
      if (!process || process.length === 0) return 0
      const completed = process.filter((p) => p.status === 2).length
      return Math.round((completed / process.length) * 100)
    },

    getTotalWorkHours(process) {
      if (!process) return 0
      return process.reduce((total, p) => total + (p.man_hour || 0), 0)
    },

    getProgressColor(process) {
      const progress = this.getProcessProgress(process)
      if (progress < 30) return '#f56c6c'
      if (progress < 70) return '#e6a23c'
      return '#67c23a'
    },
    // 修改工序标签类型判断
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
    // 修改状态相关方法为中文显示
    getStatusTagType(status) {
      switch (status) {
        case 'completed':
        case '已完成':
          return 'success'
        case 'processing':
        case '进行中':
          return 'primary'
        case 'pending':
        case '待开始':
          return 'info'
        case 'paused':
        case '已暂停':
          return 'warning'
        case 'cancelled':
        case '已取消':
          return 'danger'
        default:
          return 'info'
      }
    },
    // 状态转换为中文显示
    getStatusText(status) {
      const statusMap = {
        pending: '待开始',
        processing: '进行中',
        completed: '已完成',
        paused: '已暂停',
        cancelled: '已取消'
      }
      return statusMap[status] || status
    },
    getDifficultyText(difficulty) {
      const difficultyMap = {
        1: '低',
        2: '普通',
        3: '较高',
        4: '紧急',
        5: '非常紧急'
      }
      return difficultyMap[difficulty] || '普通'
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
      // 将搜索框的内容同步到筛选表单
      this.filterForm.keyword = this.searchText
      this.applyFilter()
    },

    quickFilter(type, value) {
      switch (type) {
        case 'status':
          this.filterForm.status = value
          break
        case 'client':
          this.filterForm.client = value
          break
        case 'urgency':
          this.filterForm.urgency = value
          break
        default:
          break
      }
      this.applyFilter()
    },

    // 清除特定筛选条件
    clearFilter(type) {
      switch (type) {
        case 'keyword':
          this.filterForm.keyword = ''
          this.searchText = ''
          break
        case 'client':
          this.filterForm.client = ''
          break
        case 'project':
          this.filterForm.project = ''
          break
        case 'status':
          this.filterForm.status = ''
          break
        case 'urgency':
          this.filterForm.urgency = 0
          break
        case 'deliveryDate':
          this.filterForm.deliveryDateRange = []
          break
        case 'createDate':
          this.filterForm.createDateRange = []
          break
        default:
          break
      }
      this.applyFilter()
    },

    // 获取筛选条件数量
    getFilterCount() {
      let count = 0

      if (this.filterForm.keyword) count++
      if (this.filterForm.client) count++
      if (this.filterForm.project) count++
      if (this.filterForm.status) count++
      if (this.filterForm.urgency > 0) count++
      if (this.filterForm.deliveryDateRange.length === 2) count++
      if (this.filterForm.createDateRange.length === 2) count++
      if (!this.filterForm.includeCompleted) count++

      return count
    },

    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    // 分页处理
    handleSizeChange(val) {
      this.pagination.pageSize = val
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
      this.addForm.createdBy = this.$store.getters.name || '当前用户'
      this.addDialogVisible = true
    },

    // 重置表单
    resetAddForm() {
      this.addForm = {
        Batch_number: '',
        client: '',
        porject: '',
        materialCode: '',
        materialName: '',
        versions: '1.0',
        count: 1,
        type: '',
        clientDeliveryDate: '',
        status: '待开始', // 使用中文状态
        Difficulty: 2,
        man_hour: 0,
        createdBy: '',
        image: '',
        description: '',
        process: [
          {
            process: '下料',
            status: 0, // 使用数字状态
            man_hour: 0,
            submitter: '',
            Submission_time: ''
          }
        ]
      }

      this.$nextTick(() => {
        if (this.$refs.addForm) {
          this.$refs.addForm.clearValidate()
        }
      })
    },

    // 生成任务编号
    async generateTaskNumber() {
      try {
        const response = await generateTaskNumber()
        if (response.code === 200) {
          this.addForm.Batch_number = response.data.taskNumber
        }
      } catch (error) {
        console.error('生成任务编号失败:', error)
        // 降级方案：本地生成
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const sequence = String(this.list.length + 1).padStart(3, '0')
        this.addForm.Batch_number = `PT${year}${month}${day}${sequence}`
      }
    },

    // 物料搜索
    async searchMaterials() {
      if (!this.materialSearch) return

      try {
        const response = await getMaterialsSearch({
          keyword: this.materialSearch,
          pageSize: 50
        })
        if (response.code === 200) {
          this.materialList = response.data.list || []
        }
      } catch (error) {
        console.error('搜索物料失败:', error)
      }
    },

    // 以下保持不变

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
        this.addForm.materialCode = this.selectedMaterial.code
        this.addForm.materialName = this.selectedMaterial.name
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
    async submitTask(showMessage = true) {
      try {
        await this.$refs.addForm.validate()

        this.submitLoading = true

        // 转换中文状态为英文存储
        const submitData = {
          ...this.addForm,
          // 状态转换：中文 -> 英文
          status: this.convertStatusToEn(this.addForm.status),
          // 工序状态转换
          process: this.addForm.process.map((proc) => ({
            ...proc,
            status: typeof proc.status === 'string' ? this.convertProcessStatusToNum(proc.status) : proc.status
          })),
          estimatedHours: this.addForm.process.reduce((total, p) => total + (p.man_hour || 0), 0)
        }

        const response = await createProductionTask(submitData)

        if (response.code === 200 || response.code === 201) {
          this.$message.success(showMessage ? '任务创建成功' : '草稿保存成功')
          this.addDialogVisible = false
          this.resetAddForm()
          await this.loadData()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '创建失败')
        }
      } catch (error) {
        console.error('创建任务失败:', error)
        this.$message.error('创建失败：' + (error.message || '网络错误'))
      } finally {
        this.submitLoading = false
      }
    },

    convertProcessStatusToNum(statusText) {
      const statusMap = {
        未开始: 0,
        进行中: 1,
        已完成: 2
      }
      return statusMap[statusText] !== undefined ? statusMap[statusText] : statusText
    },

    // 状态转换辅助方法
    convertStatusToEn(chineseStatus) {
      const statusMap = {
        待开始: 'pending',
        进行中: 'processing',
        已完成: 'completed',
        已暂停: 'paused',
        已取消: 'cancelled'
      }
      return statusMap[chineseStatus] || chineseStatus
    },

    // 编辑任务相关方法
    // 编辑任务
    async editTask(row) {
      this.currentEditId = row._id || row.id
      this.editForm = JSON.parse(JSON.stringify(row))
      this.editDialogVisible = true
    },

    // 填充编辑表单
    fillEditForm(row) {
      this.editForm = {
        Batch_number: row.Batch_number,
        client: row.client,
        porject: row.porject,
        materialCode: row.materialCode,
        materialName: row.materialName,
        versions: row.versions,
        count: row.count,
        type: row.type,
        clientDeliveryDate: row.clientDeliveryDate,
        status: row.status,
        Difficulty: row.Difficulty,
        man_hour: row.man_hour,
        createdBy: row.createdBy,
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
          this.editForm.materialCode = this.selectedMaterial.code
          this.editForm.materialName = this.selectedMaterial.name
          this.editForm.type = this.selectedMaterial.type
        } else {
          this.addForm.materialCode = this.selectedMaterial.code
          this.addForm.materialName = this.selectedMaterial.name
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
    async updateTask(showMessage = true) {
      try {
        await this.$refs.editForm.validate()

        this.updateLoading = true

        const response = await updateProductionTask(this.currentEditId, this.editForm)

        if (response.code === 200) {
          this.$message.success(showMessage ? '任务修改成功' : '草稿保存成功')
          this.editDialogVisible = false
          this.currentEditId = null
          await this.loadData()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '修改失败')
        }
      } catch (error) {
        console.error('修改任务失败:', error)
        this.$message.error('修改失败：' + (error.message || '网络错误'))
      } finally {
        this.updateLoading = false
      }
    },

    // 获取变更内容
    getChanges(oldData, newData) {
      const changes = []
      const compareFields = ['client', 'porject', 'materialCode', 'materialName', 'count', 'clientDeliveryDate', 'status', 'Difficulty']

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
    },

    // 删除任务
    async deleteTask(row) {
      try {
        await this.$confirm('确定要删除这个生产任务吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deleteProductionTask(row._id || row.id)
        if (response.code === 200) {
          this.$message.success('删除成功')
          await this.loadData()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除任务失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 批量删除
    async batchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择要删除的任务')
        return
      }

      try {
        await this.$confirm(`确定要删除选中的 ${this.multipleSelection.length} 个任务吗？`, '批量删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.multipleSelection.map((item) => item._id || item.id)
        const response = await batchDeleteProductionTasks({ ids })

        if (response.code === 200) {
          this.$message.success(`成功删除 ${this.multipleSelection.length} 个任务`)
          this.multipleSelection = []
          await this.loadData()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '批量删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      }
    },

    // 导出数据
    async exportData() {
      try {
        const response = await exportTasks(this.filterForm)

        // 创建下载链接
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `生产任务数据_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      }
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

// 添加图片加载失败的处理样式
.material-image {
  img {
    &[src=''],
    &:not([src]) {
      display: none;
    }
  }

  // 图片加载失败时的占位符
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f5f7fa
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="%23c0c4cc" d="M304 456a72 72 0 1 0 0-144 72 72 0 0 0 0 144zm0-96a24 24 0 1 1 0 48 24 24 0 0 1 0-48z"/><path fill="%23c0c4cc" d="M893.3 293.3L730.7 130.7c-7.5-7.5-16.7-13-26.7-16V112c0-17.7-14.3-32-32-32H112c-17.7 0-32 14.3-32 32v800c0 17.7 14.3 32 32 32h560c17.7 0 32-14.3 32-32V732.4l94.3-94.3c6.2-6.2 16.4-6.2 22.6 0l94.3 94.3c6.2 6.2 6.2 16.4 0 22.6L638.1 638.1c-6.2-6.2-16.4-6.2-22.6 0L521.8 732.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l71.1-71.1 156.5 156.5c18.7 18.7 49.1 18.7 67.9 0l94.3-94.3c18.7-18.7 18.7-49.1 0-67.9L677.3 421.6c-18.7-18.7-49.1-18.7-67.9 0L480 551c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l107.9-107.9L893.3 316.1c6.2-6.2 6.2-16.4 0-22.8z"/></svg>')
      center/24px no-repeat;
    display: none;
  }

  &:not(:has(img)),
  &:has(img[src='']) {
    &::after {
      display: block;
    }
  }
}
// 物料图片样式增强
.material-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .material-image {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .image-hover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      i {
        color: white;
        font-size: 18px;
      }
    }

    &:hover .image-hover-overlay {
      opacity: 1;
    }

    // 无图片状态
    &.no-image {
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed #dcdfe6;
      cursor: default;

      &:hover {
        transform: none;
        box-shadow: none;
      }

      i {
        font-size: 20px;
        color: #c0c4cc;
      }
    }
  }

  .material-details {
    flex: 1;

    .material-code {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .material-name {
      font-size: 13px;
      color: #606266;
      margin-bottom: 8px;
      line-height: 1.2;

      // 超长文本省略
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .material-specs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;

      .el-tag {
        font-size: 11px;
        height: 20px;
        line-height: 18px;
        padding: 0 6px;
      }
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

// 卡片视图中的图片样式
.card-view {
  .task-card {
    .task-card-body {
      .task-image {
        width: 80px;
        height: 80px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .image-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          i {
            color: white;
            font-size: 24px;
          }
        }

        &:hover .image-hover-overlay {
          opacity: 1;
        }

        // 无图片状态
        &.no-image {
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed #dcdfe6;
          cursor: default;

          &:hover {
            transform: none;
            box-shadow: none;
          }

          i {
            font-size: 32px;
            color: #c0c4cc;
          }
        }
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

// 图片上传容器样式
.image-upload-container {
  .image-preview-area {
    width: 200px;
    height: 150px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    outline: none;

    &:hover {
      border-color: #409eff;
    }

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    .image-preview-wrapper {
      width: 100%;
      height: 100%;
      position: relative;

      .image-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        .image-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }

      &:hover .image-overlay {
        opacity: 1;
      }
    }

    .image-upload-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #8c939d;

      i {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .upload-text {
        text-align: center;

        p {
          margin: 4px 0;
          font-size: 14px;

          &.paste-tip {
            font-size: 12px;
            color: #bbb;
          }
        }
      }
    }
  }

  .upload-tips {
    margin-top: 12px;

    .tip-text {
      margin: 4px 0;
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }
  }
}

// 图片预览对话框样式优化
.image-preview-dialog {
  .image-preview-container {
    text-align: center;
    padding: 20px;

    .preview-image {
      max-width: 100%;
      max-height: 70vh; // 限制最大高度，避免图片过大
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: zoom-in;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.02);
      }
    }
  }

  .dialog-footer {
    text-align: right;
    padding: 15px 20px;

    .el-button {
      margin-left: 10px;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .image-upload-container {
    .image-preview-area {
      width: 150px;
      height: 120px;
    }
  }

  .image-preview-dialog {
    width: 90% !important;

    .image-preview-container {
      padding: 15px;

      .preview-image {
        max-height: 300px;
      }
    }
  }
}

// 拖拽上传样式增强
.image-preview-area {
  &.drag-over {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}

// 加载状态样式
.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #409eff;
  font-size: 14px;
}
</style>
