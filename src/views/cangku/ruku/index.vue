<template>
  <div class="warehouse-in-container">
    <!-- 顶部操作栏 -->
    <el-card class="header-card">
      <div slot="header" class="clearfix">
        <span>入库管理</span>
        <el-button style="float: right" type="primary" icon="el-icon-plus" @click="showCreateDialog">新建入库单</el-button>
      </div>

      <!-- 搜索表单 -->
      <el-form :inline="true" size="small" :model="searchForm" class="search-form">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.inboundNo" placeholder="请输入入库单号" clearable />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="searchForm.supplier" placeholder="请选择或输入供应商" clearable filterable allow-create default-first-option>
            <el-option label="供应商A" value="供应商A" />
            <el-option label="供应商B" value="供应商B" />
            <el-option label="供应商C" value="供应商C" />
            <el-option label="深圳科技有限公司" value="深圳科技有限公司" />
            <el-option label="上海电子材料公司" value="上海电子材料公司" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库类型">
          <el-select v-model="searchForm.inboundType" placeholder="请选择类型" clearable>
            <el-option label="采购入库" value="purchase" />
            <el-option label="生产入库" value="production" />
            <el-option label="退货入库" value="return" />
            <el-option label="调拨入库" value="transfer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待入库" value="pending" />
            <el-option label="已入库" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库日期">
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

    <!-- 入库单列表 -->
    <el-card class="table-card">
      <el-table size="small" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="inboundNo" label="入库单号" width="150" fixed="left">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewDetail(scope.row)">{{ scope.row.inboundNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="inboundType" label="入库类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeColor(scope.row.inboundType)">{{ getTypeName(scope.row.inboundType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150" show-overflow-tooltip />
        <el-table-column prop="totalQuantity" label="总数量" width="100" align="right" />
        <el-table-column prop="totalAmount" label="总金额" width="120" align="right">
          <template slot-scope="scope">¥{{ scope.row.totalAmount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="warehouse" label="入库仓库" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusColor(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" align="center" />
        <el-table-column prop="inboundTime" label="入库时间" width="150" align="center" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 'pending'" size="mini" type="primary" @click="confirmInbound(scope.row)">确认入库</el-button>
            <el-button size="mini" @click="editInbound(scope.row)">编辑</el-button>
            <el-dropdown style="margin-left: 10px" @command="handleCommand">
              <el-button size="mini">
                更多
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ action: 'print', row: scope.row }">打印</el-dropdown-item>
                <el-dropdown-item :command="{ action: 'cancel', row: scope.row }" divided>取消</el-dropdown-item>
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

    <!-- 新建/编辑入库单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" @close="resetForm">
      <el-form ref="inboundForm" :model="inboundForm" :rules="inboundRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库单号" prop="inboundNo">
              <el-input v-model="inboundForm.inboundNo" placeholder="系统自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库类型" prop="inboundType">
              <el-select v-model="inboundForm.inboundType" placeholder="请选择入库类型" style="width: 100%">
                <el-option label="采购入库" value="purchase" />
                <el-option label="生产入库" value="production" />
                <el-option label="退货入库" value="return" />
                <el-option label="调拨入库" value="transfer" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-select
                v-model="inboundForm.supplier"
                placeholder="请选择或输入供应商"
                style="width: 100%"
                filterable
                allow-create
                default-first-option>
                <el-option label="供应商A" value="供应商A" />
                <el-option label="供应商B" value="供应商B" />
                <el-option label="供应商C" value="供应商C" />
                <el-option label="深圳科技有限公司" value="深圳科技有限公司" />
                <el-option label="上海电子材料公司" value="上海电子材料公司" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库仓库" prop="warehouse">
              <el-select v-model="inboundForm.warehouse" placeholder="请选择仓库" style="width: 100%">
                <el-option label="原料仓" value="原料仓" />
                <el-option label="成品仓" value="成品仓" />
                <el-option label="半成品仓" value="半成品仓" />
                <el-option label="耗材仓" value="耗材仓" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="入库物料">
              <el-button type="primary" size="small" @click="addMaterial">添加物料</el-button>
              <!-- 新建/编辑入库单对话框中的物料表格 -->
              <el-table :data="inboundForm.materials" border style="margin-top: 10px">
                <el-table-column label="物料编码" width="150">
                  <template slot-scope="scope">
                    <el-select
                      v-model="scope.row.materialCode"
                      filterable
                      allow-create
                      default-first-option
                      placeholder="选择或输入物料编码"
                      @change="onMaterialChange(scope.$index, scope.row.materialCode)">
                      <el-option v-for="material in materialOptions" :key="material.code" :label="material.code" :value="material.code" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="物料名称" width="180">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.materialName" placeholder="请输入物料名称" />
                  </template>
                </el-table-column>
                <el-table-column label="规格" width="120">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.specification" placeholder="请输入规格" />
                  </template>
                </el-table-column>
                <el-table-column label="版本" width="100">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.version" placeholder="请输入版本" />
                  </template>
                </el-table-column>
                <el-table-column label="单位" width="100">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.unit" placeholder="选择或输入单位" filterable allow-create default-first-option>
                      <el-option label="个" value="个" />
                      <el-option label="片" value="片" />
                      <el-option label="套" value="套" />
                      <el-option label="米" value="米" />
                      <el-option label="公斤" value="公斤" />
                      <el-option label="箱" value="箱" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="入库数量" width="120">
                  <template slot-scope="scope">
                    <el-input-number
                      v-model="scope.row.quantity"
                      :min="0"
                      :precision="2"
                      controls-position="right"
                      style="width: 100%"
                      placeholder="数量" />
                  </template>
                </el-table-column>
                <el-table-column label="单价" width="120">
                  <template slot-scope="scope">
                    <el-input-number
                      v-model="scope.row.unitPrice"
                      :min="0"
                      :precision="2"
                      controls-position="right"
                      style="width: 100%"
                      placeholder="单价" />
                  </template>
                </el-table-column>
                <el-table-column label="金额" width="120">
                  <template slot-scope="scope">
                    {{ (scope.row.quantity * scope.row.unitPrice).toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column label="备注" width="150">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.remark" placeholder="备注信息" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template slot-scope="scope">
                    <el-button type="text" @click="removeMaterial(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="inboundForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInbound">保存</el-button>
        <el-button type="success" @click="saveAndConfirm">保存并入库</el-button>
      </div>
    </el-dialog>

    <!-- 入库详情对话框 -->
    <el-dialog title="入库单详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentDetail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="入库单号">{{ currentDetail.inboundNo }}</el-descriptions-item>
          <el-descriptions-item label="入库类型">{{ getTypeName(currentDetail.inboundType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusColor(currentDetail.status)">{{ getStatusName(currentDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentDetail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="入库仓库">{{ currentDetail.warehouse }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="入库时间">{{ currentDetail.inboundTime }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ currentDetail.totalAmount.toFixed(2) }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="margin: 20px 0 10px 0">入库物料明细</h3>
        <!-- 入库详情对话框中的物料表格 -->
        <el-table :data="currentDetail.materials || []" border>
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="180" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="入库数量" width="100" align="right" />
          <el-table-column prop="unitPrice" label="单价" width="100" align="right" />
          <el-table-column label="金额" width="120" align="right">
            <template slot-scope="scope">
              {{ (scope.row.quantity * scope.row.unitPrice).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        </el-table>

        <div v-if="currentDetail.remark" style="margin-top: 20px">
          <h4>备注信息</h4>
          <p>{{ currentDetail.remark }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  fetchInboundList,
  fetchInbound,
  createInbound,
  updateInbound,
  deleteInbound,
  batchDeleteInbound,
  confirmInbound,
  cancelInbound,
  fetchInboundStatistics
} from '../../../api/inbounds'

export default {
  name: 'WarehouseInbound',
  data() {
    return {
      loading: false,
      searchForm: {
        inboundNo: '',
        supplier: '',
        inboundType: '',
        status: '',
        dateRange: []
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
      dialogTitle: '新建入库单',
      isEdit: false,
      currentEditId: null,
      inboundForm: {
        inboundNo: '',
        inboundType: '',
        supplier: '',
        warehouse: '',
        materials: [],
        remark: ''
      },
      // inboundRules: {
      //     inboundType: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
      //     supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
      //     warehouse: [{ required: true, message: '请选择入库仓库', trigger: 'change' }]
      // },

      // // 物料选项
      // materialOptions: [
      //     { code: 'M001', name: '电阻器10K', specification: '0603', unit: '个' },
      //     { code: 'M002', name: '电容器100uF', specification: '贴片', unit: '个' },
      //     { code: 'M003', name: 'PCB板', specification: '双层板', unit: '片' }
      // ],

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

        // 处理日期范围 - 这里必须删除dateRange并转换为startDate和endDate
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
          delete params.dateRange // 这行被注释了，需要取消注释
        }

        const response = await fetchInboundList(params)
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
        inboundNo: '',
        supplier: '',
        inboundType: '',
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

    // 选择改变
    handleSelectionChange(selection) {
      this.selectedRows = selection
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
        purchase: '',
        production: 'success',
        return: 'warning',
        transfer: 'info'
      }
      return colorMap[type] || ''
    },

    // 获取类型名称
    getTypeName(type) {
      const nameMap = {
        purchase: '采购入库',
        production: '生产入库',
        return: '退货入库',
        transfer: '调拨入库'
      }
      return nameMap[type] || type
    },

    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        pending: 'warning',
        completed: 'success',
        cancelled: 'danger'
      }
      return colorMap[status] || ''
    },

    // 获取状态名称
    getStatusName(status) {
      const nameMap = {
        pending: '待入库',
        completed: '已入库',
        cancelled: '已取消'
      }
      return nameMap[status] || status
    },

    // 修改表单重置，确保版本字段也被重置
    showCreateDialog() {
      this.dialogTitle = '新建入库单'
      this.isEdit = false
      this.currentEditId = null
      this.inboundForm = {
        inboundNo: '',
        inboundType: '',
        supplier: '',
        warehouse: '',
        materials: [],
        remark: ''
      }
      this.dialogVisible = true
    },

    // 添加物料
    // 修改 addMaterial 方法，增加版本字段
    addMaterial() {
      this.inboundForm.materials.push({
        materialCode: '',
        materialName: '',
        specification: '',
        version: '', // 新增版本字段
        unit: '',
        quantity: 0,
        unitPrice: 0,
        remark: ''
      })
    },

    // 删除物料
    removeMaterial(index) {
      this.inboundForm.materials.splice(index, 1)
    },

    // 物料选择改变
    // 修改 onMaterialChange 方法，处理版本信息
    onMaterialChange(index, materialCode) {
      const material = this.materialOptions.find((m) => m.code === materialCode)
      if (material) {
        this.inboundForm.materials[index].materialName = material.name
        this.inboundForm.materials[index].specification = material.specification
        this.inboundForm.materials[index].version = material.version || '' // 新增版本处理
        this.inboundForm.materials[index].unit = material.unit
      }
    },

    // 编辑入库单
    async editInbound(row) {
      this.dialogTitle = '编辑入库单'
      this.isEdit = true
      this.currentEditId = row._id || row.id

      try {
        const response = await fetchInbound(this.currentEditId)
        this.inboundForm = {
          ...response.data,
          materials: response.data.materials || []
        }
        this.dialogVisible = true
      } catch (error) {
        console.error('获取入库单详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 修改确认入库方法
    async confirmInbound(row) {
      this.$confirm('确认要对该入库单进行入库操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            console.log('开始确认入库:', row)

            const response = await confirmInbound(row._id || row.id)

            console.log('入库响应:', response)

            if (response.code === 200) {
              this.$message.success('入库成功')
              this.loadData()
            } else {
              this.$message.error(response.message || '入库失败')
            }
          } catch (error) {
            console.error('确认入库失败:', error)

            // 显示详细错误信息
            let errorMessage = '入库失败'
            if (error.response && error.response.data) {
              errorMessage = error.response.data.message || error.response.data.error || errorMessage
            } else if (error.message) {
              errorMessage = error.message
            }

            this.$message.error(errorMessage)
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    },

    // 保存入库单
    async saveInbound() {
      this.$refs.inboundForm.validate(async (valid) => {
        if (valid) {
          if (this.inboundForm.materials.length === 0) {
            this.$message.warning('请添加入库物料')
            return
          }

          const invalidMaterials = this.inboundForm.materials.some(
            (material) => !material.materialCode || !material.materialName || !material.unit || material.quantity <= 0
          )

          if (invalidMaterials) {
            this.$message.warning('请完善物料信息，确保编码、名称、单位不为空且数量大于0')
            return
          }

          try {
            const submitData = {
              ...this.inboundForm,
              operator: '当前用户',
              operatorId: 'user_id'
            }

            if (this.isEdit) {
              await updateInbound(this.currentEditId, submitData)
              this.$message.success('更新成功')
            } else {
              await createInbound(submitData)
              this.$message.success('创建成功')
            }

            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('保存入库单失败:', error)
            this.$message.error('保存失败')
          }
        }
      })
    },

    // 保存并确认入库
    async saveAndConfirm() {
      this.$refs.inboundForm.validate(async (valid) => {
        if (valid) {
          if (this.inboundForm.materials.length === 0) {
            this.$message.warning('请添加入库物料')
            return
          }

          const invalidMaterials = this.inboundForm.materials.some(
            (material) => !material.materialCode || !material.materialName || !material.unit || material.quantity <= 0
          )

          if (invalidMaterials) {
            this.$message.warning('请完善物料信息')
            return
          }

          try {
            const submitData = {
              ...this.inboundForm,
              operator: '当前用户',
              operatorId: 'user_id'
            }
            // 如果是编辑状态，使用当前编辑的ID，否则创建新的入库单
            //从登录用户获取操作人信息

            let inboundId
            if (this.isEdit) {
              await updateInbound(this.currentEditId, submitData)
              inboundId = this.currentEditId
            } else {
              const response = await createInbound(submitData)
              inboundId = response.data._id
            }

            // 确认入库
            await confirmInbound(inboundId)
            this.$message.success('保存并入库成功')
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('保存并入库失败:', error)

            this.$message.error('操作失败', error)
          }
        }
      })
    },

    // 重置表单
    resetForm() {
      if (this.$refs.inboundForm) {
        this.$refs.inboundForm.resetFields()
      }
    },

    // 查看详情
    async viewDetail(row) {
      try {
        const response = await fetchInbound(row._id || row.id)
        this.currentDetail = response.data
        this.detailDialogVisible = true
      } catch (error) {
        console.error('获取入库单详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      const { action, row } = command
      switch (action) {
        case 'print':
          this.$message.info('打印功能开发中')
          break
        case 'cancel':
          this.handleCancelInbound(row)
          break
      }
    },

    // 取消入库单
    async handleCancelInbound(row) {
      this.$prompt('请输入取消原因', '取消入库单', {
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
          await cancelInbound(row._id || row.id, { reason: value })
          this.$message.success('取消成功')
          this.loadData()
        } catch (error) {
          console.error('取消入库单失败:', error)
          this.$message.error('取消失败')
        }
      })
    },

    // 批量删除
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的数据')
        return
      }

      this.$confirm(`确认要删除选中的${this.selectedRows.length}条记录吗？`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedRows.map((row) => row._id || row.id).join(',')
          await batchDeleteInbound(ids)
          this.$message.success('批量删除成功')
          this.loadData()
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.warehouse-in-container {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.search-form {
  .el-form-item {
    margin-bottom: 10px;
  }
}

.table-card {
  .el-table {
    .el-link {
      font-weight: bold;
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style>
