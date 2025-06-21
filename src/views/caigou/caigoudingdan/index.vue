<template>
  <div class="caigoudingdan">
    <el-card class="search-card" shadow="never">
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form" size="small">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="searchForm.supplier" placeholder="请输入供应商" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="执行中" value="executing" />
            <el-option label="部分到货" value="partial" />
            <el-option label="全部到货" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期">
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
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <!-- 操作按钮 -->
      <div class="table-header">
        <div class="table-title">采购订单列表</div>
        <div class="table-actions">
          <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog">新增订单</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportOrders">导出</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单编号" width="160">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewDetail(scope.row)" :underline="false">
              {{ scope.row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template slot-scope="scope">¥{{ formatMoney(scope.row.totalAmount) }}</template>
        </el-table-column>

        <el-table-column prop="orderDate" label="下单日期" width="110" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.orderDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="expectedDate" label="期望到货日期" width="120" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.expectedDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="creator" label="创建人" width="100" />

        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="viewDetail(scope.row)">详情</el-button>

            <el-button v-if="scope.row.status === 'pending'" size="mini" type="warning" @click="editOrder(scope.row)">编辑</el-button>

            <el-button v-if="scope.row.status === 'pending'" size="mini" type="success" @click="confirmOrder(scope.row)">确认</el-button>

            <el-button
              v-if="['confirmed', 'executing', 'partial'].includes(scope.row.status)"
              size="mini"
              type="info"
              @click="receiveGoods(scope.row)">
              收货
            </el-button>

            <el-button v-if="scope.row.status === 'pending'" size="mini" type="danger" @click="cancelOrder(scope.row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1200px" :close-on-click-modal="false">
      <el-form ref="orderForm" :model="orderForm" :rules="orderRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="orderForm.orderNo" placeholder="系统自动生成" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="orderForm.supplier" placeholder="请输入供应商名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="orderForm.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="orderForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期望到货日期" prop="expectedDate">
              <el-date-picker
                v-model="orderForm.expectedDate"
                type="date"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="urgency">
              <el-select v-model="orderForm.urgency" placeholder="请选择紧急程度" style="width: 100%">
                <el-option label="普通" value="normal" />
                <el-option label="紧急" value="urgent" />
                <el-option label="特急" value="emergency" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="收货地址" prop="deliveryAddress">
          <el-input v-model="orderForm.deliveryAddress" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>

        <!-- 物料明细 -->
        <el-form-item label="物料明细">
          <div class="items-header">
            <el-button type="primary" size="small" icon="el-icon-plus" @click="addItem">添加物料</el-button>
          </div>
          <el-table :data="orderForm.items" border size="small" style="width: 100%">
            <el-table-column label="物料编码" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.materialCode" placeholder="物料编码" @blur="queryMaterialInfo(scope.row, scope.$index)" />
              </template>
            </el-table-column>
            <el-table-column label="物料名称" width="200">
              <template slot-scope="scope">
                <el-input v-model="scope.row.materialName" placeholder="物料名称" />
              </template>
            </el-table-column>
            <el-table-column label="规格型号" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.specification" placeholder="规格型号" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="80">
              <template slot-scope="scope">
                <el-input v-model="scope.row.unit" placeholder="单位" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.quantity" :min="0" :precision="2" style="width: 100%" @change="calculateAmount(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.unitPrice" :min="0" :precision="2" style="width: 100%" @change="calculateAmount(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="金额" width="120">
              <template slot-scope="scope">
                <span>{{ formatMoney(scope.row.amount || 0) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.remark" placeholder="备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="removeItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="total-amount">
            <span>总金额：¥{{ formatMoney(getTotalAmount()) }}</span>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="orderForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取消</el-button>
        <el-button type="primary" @click="saveOrder">保存</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="1000px">
      <div v-if="currentDetail" class="detail-container">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>订单编号：</label>
                <span>{{ currentDetail.orderNo }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>订单状态：</label>
                <el-tag :type="getStatusType(currentDetail.status)">
                  {{ getStatusText(currentDetail.status) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>下单日期：</label>
                <span>{{ formatDate(currentDetail.orderDate) }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>供应商：</label>
                <span>{{ currentDetail.supplier }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>联系人：</label>
                <span>{{ currentDetail.contact }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>联系电话：</label>
                <span>{{ currentDetail.contactPhone }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 物料明细 -->
        <div class="detail-section">
          <h3>物料明细</h3>
          <el-table :data="currentDetail.items" border size="small">
            <el-table-column prop="materialCode" label="物料编码" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="specification" label="规格型号" />
            <el-table-column prop="unit" label="单位" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="unitPrice" label="单价" />
            <el-table-column prop="amount" label="金额" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
          <div class="total-amount">
            <span>总金额：¥{{ formatMoney(currentDetail.totalAmount) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 收货对话框 -->
    <el-dialog title="收货确认" :visible.sync="receiveDialogVisible" width="800px">
      <el-form ref="receiveForm" :model="receiveForm" :rules="receiveRules" label-width="120px">
        <el-form-item label="收货日期" prop="receiveDate">
          <el-date-picker
            v-model="receiveForm.receiveDate"
            type="date"
            placeholder="选择收货日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="收货人" prop="receiver">
          <el-input v-model="receiveForm.receiver" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="收货说明">
          <el-input v-model="receiveForm.remark" type="textarea" :rows="3" placeholder="请输入收货说明" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="receiveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReceive">确认收货</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder
} from '@/api/purchaseOrder'

export default {
  name: 'Caigoudingdan',
  data() {
    return {
      loading: false,

      // 搜索表单
      searchForm: {
        orderNo: '',
        supplier: '',
        status: '',
        dateRange: []
      },

      // 表格数据
      tableData: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,

      // 对话框控制
      dialogVisible: false,
      dialogTitle: '新增采购订单',
      detailDialogVisible: false,
      receiveDialogVisible: false,

      // 当前编辑的索引
      currentEditIndex: -1,
      currentDetail: null,

      // 订单表单
      orderForm: {
        orderNo: '',
        supplier: '',
        contact: '',
        contactPhone: '',
        expectedDate: '',
        urgency: 'normal',
        deliveryAddress: '',
        items: [],
        remark: ''
      },

      // 表单验证规则
      orderRules: {
        supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        expectedDate: [{ required: true, message: '请选择期望到货日期', trigger: 'change' }]
      },

      // 收货表单
      receiveForm: {
        orderId: '',
        receiveDate: '',
        receiver: '',
        remark: ''
      },

      // 收货表单验证规则
      receiveRules: {
        receiveDate: [{ required: true, message: '请选择收货日期', trigger: 'change' }],
        receiver: [{ required: true, message: '请输入收货人', trigger: 'blur' }]
      }
    }
  },

  mounted() {
    this.loadData()
    // 如果URL参数中有orderNo，则自动搜索
    if (this.$route.query.orderNo) {
      this.searchForm.orderNo = this.$route.query.orderNo
      this.handleSearch()
    }
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          orderNo: this.searchForm.orderNo,
          supplier: this.searchForm.supplier,
          status: this.searchForm.status
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
        }

        const response = await fetchPurchaseOrders(params)

        if (response.code === 200) {
          this.tableData = response.data.list || response.data
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取采购订单列表失败')
        }
      } catch (error) {
        console.error('加载采购订单列表失败:', error)
        this.$message.error('加载采购订单列表失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.loadData()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        orderNo: '',
        supplier: '',
        status: '',
        dateRange: []
      }
      this.currentPage = 1
      this.loadData()
    },

    // 分页
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadData()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },

    // 选择改变
    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    // 打开新增对话框
    openCreateDialog() {
      this.dialogTitle = '新增采购订单'
      this.currentEditIndex = -1
      this.orderForm = {
        orderNo: '',
        supplier: '',
        contact: '',
        contactPhone: '',
        expectedDate: '',
        urgency: 'normal',
        deliveryAddress: '',
        items: [
          {
            materialCode: '',
            materialName: '',
            specification: '',
            unit: '',
            quantity: 0,
            unitPrice: 0,
            amount: 0,
            remark: ''
          }
        ],
        remark: ''
      }
      this.dialogVisible = true
    },

    // 编辑订单
    editOrder(row) {
      this.dialogTitle = '编辑采购订单'
      this.currentEditIndex = this.tableData.findIndex((item) => item._id === row._id)
      this.orderForm = { ...row }
      this.dialogVisible = true
    },

    // 查看详情
    viewDetail(row) {
      this.currentDetail = { ...row }
      this.detailDialogVisible = true
    },

    // 添加物料行
    addItem() {
      this.orderForm.items.push({
        materialCode: '',
        materialName: '',
        specification: '',
        unit: '',
        quantity: 0,
        unitPrice: 0,
        amount: 0,
        remark: ''
      })
    },

    // 删除物料行
    removeItem(index) {
      if (this.orderForm.items.length > 1) {
        this.orderForm.items.splice(index, 1)
      } else {
        this.$message.warning('至少保留一行物料')
      }
    },

    // 查询物料信息
    async queryMaterialInfo(item, index) {
      if (!item.materialCode) return

      try {
        // 这里应该调用物料信息查询API
        // const response = await fetchMaterialInfo(item.materialCode)
        // if (response.code === 200) {
        //   item.materialName = response.data.name
        //   item.specification = response.data.specification
        //   item.unit = response.data.unit
        // }
      } catch (error) {
        console.error('查询物料信息失败:', error)
      }
    },

    // 计算金额
    calculateAmount(item) {
      item.amount = (item.quantity || 0) * (item.unitPrice || 0)
    },

    // 获取总金额
    getTotalAmount() {
      return this.orderForm.items.reduce((total, item) => {
        return total + (item.amount || 0)
      }, 0)
    },

    // 保存订单
    async saveOrder() {
      try {
        await this.$refs.orderForm.validate()

        if (this.orderForm.items.length === 0) {
          this.$message.warning('请至少添加一行物料')
          return
        }

        // 计算总金额
        this.orderForm.totalAmount = this.getTotalAmount()

        let response
        if (this.currentEditIndex >= 0) {
          // 编辑
          response = await updatePurchaseOrder(this.orderForm._id, this.orderForm)
        } else {
          // 新增
          response = await createPurchaseOrder(this.orderForm)
        }

        if (response.code === 200) {
          this.$message.success(this.currentEditIndex >= 0 ? '编辑成功' : '创建成功')
          this.resetForm()
          this.loadData()
        } else {
          this.$message.error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存订单失败:', error)
        this.$message.error('保存失败：' + error.message)
      }
    },

    // 重置表单
    resetForm() {
      this.dialogVisible = false
      this.currentEditIndex = -1
      if (this.$refs.orderForm) {
        this.$refs.orderForm.clearValidate()
      }
    },

    // 确认订单
    async confirmOrder(row) {
      try {
        await this.$confirm('确认此采购订单？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await confirmPurchaseOrder(row._id)

        if (response.code === 200) {
          this.$message.success('订单确认成功')
          this.loadData()
        } else {
          this.$message.error(response.message || '确认失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认订单失败:', error)
          this.$message.error('确认失败：' + error.message)
        }
      }
    },

    // 收货
    receiveGoods(row) {
      this.receiveForm = {
        orderId: row._id,
        receiveDate: new Date().toISOString().split('T')[0],
        receiver: this.$store.getters.name || '',
        remark: ''
      }
      this.receiveDialogVisible = true
    },

    // 确认收货
    async confirmReceive() {
      try {
        await this.$refs.receiveForm.validate()

        const response = await receivePurchaseOrder(this.receiveForm.orderId, this.receiveForm)

        if (response.code === 200) {
          this.$message.success('收货确认成功')
          this.receiveDialogVisible = false
          this.loadData()
        } else {
          this.$message.error(response.message || '收货确认失败')
        }
      } catch (error) {
        console.error('收货确认失败:', error)
        this.$message.error('收货确认失败：' + error.message)
      }
    },

    // 取消订单
    async cancelOrder(row) {
      try {
        await this.$confirm('确认取消此采购订单？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deletePurchaseOrder(row._id)

        if (response.code === 200) {
          this.$message.success('订单取消成功')
          this.loadData()
        } else {
          this.$message.error(response.message || '取消失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消订单失败:', error)
          this.$message.error('取消失败：' + error.message)
        }
      }
    },

    // 导出订单
    exportOrders() {
      this.$message.info('导出功能开发中...')
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        pending: '待确认',
        confirmed: '已确认',
        executing: '执行中',
        partial: '部分到货',
        completed: '全部到货',
        cancelled: '已取消'
      }
      return textMap[status] || status
    },

    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        confirmed: 'success',
        executing: 'primary',
        partial: 'info',
        completed: 'success',
        cancelled: 'danger'
      }
      return typeMap[status] || ''
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    },

    // 格式化金额
    formatMoney(amount) {
      if (!amount) return '0.00'
      return parseFloat(amount).toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.caigoudingdan {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
        margin-bottom: 10px;
      }
    }
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .table-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .items-header {
    margin-bottom: 10px;
  }

  .total-amount {
    text-align: right;
    margin-top: 10px;
    font-size: 16px;
    font-weight: bold;
    color: #e6a23c;
  }

  .detail-container {
    .detail-section {
      margin-bottom: 30px;

      h3 {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
        color: #303133;
      }

      .detail-item {
        margin-bottom: 15px;

        label {
          font-weight: bold;
          color: #606266;
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
