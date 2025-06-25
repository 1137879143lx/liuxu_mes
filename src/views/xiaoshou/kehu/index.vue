<template>
  <div class="customer-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <i class="el-icon-office-building"></i>
          客户管理
        </h2>
        <p class="page-description">管理客户信息，维护客户关系</p>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="el-icon-plus" @click="openAddDialog">新增客户</el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable style="width: 200px" @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户类型">
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 120px">
            <el-option label="公司" value="company" />
            <el-option label="个人" value="individual" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="danger" icon="el-icon-delete" :disabled="multipleSelection.length === 0" @click="handleBatchDelete">
          批量删除 ({{ multipleSelection.length }})
        </el-button>
        <el-button type="success" icon="el-icon-download" @click="handleExport">导出数据</el-button>
      </div>
      <div class="toolbar-right">
        <span class="total-info">共 {{ pagination.total }} 条记录</span>
        <el-button-group class="view-mode">
          <el-button :type="viewMode === 'table' ? 'primary' : ''" icon="el-icon-menu" size="mini" @click="viewMode = 'table'">表格</el-button>
          <el-button :type="viewMode === 'card' ? 'primary' : ''" icon="el-icon-s-grid" size="mini" @click="viewMode = 'card'">卡片</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 数据展示区域 -->
    <el-card class="data-card" shadow="never">
      <!-- 表格视图 -->
      <div v-show="viewMode === 'table'">
        <el-table v-loading="loading" :data="customerList" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="60" />

          <!-- 客户信息 -->
          <el-table-column label="客户信息" min-width="200" fixed="left">
            <template slot-scope="{ row }">
              <div class="customer-info">
                <div class="customer-avatar">
                  <i class="el-icon-office-building"></i>
                </div>
                <div class="customer-details">
                  <div class="customer-name">{{ row.name }}</div>
                  <div class="company-name">{{ row.companyName }}</div>
                  <div class="customer-tags">
                    <el-tag size="mini" :type="getTypeTagType(row.type)">
                      {{ getTypeText(row.type) }}
                    </el-tag>
                    <el-tag size="mini" :type="getStatusTagType(row.status)">
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 联系信息 -->
          <el-table-column label="联系信息" min-width="180">
            <template slot-scope="{ row }">
              <div class="contact-info">
                <div v-if="row.contactPerson" class="contact-item">
                  <i class="el-icon-user"></i>
                  <span>{{ row.contactPerson }}</span>
                </div>
                <div v-if="row.phone" class="contact-item">
                  <i class="el-icon-phone"></i>
                  <el-link :href="`tel:${row.phone}`" type="primary">{{ row.phone }}</el-link>
                </div>
                <div v-if="row.email" class="contact-item">
                  <i class="el-icon-message"></i>
                  <el-link :href="`mailto:${row.email}`" type="primary">{{ row.email }}</el-link>
                </div>
              </div>
            </template>
          </el-table-column>

          <!-- 地址信息 -->
          <el-table-column label="地址" prop="address" min-width="200" show-overflow-tooltip />

          <!-- 信用等级 -->
          <el-table-column label="信用等级" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="getCreditTagType(row.creditLevel)" effect="dark">{{ row.creditLevel }}级</el-tag>
            </template>
          </el-table-column>

          <!-- 创建时间 -->
          <el-table-column label="创建时间" width="160">
            <template slot-scope="{ row }">
              <i class="el-icon-time"></i>
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCustomer(row)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCustomer(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-show="viewMode === 'card'" class="card-view">
        <el-row :gutter="20">
          <el-col v-for="customer in customerList" :key="customer._id" :xs="24" :sm="12" :md="8" :lg="6">
            <div class="customer-card">
              <div class="card-header">
                <div class="customer-avatar">
                  <i class="el-icon-office-building"></i>
                </div>
                <div class="customer-title">
                  <h3>{{ customer.name }}</h3>
                  <p>{{ customer.companyName }}</p>
                </div>
                <div class="card-actions">
                  <el-dropdown trigger="click" @command="handleCardAction">
                    <el-button size="mini" type="text" icon="el-icon-more" />
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="{ action: 'edit', data: customer }">
                        <i class="el-icon-edit"></i>
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'delete', data: customer }">
                        <i class="el-icon-delete"></i>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
              <div class="card-body">
                <div class="card-tags">
                  <el-tag size="small" :type="getTypeTagType(customer.type)">
                    {{ getTypeText(customer.type) }}
                  </el-tag>
                  <el-tag size="small" :type="getStatusTagType(customer.status)">
                    {{ getStatusText(customer.status) }}
                  </el-tag>
                  <el-tag size="small" :type="getCreditTagType(customer.creditLevel)">{{ customer.creditLevel }}级</el-tag>
                </div>
                <div class="card-info">
                  <div v-if="customer.contactPerson" class="info-item">
                    <i class="el-icon-user"></i>
                    <span>{{ customer.contactPerson }}</span>
                  </div>
                  <div v-if="customer.phone" class="info-item">
                    <i class="el-icon-phone"></i>
                    <span>{{ customer.phone }}</span>
                  </div>
                  <div v-if="customer.email" class="info-item">
                    <i class="el-icon-message"></i>
                    <span>{{ customer.email }}</span>
                  </div>
                  <div v-if="customer.address" class="info-item">
                    <i class="el-icon-location"></i>
                    <span>{{ customer.address }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" class="customer-dialog">
      <el-form ref="customerForm" :model="customerForm" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="name">
              <el-input v-model="customerForm.name" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="customerForm.companyName" placeholder="请输入公司名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="customerForm.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="customerForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="customerForm.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类型" prop="type">
              <el-select v-model="customerForm.type" placeholder="选择客户类型" style="width: 100%">
                <el-option label="公司" value="company" />
                <el-option label="个人" value="individual" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="customerForm.status" placeholder="选择状态" style="width: 100%">
                <el-option label="活跃" value="active" />
                <el-option label="非活跃" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用等级" prop="creditLevel">
              <el-select v-model="customerForm.creditLevel" placeholder="选择信用等级" style="width: 100%">
                <el-option label="A级" value="A" />
                <el-option label="B级" value="B" />
                <el-option label="C级" value="C" />
                <el-option label="D级" value="D" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="客户地址" prop="address">
          <el-input v-model="customerForm.address" type="textarea" :rows="2" placeholder="请输入客户地址" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="customerForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getlist, add, update, deletes } from '@/api/Customer'

export default {
  name: 'CustomerManagement',
  data() {
    return {
      // 视图模式
      viewMode: 'table',

      // 加载状态
      loading: false,
      submitLoading: false,

      // 搜索表单
      searchForm: {
        name: '',
        status: '',
        type: ''
      },

      // 客户列表
      customerList: [],

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 选中项
      multipleSelection: [],

      // 对话框
      dialogVisible: false,
      dialogTitle: '新增客户',
      isEditMode: false,
      currentEditId: null,

      // 客户表单
      customerForm: {
        name: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        type: 'company',
        status: 'active',
        creditLevel: 'B',
        remark: ''
      },

      // 表单验证规则
      formRules: {
        name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
        contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
      }
    }
  },

  mounted() {
    this.loadCustomerList()
  },

  methods: {
    // 加载客户列表
    async loadCustomerList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.pageSize,
          ...this.searchForm
        }

        const response = await getlist(params)
        if (response.code === 200) {
          this.customerList = response.data.list || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('加载客户列表失败:', error)
        this.$message.error('加载客户列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadCustomerList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        name: '',
        status: '',
        type: ''
      }
      this.pagination.currentPage = 1
      this.loadCustomerList()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.loadCustomerList()
    },

    // 当前页改变
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.loadCustomerList()
    },

    // 选择改变
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    // 打开新增对话框
    openAddDialog() {
      this.isEditMode = false
      this.dialogTitle = '新增客户'
      this.customerForm = {
        name: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        type: 'company',
        status: 'active',
        creditLevel: 'B',
        remark: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.customerForm.clearValidate()
      })
    },

    // 编辑客户
    editCustomer(row) {
      this.isEditMode = true
      this.dialogTitle = '编辑客户'
      this.currentEditId = row._id
      this.customerForm = {
        name: row.name,
        companyName: row.companyName,
        contactPerson: row.contactPerson,
        phone: row.phone,
        email: row.email,
        address: row.address,
        type: row.type,
        status: row.status,
        creditLevel: row.creditLevel,
        remark: row.remark
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.customerForm.clearValidate()
      })
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.customerForm.validate()

        this.submitLoading = true

        if (this.isEditMode) {
          const response = await update(this.currentEditId, this.customerForm)
          if (response.code === 200) {
            this.$message.success('客户更新成功')
            this.dialogVisible = false
            this.loadCustomerList()
          } else {
            this.$message.error(response.message || '更新失败')
          }
        } else {
          const response = await add(this.customerForm)
          if (response.code === 201) {
            this.$message.success('客户创建成功')
            this.dialogVisible = false
            this.loadCustomerList()
          } else {
            this.$message.error(response.message || '创建失败')
          }
        }
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error('操作失败')
      } finally {
        this.submitLoading = false
      }
    },

    // 删除客户
    async deleteCustomer(row) {
      try {
        await this.$confirm('确定要删除该客户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deletes(row._id)
        if (response.code === 200) {
          this.$message.success('客户删除成功')
          this.loadCustomerList()
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

    // 批量删除
    async handleBatchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要删除的客户')
        return
      }

      try {
        await this.$confirm(`确定要删除选中的 ${this.multipleSelection.length} 个客户吗？`, '批量删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 并行删除
        const deletePromises = this.multipleSelection.map((customer) => deletes(customer._id))
        await Promise.all(deletePromises)

        this.$message.success('批量删除成功')
        this.loadCustomerList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      }
    },

    // 导出数据
    handleExport() {
      this.$message.info('导出功能开发中...')
    },

    // 卡片操作
    handleCardAction(command) {
      if (command.action === 'edit') {
        this.editCustomer(command.data)
      } else if (command.action === 'delete') {
        this.deleteCustomer(command.data)
      }
    },

    // 工具方法
    getTypeText(type) {
      return type === 'company' ? '公司' : '个人'
    },

    getTypeTagType(type) {
      return type === 'company' ? 'primary' : 'success'
    },

    getStatusText(status) {
      return status === 'active' ? '活跃' : '非活跃'
    },

    getStatusTagType(status) {
      return status === 'active' ? 'success' : 'info'
    },

    getCreditTagType(level) {
      const types = {
        A: 'success',
        B: 'primary',
        C: 'warning',
        D: 'danger'
      }
      return types[level] || 'info'
    },

    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }

    .page-description {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
}

// 搜索卡片
.search-card {
  margin-bottom: 20px;

  .search-form {
    margin-bottom: 0;
  }
}

// 工具栏
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 15px;

    .total-info {
      color: #909399;
      font-size: 14px;
    }
  }
}

// 数据卡片
.data-card {
  .el-card__body {
    padding: 20px;
  }
}

// 客户信息样式
.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .customer-avatar {
    width: 40px;
    height: 40px;
    background: #f0f9ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 18px;
      color: #409eff;
    }
  }

  .customer-details {
    flex: 1;

    .customer-name {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .company-name {
      font-size: 12px;
      color: #909399;
      margin-bottom: 6px;
    }

    .customer-tags {
      display: flex;
      gap: 4px;
    }
  }
}

// 联系信息样式
.contact-info {
  .contact-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    font-size: 13px;

    &:last-child {
      margin-bottom: 0;
    }

    i {
      color: #909399;
      width: 14px;
    }
  }
}

// 卡片视图
.card-view {
  .customer-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;

      .customer-avatar {
        width: 50px;
        height: 50px;
        background: #f0f9ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 24px;
          color: #409eff;
        }
      }

      .customer-title {
        flex: 1;

        h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        p {
          margin: 0;
          font-size: 12px;
          color: #909399;
        }
      }

      .card-actions {
        .el-button {
          padding: 8px;
        }
      }
    }

    .card-body {
      padding: 20px;

      .card-tags {
        display: flex;
        gap: 6px;
        margin-bottom: 15px;
        flex-wrap: wrap;
      }

      .card-info {
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          color: #606266;

          &:last-child {
            margin-bottom: 0;
          }

          i {
            color: #909399;
            width: 16px;
          }

          span {
            word-break: break-all;
          }
        }
      }
    }
  }
}

// 分页容器
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// 对话框样式
.customer-dialog {
  .dialog-footer {
    text-align: right;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .customer-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .search-form {
    .el-form-item {
      width: 100%;
      margin-right: 0;
    }
  }

  .card-view {
    .el-col {
      margin-bottom: 0;
    }
  }
}
</style>
