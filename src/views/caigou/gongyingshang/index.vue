<template>
  <div class="supplier-container">
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div slot="header" class="clearfix">
        <span>供应商管理</span>
        <div style="float: right">
          <el-button type="primary" icon="el-icon-plus" @click="showCreateDialog">新增供应商</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="batchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportData">导出数据</el-button>
          <el-button type="info" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </div>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="供应商编号">
          <el-input v-model="searchForm.supplierCode" placeholder="请输入供应商编号" clearable />
        </el-form-item>
        <el-form-item label="供应商名称">
          <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" clearable />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="searchForm.contactPerson" placeholder="请输入联系人" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商类型">
          <el-select v-model="searchForm.supplierType" placeholder="请选择类型" clearable>
            <el-option label="原材料供应商" value="material" />
            <el-option label="设备供应商" value="equipment" />
            <el-option label="服务供应商" value="service" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 供应商表格 -->
    <el-card>
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />

        <el-table-column prop="supplierCode" label="供应商编号" width="120" fixed="left">
          <template slot-scope="scope">
            <i class="el-icon-office-building" />
            <el-link type="primary" @click="viewDetail(scope.row)">{{ scope.row.supplierCode }}</el-link>
          </template>
        </el-table-column>

        <el-table-column prop="shortName" label="简称" width="100" />
        <el-table-column prop="fullName" label="供应商全称" width="200" show-overflow-tooltip />

        <el-table-column prop="supplierType" label="供应商类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeColor(scope.row.supplierType)">{{ getTypeName(scope.row.supplierType) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="telephone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" width="200" show-overflow-tooltip />

        <el-table-column prop="taxRate" label="税率" width="80" align="right">
          <template slot-scope="scope">{{ scope.row.taxRate }}%</template>
        </el-table-column>

        <el-table-column prop="currency" label="货币" width="80" align="center" />

        <el-table-column prop="creditLevel" label="信用等级" width="100" align="center">
          <template slot-scope="scope">
            <el-rate v-model="scope.row.creditLevel" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />

        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button size="mini" @click="editSupplier(scope.row)">编辑</el-button>
            <el-button size="mini" type="warning" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteSupplier(scope.row)">删除</el-button>
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

    <!-- 新建/编辑供应商对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" :before-close="resetForm">
      <el-form ref="supplierForm" :model="supplierForm" :rules="supplierRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编号" prop="supplierCode">
              <el-input v-model="supplierForm.supplierCode" placeholder="请输入供应商编号" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商简称" prop="shortName">
              <el-input v-model="supplierForm.shortName" placeholder="请输入供应商简称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="供应商全称" prop="fullName">
          <el-input v-model="supplierForm.fullName" placeholder="请输入供应商全称" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商类型" prop="supplierType">
              <el-select v-model="supplierForm.supplierType" placeholder="请选择供应商类型" style="width: 100%">
                <el-option label="原材料供应商" value="material" />
                <el-option label="设备供应商" value="equipment" />
                <el-option label="服务供应商" value="service" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="supplierForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="supplierForm.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="telephone">
              <el-input v-model="supplierForm.telephone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="supplierForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传真">
              <el-input v-model="supplierForm.fax" placeholder="请输入传真" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="supplierForm.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="税率(%)" prop="taxRate">
              <el-input-number v-model="supplierForm.taxRate" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="货币" prop="currency">
              <el-select v-model="supplierForm.currency" placeholder="请选择货币" style="width: 100%">
                <el-option label="人民币(RMB)" value="RMB" />
                <el-option label="美元(USD)" value="USD" />
                <el-option label="欧元(EUR)" value="EUR" />
                <el-option label="日元(JPY)" value="JPY" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="信用等级">
              <el-rate v-model="supplierForm.creditLevel" show-text />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="银行名称">
              <el-input v-model="supplierForm.bankName" placeholder="请输入银行名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号">
              <el-input v-model="supplierForm.bankAccount" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="supplierForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSupplier">保存</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="供应商详情" :visible.sync="detailDialogVisible" width="700px">
      <div v-if="currentDetail">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="供应商编号">{{ currentDetail.supplierCode }}</el-descriptions-item>
          <el-descriptions-item label="供应商简称">{{ currentDetail.shortName }}</el-descriptions-item>
          <el-descriptions-item label="供应商全称" :span="2">{{ currentDetail.fullName }}</el-descriptions-item>
          <el-descriptions-item label="供应商类型">{{ getTypeName(currentDetail.supplierType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === 'active' ? 'success' : 'danger'">
              {{ currentDetail.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentDetail.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.telephone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentDetail.email }}</el-descriptions-item>
          <el-descriptions-item label="传真">{{ currentDetail.fax || '--' }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ currentDetail.address }}</el-descriptions-item>
          <el-descriptions-item label="税率">{{ currentDetail.taxRate }}%</el-descriptions-item>
          <el-descriptions-item label="货币">{{ currentDetail.currency }}</el-descriptions-item>
          <el-descriptions-item label="信用等级">
            <el-rate v-model="currentDetail.creditLevel" disabled show-score text-color="#ff9900" />
          </el-descriptions-item>
          <el-descriptions-item label="银行名称">{{ currentDetail.bankName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="银行账号">{{ currentDetail.bankAccount || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '--' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchSupplierList, fetchSupplier, createSupplier, updateSupplier, deleteSupplier, toggleSupplierStatus } from '@/api/supplier'

export default {
  name: 'SupplierManagement',
  data() {
    return {
      loading: false,
      searchForm: {
        supplierCode: '',
        supplierName: '',
        contactPerson: '',
        status: '',
        supplierType: ''
      },
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 对话框相关
      dialogVisible: false,
      dialogTitle: '新增供应商',
      isEdit: false,
      currentEditId: null,
      supplierForm: {
        supplierCode: '',
        shortName: '',
        fullName: '',
        supplierType: '',
        status: 'active',
        contactPerson: '',
        telephone: '',
        email: '',
        fax: '',
        address: '',
        taxRate: 13,
        currency: 'RMB',
        creditLevel: 3,
        bankName: '',
        bankAccount: '',
        remark: ''
      },
      supplierRules: {
        supplierCode: [{ required: true, message: '请输入供应商编号', trigger: 'blur' }],
        shortName: [{ required: true, message: '请输入供应商简称', trigger: 'blur' }],
        fullName: [{ required: true, message: '请输入供应商全称', trigger: 'blur' }],
        supplierType: [{ required: true, message: '请选择供应商类型', trigger: 'change' }],
        contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        telephone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        taxRate: [{ required: true, message: '请输入税率', trigger: 'blur' }],
        currency: [{ required: true, message: '请选择货币', trigger: 'change' }]
      },

      // 详情对话框
      detailDialogVisible: false,
      currentDetail: null
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.pageSize,
          ...this.searchForm
        }

        const response = await fetchSupplierList(params)
        this.tableData = response.data.data
        this.pagination.total = response.data.total
        this.pagination.currentPage = response.data.currentPage
        this.pagination.pageSize = response.data.pageSize
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
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
        supplierCode: '',
        supplierName: '',
        contactPerson: '',
        status: '',
        supplierType: ''
      }
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 刷新数据
    refreshData() {
      this.loadData()
    },

    // 分页
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadData()
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadData()
    },

    // 选择行
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 获取类型颜色
    getTypeColor(type) {
      const colorMap = {
        material: '',
        equipment: 'success',
        service: 'warning',
        other: 'info'
      }
      return colorMap[type] || ''
    },

    // 获取类型名称
    getTypeName(type) {
      const nameMap = {
        material: '原材料供应商',
        equipment: '设备供应商',
        service: '服务供应商',
        other: '其他'
      }
      return nameMap[type] || type
    },

    // 显示新建对话框
    showCreateDialog() {
      this.dialogTitle = '新增供应商'
      this.isEdit = false
      this.currentEditId = null
      this.supplierForm = {
        supplierCode: '',
        shortName: '',
        fullName: '',
        supplierType: '',
        status: 'active',
        contactPerson: '',
        telephone: '',
        email: '',
        fax: '',
        address: '',
        taxRate: 13,
        currency: 'RMB',
        creditLevel: 3,
        bankName: '',
        bankAccount: '',
        remark: ''
      }
      this.dialogVisible = true
    },

    // 编辑供应商
    async editSupplier(row) {
      this.dialogTitle = '编辑供应商'
      this.isEdit = true
      this.currentEditId = row._id || row.id

      try {
        const response = await fetchSupplier(this.currentEditId)
        this.supplierForm = { ...response.data }
        this.dialogVisible = true
      } catch (error) {
        console.error('获取供应商详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 保存供应商
    async saveSupplier() {
      this.$refs.supplierForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await updateSupplier(this.currentEditId, this.supplierForm)
              this.$message.success('更新成功')
            } else {
              await createSupplier(this.supplierForm)
              this.$message.success('创建成功')
            }

            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('保存供应商失败:', error)
            this.$message.error('保存失败')
          }
        }
      })
    },

    // 删除供应商
    async deleteSupplier(row) {
      this.$confirm('确认要删除该供应商吗？删除后不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteSupplier(row._id || row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          console.error('删除供应商失败:', error)
          this.$message.error('删除失败')
        }
      })
    },

    // 批量删除
    async batchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的供应商')
        return
      }

      this.$confirm(`确认要删除选中的 ${this.selectedRows.length} 个供应商吗？删除后不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const deletePromises = this.selectedRows.map((row) => deleteSupplier(row._id || row.id))
          await Promise.all(deletePromises)
          this.$message.success('批量删除成功')
          this.loadData()
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      })
    },

    // 切换状态
    async toggleStatus(row) {
      const action = row.status === 'active' ? '禁用' : '启用'
      this.$confirm(`确认要${action}该供应商吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await toggleSupplierStatus(row._id || row.id, {
            status: row.status === 'active' ? 'inactive' : 'active'
          })
          this.$message.success(`${action}成功`)
          this.loadData()
        } catch (error) {
          console.error(`${action}失败:`, error)
          this.$message.error(`${action}失败`)
        }
      })
    },

    // 查看详情
    async viewDetail(row) {
      try {
        const response = await fetchSupplier(row._id || row.id)
        this.currentDetail = response.data
        this.detailDialogVisible = true
      } catch (error) {
        console.error('获取供应商详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 导出数据
    exportData() {
      this.$message.success('导出功能开发中')
    },

    // 重置表单
    resetForm() {
      if (this.$refs.supplierForm) {
        this.$refs.supplierForm.resetFields()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.supplier-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
