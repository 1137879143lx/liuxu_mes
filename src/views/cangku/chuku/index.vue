<template>
  <div class="outbound-container">
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div slot="header" class="clearfix">
        <span>出库管理</span>
        <el-button style="float: right" type="primary" @click="showCreateDialog">新建出库单</el-button>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.outboundNo" placeholder="请输入出库单号" clearable />
        </el-form-item>
        <el-form-item label="申请部门">
          <el-input v-model="searchForm.department" placeholder="请输入申请部门" clearable />
        </el-form-item>
        <el-form-item label="出库类型">
          <el-select v-model="searchForm.outboundType" placeholder="请选择出库类型" clearable>
            <el-option label="生产领料" value="production" />
            <el-option label="销售出库" value="sale" />
            <el-option label="调拨出库" value="transfer" />
            <el-option label="退货出库" value="return" />
            <el-option label="报废出库" value="scrap" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已出库" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 出库表格 -->
    <el-card>
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="outboundNo" label="出库单号" width="150" fixed="left">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewDetail(scope.row)">{{ scope.row.outboundNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="outboundType" label="出库类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeColor(scope.row.outboundType)">{{ getTypeName(scope.row.outboundType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="申请部门" width="120" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="warehouse" label="出库仓库" width="120" />
        <el-table-column prop="totalRequestQuantity" label="申请数量" width="100" align="right" />
        <el-table-column prop="totalActualQuantity" label="实际数量" width="100" align="right" />
        <el-table-column prop="urgentLevel" label="紧急程度" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getUrgentColor(scope.row.urgentLevel)">{{ getUrgentText(scope.row.urgentLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusColor(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 'pending'" size="mini" type="warning" @click="approveOutbound(scope.row)">审核</el-button>
            <el-button v-if="scope.row.status === 'approved'" size="mini" type="success" @click="confirmOutbound(scope.row)">出库</el-button>
            <el-button v-if="scope.row.status === 'pending'" size="mini" @click="editOutbound(scope.row)">编辑</el-button>
            <el-dropdown v-if="scope.row.status !== 'completed'" @command="handleCommand">
              <el-button size="mini" type="info">
                更多
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ action: 'cancel', row: scope.row }">取消</el-dropdown-item>
                <el-dropdown-item :command="{ action: 'delete', row: scope.row }">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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

    <!-- 新建/编辑出库单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1200px" :before-close="resetForm">
      <el-form ref="outboundForm" :model="outboundForm" :rules="outboundRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出库类型" prop="outboundType">
              <el-select v-model="outboundForm.outboundType" placeholder="请选择出库类型" style="width: 100%">
                <el-option label="生产领料" value="production" />
                <el-option label="销售出库" value="sale" />
                <el-option label="调拨出库" value="transfer" />
                <el-option label="退货出库" value="return" />
                <el-option label="报废出库" value="scrap" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请部门" prop="department">
              <el-input v-model="outboundForm.department" placeholder="请输入申请部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="outboundForm.applicant" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库仓库" prop="warehouse">
              <el-select v-model="outboundForm.warehouse" placeholder="请选择出库仓库" style="width: 100%">
                <el-option label="原料仓" value="原料仓" />
                <el-option label="成品仓" value="成品仓" />
                <el-option label="半成品仓" value="半成品仓" />
                <el-option label="耗材仓" value="耗材仓" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急程度">
              <el-select v-model="outboundForm.urgentLevel" placeholder="请选择紧急程度" style="width: 100%">
                <el-option label="普通" value="normal" />
                <el-option label="紧急" value="urgent" />
                <el-option label="特急" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="outboundForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>

        <!-- 物料明细 -->
        <el-form-item label="出库物料">
          <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="addMaterial">添加物料</el-button>
          </div>
          <el-table :data="outboundForm.materials" border style="width: 100%">
            <el-table-column label="物料编码" width="180">
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.materialCode"
                  placeholder="请选择物料"
                  @change="onMaterialChange(scope.$index, scope.row.materialCode)"
                  filterable
                  :loading="loadingMaterials"
                  style="width: 100%">
                  <el-option
                    v-for="material in materialOptions"
                    :key="material.code"
                    :label="`${material.code} - ${material.name}`"
                    :value="material.code">
                    <span style="float: left">{{ material.code }} - {{ material.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">库存: {{ material.currentStock }}{{ material.unit }}</span>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>

            <!-- 添加当前库存列 -->
            <el-table-column label="当前库存" width="100">
              <template slot-scope="scope">
                <span :class="scope.row.currentStock > 0 ? 'text-success' : 'text-danger'">
                  {{ scope.row.currentStock || 0 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.materialName" disabled />
              </template>
            </el-table-column>
            <el-table-column label="规格型号" width="120">
              <template slot-scope="scope">
                <el-input v-model="scope.row.specification" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="80">
              <template slot-scope="scope">
                <el-input v-model="scope.row.unit" disabled />
              </template>
            </el-table-column>
            <el-table-column label="申请数量" width="120">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.requestQuantity"
                  :min="0"
                  :max="scope.row.currentStock || 999999"
                  :precision="2"
                  controls-position="right"
                  style="width: 100%"
                  @change="checkStockLimit(scope.$index)" />
              </template>
            </el-table-column>
            <el-table-column label="备注" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.remark" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="removeMaterial(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOutbound">保存</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="出库单详情" :visible.sync="detailDialogVisible" width="800px">
      <div v-if="currentDetail">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="出库单号">{{ currentDetail.outboundNo }}</el-descriptions-item>
          <el-descriptions-item label="出库类型">{{ getTypeName(currentDetail.outboundType) }}</el-descriptions-item>
          <el-descriptions-item label="申请部门">{{ currentDetail.department }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentDetail.applicant }}</el-descriptions-item>
          <el-descriptions-item label="出库仓库">{{ currentDetail.warehouse }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusColor(currentDetail.status)">{{ getStatusName(currentDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentDetail.remark || '--' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 物料明细 -->
        <div style="margin-top: 20px">
          <h4>物料明细</h4>
          <el-table :data="currentDetail.materials" border>
            <el-table-column prop="materialCode" label="物料编码" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="specification" label="规格型号" />
            <el-table-column prop="unit" label="单位" />
            <el-table-column prop="requestQuantity" label="申请数量" />
            <el-table-column prop="actualQuantity" label="实际数量" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchOutboundList,
  fetchOutbound,
  createOutbound,
  updateOutbound,
  deleteOutbound,
  approveOutbound,
  confirmOutbound,
  cancelOutbound
} from '@/api/outbound'
import { fetchInventoryList } from '@/api/inventory'

export default {
  name: 'WarehouseOutbound',
  data() {
    return {
      loading: false,
      searchForm: {
        outboundNo: '',
        department: '',
        outboundType: '',
        status: '',
        dateRange: []
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 对话框相关
      dialogVisible: false,
      dialogTitle: '新建出库单',
      isEdit: false,
      currentEditId: null,
      outboundForm: {
        outboundType: '',
        department: '',
        applicant: '',
        warehouse: '',
        urgentLevel: 'normal',
        materials: [],
        remark: ''
      },
      outboundRules: {
        outboundType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
        department: [{ required: true, message: '请输入申请部门', trigger: 'blur' }],
        applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
        warehouse: [{ required: true, message: '请选择出库仓库', trigger: 'change' }]
      },

      // 物料选项 - 从库存中获取
      materialOptions: [],
      loadingMaterials: false,

      // 详情对话框
      detailDialogVisible: false,
      currentDetail: null
    }
  },

  mounted() {
    this.loadData()
  },

  watch: {
    // 监听仓库变化，重新获取物料列表
    'outboundForm.warehouse'(newWarehouse) {
      if (newWarehouse) {
        this.loadMaterialOptions(newWarehouse)
      } else {
        this.materialOptions = []
      }
    }
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

        // 处理日期范围
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
          delete params.dateRange
        }

        const response = await fetchOutboundList(params)
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

    // 根据选择的仓库加载物料选项
    async loadMaterialOptions(warehouse) {
      this.loadingMaterials = true
      try {
        const params = {
          warehouse: warehouse,
          page: 1,
          limit: 1000, // 获取所有物料
          stockStatus: 'normal' // 只获取正常状态的库存
        }

        const response = await fetchInventoryList(params)
        this.materialOptions = response.data.data.map((item) => ({
          code: item.materialCode,
          name: item.materialName,
          specification: item.specification,
          unit: item.unit,
          currentStock: item.currentStock,
          safetyStock: item.safetyStock,
          warehouse: item.warehouse
        }))

        console.log('加载物料选项:', this.materialOptions)
      } catch (error) {
        console.error('获取物料选项失败:', error)
        this.$message.error('获取物料选项失败')
        this.materialOptions = []
      } finally {
        this.loadingMaterials = false
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
        outboundNo: '',
        department: '',
        outboundType: '',
        status: '',
        dateRange: []
      }
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 导出数据
    exportData() {
      this.$message.success('导出功能开发中')
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

    // 获取类型颜色
    getTypeColor(type) {
      const colorMap = {
        production: '',
        sale: 'success',
        transfer: 'warning',
        return: 'info',
        scrap: 'danger'
      }
      return colorMap[type] || ''
    },

    // 获取类型名称
    getTypeName(type) {
      const nameMap = {
        production: '生产领料',
        sale: '销售出库',
        transfer: '调拨出库',
        return: '退货出库',
        scrap: '报废出库'
      }
      return nameMap[type] || type
    },

    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        pending: 'warning',
        approved: 'info',
        completed: 'success',
        cancelled: 'danger'
      }
      return colorMap[status] || ''
    },

    // 获取状态名称
    getStatusName(status) {
      const nameMap = {
        pending: '待审核',
        approved: '已审核',
        completed: '已出库',
        cancelled: '已取消'
      }
      return nameMap[status] || status
    },

    // 获取紧急程度颜色
    getUrgentColor(level) {
      const colorMap = {
        normal: '',
        urgent: 'warning',
        emergency: 'danger'
      }
      return colorMap[level] || ''
    },

    // 获取紧急程度文本
    getUrgentText(level) {
      const textMap = {
        normal: '普通',
        urgent: '紧急',
        emergency: '特急'
      }
      return textMap[level] || level
    },

    // 显示新建对话框
    showCreateDialog() {
      this.dialogTitle = '新建出库单'
      this.isEdit = false
      this.currentEditId = null
      this.outboundForm = {
        outboundType: '',
        department: '',
        applicant: '',
        warehouse: '',
        urgentLevel: 'normal',
        materials: [],
        remark: ''
      }
      this.materialOptions = [] // 重置物料选项
      this.dialogVisible = true
    },

    // 添加物料
    addMaterial() {
      if (!this.outboundForm.warehouse) {
        this.$message.warning('请先选择出库仓库')
        return
      }

      this.outboundForm.materials.push({
        materialCode: '',
        materialName: '',
        specification: '',
        unit: '',
        requestQuantity: 0,
        currentStock: 0, // 当前库存
        remark: ''
      })
    },

    // 删除物料
    removeMaterial(index) {
      this.outboundForm.materials.splice(index, 1)
    },

    // 物料选择改变
    onMaterialChange(index, materialCode) {
      const material = this.materialOptions.find((m) => m.code === materialCode)
      if (material) {
        this.outboundForm.materials[index].materialName = material.name
        this.outboundForm.materials[index].specification = material.specification
        this.outboundForm.materials[index].unit = material.unit
        this.outboundForm.materials[index].currentStock = material.currentStock

        // 提示库存信息
        this.$message.info(`当前库存：${material.currentStock} ${material.unit}`)
      }
    },

    // 编辑出库单
    async editOutbound(row) {
      this.dialogTitle = '编辑出库单'
      this.isEdit = true
      this.currentEditId = row._id || row.id

      try {
        const response = await fetchOutbound(this.currentEditId)
        this.outboundForm = {
          ...response.data,
          materials: response.data.materials || []
        }

        // 加载对应仓库的物料选项
        if (this.outboundForm.warehouse) {
          await this.loadMaterialOptions(this.outboundForm.warehouse)

          // 更新物料的当前库存信息
          this.outboundForm.materials.forEach((material) => {
            const materialOption = this.materialOptions.find((m) => m.code === material.materialCode)
            if (materialOption) {
              material.currentStock = materialOption.currentStock
            }
          })
        }

        this.dialogVisible = true
      } catch (error) {
        console.error('获取出库单详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 保存出库单
    async saveOutbound() {
      this.$refs.outboundForm.validate(async (valid) => {
        if (valid) {
          if (this.outboundForm.materials.length === 0) {
            this.$message.warning('请添加出库物料')
            return
          }

          // 验证物料信息和库存
          const invalidMaterials = this.outboundForm.materials.some((material) => {
            if (!material.materialCode || !material.materialName || !material.unit || material.requestQuantity <= 0) {
              return true
            }

            // 检查库存是否充足
            if (material.requestQuantity > material.currentStock) {
              this.$message.error(`物料 ${material.materialCode} 申请数量(${material.requestQuantity})超出库存(${material.currentStock})`)
              return true
            }

            return false
          })

          if (invalidMaterials) {
            this.$message.warning('请完善物料信息，确保编码、名称、单位不为空且申请数量不超出库存')
            return
          }

          try {
            const submitData = {
              ...this.outboundForm,
              operator: '当前用户',
              operatorId: 'user_id'
            }

            if (this.isEdit) {
              await updateOutbound(this.currentEditId, submitData)
              this.$message.success('更新成功')
            } else {
              await createOutbound(submitData)
              this.$message.success('创建成功')
            }

            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('保存出库单失败:', error)
            let errorMessage = '保存失败'
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message
            }
            this.$message.error(errorMessage)
          }
        }
      })
    },

    // 审核出库单
    async approveOutbound(row) {
      this.$confirm('确认要审核通过该出库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await approveOutbound(row._id || row.id, {
            approver: '当前用户',
            approverId: 'user_id'
          })
          this.$message.success('审核成功')
          this.loadData()
        } catch (error) {
          console.error('审核失败:', error)
          this.$message.error('审核失败')
        }
      })
    },

    // 确认出库
    async confirmOutbound(row) {
      this.$confirm('确认要进行出库操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await confirmOutbound(row._id || row.id)
          this.$message.success('出库成功')
          this.loadData()
        } catch (error) {
          console.error('出库失败:', error)
          let errorMessage = '出库失败'
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          }
          this.$message.error(errorMessage)
        }
      })
    },

    // 查看详情
    async viewDetail(row) {
      try {
        const response = await fetchOutbound(row._id || row.id)
        this.currentDetail = response.data
        this.detailDialogVisible = true
      } catch (error) {
        console.error('获取出库单详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      const { action, row } = command
      switch (action) {
        case 'cancel':
          this.handleCancelOutbound(row)
          break
        case 'delete':
          this.handleDeleteOutbound(row)
          break
      }
    },

    // 取消出库单
    async handleCancelOutbound(row) {
      this.$prompt('请输入取消原因', '取消出库单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return '请输入取消原因'
          }
          return true
        }
      }).then(async ({ value }) => {
        try {
          await cancelOutbound(row._id || row.id, { reason: value })
          this.$message.success('取消成功')
          this.loadData()
        } catch (error) {
          console.error('取消出库单失败:', error)
          this.$message.error('取消失败')
        }
      })
    },

    // 删除出库单
    async handleDeleteOutbound(row) {
      this.$confirm('确认要删除该出库单吗？删除后不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteOutbound(row._id || row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          console.error('删除出库单失败:', error)
          this.$message.error('删除失败')
        }
      })
    },

    // 重置表单
    resetForm() {
      if (this.$refs.outboundForm) {
        this.$refs.outboundForm.resetFields()
      }
    },
    // 检查库存限制
    checkStockLimit(index) {
      const material = this.outboundForm.materials[index]
      if (material.requestQuantity > material.currentStock) {
        this.$message.warning(`申请数量不能超过当前库存 ${material.currentStock}`)
        this.$nextTick(() => {
          material.requestQuantity = material.currentStock
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.outbound-container {
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

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
