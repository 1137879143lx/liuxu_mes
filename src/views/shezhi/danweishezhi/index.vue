<template>
  <div class="material-category-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">
            <i class="el-icon-collection-tag"></i>
            物料类型管理
          </h2>
          <div class="page-description">管理系统中的物料分类和编码规则</div>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="showAddDialog">新增物料类型</el-button>
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
            <el-button size="mini" icon="el-icon-refresh" @click="handleReset">重置</el-button>
            <el-button type="primary" size="mini" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </div>
        </div>

        <div class="filter-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="filter-item">
                <label class="filter-label">物料类型</label>
                <el-input
                  v-model="queryParams.name"
                  placeholder="请输入物料类型名称"
                  clearable
                  size="small"
                  prefix-icon="el-icon-collection-tag"
                  @keyup.enter.native="handleSearch" />
              </div>
            </el-col>
            <el-col :span="5">
              <div class="filter-item">
                <label class="filter-label">类别编码</label>
                <el-input
                  v-model="queryParams.code"
                  placeholder="请输入类别编码"
                  clearable
                  size="small"
                  prefix-icon="el-icon-document"
                  @keyup.enter.native="handleSearch" />
              </div>
            </el-col>
            <el-col :span="4">
              <div class="filter-item">
                <label class="filter-label">状态</label>
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small" style="width: 100%">
                  <el-option label="启用" :value="1" />
                  <el-option label="禁用" :value="0" />
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
            物料类型列表
          </span>
          <div class="table-stats">
            <span class="stat-item">
              总计
              <strong>{{ pagination.total }}</strong>
              条
            </span>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          border
          class="modern-table"
          :header-cell-style="{
            background: '#f8f9fa',
            color: '#606266',
            fontWeight: '600',
            fontSize: '13px',
            borderBottom: '1px solid #e4e7ed'
          }">
          <el-table-column type="index" label="序号" width="60" align="center" />

          <el-table-column prop="name" label="物料类型" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="type-cell">
                <i class="el-icon-collection-tag type-icon"></i>
                <span class="type-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="code" label="类别编码" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tag type="info" size="mini" effect="plain">{{ scope.row.code }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="unit" label="单位" width="80" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" type="success" effect="plain">{{ scope.row.unit }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="codeRule" label="编码规则" min-width="200" show-overflow-tooltip>
            <template slot-scope="scope">
              <div class="rule-cell">
                <i class="el-icon-setting rule-icon"></i>
                <span class="rule-text">{{ scope.row.codeRule || '暂无规则' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span class="description-text">{{ scope.row.description || '暂无描述' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini" effect="dark">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="140" align="center">
            <template slot-scope="scope">
              <div class="time-info">
                <div class="time-date">
                  {{ scope.row.createTime ? new Date(scope.row.createTime).toLocaleDateString('zh-CN') : '--' }}
                </div>
                <div class="time-clock">
                  {{
                    scope.row.createTime
                      ? new Date(scope.row.createTime).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
                      : '--'
                  }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-tooltip content="编辑" placement="top">
                  <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="handleEdit(scope.row)" />
                </el-tooltip>
                <el-tooltip :content="scope.row.status === 1 ? '禁用' : '启用'" placement="top">
                  <el-button
                    :type="scope.row.status === 1 ? 'warning' : 'success'"
                    :icon="scope.row.status === 1 ? 'el-icon-close' : 'el-icon-check'"
                    size="mini"
                    circle
                    @click="handleToggleStatus(scope.row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="handleDelete(scope.row)" />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogForm.isEdit ? '编辑物料类型' : '新增物料类型'"
      :visible.sync="dialogForm.visible"
      width="700px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
      class="modern-dialog">
      <div class="dialog-content">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="modern-form">
          <!-- 基本信息 -->
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
                  <el-form-item label="物料类型" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入物料类型名称">
                      <template slot="prefix">
                        <i class="el-icon-collection-tag"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="类别编码" prop="code">
                    <el-input v-model="formData.code" placeholder="请输入类别编码">
                      <template slot="prefix">
                        <i class="el-icon-document"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="单位" prop="unit">
                    <el-input v-model="formData.unit" placeholder="请输入单位">
                      <template slot="prefix">
                        <i class="el-icon-collection"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="formData.status" class="status-radio">
                      <el-radio :label="1" class="status-radio-item">
                        <span class="status-indicator success"></span>
                        启用
                      </el-radio>
                      <el-radio :label="0" class="status-radio-item">
                        <span class="status-indicator danger"></span>
                        禁用
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="编码规则" prop="codeRule">
                    <el-input v-model="formData.codeRule" placeholder="请输入编码规则，如：前缀+日期+序号">
                      <template slot="prefix">
                        <i class="el-icon-setting"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="描述">
                    <el-input
                      v-model="formData.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入描述信息..."
                      maxlength="200"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogForm.visible = false" icon="el-icon-close">取消</el-button>
        <el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
        <el-button type="primary" :loading="dialogForm.loading" @click="handleSave" icon="el-icon-check">
          {{ dialogForm.isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import materialCategoryApi from '@/api/materialCategory'

export default {
  name: 'MaterialCategoryManage',
  data() {
    return {
      // 加载状态
      loading: false,

      // 查询参数
      queryParams: {
        name: '',
        code: '',
        status: null
      },

      // 表格数据
      tableData: [],

      // 分页信息
      pagination: {
        page: 1,
        size: 20,
        total: 0
      },

      // 弹窗状态
      dialogForm: {
        visible: false,
        isEdit: false,
        loading: false
      },

      // 表单数据
      formData: {
        id: null,
        name: '',
        code: '',
        unit: '',
        codeRule: '',
        description: '',
        status: 1
      },

      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入物料类型名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入类别编码', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9_-]+$/, message: '编码只能包含字母、数字、下划线和连字符', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位', trigger: 'blur' },
          { max: 10, message: '单位长度不能超过 10 个字符', trigger: 'blur' }
        ],
        codeRule: [{ max: 100, message: '编码规则长度不能超过 100 个字符', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          ...this.queryParams
        }

        const response = await materialCategoryApi.getList(params)
        this.tableData = response.data.list || []
        this.pagination.total = response.data.total || 0
      } catch (error) {
        this.$message.error('加载数据失败')
        console.error('Load data error:', error)
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },

    // 重置
    handleReset() {
      this.queryParams = {
        name: '',
        code: '',
        status: null
      }
      this.pagination.page = 1
      this.loadData()
    },

    // 显示新增弹窗
    showAddDialog() {
      this.dialogForm.isEdit = false
      this.dialogForm.visible = true
      this.resetForm()
    },

    // 编辑
    handleEdit(row) {
      this.dialogForm.isEdit = true
      this.dialogForm.visible = true
      this.formData = { ...row }
    },

    // 保存
    async handleSave() {
      try {
        await this.$refs.formRef.validate()
        this.dialogForm.loading = true

        if (this.dialogForm.isEdit) {
          await materialCategoryApi.update(this.formData.id, this.formData)
          this.$message.success('更新成功')
        } else {
          await materialCategoryApi.create(this.formData)
          this.$message.success('创建成功')
        }

        this.dialogForm.visible = false
        this.loadData()
      } catch (error) {
        if (error.response?.data?.message) {
          this.$message.error(error.response.data.message)
        } else {
          this.$message.error(this.dialogForm.isEdit ? '更新失败' : '创建失败')
        }
        console.error('Save error:', error)
      } finally {
        this.dialogForm.loading = false
      }
    },

    // 切换状态
    async handleToggleStatus(row) {
      try {
        await this.$confirm(`确认${row.status === 1 ? '禁用' : '启用'}物料类型"${row.name}"吗？`, '状态切换确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const newStatus = row.status === 1 ? 0 : 1
        await materialCategoryApi.updateStatus(row.id, newStatus)
        this.$message.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
        row.status = newStatus
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('状态更新失败')
          console.error('Toggle status error:', error)
        }
      }
    },

    // 删除
    async handleDelete(row) {
      try {
        await this.$confirm(`确认删除物料类型"${row.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await materialCategoryApi.delete(row.id)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
          console.error('Delete error:', error)
        }
      }
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: null,
        name: '',
        code: '',
        unit: '',
        codeRule: '',
        description: '',
        status: 1
      }
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },

    // 弹窗关闭
    handleDialogClose() {
      this.resetForm()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.loadData()
    },

    // 页码改变
    handlePageChange(page) {
      this.pagination.page = page
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.material-category-management {
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
      .el-button {
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
          .el-button {
            margin-left: 8px;
          }
        }
      }

      .filter-content {
        .filter-item {
          margin-bottom: 16px;

          .filter-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #606266;
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
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;

      .table-info {
        display: flex;
        align-items: center;
        gap: 20px;

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
          gap: 16px;

          .stat-item {
            font-size: 14px;
            color: #606266;

            strong {
              color: #409eff;
              font-weight: 600;
              margin: 0 2px;
            }
          }
        }
      }
    }

    .table-wrapper {
      .modern-table {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #ebeef5;

        // 表格行样式
        ::v-deep .el-table__row {
          &:hover > td {
            background-color: #f8f9ff !important;
          }
        }

        // 单元格样式
        .type-cell {
          display: flex;
          align-items: center;

          .type-icon {
            margin-right: 8px;
            color: #409eff;
            font-size: 16px;
          }

          .type-name {
            font-weight: 500;
            color: #303133;
          }
        }

        .rule-cell {
          display: flex;
          align-items: center;

          .rule-icon {
            margin-right: 6px;
            color: #67c23a;
            font-size: 14px;
          }

          .rule-text {
            color: #606266;
          }
        }

        .description-text {
          color: #909399;
          font-size: 13px;
        }

        .time-info {
          .time-date {
            font-size: 13px;
            color: #303133;
            margin-bottom: 2px;
          }

          .time-clock {
            font-size: 12px;
            color: #909399;
          }
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;

          .el-button.is-circle {
            width: 28px;
            height: 28px;
            padding: 0;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
          }
        }
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      padding: 20px 0 0 0;
      border-top: 1px solid #ebeef5;
    }
  }

  // 对话框样式
  .modern-dialog {
    ::v-deep .el-dialog {
      border-radius: 12px;
      overflow: hidden;

      .el-dialog__header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;

        .el-dialog__title {
          color: white;
          font-weight: 600;
        }

        .el-dialog__close {
          color: white;
          font-size: 18px;

          &:hover {
            color: #f0f0f0;
          }
        }
      }

      .el-dialog__body {
        padding: 0;
      }
    }

    .dialog-content {
      padding: 24px;

      .modern-form {
        .form-section {
          margin-bottom: 24px;

          .section-header {
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #ebeef5;

            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              display: flex;
              align-items: center;

              i {
                margin-right: 8px;
                color: #409eff;
                font-size: 18px;
              }
            }
          }

          .section-content {
            .el-form-item {
              margin-bottom: 20px;

              .el-input {
                ::v-deep .el-input__inner {
                  border-radius: 6px;
                  border: 1px solid #dcdfe6;
                  transition: all 0.3s ease;

                  &:focus {
                    border-color: #409eff;
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                  }
                }
              }

              .status-radio {
                .status-radio-item {
                  margin-right: 20px;
                  display: flex;
                  align-items: center;

                  .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 6px;

                    &.success {
                      background: #67c23a;
                    }

                    &.danger {
                      background: #f56c6c;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .dialog-footer {
      padding: 20px 24px;
      background: #f8f9fa;
      border-top: 1px solid #ebeef5;
      text-align: right;

      .el-button {
        margin-left: 12px;
        border-radius: 6px;
        padding: 10px 20px;
        font-weight: 500;

        &.el-button--primary {
          background: #409eff;
          border-color: #409eff;

          &:hover {
            background: #3a8ee6;
            border-color: #3a8ee6;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .material-category-management {
    .page-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;

        .header-actions {
          align-self: flex-end;
        }
      }
    }

    .filter-card {
      margin: 0 10px 20px 10px;

      .filter-content {
        .el-col {
          margin-bottom: 10px;
        }
      }
    }

    .table-card {
      margin: 0 10px;
    }
  }
}

@media (max-width: 768px) {
  .material-category-management {
    .page-header {
      padding: 16px 20px;

      .header-content {
        .header-left {
          .page-title {
            font-size: 24px;

            i {
              font-size: 28px;
            }
          }
        }

        .header-actions {
          align-self: stretch;

          .el-button {
            width: 100%;
          }
        }
      }
    }

    .filter-card {
      .filter-content {
        .el-row {
          .el-col {
            width: 100% !important;
            margin-bottom: 16px;
          }
        }
      }
    }

    .table-card {
      .table-wrapper {
        overflow-x: auto;

        .modern-table {
          min-width: 800px;
        }
      }

      .pagination-wrapper {
        justify-content: center;
        padding: 16px 0 0 0;
      }
    }

    .modern-dialog {
      ::v-deep .el-dialog {
        width: 95% !important;
        margin: 5vh auto !important;
      }

      .dialog-content {
        padding: 16px;

        .section-content {
          .el-row {
            .el-col {
              width: 100% !important;
              margin-bottom: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
