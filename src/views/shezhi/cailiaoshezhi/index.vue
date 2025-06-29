<template>
  <div class="material-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">
            <i class="el-icon-goods"></i>
            物料管理
          </h2>
          <div class="page-description">管理企业所有物料信息，支持批量操作和智能编码生成</div>
        </div>
        <div class="header-actions">
          <el-button-group class="action-group">
            <el-button icon="el-icon-download" size="small" @click="showImportDialog">导入</el-button>
            <el-button icon="el-icon-document" size="small" @click="downloadTemplate">模板</el-button>
            <el-button icon="el-icon-delete" size="small" @click="showDeletedMaterials">回收站</el-button>
          </el-button-group>
          <el-button type="success" icon="el-icon-s-grid" size="small" @click="openBatchCreateDialog">批量新增</el-button>
          <el-button type="primary" icon="el-icon-plus" size="small" @click="openCreateDialog">新增物料</el-button>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-wrapper">
        <div class="filter-header">
          <div class="filter-title">
            <i class="el-icon-search"></i>
            筛选条件
          </div>
          <div class="filter-controls">
            <el-button size="mini" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            <el-button type="primary" size="mini" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </div>
        </div>

        <div class="filter-content">
          <el-row :gutter="20">
            <el-col :span="5">
              <div class="filter-item">
                <label class="filter-label">物料编码</label>
                <el-input v-model="searchForm.code" placeholder="请输入物料编码" clearable size="small" prefix-icon="el-icon-search" />
              </div>
            </el-col>
            <el-col :span="5">
              <div class="filter-item">
                <label class="filter-label">物料名称</label>
                <el-input v-model="searchForm.name" placeholder="请输入物料名称" clearable size="small" prefix-icon="el-icon-goods" />
              </div>
            </el-col>
            <el-col :span="4">
              <div class="filter-item">
                <label class="filter-label">物料类别</label>
                <el-select v-model="searchForm.category" placeholder="请选择" clearable size="small" style="width: 100%">
                  <el-option v-for="item in Class_of_material_list" :key="item._id" :label="item.name" :value="item.name" />
                </el-select>
              </div>
            </el-col>
            <el-col :span="3">
              <div class="filter-item">
                <label class="filter-label">状态</label>
                <el-select v-model="searchForm.status" placeholder="请选择" clearable size="small" style="width: 100%">
                  <el-option label="启用" value="启用" />
                  <el-option label="禁用" value="禁用" />
                </el-select>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <!-- 数据表格区域 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-info">
          <span class="table-title">
            <i class="el-icon-document"></i>
            物料列表
          </span>
          <div class="table-stats">
            <span class="stat-item">
              总计
              <strong>{{ pagination.total }}</strong>
              条
            </span>
            <span v-if="selectedItems.length > 0" class="stat-item selected">
              已选择
              <strong>{{ selectedItems.length }}</strong>
              项
            </span>
          </div>
        </div>
        <div class="table-actions">
          <el-button v-if="selectedItems.length > 0" type="danger" icon="el-icon-delete" size="mini" plain @click="batchDelete">
            批量删除 ({{ selectedItems.length }})
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          :data="filteredTableData"
          v-loading="tableLoading"
          @selection-change="handleSelectionChange"
          class="modern-table"
          :header-cell-style="{
            background: '#f8f9fa',
            color: '#606266',
            fontWeight: '600',
            fontSize: '13px',
            borderBottom: '1px solid #e4e7ed'
          }"
          stripe
          border>
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column type="index" label="序号" width="50" align="center" />

          <el-table-column prop="code" label="物料编码" width="140" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="code-cell">
                <el-tag type="info" size="mini" effect="plain">{{ scope.row.code }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="name" label="物料名称" min-width="180" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="name-cell">
                <span class="material-name">{{ scope.row.name }}</span>
                <div v-if="scope.row.specification" class="material-spec">
                  {{ scope.row.specification }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="category" label="物料类别" width="110">
            <template slot-scope="scope">
              <el-tag size="mini" type="success" effect="plain">{{ scope.row.category }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="version" label="版本" width="70" align="center">
            <template slot-scope="scope">
              <span class="version-text">{{ scope.row.version || '--' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="unit" label="单位" width="60" align="center">
            <template slot-scope="scope">
              <span class="unit-text">{{ scope.row.unit }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="price" label="单价(元)" width="100" align="right">
            <template slot-scope="scope">
              <span class="price-value">
                {{ scope.row.price ? '¥' + scope.row.price.toFixed(2) : '--' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="库存信息" width="120" align="center">
            <template slot-scope="scope">
              <div class="inventory-info">
                <div class="inventory-row">
                  <span class="inventory-label">安全:</span>
                  <span :class="['inventory-value', { 'low-stock': scope.row.inventory < 10 }]">
                    {{ scope.row.inventory || 0 }}
                  </span>
                </div>
                <div class="inventory-row">
                  <span class="inventory-label">最大:</span>
                  <span class="inventory-value">{{ scope.row.maxInventory || 0 }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="70" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'" size="mini" effect="dark">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="140" align="center">
            <template slot-scope="scope">
              <div class="time-info">
                <div class="time-date">
                  {{ scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleDateString('zh-CN') : '--' }}
                </div>
                <div class="time-clock">
                  {{
                    scope.row.createdAt
                      ? new Date(scope.row.createdAt).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
                      : '--'
                  }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-tooltip content="编辑" placement="top">
                  <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="edit(scope.row)" />
                </el-tooltip>
                <el-tooltip content="详情" placement="top">
                  <el-button type="info" icon="el-icon-view" size="mini" circle @click="viewDetail(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="remove(scope.row)" />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          background />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="900px"
      :close-on-click-modal="false"
      @close="resetForm"
      class="modern-dialog">
      <div class="dialog-content">
        <el-form :model="materials_form" :rules="formRules" ref="materialForm" label-width="120px" class="modern-form">
          <!-- 基本信息section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-title">
                <i class="el-icon-info"></i>
                基本信息
              </div>
            </div>
            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="物料类别" prop="category">
                    <el-select
                      v-model="materials_form.category"
                      placeholder="请选择物料类别"
                      clearable
                      @change="onCategoryChange"
                      style="width: 100%">
                      <el-option v-for="item in Class_of_material_list" :key="item._id" :label="item.name" :value="item.name" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="计量单位" prop="unit">
                    <el-input v-model="materials_form.unit" placeholder="自动获取" readonly>
                      <template slot="prefix">
                        <i class="el-icon-collection"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="物料编码" prop="code">
                    <el-input v-model="materials_form.code" placeholder="选择类别后自动生成" @blur="checkCode">
                      <template slot="prefix">
                        <i class="el-icon-price-tag"></i>
                      </template>
                      <template slot="append">
                        <el-button @click="generateMaterialCode" :disabled="!materials_form.category" icon="el-icon-refresh" size="small">
                          生成
                        </el-button>
                      </template>
                    </el-input>
                    <div v-if="codeCheckResult.checked" class="code-check-result">
                      <i :class="['result-icon', codeCheckResult.available ? 'el-icon-success' : 'el-icon-error']"></i>
                      <span :class="['result-text', codeCheckResult.available ? 'text-success' : 'text-error']">
                        {{ codeCheckResult.message }}
                      </span>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="物料名称" prop="name">
                    <el-input v-model="materials_form.name" placeholder="请输入物料名称">
                      <template slot="prefix">
                        <i class="el-icon-goods"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="规格型号">
                    <el-input v-model="materials_form.specification" placeholder="请输入规格型号">
                      <template slot="prefix">
                        <i class="el-icon-menu"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="版本号">
                    <el-input v-model="materials_form.version" placeholder="如：V1.0">
                      <template slot="prefix">
                        <i class="el-icon-postcard"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="物料描述">
                    <el-input
                      v-model="materials_form.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入物料描述信息..."
                      maxlength="500"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 分类标签section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-title">
                <i class="el-icon-collection-tag"></i>
                分类标签
              </div>
            </div>
            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="16">
                  <el-form-item label="物料标签">
                    <el-select v-model="materials_form.tags" multiple placeholder="选择标签" style="width: 100%" collapse-tags>
                      <el-option label="原材料" value="原材料">
                        <span>原材料</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">Raw Material</span>
                      </el-option>
                      <el-option label="半成品" value="半成品">
                        <span>半成品</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">Semi-finished</span>
                      </el-option>
                      <el-option label="成品" value="成品">
                        <span>成品</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">Finished</span>
                      </el-option>
                      <el-option label="包装材料" value="包装材料">
                        <span>包装材料</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">Packaging</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="状态">
                    <el-radio-group v-model="materials_form.status" class="status-radio">
                      <el-radio label="启用" class="status-radio-item">
                        <span class="status-indicator success"></span>
                        启用
                      </el-radio>
                      <el-radio label="禁用" class="status-radio-item">
                        <span class="status-indicator danger"></span>
                        禁用
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 价格库存section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-title">
                <i class="el-icon-money"></i>
                价格库存
              </div>
            </div>
            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="8">
                  <el-form-item label="密度(g/cm³)">
                    <el-input-number
                      v-model="materials_form.density"
                      :precision="2"
                      :min="0"
                      placeholder="密度"
                      style="width: 100%"
                      controls-position="right" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="单价(元)">
                    <el-input-number
                      v-model="materials_form.price"
                      :precision="2"
                      :min="0"
                      placeholder="单价"
                      style="width: 100%"
                      controls-position="right" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="采购周期(天)">
                    <el-input-number
                      v-model="materials_form.leadTime"
                      :min="1"
                      placeholder="采购周期"
                      style="width: 100%"
                      controls-position="right" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="安全库存">
                    <el-input-number
                      v-model="materials_form.inventory"
                      :min="0"
                      placeholder="安全库存"
                      style="width: 100%"
                      controls-position="right" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大库存">
                    <el-input-number
                      v-model="materials_form.maxInventory"
                      :min="0"
                      placeholder="最大库存"
                      style="width: 100%"
                      controls-position="right" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" icon="el-icon-close">取消</el-button>
        <el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          <i class="el-icon-check"></i>
          {{ isEdit ? '更新物料' : '创建物料' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 批量创建对话框 -->
    <el-dialog
      title="批量新增物料"
      :visible.sync="batchCreateVisible"
      width="95%"
      top="30px"
      :close-on-click-modal="false"
      @close="resetBatchForm"
      class="batch-dialog">
      <div class="batch-container">
        <!-- 批量设置面板 -->
        <el-card class="batch-settings-card" shadow="never">
          <div slot="header" class="batch-header">
            <div class="batch-title">
              <i class="el-icon-setting"></i>
              批量设置
            </div>
            <div class="batch-header-actions">
              <el-button type="text" @click="clearBatchSettings" icon="el-icon-refresh" size="small">清空设置</el-button>
            </div>
          </div>

          <div class="batch-settings-content">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="setting-item">
                  <label class="setting-label">
                    物料类别
                    <span class="required">*</span>
                  </label>
                  <el-select
                    v-model="batchSettings.category"
                    placeholder="请选择"
                    clearable
                    @change="onBatchCategoryChange"
                    style="width: 100%"
                    size="small">
                    <el-option v-for="item in Class_of_material_list" :key="item._id" :label="item.name" :value="item.name" />
                  </el-select>
                </div>
              </el-col>
              <el-col :span="5">
                <div class="setting-item">
                  <label class="setting-label">计量单位</label>
                  <el-input v-model="batchSettings.unit" placeholder="自动获取" readonly size="small" />
                </div>
              </el-col>
              <el-col :span="4">
                <div class="setting-item">
                  <label class="setting-label">版本号</label>
                  <el-input v-model="batchSettings.version" placeholder="如：V1.0" size="small" />
                </div>
              </el-col>
              <el-col :span="5">
                <div class="setting-item">
                  <label class="setting-label">物料标签</label>
                  <el-select v-model="batchSettings.tags" multiple placeholder="选择标签" style="width: 100%" size="small" collapse-tags>
                    <el-option label="原材料" value="原材料" />
                    <el-option label="半成品" value="半成品" />
                    <el-option label="成品" value="成品" />
                    <el-option label="包装材料" value="包装材料" />
                  </el-select>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="setting-item">
                  <label class="setting-label">创建数量</label>
                  <el-input-number v-model="batchCreateCount" :min="1" :max="50" style="width: 100%" size="small" controls-position="right" />
                </div>
              </el-col>
            </el-row>

            <div class="batch-actions">
              <el-button
                type="primary"
                @click="generateBatchMaterials"
                :disabled="!batchSettings.category || batchCreateCount < 1"
                icon="el-icon-plus"
                size="small">
                生成 {{ batchCreateCount }} 个物料模板
              </el-button>
              <el-button
                type="success"
                @click="batchGenerateCodes"
                :disabled="batchMaterials.length === 0"
                icon="el-icon-magic-stick"
                size="small"
                :loading="batchGenerating">
                批量生成编码
              </el-button>
              <el-button @click="clearBatchMaterials" icon="el-icon-delete" size="small" plain>清空列表</el-button>
            </div>
          </div>
        </el-card>

        <!-- 批量物料列表 -->
        <el-card class="batch-materials-card" shadow="never">
          <div slot="header" class="batch-header">
            <div class="batch-title">
              <i class="el-icon-document"></i>
              物料列表
              <el-badge :value="batchMaterials.length" type="primary" class="list-count" />
            </div>
            <div class="batch-header-actions">
              <el-button type="text" @click="selectAllBatchMaterials" size="small" icon="el-icon-check">
                {{ allBatchSelected ? '取消全选' : '全选' }}
              </el-button>
            </div>
          </div>

          <div class="batch-table-wrapper">
            <el-table
              :data="batchMaterials"
              size="mini"
              @selection-change="handleBatchSelectionChange"
              v-loading="batchGenerating"
              max-height="500"
              border
              stripe
              ref="batchTable"
              :header-cell-style="{
                background: '#f8f9fa',
                color: '#606266',
                fontWeight: '600',
                fontSize: '12px'
              }">
              <el-table-column type="selection" width="45" align="center" />
              <el-table-column type="index" width="50" label="序号" align="center" />

              <el-table-column prop="code" label="物料编码" width="160">
                <template slot-scope="scope">
                  <div class="code-input-wrapper">
                    <el-input v-model="scope.row.code" size="mini" placeholder="待生成" @blur="checkBatchCode(scope.row, scope.$index)" clearable />
                    <div v-if="scope.row.codeStatus" class="code-status-indicator">
                      <el-tooltip :content="scope.row.codeStatus.message" placement="top">
                        <i
                          :class="[
                            'status-icon',
                            scope.row.codeStatus.type === 'success' ? 'el-icon-success' : 'el-icon-error',
                            scope.row.codeStatus.type === 'success' ? 'success' : 'error'
                          ]"></i>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="name" label="物料名称" min-width="180">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.name" size="mini" placeholder="请输入物料名称" clearable />
                </template>
              </el-table-column>

              <el-table-column prop="category" label="物料类别" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag size="mini" type="success" effect="plain">{{ scope.row.category }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="specification" label="规格型号" width="140">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.specification" size="mini" placeholder="规格型号" clearable />
                </template>
              </el-table-column>

              <el-table-column prop="unit" label="单位" width="70" align="center">
                <template slot-scope="scope">
                  <span class="unit-text">{{ scope.row.unit }}</span>
                </template>
              </el-table-column>

              <el-table-column prop="price" label="单价" width="120">
                <template slot-scope="scope">
                  <el-input-number v-model="scope.row.price" size="mini" :precision="2" :min="0" style="width: 100%" controls-position="right" />
                </template>
              </el-table-column>

              <el-table-column label="操作" width="60" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-tooltip content="删除" placement="top">
                    <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="removeBatchMaterial(scope.$index)" />
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>

      <div slot="footer" class="dialog-footer batch-footer">
        <div class="footer-info">
          <span class="selected-info">
            已选择
            <strong>{{ selectedBatchMaterials.length }}</strong>
            个物料
          </span>
        </div>
        <div class="footer-actions">
          <el-button @click="batchCreateVisible = false" icon="el-icon-close">取消</el-button>
          <el-button @click="resetBatchForm" icon="el-icon-refresh">重置</el-button>
          <el-button type="primary" @click="submitBatchCreate" :loading="batchSubmitting" icon="el-icon-check">
            批量创建 ({{ selectedBatchMaterials.length }})
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import materialCategoryApi from '@/api/materialCategory'
import { getToken } from '@/utils/auth'
import config from '../../../../config'
import * as XLSX from 'xlsx'
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  batchDeleteMaterials,
  getDeletedMaterials,
  restoreMaterial,
  permanentDeleteMaterial,
  checkMaterialCode,
  importMaterials,
  exportMaterials,
  generateMaterialCode,
  batchGenerateMaterialCodes, // 新增
  batchCreateMaterials,
  downloadTemplate
} from '@/api/materials'
import { getClassOfMaterials } from '@/api/classOfMaterial'

export default {
  name: 'Cailiaoshezhi',

  data() {
    return {
      materials: '',
      // ...existing data
      tableData: [],
      filteredTableData: [],
      selectedItems: [],
      tableLoading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      searchForm: {
        code: '',
        name: '',
        category: '',
        status: ''
      },
      Class_of_material_list: [],
      dialogVisible: false,
      dialogTitle: '新增物料',
      isEdit: false,
      currentEditId: null,
      materials_form: {
        code: '',
        name: '',
        category: '',
        unit: '',
        specification: '',
        description: '',
        tags: [],
        version: 'V1.0',
        density: '',
        price: '',
        inventory: '',
        maxInventory: '',
        status: '启用',
        image: '',
        leadTime: 7
      },
      formRules: {
        code: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择物料类别', trigger: 'change' }],
        unit: [{ required: true, message: '计量单位不能为空', trigger: 'blur' }]
      },
      codeCheckResult: {
        checked: true,
        available: true,
        message: ''
      },
      submitting: false,
      batchCreateVisible: false,
      batchSettings: {
        category: '',
        unit: '',
        version: 'V1.0',
        tags: [],
        status: '启用'
      },
      batchCreateCount: 1,
      batchMaterials: [],
      selectedBatchMaterials: [],
      batchSubmitting: false,
      batchGenerating: false
    }
  },

  computed: {
    hasValidBatchMaterials() {
      return (
        this.selectedBatchMaterials.length > 0 && this.selectedBatchMaterials.every((material) => material.code && material.name && material.category)
      )
    },

    allBatchSelected() {
      return this.batchMaterials.length > 0 && this.selectedBatchMaterials.length === this.batchMaterials.length
    }
  },

  mounted() {
    this.loadData()
    this.loadClassOfMaterials()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.tableLoading = true
      try {
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.pageSize,
          ...this.searchForm
        }

        const response = await getMaterials(params)
        if (response.code === 200) {
          this.tableData = response.data.list || []
          this.filteredTableData = this.tableData
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.tableLoading = false
      }
    },

    // 加载物料类别
    async loadClassOfMaterials() {
      try {
        const response = await getClassOfMaterials()
        if (response.code === 200) {
          this.Class_of_material_list = response.data.list || []
        }
      } catch (error) {
        console.error('加载物料类别失败:', error)
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        code: '',
        name: '',
        category: '',
        status: ''
      }
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 打开新增对话框
    openCreateDialog() {
      this.dialogTitle = '新增物料'
      this.isEdit = false
      this.currentEditId = null
      this.resetForm()
      this.dialogVisible = true
    },

    // 编辑物料
    edit(row) {
      this.dialogTitle = '编辑物料'
      this.isEdit = true
      this.currentEditId = row._id || row.id
      this.materials_form = { ...row }
      this.dialogVisible = true
    },

    // 查看详情
    viewDetail(row) {
      this.$message.info(`查看物料详情: ${row.name}`)
      // TODO: 实现详情查看功能
    },

    // 删除物料
    async remove(row) {
      try {
        await this.$confirm(`确认删除物料"${row.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deleteMaterial(row._id || row.id)
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.materialForm.validate()
        this.submitting = true

        const formData = { ...this.materials_form }
        let response

        if (this.isEdit) {
          response = await updateMaterial(this.currentEditId, formData)
        } else {
          response = await createMaterial(formData)
        }

        if (response.code === 200) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功')
          this.dialogVisible = false
          this.loadData()
        } else {
          this.$message.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error('提交失败')
      } finally {
        this.submitting = false
      }
    },

    // 重置表单
    resetForm() {
      this.materials_form = {
        code: '',
        name: '',
        category: '',
        unit: '',
        specification: '',
        description: '',
        tags: [],
        version: 'V1.0',
        density: '',
        price: '',
        inventory: '',
        maxInventory: '',
        status: '启用',
        image: '',
        leadTime: 7
      }
      this.codeCheckResult = {
        checked: true,
        available: true,
        message: ''
      }
      if (this.$refs.materialForm) {
        this.$refs.materialForm.clearValidate()
      }
    },

    // 物料类别改变
    onCategoryChange(category) {
      if (category) {
        const categoryItem = this.Class_of_material_list.find((item) => item.name === category)
        if (categoryItem) {
          this.materials_form.unit = categoryItem.unit || ''
        }
      }
    },

    // 单个编码生成保持原有逻辑（用于单个物料创建）
    async generateMaterialCode() {
      if (!this.materials_form.category) {
        this.$message.warning('请先选择物料类别')
        return
      }

      try {
        const categoryItem = this.Class_of_material_list.find((item) => item.name === this.materials_form.category)

        const response = await generateMaterialCode({
          category: this.materials_form.category,
          categoryCode: categoryItem?.code
        })

        if (response.code === 200) {
          this.materials_form.code = response.data.code
          this.$message.success('编码生成成功')
          //await this.checkCode()
        } else {
          this.$message.error(response.message || '生成编码失败')
        }
      } catch (error) {
        console.error('生成编码失败:', error)
        this.$message.error('生成编码失败')
      }
    },

    // 检查编码
    // async checkCode() {
    //   if (!this.materials_form.code) {
    //     this.codeCheckResult = {
    //       checked: false,
    //       available: false,
    //       message: ''
    //     }
    //     return
    //   }

    //   try {
    //     const response = await checkMaterialCode({
    //       code: this.materials_form.code,
    //       id: this.isEdit ? this.currentEditId : undefined
    //     })

    //     if (response.code === 200) {
    //       this.codeCheckResult = {
    //         checked: true,
    //         available: response.data.available,
    //         message: response.data.message
    //       }
    //     }
    //   } catch (error) {
    //     console.error('检查编码失败:', error)
    //   }
    // },

    // 批量操作相关方法
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    async batchDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请先选择要删除的物料')
        return
      }

      try {
        await this.$confirm(`确认删除选中的 ${this.selectedItems.length} 个物料吗？`, '批量删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.selectedItems.map((item) => item._id || item.id)
        const response = await batchDeleteMaterials({ ids })

        if (response.code === 200) {
          this.$message.success('批量删除成功')
          this.loadData()
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

    // 分页相关方法
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadData()
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadData()
    },

    // 批量创建相关方法
    openBatchCreateDialog() {
      this.batchCreateVisible = true
      this.resetBatchForm()
    },

    resetBatchForm() {
      this.batchSettings = {
        category: '',
        unit: '',
        version: 'V1.0',
        tags: [],
        status: '启用'
      }
      this.batchMaterials = [] // 确保是数组
      this.selectedBatchMaterials = []
      this.batchCreateCount = 1
    },

    onBatchCategoryChange(category) {
      if (category) {
        const categoryItem = this.Class_of_material_list.find((item) => item.name === category)
        if (categoryItem) {
          this.batchSettings.unit = categoryItem.unit || ''
        }
      }
    },

    generateBatchMaterials() {
      if (!this.batchSettings.category) {
        this.$message.warning('请先选择物料类别')
        return
      }

      for (let i = 0; i < this.batchCreateCount; i++) {
        this.batchMaterials.push({
          code: '',
          name: '',
          category: this.batchSettings.category,
          unit: this.batchSettings.unit,
          version: this.batchSettings.version,
          tags: [...this.batchSettings.tags],
          status: this.batchSettings.status,
          specification: '',
          price: 0,
          inventory: 0,
          maxInventory: 0,
          description: '',
          codeStatus: null
        })
      }

      this.batchMaterials = materials
      this.$message.success(`已生成 ${this.batchCreateCount} 个物料模板`)
    },

    async batchGenerateCodes() {
      if (this.batchMaterials.length === 0) {
        this.$message.warning('请先生成物料模板')
        return
      }

      this.batchGenerating = true
      try {
        const categoryItem = this.Class_of_material_list.find((item) => item.name === this.batchSettings.category)

        // 使用批量生成接口而不是循环调用单个接口
        const response = await batchGenerateMaterialCodes({
          category: this.batchSettings.category,
          categoryCode: categoryItem?.code,
          count: this.batchMaterials.length
        })

        if (response.code === 200) {
          const generatedCodes = response.data.codes || []

          // 将生成的编码分配给物料
          for (let i = 0; i < Math.min(generatedCodes.length, this.batchMaterials.length); i++) {
            this.batchMaterials[i].code = generatedCodes[i].code
            this.batchMaterials[i].codeStatus = {
              type: 'success',
              message: '编码生成成功'
            }
          }

          // 如果生成的编码少于请求的数量，标记剩余的为失败
          for (let i = generatedCodes.length; i < this.batchMaterials.length; i++) {
            this.batchMaterials[i].codeStatus = {
              type: 'error',
              message: '编码生成失败：已达当日上限'
            }
          }

          this.$message.success(`批量生成编码完成，成功生成 ${generatedCodes.length} 个编码`)
        } else {
          this.$message.error(response.message || '批量生成编码失败')

          // 标记所有物料编码生成失败
          this.batchMaterials.forEach((material) => {
            material.codeStatus = {
              type: 'error',
              message: response.message || '生成失败'
            }
          })
        }
      } catch (error) {
        console.error('批量生成编码失败:', error)
        this.$message.error('批量生成编码失败')

        // 标记所有物料编码生成失败
        this.batchMaterials.forEach((material) => {
          material.codeStatus = {
            type: 'error',
            message: '网络错误'
          }
        })
      } finally {
        this.batchGenerating = false
      }
    },

    // async checkBatchCode(material, index) {
    //   if (!material.code) {
    //     material.codeStatus = null
    //     return
    //   }

    //   try {
    //     const response = await checkMaterialCode({ code: material.code })
    //     if (response.code === 200) {
    //       material.codeStatus = {
    //         type: response.data.available ? 'success' : 'error',
    //         message: response.data.message
    //       }
    //     }
    //   } catch (error) {
    //     material.codeStatus = {
    //       type: 'error',
    //       message: '检查失败'
    //     }
    //   }
    // },

    handleBatchSelectionChange(selection) {
      this.selectedBatchMaterials = selection
    },

    selectAllBatchMaterials() {
      if (this.allBatchSelected) {
        this.$refs.batchTable.clearSelection()
      } else {
        this.batchMaterials.forEach((row) => {
          this.$refs.batchTable.toggleRowSelection(row)
        })
      }
    },

    removeBatchMaterial(index) {
      this.batchMaterials.splice(index, 1)
    },

    clearBatchMaterials() {
      this.batchMaterials = []
      this.selectedBatchMaterials = []
    },

    clearBatchSettings() {
      this.batchSettings = {
        category: '',
        unit: '',
        version: 'V1.0',
        tags: [],
        status: '启用'
      }
    },

    async submitBatchCreate() {
      if (!this.hasValidBatchMaterials) {
        this.$message.warning('请完善物料信息')
        return
      }

      this.batchSubmitting = true
      try {
        const response = await batchCreateMaterials({
          materials: this.selectedBatchMaterials
        })

        if (response.code === 200) {
          this.$message.success(`成功创建 ${this.selectedBatchMaterials.length} 个物料`)
          this.batchCreateVisible = false
          this.loadData()
        } else {
          this.$message.error(response.message || '批量创建失败')
        }
      } catch (error) {
        console.error('批量创建失败:', error)
        this.$message.error('批量创建失败')
      } finally {
        this.batchSubmitting = false
      }
    },

    // 导入导出功能
    showImportDialog() {
      this.$message.info('导入功能开发中...')
      // TODO: 实现导入功能
    },

    async downloadTemplate() {
      try {
        const response = await downloadTemplate()
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `物料导入模板_${new Date().toISOString().slice(0, 10)}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载模板失败:', error)
        this.$message.error('下载模板失败')
      }
    },

    showDeletedMaterials() {
      this.$message.info('回收站功能开发中...')
      // TODO: 实现回收站功能
    }
  }
}
</script>

<style lang="scss" scoped>
.material-management {
  padding: 0;
  background: #f5f7fa;
  min-height: 100vh;

  // 页面头部样式
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px 32px;
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        display: flex;
        align-items: center;

        i {
          margin-right: 12px;
          font-size: 32px;
        }
      }

      .page-description {
        font-size: 14px;
        opacity: 0.9;
        font-weight: 400;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;

      .action-group {
        .el-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
          }
        }
      }

      .el-button {
        &.el-button--success {
          background: #67c23a;
          border-color: #67c23a;
          box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);

          &:hover {
            background: #5daf34;
            border-color: #5daf34;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
          }
        }

        &.el-button--primary {
          background: #409eff;
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);

          &:hover {
            background: #3a8ee6;
            border-color: #3a8ee6;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
          }
        }
      }
    }
  }

  // 筛选卡片样式
  .filter-card {
    margin: 0 20px 20px 20px;
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .filter-wrapper {
      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;

        .filter-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          display: flex;
          align-items: center;

          i {
            margin-right: 8px;
            color: #409eff;
          }
        }

        .filter-controls {
          display: flex;
          gap: 8px;
        }
      }

      .filter-content {
        .filter-item {
          .filter-label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            color: #606266;
            font-weight: 500;
          }
        }
      }
    }
  }

  // 表格卡片样式
  .table-card {
    margin: 0 20px;
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      .table-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .table-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          display: flex;
          align-items: center;

          i {
            margin-right: 8px;
            color: #409eff;
          }
        }

        .table-stats {
          display: flex;
          gap: 12px;

          .stat-item {
            font-size: 13px;
            color: #909399;

            strong {
              color: #303133;
              font-weight: 600;
            }

            &.selected {
              color: #409eff;

              strong {
                color: #409eff;
              }
            }
          }
        }
      }

      .table-actions {
        display: flex;
        gap: 8px;
      }
    }

    .table-wrapper {
      .modern-table {
        border-radius: 8px;
        overflow: hidden;

        // 表格单元格样式
        .code-cell {
          .el-tag {
            font-family: 'Courier New', monospace;
            font-weight: 600;
          }
        }

        .name-cell {
          .material-name {
            font-weight: 500;
            color: #303133;
          }

          .material-spec {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }

        .price-value {
          font-weight: 600;
          color: #f56c6c;
        }

        .inventory-info {
          .inventory-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;

            .inventory-label {
              font-size: 11px;
              color: #909399;
            }

            .inventory-value {
              font-size: 12px;
              font-weight: 500;

              &.low-stock {
                color: #f56c6c;
                font-weight: 600;
              }
            }
          }
        }

        .time-info {
          .time-date {
            font-size: 12px;
            color: #303133;
          }

          .time-clock {
            font-size: 11px;
            color: #909399;
            margin-top: 2px;
          }
        }

        .action-buttons {
          display: flex;
          gap: 4px;
          justify-content: center;

          .el-button {
            &.is-circle {
              width: 28px;
              height: 28px;
            }
          }
        }
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  // 对话框样式
  .modern-dialog {
    .dialog-content {
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 8px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;

        &:hover {
          background: #a8a8a8;
        }
      }
    }

    .modern-form {
      .form-section {
        margin-bottom: 24px;
        background: #fafbfc;
        border-radius: 8px;
        overflow: hidden;

        .section-header {
          background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 12px 16px;
          border-bottom: 1px solid #dee2e6;

          .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #495057;
            display: flex;
            align-items: center;

            i {
              margin-right: 8px;
              color: #6c757d;
            }
          }
        }

        .section-content {
          padding: 20px 16px;
        }
      }

      // 编码检查结果样式
      .code-check-result {
        margin-top: 6px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        display: flex;
        align-items: center;

        .result-icon {
          margin-right: 4px;
        }

        .text-success {
          color: #67c23a;
        }

        .text-error {
          color: #f56c6c;
        }
      }

      // 状态单选框样式
      .status-radio {
        .status-radio-item {
          margin-right: 20px;

          .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;

            &.success {
              background-color: #67c23a;
            }

            &.danger {
              background-color: #f56c6c;
            }
          }
        }
      }
    }

    .dialog-footer {
      padding: 16px 20px;
      border-top: 1px solid #ebeef5;
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 80px;
      }
    }
  }

  // 批量创建对话框样式
  .batch-dialog {
    .batch-container {
      .batch-settings-card,
      .batch-materials-card {
        margin-bottom: 16px;
        border-radius: 8px;
        border: 1px solid #e4e7ed;

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .batch-title {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            display: flex;
            align-items: center;

            i {
              margin-right: 8px;
              color: #409eff;
            }

            .list-count {
              margin-left: 8px;
            }
          }

          .batch-header-actions {
            .el-button {
              padding: 4px 8px;
            }
          }
        }
      }

      .batch-settings-content {
        .setting-item {
          margin-bottom: 16px;

          .setting-label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            color: #606266;
            font-weight: 500;

            .required {
              color: #f56c6c;
            }
          }
        }

        .batch-actions {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #ebeef5;
          display: flex;
          gap: 12px;
        }
      }

      .batch-table-wrapper {
        .code-input-wrapper {
          position: relative;

          .code-status-indicator {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);

            .status-icon {
              font-size: 14px;

              &.success {
                color: #67c23a;
              }

              &.error {
                color: #f56c6c;
              }
            }
          }
        }

        .unit-text {
          font-size: 12px;
          color: #606266;
          padding: 2px 6px;
          background: #f5f7fa;
          border-radius: 4px;
        }
      }
    }

    .batch-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid #ebeef5;

      .footer-info {
        .selected-info {
          font-size: 14px;
          color: #606266;

          strong {
            color: #409eff;
            font-weight: 600;
          }
        }
      }

      .footer-actions {
        display: flex;
        gap: 12px;

        .el-button {
          min-width: 80px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .material-management {
    .page-header {
      padding: 20px 24px;

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }

    .filter-card,
    .table-card {
      margin: 0 16px 16px 16px;
    }
  }
}

@media (max-width: 768px) {
  .material-management {
    .page-header {
      padding: 16px 20px;

      .header-actions {
        flex-direction: column;
        gap: 8px;
        width: 100%;

        .action-group {
          width: 100%;
        }

        .el-button {
          width: 100%;
        }
      }
    }

    .filter-card {
      .filter-content {
        .el-row {
          .el-col {
            margin-bottom: 12px;
          }
        }
      }
    }

    .table-card {
      .table-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
    }
  }
}
</style>
