<template>
  <div class="inventory-container">
    <!-- 搜索和操作区域 -->
    <!-- 搜索和操作区域 -->
    <el-card class="search-card" shadow="never">
      <div slot="header" class="search-header">
        <div class="header-left">
          <i class="el-icon-search header-icon"></i>
          <span class="header-title">即时库存管理</span>
        </div>
        <div class="header-right">
          <el-button type="success" icon="el-icon-upload2" size="small" @click="showImportDialog">导入库存</el-button>
          <el-button type="primary" icon="el-icon-refresh" size="small" @click="refreshData">刷新数据</el-button>
        </div>
      </div>

      <!-- 搜索表单 -->
      <div class="search-form-wrapper">
        <el-form ref="searchForm" :model="searchForm" class="advanced-search-form" :inline="false" label-position="top">
          <!-- 第一行：基础搜索 -->
          <el-row :gutter="20" class="search-row">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
              <el-form-item label="物料编码" class="search-item">
                <el-input
                  v-model="searchForm.materialCode"
                  @keyup.enter.native="handleSearch"
                  placeholder="请输入物料编码"
                  clearable
                  prefix-icon="el-icon-goods"
                  size="medium" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
              <el-form-item label="物料名称" class="search-item">
                <el-input
                  v-model="searchForm.materialName"
                  @keyup.enter.native="handleSearch"
                  placeholder="请输入物料名称"
                  clearable
                  prefix-icon="el-icon-collection-tag"
                  size="medium" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
              <el-form-item label="规格型号" class="search-item">
                <el-input
                  v-model="searchForm.specification"
                  @keyup.enter.native="handleSearch"
                  placeholder="请输入规格型号"
                  clearable
                  prefix-icon="el-icon-menu"
                  size="medium" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
              <el-form-item label="版本" class="search-item">
                <el-input
                  v-model="searchForm.version"
                  @keyup.enter.native="handleSearch"
                  placeholder="请输入版本"
                  clearable
                  prefix-icon="el-icon-price-tag"
                  size="medium" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
              <el-form-item label="仓库" class="search-item">
                <el-select v-model="searchForm.warehouse" placeholder="请选择仓库" clearable size="medium" style="width: 100%">
                  <el-option v-for="warehouse in warehouseOptions" :key="warehouse.value" :label="warehouse.label" :value="warehouse.value">
                    <span class="warehouse-option">
                      <i :class="warehouse.icon"></i>
                      {{ warehouse.label }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
              <el-form-item label="库存状态" class="search-item">
                <el-select v-model="searchForm.stockStatus" placeholder="请选择状态" clearable size="medium" style="width: 100%">
                  <el-option v-for="status in statusOptions" :key="status.value" :label="status.label" :value="status.value">
                    <span class="status-option">
                      <el-tag :type="status.type" size="mini">{{ status.label }}</el-tag>
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 操作按钮行 -->
          <el-row class="search-actions">
            <el-col :span="24">
              <div class="action-buttons">
                <div class="left-actions">
                  <el-button type="primary" icon="el-icon-search" size="medium" @click="handleSearch" :loading="loading">查询</el-button>
                  <el-button icon="el-icon-refresh-left" size="medium" @click="resetSearch">重置</el-button>
                  <el-button
                    v-if="hasSearchConditions"
                    type="text"
                    icon="el-icon-close"
                    size="medium"
                    @click="clearAllConditions"
                    class="clear-all-btn">
                    清空所有条件
                  </el-button>
                </div>

                <div class="right-actions">
                  <!-- 导出下拉菜单 -->
                  <el-dropdown @command="handleExportCommand" trigger="click" placement="bottom-end">
                    <el-button type="success" icon="el-icon-download" size="medium">
                      导出数据
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown" class="export-dropdown">
                      <el-dropdown-item command="current">
                        <i class="el-icon-document"></i>
                        导出当前搜索结果
                      </el-dropdown-item>
                      <el-dropdown-item command="all" divided>
                        <i class="el-icon-folder-opened"></i>
                        导出所有数据
                      </el-dropdown-item>
                      <el-dropdown-item command="template" divided>
                        <i class="el-icon-download"></i>
                        下载导入模板
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>

                  <!-- 高级搜索切换 -->
                  <el-button type="text" icon="el-icon-setting" size="medium" @click="toggleAdvancedSearch" class="advanced-toggle">
                    {{ showAdvanced ? '收起' : '高级' }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 高级搜索面板（可折叠） -->
          <el-collapse-transition>
            <div v-show="showAdvanced" class="advanced-search-panel">
              <el-divider content-position="left">
                <span class="divider-text">
                  <i class="el-icon-s-operation"></i>
                  高级筛选
                </span>
              </el-divider>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="库存范围" class="search-item">
                    <el-input-number v-model="searchForm.minStock" :min="0" placeholder="最小库存" size="medium" style="width: 100%" />
                  </el-form-item>
                </el-col>

                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="　" class="search-item">
                    <!-- 占位符保持对齐 -->
                    <el-input-number v-model="searchForm.maxStock" :min="0" placeholder="最大库存" size="medium" style="width: 100%" />
                  </el-form-item>
                </el-col>

                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="更新时间" class="search-item">
                    <el-date-picker
                      v-model="searchForm.updateTimeRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      size="medium"
                      style="width: 100%"
                      format="yyyy-MM-dd"
                      value-format="yyyy-MM-dd" />
                  </el-form-item>
                </el-col>

                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="单位" class="search-item">
                    <el-select v-model="searchForm.unit" placeholder="请选择单位" clearable size="medium" style="width: 100%" filterable>
                      <el-option v-for="unit in unitOptions" :key="unit" :label="unit" :value="unit" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-collapse-transition>

          <!-- 搜索条件标签 -->
          <div v-if="activeFilters.length > 0" class="filter-tags">
            <span class="filter-label">当前筛选条件：</span>
            <el-tag
              v-for="filter in activeFilters"
              :key="filter.key"
              :type="filter.type"
              size="small"
              closable
              @close="removeFilter(filter.key)"
              class="filter-tag">
              {{ filter.label }}：{{ filter.value }}
            </el-tag>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stats-card stats-total">
          <div class="stats-card-inner">
            <div class="stats-left">
              <div class="stats-icon-wrapper total">
                <i class="el-icon-goods"></i>
              </div>
            </div>
            <div class="stats-right">
              <div class="stats-number">{{ stats.totalItems || 0 }}</div>
              <div class="stats-label">总物料数</div>
              <div class="stats-trend">
                <i class="el-icon-trend-charts"></i>
                <span>较昨日 +5%</span>
              </div>
            </div>
          </div>
          <div class="stats-progress">
            <div class="progress-bar total-progress"></div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stats-card stats-normal">
          <div class="stats-card-inner">
            <div class="stats-left">
              <div class="stats-icon-wrapper normal">
                <i class="el-icon-success"></i>
              </div>
            </div>
            <div class="stats-right">
              <div class="stats-number">{{ stats.normalStock || 0 }}</div>
              <div class="stats-label">正常库存</div>
              <div class="stats-trend">
                <i class="el-icon-caret-top"></i>
                <span>库存充足</span>
              </div>
            </div>
          </div>
          <div class="stats-progress">
            <div class="progress-bar normal-progress"></div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stats-card stats-warning">
          <div class="stats-card-inner">
            <div class="stats-left">
              <div class="stats-icon-wrapper warning">
                <i class="el-icon-warning"></i>
              </div>
            </div>
            <div class="stats-right">
              <div class="stats-number">{{ stats.shortageStock || 0 }}</div>
              <div class="stats-label">缺货预警</div>
              <div class="stats-trend">
                <i class="el-icon-warning-outline"></i>
                <span>需要补货</span>
              </div>
            </div>
          </div>
          <div class="stats-progress">
            <div class="progress-bar warning-progress"></div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <div class="stats-card stats-danger">
          <div class="stats-card-inner">
            <div class="stats-left">
              <div class="stats-icon-wrapper danger">
                <i class="el-icon-error"></i>
              </div>
            </div>
            <div class="stats-right">
              <div class="stats-number">{{ stats.overstockItems || 0 }}</div>
              <div class="stats-label">超储物料</div>
              <div class="stats-trend">
                <i class="el-icon-caret-bottom"></i>
                <span>库存过多</span>
              </div>
            </div>
          </div>
          <div class="stats-progress">
            <div class="progress-bar danger-progress"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 库存表格 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" :row-class-name="getRowClassName">
        <el-table-column prop="materialCode" label="物料编码" width="120" fixed="left">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewDetail(scope.row)">{{ scope.row.materialCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="200" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格型号" width="150" show-overflow-tooltip />
        <!-- 新增版本列 -->
        <el-table-column prop="version" label="版本" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.version" size="small" type="info">{{ scope.row.version }}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="warehouse" label="仓库" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getWarehouseType(scope.row.warehouse)">{{ getWarehouseName(scope.row.warehouse) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentStock" label="当前库存" width="120" align="right">
          <template slot-scope="scope">
            <span :class="getStockClass(scope.row)">{{ scope.row.currentStock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="safetyStock" label="安全库存" width="120" align="right" />
        <el-table-column prop="maxStock" label="最大库存" width="120" align="right" />
        <el-table-column label="库存状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdateTime" label="最后更新" width="160" align="center" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button size="mini" @click="adjustStock(scope.row)">库存调整</el-button>
            <el-button size="mini" type="success" @click="viewHistory(scope.row)">出入库记录</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        style="margin-top: 20px; text-align: center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>

    <!-- 导入库存对话框 -->
    <el-dialog title="导入库存数据" :visible.sync="importDialogVisible" width="900px" :before-close="resetImport">
      <div class="import-container">
        <!-- 操作步骤提示 -->
        <el-steps :active="importStep" align-center class="import-steps">
          <el-step title="上传文件" description="选择Excel文件" />
          <el-step title="数据预览" description="检查导入数据" />
          <el-step title="导入结果" description="查看导入结果" />
        </el-steps>

        <!-- 步骤1: 文件上传 -->
        <div v-if="importStep === 0" class="upload-section">
          <el-upload
            ref="upload"
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            accept=".xlsx,.xls"
            :limit="1">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将Excel文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="el-upload__tip" slot="tip">
              <p>只能上传xlsx/xls文件，文件大小不超过10MB</p>
              <p>请确保Excel文件包含以下列：物料编码、物料名称、规格型号、版本、单位、仓库、当前库存、安全库存、最大库存</p>
            </div>
          </el-upload>

          <div class="upload-actions">
            <el-button type="info" @click="downloadTemplate">下载导入模板</el-button>
            <el-button type="primary" @click="parseFile" :disabled="fileList.length === 0" :loading="parsing">解析文件</el-button>
          </div>
        </div>

        <!-- 步骤2: 数据预览 -->
        <div v-if="importStep === 1" class="preview-section">
          <div class="preview-header">
            <h4>数据预览 (共{{ previewData.length }}条记录)</h4>
            <div class="preview-stats">
              <el-tag type="success">有效: {{ validCount }}</el-tag>
              <el-tag type="danger">无效: {{ invalidCount }}</el-tag>
            </div>
          </div>

          <el-table :data="previewData.slice(0, 20)" border size="small" max-height="400" class="preview-table">
            <el-table-column type="index" label="行号" width="60" />
            <el-table-column prop="materialCode" label="物料编码" width="120" />
            <el-table-column prop="materialName" label="物料名称" width="150" />
            <el-table-column prop="specification" label="规格型号" width="120" />
            <!-- 新增版本列 -->
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="warehouse" label="仓库" width="100" />
            <el-table-column prop="currentStock" label="当前库存" width="100" />
            <el-table-column prop="safetyStock" label="安全库存" width="100" />
            <el-table-column prop="maxStock" label="最大库存" width="100" />
            <el-table-column label="状态" width="80" fixed="right">
              <template slot-scope="scope">
                <el-tag :type="scope.row.isValid ? 'success' : 'danger'" size="mini">
                  {{ scope.row.isValid ? '有效' : '无效' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="previewData.length > 20" class="preview-more">还有 {{ previewData.length - 20 }} 条数据未显示...</div>

          <!-- 错误数据列表 -->
          <div v-if="invalidItems.length > 0" class="error-section">
            <h4>数据错误详情：</h4>
            <el-table :data="invalidItems.slice(0, 10)" border size="small" max-height="200">
              <el-table-column prop="rowIndex" label="行号" width="80" />
              <el-table-column prop="materialCode" label="物料编码" width="120" />
              <el-table-column prop="errors" label="错误信息" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span class="error-text">{{ scope.row.errors.join(', ') }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="preview-actions">
            <el-button @click="importStep = 0">上一步</el-button>
            <el-button type="primary" @click="confirmImport" :disabled="validCount === 0" :loading="importing">
              确认导入 ({{ validCount }}条)
            </el-button>
          </div>
        </div>

        <!-- 步骤3: 导入结果 -->
        <div v-if="importStep === 2" class="result-section">
          <el-result :icon="importResult.success ? 'success' : 'error'" :title="importResult.title" :subTitle="importResult.description">
            <template slot="extra">
              <div class="result-details">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="总记录数">{{ importResult.totalCount }}</el-descriptions-item>
                  <el-descriptions-item label="成功导入">
                    <span class="success-text">{{ importResult.successCount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="失败记录">
                    <span class="error-text">{{ importResult.failCount }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="导入时间">{{ importResult.importTime }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <!-- 失败记录详情 -->
              <div v-if="importResult.errors && importResult.errors.length > 0" class="error-details">
                <h4>失败记录详情：</h4>
                <el-table :data="importResult.errors" border size="small" max-height="200">
                  <el-table-column prop="row" label="行号" width="80" />
                  <el-table-column prop="materialCode" label="物料编码" width="120" />
                  <el-table-column prop="message" label="失败原因" show-overflow-tooltip />
                </el-table>
              </div>

              <div class="result-actions">
                <el-button type="primary" @click="finishImport">完成</el-button>
                <el-button @click="restartImport">重新导入</el-button>
              </div>
            </template>
          </el-result>
        </div>
      </div>
    </el-dialog>

    <!-- 库存调整对话框 -->
    <el-dialog title="库存调整" :visible.sync="adjustDialogVisible" width="500px">
      <el-form ref="adjustForm" :model="adjustForm" :rules="adjustRules" label-width="100px">
        <el-form-item label="物料编码">
          <el-input v-model="adjustForm.materialCode" disabled />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="adjustForm.materialName" disabled />
        </el-form-item>
        <!-- 新增版本显示 -->
        <el-form-item label="版本">
          <el-input v-model="adjustForm.version" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="adjustForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="调整类型" prop="adjustType">
          <el-radio-group v-model="adjustForm.adjustType">
            <el-radio label="in">入库</el-radio>
            <el-radio label="out">出库</el-radio>
            <el-radio label="set">设定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="adjustQuantity">
          <el-input-number v-model="adjustForm.adjustQuantity" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdjust">确定</el-button>
      </div>
    </el-dialog>

    <!-- 出入库记录对话框 - 不变 -->
    <!-- 出入库记录对话框 -->
    <el-dialog
      :title="`${currentHistoryMaterial ? currentHistoryMaterial.materialName : ''} - 出入库记录`"
      :visible.sync="historyDialogVisible"
      width="1200px">
      <div v-if="currentHistoryMaterial" class="history-container">
        <!-- 物料基本信息 -->
        <el-card class="material-info" shadow="never">
          <div class="info-content">
            <div class="info-item">
              <label>物料编码：</label>
              <span>{{ currentHistoryMaterial.materialCode }}</span>
            </div>
            <div class="info-item">
              <label>物料名称：</label>
              <span>{{ currentHistoryMaterial.materialName }}</span>
            </div>
            <div class="info-item">
              <label>规格型号：</label>
              <span>{{ currentHistoryMaterial.specification || '--' }}</span>
            </div>
            <div class="info-item">
              <label>版本：</label>
              <span>{{ currentHistoryMaterial.version || '--' }}</span>
            </div>
            <div class="info-item">
              <label>仓库：</label>
              <span>{{ currentHistoryMaterial.warehouse }}</span>
            </div>
            <div class="info-item">
              <label>当前库存：</label>
              <span class="stock-value">{{ currentHistoryMaterial.currentStock }} {{ currentHistoryMaterial.unit }}</span>
            </div>
          </div>
        </el-card>

        <!-- 筛选条件 -->
        <el-card class="filter-card" shadow="never">
          <el-form :inline="true" :model="historyFilter" class="filter-form">
            <el-form-item label="交易类型">
              <el-select v-model="historyFilter.transactionType" placeholder="全部" clearable>
                <el-option label="入库" value="in" />
                <el-option label="出库" value="out" />
                <el-option label="调整" value="adjust" />
              </el-select>
            </el-form-item>
            <el-form-item label="业务类型">
              <el-select v-model="historyFilter.businessType" placeholder="全部" clearable>
                <el-option label="采购入库" value="purchase" />
                <el-option label="生产入库" value="production" />
                <el-option label="销售出库" value="sale" />
                <el-option label="生产出库" value="production" />
                <el-option label="调拨" value="transfer" />
                <el-option label="退货" value="return" />
                <el-option label="库存调整" value="adjust" />
                <el-option label="报废" value="scrap" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="filterHistory">查询</el-button>
              <el-button @click="resetHistoryFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 出入库记录表格 -->
        <el-card class="table-card" shadow="never">
          <el-table v-loading="historyLoading" :data="historyData" border stripe style="width: 100%" empty-text="暂无出入库记录">
            <el-table-column prop="createTime" label="交易时间" width="160" align="center">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>

            <el-table-column prop="transactionType" label="交易类型" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getTransactionTypeColor(scope.row.transactionType)" size="small">
                  {{ getTransactionTypeName(scope.row.transactionType) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="businessType" label="业务类型" width="120" align="center">
              <template slot-scope="scope">
                <el-tag :type="getBusinessTypeColor(scope.row.businessType)" size="small">
                  {{ getBusinessTypeName(scope.row.businessType) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="quantity" label="变动数量" width="120" align="right">
              <template slot-scope="scope">
                <span :class="scope.row.quantity > 0 ? 'text-success' : 'text-danger'">
                  {{ scope.row.quantity > 0 ? '+' : '' }}{{ scope.row.quantity }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="stockBefore" label="变动前库存" width="120" align="right">
              <template slot-scope="scope">
                {{ scope.row.stockBefore }}
              </template>
            </el-table-column>

            <el-table-column prop="stockAfter" label="变动后库存" width="120" align="right">
              <template slot-scope="scope">
                {{ scope.row.stockAfter }}
              </template>
            </el-table-column>

            <el-table-column prop="reason" label="变动原因" min-width="200" show-overflow-tooltip />

            <el-table-column prop="operator" label="操作人" width="100" align="center" />

            <el-table-column prop="referenceNo" label="关联单据" width="150" align="center">
              <template slot-scope="scope">
                <el-link v-if="scope.row.referenceNo" type="primary" @click="viewReference(scope.row)">
                  {{ scope.row.referenceNo }}
                </el-link>
                <span v-else>--</span>
              </template>
            </el-table-column>

            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          </el-table>

          <!-- 分页 -->
          <el-pagination
            :current-page="historyPagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="historyPagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="historyPagination.total"
            style="margin-top: 20px; text-align: center"
            @size-change="
              (val) => {
                historyPagination.pageSize = val
                historyPagination.currentPage = 1
                loadHistoryData()
              }
            "
            @current-change="handleHistoryPageChange" />
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchInventoryList,
  fetchInventoryStatistics,
  adjustInventory,
  fetchInventoryHistory,
  importInventory,
  exportInventory
} from '@/api/inventory'
import * as XLSX from 'xlsx'

export default {
  name: 'InventoryRealTime',
  data() {
    return {
      // 导入相关
      importDialogVisible: false,
      importStep: 0, // 0: 上传, 1: 预览, 2: 结果
      fileList: [],
      parsing: false,
      importing: false,
      previewData: [],
      importResult: null,

      // 搜索相关
      showAdvanced: false, // 是否显示高级搜索
      searchForm: {
        materialCode: '',
        materialName: '',
        specification: '',
        version: '',
        warehouse: '',
        stockStatus: '',
        // 高级搜索字段
        minStock: null,
        maxStock: null,
        updateTimeRange: null,
        unit: ''
      },

      // 选项数据
      warehouseOptions: [
        { label: '原料仓', value: '原料仓', icon: 'el-icon-box' },
        { label: '成品仓', value: '成品仓', icon: 'el-icon-goods' },
        { label: '半成品仓', value: '半成品仓', icon: 'el-icon-cpu' },
        { label: '耗材仓', value: '耗材仓', icon: 'el-icon-paperclip' }
      ],

      statusOptions: [
        { label: '正常', value: 'normal', type: 'success' },
        { label: '缺货', value: 'shortage', type: 'danger' },
        { label: '超储', value: 'overstock', type: 'warning' }
      ],

      unitOptions: ['个', '件', '台', '套', '米', '公斤', '升', '包', '盒', '张'],

      // 统计信息
      validCount: 0,
      invalidCount: 0,
      invalidItems: [],

      loading: false,
      searchForm: {
        materialCode: '',
        materialName: '',
        specification: '', // 新增规格型号搜索字段
        version: '', // 新增版本搜索字段
        warehouse: '',
        stockStatus: ''
      },
      stats: {
        totalItems: 0,
        normalStock: 0,
        shortageStock: 0,
        overstockItems: 0
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      adjustDialogVisible: false,
      adjustForm: {
        materialCode: '',
        materialName: '',
        version: '', // 新增版本字段
        currentStock: 0,
        adjustType: 'in',
        adjustQuantity: 0,
        reason: ''
      },
      adjustRules: {
        adjustType: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
        adjustQuantity: [{ required: true, message: '请输入调整数量', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
      },
      // 出入库记录相关
      historyDialogVisible: false,
      historyData: [],
      historyLoading: false,
      currentHistoryMaterial: null, // 当前查看记录的物料信息
      historyFilter: {
        transactionType: '',
        businessType: ''
      },
      historyPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }
    }
  },

  computed: {
    // 检查是否有搜索条件
    hasSearchConditions() {
      return Object.values(this.searchForm).some((value) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== '' && value !== null && value !== undefined
      })
    },

    // 当前激活的筛选条件
    activeFilters() {
      const filters = []
      const form = this.searchForm

      if (form.materialCode) {
        filters.push({
          key: 'materialCode',
          label: '物料编码',
          value: form.materialCode,
          type: 'primary'
        })
      }

      if (form.materialName) {
        filters.push({
          key: 'materialName',
          label: '物料名称',
          value: form.materialName,
          type: 'primary'
        })
      }

      if (form.specification) {
        filters.push({
          key: 'specification',
          label: '规格型号',
          value: form.specification,
          type: 'primary'
        })
      }

      if (form.version) {
        filters.push({
          key: 'version',
          label: '版本',
          value: form.version,
          type: 'primary'
        })
      }

      if (form.warehouse) {
        const warehouse = this.warehouseOptions.find((w) => w.value === form.warehouse)
        filters.push({
          key: 'warehouse',
          label: '仓库',
          value: warehouse ? warehouse.label : form.warehouse,
          type: 'success'
        })
      }

      if (form.stockStatus) {
        const status = this.statusOptions.find((s) => s.value === form.stockStatus)
        filters.push({
          key: 'stockStatus',
          label: '库存状态',
          value: status ? status.label : form.stockStatus,
          type: status ? status.type : 'info'
        })
      }

      return filters
    }
  },
  mounted() {
    this.loadData()
    this.loadStatistics()
  },
  methods: {
    // 切换高级搜索
    toggleAdvancedSearch() {
      this.showAdvanced = !this.showAdvanced
    },

    // 加载库存数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.pageSize,
          ...this.searchForm
        }

        const response = await fetchInventoryList(params)
        this.tableData = response.data.data
        this.pagination.total = response.data.total
        this.pagination.currentPage = response.data.currentPage
        this.pagination.pageSize = response.data.pageSize
      } catch (error) {
        console.error('加载库存数据失败:', error)
        this.$message.error('获取库存数据失败')
      } finally {
        this.loading = false
      }
    },

    // 加载统计数据 - 修复错误处理
    async loadStatistics() {
      try {
        console.log('开始加载统计数据...')
        const response = await fetchInventoryStatistics()

        console.log('统计数据响应:', response)

        if (response.code === 200) {
          this.stats = {
            totalItems: response.data.totalItems || 0,
            normalStock: response.data.normalStock || 0,
            shortageStock: response.data.shortageStock || 0,
            overstockItems: response.data.overstockItems || 0
          }
          console.log('统计数据更新成功:', this.stats)
        } else {
          console.warn('获取统计数据失败:', response.message)
          // 使用默认值
          this.stats = {
            totalItems: 0,
            normalStock: 0,
            shortageStock: 0,
            overstockItems: 0
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 使用默认值，不显示错误消息
        this.stats = {
          totalItems: 0,
          normalStock: 0,
          shortageStock: 0,
          overstockItems: 0
        }
      }
    },

    // 刷新数据 - 确保统计数据也被刷新
    refreshData() {
      Promise.all([this.loadData(), this.loadStatistics()])
        .then(() => {
          this.$message.success('数据已刷新')
        })
        .catch((error) => {
          console.error('刷新数据失败:', error)
          this.$message.error('刷新数据失败')
        })
    },

    // 在导入成功后刷新统计数据
    async confirmImport() {
      const validItems = this.previewData.filter((item) => item.isValid)

      if (validItems.length === 0) {
        this.$message.warning('没有有效的数据可以导入')
        return
      }

      this.importing = true
      try {
        const response = await importInventory(validItems)

        this.importResult = {
          success: response.code === 200,
          title: response.code === 200 ? '导入成功' : '导入失败',
          description: response.message,
          totalCount: validItems.length,
          successCount: response.data?.successCount || 0,
          failCount: response.data?.failCount || 0,
          errors: response.data?.errors || [],
          importTime: new Date().toLocaleString()
        }

        this.importStep = 2

        // 刷新页面数据和统计数据
        if (response.code === 200) {
          await Promise.all([this.loadData(), this.loadStatistics()])
        }
      } catch (error) {
        console.error('导入失败:', error)
        this.importResult = {
          success: false,
          title: '导入失败',
          description: error.message || '导入过程中发生错误',
          totalCount: validItems.length,
          successCount: 0,
          failCount: validItems.length,
          errors: [],
          importTime: new Date().toLocaleString()
        }
        this.importStep = 2
      } finally {
        this.importing = false
      }
    },

    // 在库存调整成功后刷新统计数据
    async submitAdjust() {
      this.$refs.adjustForm.validate(async (valid) => {
        if (valid) {
          try {
            const adjustData = {
              materialId: this.adjustForm.materialId,
              adjustType: this.adjustForm.adjustType,
              adjustQuantity: this.adjustForm.adjustQuantity,
              reason: this.adjustForm.reason,
              operator: '当前用户', // 应该从用户状态中获取
              operatorId: 'user_id' // 应该从用户状态中获取
            }

            await adjustInventory(adjustData)
            this.$message.success('库存调整成功')
            this.adjustDialogVisible = false

            // 刷新数据和统计
            await Promise.all([this.loadData(), this.loadStatistics()])
          } catch (error) {
            console.error('库存调整失败:', error)
            this.$message.error('库存调整失败: ' + (error.message || '未知错误'))
          }
        }
      })
    },

    // ...existing methods...

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 重置搜索 - 更新版本
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.searchForm = {
        materialCode: '',
        materialName: '',
        specification: '',
        version: '',
        warehouse: '',
        stockStatus: '',
        minStock: null,
        maxStock: null,
        updateTimeRange: null,
        unit: ''
      }
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 刷新数据
    refreshData() {
      this.loadData()
      this.loadStatistics()
      this.$message.success('数据已刷新')
    },

    // 处理导出命令
    handleExportCommand(command) {
      switch (command) {
        case 'current':
          this.exportData()
          break
        case 'all':
          this.exportAllData()
          break
        case 'template':
          this.downloadTemplate()
          break
        default:
          break
      }
    },

    // 清空所有搜索条件
    clearAllConditions() {
      this.searchForm = {
        materialCode: '',
        materialName: '',
        specification: '',
        version: '',
        warehouse: '',
        stockStatus: '',
        minStock: null,
        maxStock: null,
        updateTimeRange: null,
        unit: ''
      }
      this.pagination.currentPage = 1
      this.loadData()
    },
    // 移除单个筛选条件
    removeFilter(key) {
      this.searchForm[key] = ''
      if (key === 'updateTimeRange') {
        this.searchForm[key] = null
      }
      if (key === 'minStock' || key === 'maxStock') {
        this.searchForm[key] = null
      }
      this.handleSearch()
    },
    // 导出数据 - 完善实现
    async exportData() {
      try {
        this.$message.info('正在导出数据，请稍候...')

        // 使用当前搜索条件导出数据
        const params = {
          materialCode: this.searchForm.materialCode,
          materialName: this.searchForm.materialName,
          version: this.searchForm.version,
          warehouse: this.searchForm.warehouse,
          stockStatus: this.searchForm.stockStatus
        }

        // 调用后端导出API
        const response = await exportInventory(params)

        if (response.code === 200) {
          const exportData = response.data

          if (!exportData || exportData.length === 0) {
            this.$message.warning('没有数据可以导出')
            return
          }

          // 创建Excel工作簿
          const wb = XLSX.utils.book_new()

          // 转换数据格式，确保所有字段都包含
          const formattedData = exportData.map((item, index) => ({
            序号: index + 1,
            物料编码: item['物料编码'] || item.materialCode || '',
            物料名称: item['物料名称'] || item.materialName || '',
            规格型号: item['规格型号'] || item.specification || '',
            版本: item['版本'] || item.version || '',
            单位: item['单位'] || item.unit || '',
            仓库: item['仓库'] || item.warehouse || '',
            当前库存: item['当前库存'] || item.currentStock || 0,
            安全库存: item['安全库存'] || item.safetyStock || 0,
            最大库存: item['最大库存'] || item.maxStock || 0,
            库存状态: item['库存状态'] || this.getStatusText(item.status) || '',
            最后更新时间: item['最后更新时间'] || this.formatDateTime(item.lastUpdateTime) || ''
          }))

          // 创建工作表
          const ws = XLSX.utils.json_to_sheet(formattedData)

          // 设置列宽
          const colWidths = [
            { wch: 8 }, // 序号
            { wch: 15 }, // 物料编码
            { wch: 25 }, // 物料名称
            { wch: 20 }, // 规格型号
            { wch: 12 }, // 版本
            { wch: 8 }, // 单位
            { wch: 12 }, // 仓库
            { wch: 12 }, // 当前库存
            { wch: 12 }, // 安全库存
            { wch: 12 }, // 最大库存
            { wch: 12 }, // 库存状态
            { wch: 20 } // 最后更新时间
          ]
          ws['!cols'] = colWidths

          // 设置表头样式
          const headerRow = 1
          const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1']

          headerCells.forEach((cell) => {
            if (ws[cell]) {
              ws[cell].s = {
                font: { bold: true, sz: 12 },
                fill: { fgColor: { rgb: 'E6F3FF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                  top: { style: 'thin' },
                  bottom: { style: 'thin' },
                  left: { style: 'thin' },
                  right: { style: 'thin' }
                }
              }
            }
          })

          // 添加工作表到工作簿
          XLSX.utils.book_append_sheet(wb, ws, '库存数据')

          // 生成文件名
          const now = new Date()
          const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-')
          let fileName = `库存数据导出_${timestamp}.xlsx`

          // 如果有搜索条件，在文件名中体现
          const searchConditions = []
          if (this.searchForm.materialCode) searchConditions.push(`物料编码_${this.searchForm.materialCode}`)
          if (this.searchForm.materialName) searchConditions.push(`物料名称_${this.searchForm.materialName}`)
          if (this.searchForm.specification) searchConditions.push(`规格型号_${this.searchForm.specification}`) // 包含规格型号
          if (this.searchForm.version) searchConditions.push(`版本_${this.searchForm.version}`)
          if (this.searchForm.warehouse) searchConditions.push(`仓库_${this.searchForm.warehouse}`)
          if (this.searchForm.stockStatus) searchConditions.push(`状态_${this.getStatusText(this.searchForm.stockStatus)}`)

          if (searchConditions.length > 0) {
            const conditionStr = searchConditions.join('_')
            fileName = `库存数据导出_${conditionStr}_${timestamp}.xlsx`
          }

          // 下载文件
          XLSX.writeFile(wb, fileName)

          this.$message.success(`导出成功！共导出 ${formattedData.length} 条数据`)

          // 记录导出日志（可选）
          console.log('库存数据导出完成:', {
            fileName,
            recordCount: formattedData.length,
            exportTime: now.toISOString(),
            searchConditions: this.searchForm
          })
        } else {
          this.$message.error(response.message || '导出失败')
        }
      } catch (error) {
        console.error('导出数据失败:', error)
        this.$message.error('导出失败：' + (error.message || '网络错误'))
      }
    },

    // 批量导出（可选：导出所有数据而不仅仅是当前页）
    async exportAllData() {
      try {
        this.$confirm('是否导出所有库存数据？这可能需要较长时间。', '确认导出', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            this.$message.info('正在导出所有数据，请稍候...')

            // 导出所有数据（不分页）
            const params = {
              materialCode: this.searchForm.materialCode,
              materialName: this.searchForm.materialName,
              specification: this.searchForm.specification, // 包含规格型号搜索条件
              version: this.searchForm.version,
              warehouse: this.searchForm.warehouse,
              stockStatus: this.searchForm.stockStatus,
              exportAll: true // 标识导出所有数据
            }

            const response = await exportInventory(params)

            if (response.code === 200) {
              // 使用相同的导出逻辑
              await this.processExportData(response.data, '全部库存数据导出')
            } else {
              this.$message.error(response.message || '导出失败')
            }
          })
          .catch(() => {
            this.$message.info('已取消导出')
          })
      } catch (error) {
        console.error('批量导出失败:', error)
        this.$message.error('批量导出失败：' + (error.message || '网络错误'))
      }
    },

    // 处理导出数据的通用方法
    async processExportData(exportData, filePrefix = '库存数据导出') {
      if (!exportData || exportData.length === 0) {
        this.$message.warning('没有数据可以导出')
        return
      }

      // 创建Excel工作簿和工作表
      const wb = XLSX.utils.book_new()

      // 格式化数据
      const formattedData = exportData.map((item, index) => ({
        序号: index + 1,
        物料编码: item['物料编码'] || item.materialCode || '',
        物料名称: item['物料名称'] || item.materialName || '',
        规格型号: item['规格型号'] || item.specification || '',
        版本: item['版本'] || item.version || '',
        单位: item['单位'] || item.unit || '',
        仓库: item['仓库'] || item.warehouse || '',
        当前库存: item['当前库存'] || item.currentStock || 0,
        安全库存: item['安全库存'] || item.safetyStock || 0,
        最大库存: item['最大库存'] || item.maxStock || 0,
        库存状态: item['库存状态'] || this.getStatusText(item.status) || '',
        最后更新时间: item['最后更新时间'] || this.formatDateTime(item.lastUpdateTime) || ''
      }))

      const ws = XLSX.utils.json_to_sheet(formattedData)

      // 设置列宽和样式（与之前相同）
      const colWidths = [
        { wch: 8 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 }
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, '库存数据')

      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const fileName = `${filePrefix}_${timestamp}.xlsx`

      // 下载文件
      XLSX.writeFile(wb, fileName)
      this.$message.success(`导出成功！共导出 ${formattedData.length} 条数据`)
    },

    // 格式化日期时间（如果之前没有的话）
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    // ...existing methods...

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadData()
    },

    // 获取行样式
    getRowClassName({ row }) {
      if (row.status === 'shortage') {
        return 'shortage-row'
      } else if (row.status === 'overstock') {
        return 'overstock-row'
      }
      return ''
    },

    // 获取库存数量样式
    getStockClass(row) {
      if (row.status === 'shortage') {
        return 'text-danger'
      } else if (row.status === 'overstock') {
        return 'text-warning'
      }
      return 'text-success'
    },

    // 获取仓库标签类型
    getWarehouseType(warehouse) {
      const typeMap = {
        raw: '',
        finished: 'success',
        semi: 'warning'
      }
      return typeMap[warehouse] || ''
    },

    // 获取仓库名称
    getWarehouseName(warehouse) {
      const nameMap = {
        raw: '原料仓',
        finished: '成品仓',
        semi: '半成品仓'
      }
      return nameMap[warehouse] || warehouse
    },

    // 获取状态标签类型
    getStatusType(status) {
      const typeMap = {
        normal: 'success',
        shortage: 'danger',
        overstock: 'warning'
      }
      return typeMap[status] || ''
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        normal: '正常',
        shortage: '缺货',
        overstock: '超储'
      }
      return textMap[status] || status
    },

    // 查看详情
    viewDetail(row) {
      this.$message.info(`查看物料 ${row.materialCode} 的详细信息`)
    },

    // 库存调整
    adjustStock(row) {
      this.adjustForm = {
        materialCode: row.materialCode,
        materialName: row.materialName,
        version: row.version || '', // 包含版本信息
        currentStock: row.currentStock,
        adjustType: 'in',
        adjustQuantity: 0,
        reason: '',
        materialId: row.id || row._id
      }
      this.adjustDialogVisible = true
    },

    // 提交库存调整
    async submitAdjust() {
      this.$refs.adjustForm.validate(async (valid) => {
        if (valid) {
          try {
            const adjustData = {
              materialId: this.adjustForm.materialId,
              adjustType: this.adjustForm.adjustType,
              adjustQuantity: this.adjustForm.adjustQuantity,
              reason: this.adjustForm.reason,
              operator: '当前用户', // 应该从用户状态中获取
              operatorId: 'user_id' // 应该从用户状态中获取
            }

            await adjustInventory(adjustData)
            this.$message.success('库存调整成功')
            this.adjustDialogVisible = false
            this.loadData()
            this.loadStatistics()
          } catch (error) {
            console.error('库存调整失败:', error)
            this.$message.error('库存调整失败')
          }
        }
      })
    },

    // 查看出入库记录
    async viewHistory(row) {
      this.currentHistoryMaterial = row
      this.historyDialogVisible = true
      this.historyPagination.currentPage = 1
      this.resetHistoryFilter()
      await this.loadHistoryData()
    },

    // 加载出入库记录数据
    async loadHistoryData() {
      if (!this.currentHistoryMaterial) return

      this.historyLoading = true
      try {
        const params = {
          materialCode: this.currentHistoryMaterial.materialCode,
          warehouse: this.currentHistoryMaterial.warehouse,
          page: this.historyPagination.currentPage,
          limit: this.historyPagination.pageSize,
          ...this.historyFilter
        }

        const response = await fetchInventoryHistory(params)

        if (response.code === 200) {
          this.historyData = response.data.data || []
          this.historyPagination.total = response.data.total || 0
          this.historyPagination.currentPage = response.data.currentPage || 1
          this.historyPagination.pageSize = response.data.pageSize || 20
        } else {
          this.$message.error(response.message || '获取出入库记录失败')
          this.historyData = []
        }
      } catch (error) {
        console.error('获取出入库记录失败:', error)
        this.$message.error('获取出入库记录失败')
        this.historyData = []
      } finally {
        this.historyLoading = false
      }
    },

    // 筛选历史记录
    filterHistory() {
      this.historyPagination.currentPage = 1
      this.loadHistoryData()
    },

    // 重置历史记录筛选
    resetHistoryFilter() {
      this.historyFilter = {
        transactionType: '',
        businessType: ''
      }
      this.historyPagination.currentPage = 1
      this.loadHistoryData()
    },

    // 历史记录分页改变
    handleHistoryPageChange(page) {
      this.historyPagination.currentPage = page
      this.loadHistoryData()
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    // 获取交易类型名称
    getTransactionTypeName(type) {
      const nameMap = {
        in: '入库',
        out: '出库',
        adjust: '调整'
      }
      return nameMap[type] || type
    },

    // 获取交易类型颜色
    getTransactionTypeColor(type) {
      const colorMap = {
        in: 'success',
        out: 'warning',
        adjust: 'info'
      }
      return colorMap[type] || ''
    },

    // 获取业务类型名称
    getBusinessTypeName(type) {
      const nameMap = {
        purchase: '采购',
        production: '生产',
        sale: '销售',
        transfer: '调拨',
        return: '退货',
        adjust: '调整',
        scrap: '报废'
      }
      return nameMap[type] || type
    },

    // 获取业务类型颜色
    getBusinessTypeColor(type) {
      const colorMap = {
        purchase: 'success',
        production: 'primary',
        sale: 'warning',
        transfer: 'info',
        return: 'danger',
        adjust: '',
        scrap: 'danger'
      }
      return colorMap[type] || ''
    },

    // 查看关联单据
    viewReference(row) {
      if (!row.referenceNo) return

      // 根据业务类型跳转到对应页面
      const businessTypeRouteMap = {
        purchase: '/warehouse/inbound',
        production: '/warehouse/inbound',
        sale: '/warehouse/outbound',
        transfer: '/warehouse/transfer',
        return: '/warehouse/return'
      }

      const route = businessTypeRouteMap[row.businessType]
      if (route) {
        // 这里可以实现跳转到对应单据详情页
        this.$message.info(`查看关联单据：${row.referenceNo}`)
        // this.$router.push(`${route}?no=${row.referenceNo}`)
      } else {
        this.$message.info(`关联单据：${row.referenceNo}`)
      }
    },

    // 显示导入对话框
    showImportDialog() {
      this.importDialogVisible = true
      this.resetImport()
    },

    // 重置导入状态
    resetImport() {
      this.importStep = 0
      this.fileList = []
      this.previewData = []
      this.importResult = null
      this.parsing = false
      this.importing = false
      this.validCount = 0
      this.invalidCount = 0
      this.invalidItems = []
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },

    // 下载导入模板
    downloadTemplate() {
      // 创建模板数据
      const templateData = [
        {
          物料编码: 'M001',
          物料名称: '电阻器10K',
          规格型号: '0603',
          版本: 'V1.0', // 新增版本字段
          单位: '个',
          仓库: '原料仓',
          当前库存: 100,
          安全库存: 10,
          最大库存: 1000,
          备注: '示例数据'
        },
        {
          物料编码: 'M002',
          物料名称: '电容器100uF',
          规格型号: '贴片',
          版本: 'V2.1', // 新增版本字段
          单位: '个',
          仓库: '原料仓',
          当前库存: 50,
          安全库存: 5,
          最大库存: 500,
          备注: '示例数据'
        },
        {
          物料编码: 'M003',
          物料名称: 'PCB板',
          规格型号: '双层板',
          版本: 'V1.5', // 新增版本字段
          单位: '片',
          仓库: '半成品仓',
          当前库存: 20,
          安全库存: 2,
          最大库存: 200,
          备注: '示例数据'
        }
      ]

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(templateData)

      // 设置列宽 - 包含版本列
      const colWidths = [
        { wch: 15 }, // 物料编码
        { wch: 20 }, // 物料名称
        { wch: 15 }, // 规格型号
        { wch: 10 }, // 版本
        { wch: 8 }, // 单位
        { wch: 12 }, // 仓库
        { wch: 12 }, // 当前库存
        { wch: 12 }, // 安全库存
        { wch: 12 }, // 最大库存
        { wch: 20 } // 备注
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, '库存导入模板')

      // 下载文件
      const fileName = `库存导入模板_${new Date().getTime()}.xlsx`
      XLSX.writeFile(wb, fileName)
      this.$message.success('模板下载成功')
    },

    // 文件选择改变
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },

    // 文件移除
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      this.previewData = []
    },

    // 解析文件
    parseFile() {
      if (this.fileList.length === 0) {
        this.$message.warning('请先选择要导入的文件')
        return
      }

      const file = this.fileList[0].raw

      // 检查文件类型和大小
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传 Excel 文件!')
        return
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        return
      }

      this.parsing = true

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          this.processImportData(jsonData)
        } catch (error) {
          console.error('解析Excel文件失败:', error)
          this.$message.error('解析Excel文件失败，请检查文件格式')
        } finally {
          this.parsing = false
        }
      }
      reader.readAsArrayBuffer(file)
    },

    // 处理导入数据 - 更新包含版本字段
    processImportData(jsonData) {
      if (!jsonData || jsonData.length === 0) {
        this.$message.warning('Excel文件中没有数据')
        return
      }

      this.previewData = jsonData.map((row, index) => {
        const item = {
          materialCode: this.getFieldValue(row, ['物料编码', 'materialCode']),
          materialName: this.getFieldValue(row, ['物料名称', 'materialName']),
          specification: this.getFieldValue(row, ['规格型号', 'specification']) || '',
          version: this.getFieldValue(row, ['版本', 'version']) || '', // 新增版本字段处理
          unit: this.getFieldValue(row, ['单位', 'unit']),
          warehouse: this.getFieldValue(row, ['仓库', 'warehouse']),
          currentStock: Number(this.getFieldValue(row, ['当前库存', 'currentStock'])) || 0,
          safetyStock: Number(this.getFieldValue(row, ['安全库存', 'safetyStock'])) || 0,
          maxStock: Number(this.getFieldValue(row, ['最大库存', 'maxStock'])) || 0,
          remark: this.getFieldValue(row, ['备注', 'remark']) || '',
          rowIndex: index + 2, // Excel行号从2开始（第1行是表头）
          errors: []
        }

        // 数据验证
        this.validateImportItem(item)
        return item
      })

      // 统计有效和无效数据
      this.validCount = this.previewData.filter((item) => item.isValid).length
      this.invalidCount = this.previewData.filter((item) => !item.isValid).length
      this.invalidItems = this.previewData.filter((item) => !item.isValid)

      if (this.previewData.length > 0) {
        this.importStep = 1
        this.$message.success(`成功解析 ${this.previewData.length} 条数据`)
      }
    },

    // 获取字段值（支持多种字段名）
    getFieldValue(row, fieldNames) {
      for (const fieldName of fieldNames) {
        if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
          return row[fieldName]
        }
      }
      return ''
    },

    // 验证导入数据项
    validateImportItem(item) {
      item.errors = []

      // 必填字段验证
      if (!item.materialCode) {
        item.errors.push('物料编码不能为空')
      }
      if (!item.materialName) {
        item.errors.push('物料名称不能为空')
      }
      if (!item.unit) {
        item.errors.push('单位不能为空')
      }
      if (!item.warehouse) {
        item.errors.push('仓库不能为空')
      }

      // 数值验证
      if (item.currentStock < 0) {
        item.errors.push('当前库存不能为负数')
      }
      if (item.safetyStock < 0) {
        item.errors.push('安全库存不能为负数')
      }
      if (item.maxStock < 0) {
        item.errors.push('最大库存不能为负数')
      }
      if (item.maxStock > 0 && item.safetyStock > item.maxStock) {
        item.errors.push('安全库存不能大于最大库存')
      }

      // 仓库值验证
      const validWarehouses = ['原料仓', '成品仓', '半成品仓', '耗材仓']
      if (item.warehouse && !validWarehouses.includes(item.warehouse)) {
        item.errors.push('仓库值无效，请选择：' + validWarehouses.join('、'))
      }

      item.isValid = item.errors.length === 0
    },

    // 确认导入
    async confirmImport() {
      const validItems = this.previewData.filter((item) => item.isValid)

      if (validItems.length === 0) {
        this.$message.warning('没有有效的数据可以导入')
        return
      }

      this.importing = true
      try {
        const response = await importInventory(validItems)

        this.importResult = {
          success: response.code === 200,
          title: response.code === 200 ? '导入成功' : '导入失败',
          description: response.message,
          totalCount: validItems.length,
          successCount: response.data?.successCount || 0,
          failCount: response.data?.failCount || 0,
          errors: response.data?.errors || [],
          importTime: new Date().toLocaleString()
        }

        this.importStep = 2

        // 刷新页面数据
        if (response.code === 200) {
          this.loadData()
          this.loadStatistics()
        }
      } catch (error) {
        console.error('导入失败:', error)
        this.importResult = {
          success: false,
          title: '导入失败',
          description: error.message || '导入过程中发生错误',
          totalCount: validItems.length,
          successCount: 0,
          failCount: validItems.length,
          errors: [],
          importTime: new Date().toLocaleString()
        }
        this.importStep = 2
      } finally {
        this.importing = false
      }
    },

    // 完成导入
    finishImport() {
      this.importDialogVisible = false
      this.resetImport()
    },

    // 重新导入
    restartImport() {
      this.resetImport()
    }
  }
}
</script>

<style lang="scss" scoped>
.inventory-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;

      .header-icon {
        font-size: 18px;
        color: #409eff;
        margin-right: 8px;
      }

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }
}

.search-form-wrapper {
  .advanced-search-form {
    .search-row {
      margin-bottom: 20px;

      .search-item {
        margin-bottom: 0;

        ::v-deep .el-form-item__label {
          font-weight: 500;
          color: #606266;
          font-size: 13px;
          line-height: 20px;
          padding-bottom: 8px;
        }

        ::v-deep .el-input__inner,
        ::v-deep .el-select .el-input__inner {
          border-radius: 8px;
          border: 1px solid #dcdfe6;
          transition: all 0.3s;

          &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
          }

          &:hover {
            border-color: #c0c4cc;
          }
        }

        ::v-deep .el-input__prefix {
          color: #c0c4cc;
        }
      }
    }

    .search-actions {
      .action-buttons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0 10px;
        border-top: 1px solid #f0f0f0;

        .left-actions {
          display: flex;
          align-items: center;
          gap: 12px;

          .clear-all-btn {
            color: #f56c6c;

            &:hover {
              color: #f78989;
            }
          }
        }

        .right-actions {
          display: flex;
          align-items: center;
          gap: 12px;

          .advanced-toggle {
            color: #909399;

            &:hover {
              color: #409eff;
            }
          }
        }
      }
    }

    .advanced-search-panel {
      background: #fafbfc;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;

      .divider-text {
        font-size: 14px;
        color: #606266;
        font-weight: 500;

        i {
          margin-right: 4px;
          color: #909399;
        }
      }
    }

    .filter-tags {
      margin-top: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #409eff;

      .filter-label {
        font-size: 13px;
        color: #606266;
        font-weight: 500;
        margin-right: 8px;
      }

      .filter-tag {
        margin: 2px 4px;
        border-radius: 4px;

        &.el-tag--primary {
          background-color: #ecf5ff;
          border-color: #d9ecff;
          color: #409eff;
        }

        &.el-tag--success {
          background-color: #f0f9ff;
          border-color: #c6f7ff;
          color: #13ce66;
        }

        &.el-tag--warning {
          background-color: #fdf6ec;
          border-color: #faecd8;
          color: #e6a23c;
        }
      }
    }
  }
}

// 下拉选项样式
.warehouse-option,
.status-option {
  display: flex;
  align-items: center;

  i {
    margin-right: 6px;
    font-size: 14px;
  }
}

.export-dropdown {
  ::v-deep .el-dropdown-menu__item {
    padding: 8px 16px;

    i {
      margin-right: 6px;
      color: #909399;
    }

    &:hover i {
      color: #409eff;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .search-form-wrapper {
    .advanced-search-form {
      .search-actions {
        .action-buttons {
          flex-direction: column;
          gap: 16px;

          .left-actions,
          .right-actions {
            width: 100%;
            justify-content: center;
          }
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .search-header {
    flex-direction: column;
    gap: 12px;

    .header-right {
      width: 100%;
      justify-content: center;
    }
  }
}

// 动画效果
.el-collapse-transition {
  transition: all 0.3s ease-in-out;
}

// 加载状态
.search-loading {
  ::v-deep .el-button {
    position: relative;

    &.is-loading {
      pointer-events: none;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.35);
        border-radius: inherit;
      }
    }
  }
}

// 焦点状态优化
.search-item {
  ::v-deep .el-input:focus-within,
  ::v-deep .el-select:focus-within {
    .el-input__inner {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }
}

.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}
.stats-row {
  margin-bottom: 24px;

  .el-col {
    margin-bottom: 16px;

    @media (min-width: 768px) {
      margin-bottom: 0;
    }
  }
}

.stats-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  &.stats-total::before {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  &.stats-normal::before {
    background: linear-gradient(90deg, #56ab2f 0%, #a8e6cf 100%);
  }

  &.stats-warning::before {
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  }

  &.stats-danger::before {
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  }

  .stats-card-inner {
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .stats-left {
      .stats-icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        i {
          font-size: 28px;
          z-index: 2;
          position: relative;
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          opacity: 0.1;
          z-index: 1;
        }

        &.total {
          color: #667eea;
          &::before {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        }

        &.normal {
          color: #56ab2f;
          &::before {
            background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
          }
        }

        &.warning {
          color: #f093fb;
          &::before {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
        }

        &.danger {
          color: #4facfe;
          &::before {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
        }
      }
    }

    .stats-right {
      flex: 1;
      text-align: right;

      .stats-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2c3e50;
        line-height: 1;
        margin-bottom: 8px;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }

      .stats-label {
        font-size: 16px;
        color: #7f8c8d;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .stats-trend {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 12px;
        color: #95a5a6;

        i {
          margin-right: 4px;
          font-size: 14px;
        }

        span {
          font-weight: 500;
        }
      }
    }
  }

  .stats-progress {
    height: 6px;
    background-color: #f8f9fa;
    position: relative;
    overflow: hidden;

    .progress-bar {
      height: 100%;
      width: 0;
      animation: progressAnimation 2s ease-in-out forwards;

      &.total-progress {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 85%;
      }

      &.normal-progress {
        background: linear-gradient(90deg, #56ab2f 0%, #a8e6cf 100%);
        width: 92%;
      }

      &.warning-progress {
        background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
        width: 68%;
      }

      &.danger-progress {
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        width: 45%;
      }
    }
  }
}

@keyframes progressAnimation {
  from {
    width: 0;
  }
  to {
    width: var(--progress-width, 0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-card {
    .stats-card-inner {
      padding: 20px;

      .stats-left {
        .stats-icon-wrapper {
          width: 56px;
          height: 56px;

          i {
            font-size: 24px;
          }
        }
      }

      .stats-right {
        .stats-number {
          font-size: 2rem;
        }

        .stats-label {
          font-size: 14px;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .stats-row {
    .el-col {
      margin-bottom: 12px;
    }
  }

  .stats-card {
    .stats-card-inner {
      padding: 16px;
      flex-direction: column;
      text-align: center;

      .stats-left {
        margin-bottom: 16px;
      }

      .stats-right {
        text-align: center;

        .stats-trend {
          justify-content: center;
        }
      }
    }
  }
}

// 暗色主题支持
@media (prefers-color-scheme: dark) {
  .stats-card {
    background: #1e1e1e;
    color: #ffffff;

    .stats-card-inner {
      .stats-right {
        .stats-number {
          color: #ffffff;
        }

        .stats-label {
          color: #b0b0b0;
        }

        .stats-trend {
          color: #888888;
        }
      }
    }

    .stats-progress {
      background-color: #2a2a2a;
    }
  }
}

// 加载动画
.stats-card-loading {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 1.5s infinite;
  }
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}
.table-card {
  .el-table {
    ::v-deep .shortage-row {
      background-color: #fef0f0;
    }

    ::v-deep .overstock-row {
      background-color: #fdf6ec;
    }
  }
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.text-warning {
  color: #e6a23c;
  font-weight: bold;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.import-container {
  .import-steps {
    margin-bottom: 30px;
  }

  .upload-section {
    text-align: center;

    .upload-demo {
      margin-bottom: 20px;
    }

    .upload-actions {
      margin-top: 20px;

      .el-button {
        margin: 0 10px;
      }
    }
  }

  .preview-section {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h4 {
        margin: 0;
        color: #303133;
      }

      .preview-stats {
        .el-tag {
          margin-left: 10px;
        }
      }
    }

    .preview-table {
      margin-bottom: 15px;
    }

    .preview-more {
      text-align: center;
      color: #909399;
      padding: 10px;
      background-color: #f5f7fa;
      margin-bottom: 20px;
    }

    .error-section {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #f56c6c;
      }

      .error-text {
        color: #f56c6c;
      }
    }

    .preview-actions {
      text-align: center;
      margin-top: 20px;

      .el-button {
        margin: 0 10px;
      }
    }
  }

  .result-section {
    .result-details {
      margin: 20px 0;
    }

    .success-text {
      color: #67c23a;
      font-weight: bold;
    }

    .error-text {
      color: #f56c6c;
      font-weight: bold;
    }

    .error-details {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #f56c6c;
      }
    }

    .result-actions {
      margin-top: 20px;

      .el-button {
        margin: 0 10px;
      }
    }
  }
}
// 在<style>标签中添加以下样式
.history-container {
  .material-info {
    margin-bottom: 20px;

    .info-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;

      .info-item {
        display: flex;
        align-items: center;

        label {
          font-weight: bold;
          color: #606266;
          margin-right: 8px;
          min-width: 80px;
        }

        span {
          color: #303133;

          &.stock-value {
            font-weight: bold;
            color: #409eff;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    .el-table {
      .text-success {
        color: #67c23a;
        font-weight: bold;
      }

      .text-danger {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
}
</style>
