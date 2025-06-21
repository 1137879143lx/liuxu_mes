<template>
  <div class="purchase-request-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>采购申请管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog">新增采购申请</el-button>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="申请单号">
          <el-input v-model="searchForm.requestNo" placeholder="请输入申请单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已转采购" value="converted" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applicant" placeholder="请输入申请人" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="申请日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column prop="requestNo" label="申请单号" width="160" align="center">
          <template slot-scope="scope">
            <el-link type="primary" @click="viewDetail(scope.row)">
              {{ scope.row.requestNo }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="applicationStatus" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.applicationStatus)" size="small">
              {{ getStatusText(scope.row.applicationStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="applicant" label="申请人" width="100" align="center" />

        <el-table-column prop="department" label="申请部门" width="120" align="center" />

        <el-table-column prop="itemCount" label="物料种类" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.materialList ? scope.row.materialList.length : 0 }} 种</template>
        </el-table-column>

        <el-table-column prop="totalAmount" label="预计金额" width="120" align="right">
          <template slot-scope="scope">¥{{ scope.row.totalAmount ? scope.row.totalAmount.toLocaleString() : '0.00' }}</template>
        </el-table-column>

        <el-table-column prop="urgency" label="紧急程度" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getUrgencyType(scope.row.urgency)" size="small">
              {{ getUrgencyText(scope.row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="requestDate" label="申请日期" width="120" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.requestDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="expectedDate" label="期望到货日期" width="140" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.expectedDate) }}
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="申请原因" min-width="200" show-overflow-tooltip />

        <!-- 表格操作列 -->
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="viewDetail(scope.row)">详情</el-button>

            <!-- 只有待审核状态才能编辑 -->
            <el-button v-if="scope.row.applicationStatus === 'pending'" size="mini" type="warning" @click="editRequest(scope.row)">编辑</el-button>

            <!-- 只有已审核通过且未转换的才能转采购单 -->
            <el-button v-if="scope.row.applicationStatus === 'approved'" size="mini" type="success" @click="convertToPurchase(scope.row)">
              转采购单
            </el-button>

            <!-- 已转采购状态显示提示 -->
            <el-tag v-if="scope.row.applicationStatus === 'converted'" size="mini" type="info">已转采购</el-tag>

            <!-- 只有待审核状态才能删除 -->
            <el-button v-if="scope.row.applicationStatus === 'pending'" size="mini" type="danger" @click="deleteRequest(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1200px" :before-close="resetForm">
      <el-form ref="requestForm" :model="requestForm" :rules="requestRules" label-width="120px">
        <!-- 基本信息 -->
        <el-card class="form-card" shadow="never">
          <div slot="header" class="card-header">
            <h4>基本信息</h4>
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="申请单号" prop="requestNo">
                <el-input v-model="requestForm.requestNo" placeholder="系统自动生成" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="申请人" prop="applicant">
                <el-input v-model="requestForm.applicant" placeholder="请输入申请人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="申请部门" prop="department">
                <el-select v-model="requestForm.department" placeholder="请选择申请部门" style="width: 100%">
                  <el-option label="机加部" value="机加部" />
                  <el-option label="技术部" value="技术部" />
                  <el-option label="质量部" value="质量部" />
                  <el-option label="仓储部" value="仓储部" />
                  <el-option label="行政部" value="行政部" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="紧急程度" prop="urgency">
                <el-select v-model="requestForm.urgency" placeholder="请选择紧急程度" style="width: 100%">
                  <el-option label="一般" value="normal" />
                  <el-option label="紧急" value="urgent" />
                  <el-option label="特急" value="emergency" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="期望到货日期" prop="expectedDate">
                <el-date-picker
                  v-model="requestForm.expectedDate"
                  type="date"
                  placeholder="请选择期望到货日期"
                  style="width: 100%"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="申请日期" prop="requestDate">
                <el-date-picker
                  v-model="requestForm.requestDate"
                  type="date"
                  placeholder="请选择申请日期"
                  style="width: 100%"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="申请原因" prop="reason">
                <el-input v-model="requestForm.reason" type="textarea" :rows="3" placeholder="请输入申请原因" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 采购物料明细 -->
        <el-card class="form-card" shadow="never" style="margin-top: 20px">
          <div slot="header" class="card-header">
            <h4>采购物料明细</h4>
            <el-button type="primary" size="small" @click="addItem">添加物料</el-button>
          </div>

          <el-table :data="requestForm.items" border style="width: 100%" max-height="400">
            <el-table-column prop="materialCode" label="物料编码" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.materialCode" placeholder="请输入物料编码" @blur="queryMaterialInfo(scope.row, scope.$index)" />
              </template>
            </el-table-column>

            <el-table-column prop="materialName" label="物料名称" width="200">
              <template slot-scope="scope">
                <el-input v-model="scope.row.materialName" placeholder="请输入物料名称" />
              </template>
            </el-table-column>

            <el-table-column prop="specification" label="规格型号" width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.specification" placeholder="请输入规格型号" />
              </template>
            </el-table-column>

            <el-table-column prop="unit" label="单位" width="80">
              <template slot-scope="scope">
                <el-input v-model="scope.row.unit" placeholder="单位" />
              </template>
            </el-table-column>

            <el-table-column prop="quantity" label="申请数量" width="120">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.quantity" :min="1" :precision="2" style="width: 100%" @change="calculateAmount(scope.row)" />
              </template>
            </el-table-column>

            <el-table-column prop="estimatedPrice" label="预估单价" width="120">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.estimatedPrice"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                  @change="calculateAmount(scope.row)" />
              </template>
            </el-table-column>

            <el-table-column prop="estimatedAmount" label="预估金额" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.estimatedAmount ? scope.row.estimatedAmount.toFixed(2) : '0.00' }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="remark" label="备注" min-width="150">
              <template slot-scope="scope">
                <el-input v-model="scope.row.remark" placeholder="请输入备注" />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeItem(scope.$index)" />
              </template>
            </el-table-column>
          </el-table>

          <!-- 合计信息 -->
          <div class="total-info">
            <span>物料种类总数：{{ requestForm.items.length }} 种</span>
            <span style="margin-left: 30px">预估总金额：¥{{ getTotalAmount() }}</span>
          </div>
        </el-card>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取消</el-button>
        <el-button type="primary" @click="saveRequest">保存</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="采购申请详情" :visible.sync="detailDialogVisible" width="1000px">
      <div v-if="currentDetail" class="detail-container">
        <!-- 基本信息 -->
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <h4>基本信息</h4>
            <div class="header-actions">
              <el-button v-if="currentDetail.applicationStatus === 'pending'" type="success" size="small" @click="approveRequest(currentDetail)">
                审核通过
              </el-button>
              <el-button v-if="currentDetail.applicationStatus === 'pending'" type="warning" size="small" @click="rejectRequest(currentDetail)">
                驳回
              </el-button>
              <el-button type="primary" size="small" @click="printRequest(currentDetail)">打印</el-button>
            </div>
          </div>

          <div class="detail-info">
            <div class="info-row">
              <div class="info-item">
                <label>申请单号：</label>
                <span>{{ currentDetail.requestNo }}</span>
              </div>
              <div class="info-item">
                <label>申请状态：</label>
                <el-tag :type="getStatusType(currentDetail.applicationStatus)">
                  {{ getStatusText(currentDetail.applicationStatus) }}
                </el-tag>
                <!-- 如果是已转采购状态，显示关联的采购单号 -->
                <span v-if="currentDetail.applicationStatus === 'converted' && currentDetail.purchaseOrderNo" class="convert-info">
                  （已转为采购单：
                  <el-link type="primary" @click="viewPurchaseOrder(currentDetail.purchaseOrderNo)">
                    {{ currentDetail.purchaseOrderNo }}
                  </el-link>
                  ）
                </span>
              </div>
              <div class="info-item">
                <label>申请人：</label>
                <span>{{ currentDetail.applicant }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <label>申请部门：</label>
                <span>{{ getDepartmentText(currentDetail.department) }}</span>
              </div>
              <div class="info-item">
                <label>紧急程度：</label>
                <el-tag :type="getUrgencyType(currentDetail.urgency)">
                  {{ getUrgencyText(currentDetail.urgency) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>申请日期：</label>
                <span>{{ formatDate(currentDetail.requestDate) }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <label>期望到货日期：</label>
                <span>{{ formatDate(currentDetail.expectedDate) }}</span>
              </div>
              <div class="info-item">
                <label>预估总金额：</label>
                <span class="amount">¥{{ currentDetail.totalAmount ? currentDetail.totalAmount.toLocaleString() : '0.00' }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item full-width">
                <label>申请原因：</label>
                <span>{{ currentDetail.reason || '--' }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 物料明细 - 修改数据源 -->
        <el-card shadow="never" style="margin-top: 20px">
          <div slot="header" class="card-header">
            <h4>物料明细</h4>
          </div>

          <el-table :data="currentDetail.materialList" border style="width: 100%">
            <el-table-column prop="materialCode" label="物料编码" width="150" />
            <el-table-column prop="materialName" label="物料名称" width="200" />
            <el-table-column prop="specification" label="规格型号" width="150" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="quantity" label="申请数量" width="100" align="right" />
            <el-table-column prop="estimatedUnitPrice" label="预估单价" width="100" align="right">
              <template slot-scope="scope">
                {{ scope.row.estimatedUnitPrice ? scope.row.estimatedUnitPrice.toFixed(2) : '0.00' }}
              </template>
            </el-table-column>
            <el-table-column prop="estimatedAmount" label="预估金额" width="120" align="right">
              <template slot-scope="scope">
                {{ scope.row.estimatedAmount ? scope.row.estimatedAmount.toFixed(2) : '0.00' }}
              </template>
            </el-table-column>
            <el-table-column prop="note" label="备注" min-width="150" />
          </el-table>
        </el-card>

        <!-- 审核记录 -->
        <el-card v-if="currentDetail.approvalHistory && currentDetail.approvalHistory.length > 0" shadow="never" style="margin-top: 20px">
          <div slot="header" class="card-header">
            <h4>审核记录</h4>
          </div>

          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in currentDetail.approvalHistory"
              :key="index"
              :type="getTimelineType(record.action)"
              :timestamp="formatDateTime(record.createTime)">
              <div class="timeline-content">
                <div class="timeline-title">{{ getActionText(record.action) }}</div>
                <div class="timeline-user">操作人：{{ record.operator }}</div>
                <div v-if="record.comment" class="timeline-comment">备注：{{ record.comment }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="approvalDialogTitle" :visible.sync="approvalDialogVisible" width="500px">
      <el-form ref="approvalForm" :model="approvalForm" :rules="approvalRules" label-width="100px">
        <el-form-item label="审核意见" prop="comment">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            :placeholder="approvalForm.action === 'approve' ? '请输入审核通过的意见（可选）' : '请输入驳回原因'" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button :type="approvalForm.action === 'approve' ? 'success' : 'warning'" @click="submitApproval">
          {{ approvalForm.action === 'approve' ? '审核通过' : '确认驳回' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 转换对话框 -->
    <el-dialog title="转为采购单" :visible.sync="convertDialogVisible" width="500px">
      <el-form ref="convertForm" :model="convertForm" :rules="convertRules" label-width="100px">
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="convertForm.operator" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="convertForm.remark" type="textarea" :rows="3" placeholder="请输入转换说明（可选）" />
        </el-form-item>
        <el-alert title="转换说明" type="info" :closable="false" show-icon>
          <template slot="default">
            <p>转为采购单后，该申请的状态将变更为"已转采购"，无法再次转换。</p>
            <p>转换后会自动生成对应的采购单据，包含当前申请的所有物料信息。</p>
          </template>
        </el-alert>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelConvert">取消</el-button>
        <el-button type="primary" @click="confirmConvert">确认转换</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  convertToPurchaseOrder // 添加这个导入
} from '@/api/purchaseRequest'
import { fetchMaterialInfo } from '@/api/purchaseRequest'

export default {
  name: 'PurchaseRequest',
  data() {
    return {
      // 搜索表单
      searchForm: {
        requestNo: '',
        status: '',
        applicant: '',
        dateRange: []
      },

      // 表格数据
      tableData: [],
      loading: false,
      multipleSelection: [],

      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,

      // 对话框控制
      dialogVisible: false,
      dialogTitle: '新增采购申请',
      detailDialogVisible: false,
      approvalDialogVisible: false,
      approvalDialogTitle: '',

      // 表单数据
      requestForm: {
        requestNo: '',
        applicant: '',
        department: '',
        urgency: 'normal',
        expectedDate: '',
        requestDate: new Date().toISOString().split('T')[0],
        reason: '',
        items: []
      },

      // 审核表单
      approvalForm: {
        action: '',
        comment: ''
      },

      // 当前详情
      currentDetail: null,
      currentEditIndex: -1,

      // 添加转换对话框控制
      convertDialogVisible: false,
      convertForm: {
        requestId: null,
        operator: '',
        remark: ''
      },

      // 表单验证规则
      requestRules: {
        applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }],
        department: [{ required: true, message: '请选择申请部门', trigger: 'change' }],
        urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
        expectedDate: [{ required: true, message: '请选择期望到货日期', trigger: 'change' }],
        requestDate: [{ required: true, message: '请选择申请日期', trigger: 'change' }],
        reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }]
      },

      approvalRules: {
        comment: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
      },

      convertRules: {
        operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }]
      }
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    // 加载数据
    async loadData() {
      try {
        this.loading = true
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          requestNo: this.searchForm.requestNo,
          status: this.searchForm.status,
          applicant: this.searchForm.applicant
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.startDate = this.searchForm.dateRange[0]
          params.endDate = this.searchForm.dateRange[1]
        }

        // 移除空值参数
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await fetchPurchaseRequests(params)
        if (response.code === 200) {
          this.tableData = response.data.data || []
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取采购申请列表失败')
        }
      } catch (error) {
        console.error('加载采购申请列表失败:', error)
        this.$message.error('加载采购申请列表失败：' + error.message)
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
        requestNo: '',
        status: '',
        applicant: '',
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
      this.dialogTitle = '新增采购申请'
      this.currentEditIndex = -1
      this.requestForm = {
        requestNo: '',
        applicant: this.$store.getters.name || '',
        department: '',
        urgency: 'normal',
        expectedDate: '',
        requestDate: new Date().toISOString().split('T')[0],
        reason: '',
        items: []
      }
      this.dialogVisible = true
    },

    // 编辑申请
    editRequest(row) {
      this.dialogTitle = '编辑采购申请'
      this.currentEditIndex = this.tableData.findIndex((item) => item._id === row._id)

      // 转换后端数据格式到前端表单格式
      this.requestForm = {
        ...row,
        items: row.materialList
          ? row.materialList.map((item) => ({
              materialCode: item.materialCode,
              materialName: item.materialName,
              specification: item.specification,
              unit: item.unit,
              quantity: item.quantity,
              estimatedPrice: item.estimatedUnitPrice,
              estimatedAmount: item.estimatedAmount,
              remark: item.note
            }))
          : []
      }

      this.dialogVisible = true
    },

    // 查看详情
    viewDetail(row) {
      this.currentDetail = { ...row }
      this.detailDialogVisible = true
    },

    // 添加物料行
    addItem() {
      this.requestForm.items.push({
        materialCode: '',
        materialName: '',
        specification: '',
        unit: '',
        quantity: 1,
        estimatedPrice: 0,
        estimatedAmount: 0,
        remark: ''
      })
    },

    // 删除物料行
    removeItem(index) {
      this.requestForm.items.splice(index, 1)
    },

    // 查询物料信息
    async queryMaterialInfo(item, index) {
      if (!item.materialCode) return

      try {
        const response = await fetchMaterialInfo(item.materialCode)
        if (response.code === 200 && response.data) {
          const material = response.data
          this.$set(this.requestForm.items, index, {
            ...item,
            materialName: material.materialName,
            specification: material.specification,
            unit: material.unit
          })
        }
      } catch (error) {
        console.error('查询物料信息失败:', error)
      }
    },

    // 计算金额
    calculateAmount(item) {
      item.estimatedAmount = (item.quantity || 0) * (item.estimatedPrice || 0)
    },

    // 获取总金额
    getTotalAmount() {
      return this.requestForm.items
        .reduce((total, item) => {
          return total + (item.estimatedAmount || 0)
        }, 0)
        .toFixed(2)
    },

    // 保存申请
    async saveRequest() {
      try {
        await this.$refs.requestForm.validate()

        if (this.requestForm.items.length === 0) {
          this.$message.warning('请至少添加一个采购物料')
          return
        }

        // 验证物料明细
        for (let i = 0; i < this.requestForm.items.length; i++) {
          const item = this.requestForm.items[i]
          if (!item.materialCode || !item.materialName || !item.quantity) {
            this.$message.warning(`第${i + 1}行物料信息不完整`)
            return
          }
        }

        // 计算总金额
        this.requestForm.totalAmount = parseFloat(this.getTotalAmount())

        // 转换前端表单格式到后端数据格式
        const submitData = {
          applicant: this.requestForm.applicant,
          department: this.requestForm.department,
          urgency: this.requestForm.urgency,
          expectedDate: this.requestForm.expectedDate,
          requestDate: this.requestForm.requestDate,
          reason: this.requestForm.reason,
          items: this.requestForm.items.map((item) => ({
            materialCode: item.materialCode,
            materialName: item.materialName,
            specification: item.specification || '',
            unit: item.unit,
            quantity: item.quantity,
            estimatedPrice: item.estimatedPrice || 0,
            estimatedAmount: item.estimatedAmount || 0,
            remark: item.remark || ''
          }))
        }

        let response
        if (this.currentEditIndex >= 0) {
          response = await updatePurchaseRequest(this.requestForm._id, submitData)
        } else {
          response = await createPurchaseRequest(submitData)
        }

        if (response.code === 200) {
          this.$message.success(this.currentEditIndex >= 0 ? '修改成功' : '创建成功')
          this.resetForm()
          this.loadData()
        } else {
          this.$message.error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存采购申请失败:', error)
        this.$message.error('保存失败：' + error.message)
      }
    },

    // 重置表单
    resetForm() {
      this.dialogVisible = false
      this.currentEditIndex = -1
      if (this.$refs.requestForm) {
        this.$refs.requestForm.resetFields()
      }
    },

    // 删除申请
    async deleteRequest(row) {
      try {
        await this.$confirm('确定要删除这个采购申请吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deletePurchaseRequest(row._id)
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        } else {
          this.$message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除采购申请失败:', error)
          this.$message.error('删除失败：' + error.message)
        }
      }
    },

    // 审核通过
    approveRequest(row) {
      this.approvalForm = {
        action: 'approve',
        comment: ''
      }
      this.currentDetail = row
      this.approvalDialogTitle = '审核通过'
      this.approvalDialogVisible = true
    },

    // 驳回申请
    rejectRequest(row) {
      this.approvalForm = {
        action: 'reject',
        comment: ''
      }
      this.currentDetail = row
      this.approvalDialogTitle = '驳回申请'
      this.approvalDialogVisible = true
    },

    // 提交审核
    async submitApproval() {
      try {
        await this.$refs.approvalForm.validate()

        let response
        if (this.approvalForm.action === 'approve') {
          response = await approvePurchaseRequest(this.currentDetail._id, {
            comment: this.approvalForm.comment,
            operator: this.$store.getters.name,
            operatorId: this.$store.getters.userId
          })
        } else {
          response = await rejectPurchaseRequest(this.currentDetail._id, {
            comment: this.approvalForm.comment,
            operator: this.$store.getters.name,
            operatorId: this.$store.getters.userId
          })
        }

        if (response.code === 200) {
          this.$message.success(this.approvalForm.action === 'approve' ? '审核通过成功' : '驳回成功')
          this.approvalDialogVisible = false
          this.detailDialogVisible = false
          this.loadData()
        } else {
          this.$message.error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('审核操作失败:', error)
        this.$message.error('操作失败：' + error.message)
      }
    },

    // 转采购单 - 完善实现
    async convertToPurchase(row) {
      try {
        // 首先检查状态
        if (row.applicationStatus !== 'approved') {
          this.$message.warning('只有已审核通过的申请才能转为采购单')
          return
        }

        // 显示转换确认对话框
        this.convertForm = {
          requestId: row._id,
          operator: this.$store.getters.name || '当前用户',
          remark: ''
        }
        this.convertDialogVisible = true
      } catch (error) {
        console.error('转换采购单失败:', error)
        this.$message.error('转换失败：' + error.message)
      }
    },

    // 确认转换
    async confirmConvert() {
      try {
        await this.$refs.convertForm.validate()

        // 调用转换API
        const response = await convertToPurchaseOrder(this.convertForm.requestId, {
          operator: this.convertForm.operator,
          operatorId: this.$store.getters.userId || 'user_id',
          remark: this.convertForm.remark
        })

        if (response.code === 200) {
          this.$message.success('转为采购单成功')
          this.convertDialogVisible = false
          this.detailDialogVisible = false

          // 更新当前行的状态显示
          const updatedRow = this.tableData.find((item) => item._id === this.convertForm.requestId)
          if (updatedRow) {
            updatedRow.applicationStatus = 'converted'
          }

          // 重新加载数据以确保状态同步
          this.loadData()

          // 显示转换成功的通知
          this.$notify({
            title: '转换成功',
            message: `采购申请已成功转为采购单，当前状态：已转采购`,
            type: 'success',
            duration: 5000
          })

          // 可以在这里跳转到采购单页面
          // this.$router.push('/purchase/order')
        } else {
          this.$message.error(response.message || '转换失败')
        }
      } catch (error) {
        console.error('转换采购单失败:', error)
        this.$message.error('转换失败：' + error.message)
      }
    },

    // 取消转换
    cancelConvert() {
      this.convertDialogVisible = false
      this.convertForm = {
        requestId: null,
        operator: '',
        remark: ''
      }
    },

    // 打印申请单 - 修改数据结构
    printRequest(row) {
      // 创建打印窗口
      const printWindow = window.open('', '_blank')
      const printContent = this.generatePrintContent(row)

      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()

      // 等待内容加载完成后打印
      printWindow.onload = function () {
        printWindow.print()
        printWindow.close()
      }
    },

    // 生成打印内容 - 修改数据结构
    generatePrintContent(data) {
      const materialList = data.materialList || []

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>采购申请单</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .info-table td { padding: 8px; border: 1px solid #ddd; }
            .material-table { width: 100%; border-collapse: collapse; }
            .material-table th, .material-table td { padding: 8px; border: 1px solid #ddd; text-align: center; }
            .signature { margin-top: 50px; }
            .signature-item { display: inline-block; margin-right: 100px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>采购申请单</h1>
            <p>申请单号：${data.requestNo}</p>
          </div>
          
          <table class="info-table">
            <tr>
              <td><strong>申请人：</strong>${data.applicant}</td>
              <td><strong>申请部门：</strong>${this.getDepartmentText(data.department)}</td>
              <td><strong>申请日期：</strong>${this.formatDate(data.requestDate)}</td>
            </tr>
            <tr>
              <td><strong>紧急程度：</strong>${this.getUrgencyText(data.urgency)}</td>
              <td><strong>期望到货日期：</strong>${this.formatDate(data.expectedDate)}</td>
              <td><strong>预估总金额：</strong>¥${(data.totalAmount || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3"><strong>申请原因：</strong>${data.reason}</td>
            </tr>
          </table>

          <h3>物料明细</h3>
          <table class="material-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>物料编码</th>
                <th>物料名称</th>
                <th>规格型号</th>
                <th>单位</th>
                <th>申请数量</th>
                <th>预估单价</th>
                <th>预估金额</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              ${materialList
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.materialCode}</td>
                  <td>${item.materialName}</td>
                  <td>${item.specification || '--'}</td>
                  <td>${item.unit}</td>
                  <td>${item.quantity}</td>
                  <td>¥${(item.estimatedUnitPrice || 0).toFixed(2)}</td>
                  <td>¥${(item.estimatedAmount || 0).toFixed(2)}</td>
                  <td>${item.note || '--'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="signature">
            <div class="signature-item">
              <p>申请人签字：_________________</p>
              <p>日期：_________________</p>
            </div>
            <div class="signature-item">
              <p>部门负责人签字：_________________</p>
              <p>日期：_________________</p>
            </div>
            <div class="signature-item">
              <p>审核人签字：_________________</p>
              <p>日期：_________________</p>
            </div>
          </div>
        </body>
        </html>
      `
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      return new Date(date).toLocaleDateString()
    },

    // 格式化日期时间
    formatDateTime(datetime) {
      if (!datetime) return '--'
      return new Date(datetime).toLocaleString()
    },

    // 获取状态文本 - 确保包含已转采购状态
    getStatusText(status) {
      const textMap = {
        pending: '待审核',
        approved: '已审核',
        rejected: '已驳回',
        converted: '已转采购', // 确保这个状态存在
        completed: '已完成'
      }
      return textMap[status] || status
    },

    // 获取状态类型 - 为已转采购状态设置合适的颜色
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        converted: 'info', // 使用蓝色表示已转采购
        completed: 'success'
      }
      return typeMap[status] || ''
    },
    // 查看关联的采购订单
    viewPurchaseOrder(orderNo) {
      // 跳转到采购订单页面并定位到指定订单
      this.$router.push({
        path: '/caigou/caigoudingdan',
        query: { orderNo: orderNo }
      })
    },
    // 获取紧急程度类型
    getUrgencyType(urgency) {
      const typeMap = {
        normal: '',
        urgent: 'warning',
        emergency: 'danger'
      }
      return typeMap[urgency] || ''
    },

    // 获取紧急程度文本
    getUrgencyText(urgency) {
      const textMap = {
        normal: '一般',
        urgent: '紧急',
        emergency: '特急'
      }
      return textMap[urgency] || urgency
    },

    // 获取部门文本
    getDepartmentText(department) {
      const textMap = {
        production: '生产部',
        technology: '技术部',
        quality: '质量部',
        warehouse: '仓储部',
        admin: '行政部'
      }
      return textMap[department] || department
    },

    // 获取时间线类型
    getTimelineType(action) {
      const typeMap = {
        create: 'primary',
        approve: 'success',
        reject: 'danger',
        convert: 'info'
      }
      return typeMap[action] || 'primary'
    },

    // 获取操作文本
    getActionText(action) {
      const textMap = {
        create: '创建申请',
        approve: '审核通过',
        reject: '驳回申请',
        convert: '转为采购单'
      }
      return textMap[action] || action
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-request-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .search-card {
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    .el-table {
      .el-link {
        font-weight: bold;
      }
    }
  }

  .form-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        color: #303133;
      }
    }
  }

  .total-info {
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    text-align: right;

    span {
      font-weight: bold;
      color: #606266;
    }
  }

  .detail-container {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        color: #303133;
      }

      .header-actions {
        .el-button {
          margin-left: 8px;
        }
      }
    }

    .detail-info {
      .info-row {
        display: flex;
        margin-bottom: 15px;

        .info-item {
          flex: 1;
          display: flex;
          align-items: center;

          &.full-width {
            flex: 100%;
          }

          label {
            font-weight: bold;
            color: #606266;
            margin-right: 8px;
            min-width: 100px;
          }

          span {
            color: #303133;

            &.amount {
              font-weight: bold;
              color: #409eff;
            }
          }
        }
      }
    }

    .timeline-content {
      .timeline-title {
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }

      .timeline-user {
        color: #606266;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .timeline-comment {
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

.convert-info {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
