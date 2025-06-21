<template>
  <div class="cailiaoshezhi">
    <!-- 主表格卡片 -->
    <el-card shadow="always" :body-style="{ padding: '5px' }">
      <div slot="header">
        <span>
          物料设置
          <span v-if="selectedItems.length > 0" style="color: rgb(14, 91, 235); font-size: 0.5em">已选择 {{ selectedItems.length }} 项</span>
        </span>
        <div style="float: right">
          <el-button size="mini" type="text" @click="batchDelete" v-if="selectedItems.length > 0">批量删除</el-button>
          <el-button size="mini" type="text" @click="showDeletedMaterials">已删除物料</el-button>
          <el-button size="mini" type="text" @click="showImportDialog">导入</el-button>
          <el-button size="mini" type="text" @click="downloadTemplate">下载导入模板</el-button>
          <el-button size="mini" type="primary" @click="openCreateDialog">新增</el-button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar" style="margin-bottom: 10px; padding: 10px">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-input v-model="searchForm.code" placeholder="物料编码" clearable prefix-icon="el-icon-search" size="small" />
          </el-col>
          <el-col :span="6">
            <el-input v-model="searchForm.name" placeholder="物料名称" clearable prefix-icon="el-icon-goods" size="small" />
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.category" placeholder="物料类别" clearable size="small">
              <el-option v-for="item in Class_of_material_list" :key="item._id" :label="item.name" :value="item.name" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="状态" clearable size="small">
              <el-option label="启用" value="启用" />
              <el-option label="禁用" value="禁用" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
            <el-button size="small" @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 完整表格 -->
      <el-table :data="filteredTableData" size="mini" highlight-current-row @selection-change="handleSelectionChange" v-loading="tableLoading">
        <el-table-column type="index" width="50" />
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="物料编码" width="150" />
        <el-table-column prop="name" label="物料名称" min-width="150" />
        <el-table-column prop="category" label="物料类别" width="120" />
        <el-table-column prop="specification" label="规格型号" width="120" />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="price" label="单价(元)" width="100" align="right">
          <template slot-scope="scope">
            {{ scope.row.price ? scope.row.price.toFixed(2) : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="inventory" label="安全库存" width="100" align="right" />
        <el-table-column prop="maxInventory" label="最大库存" width="100" align="right" />
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'" size="mini">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 修复创建时间显示 -->
        <el-table-column label="创建时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString('zh-CN') : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="edit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="mini" @click="remove(scope.row)" style="color: #f56c6c">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="text-align: center; margin-top: 20px">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total" />
      </div>
    </el-card>

    <!-- 新增/编辑物料对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%" :close-on-click-modal="false" @close="resetForm">
      <el-form :model="materials_form" :rules="formRules" ref="materialForm" label-width="120px" size="small">
        <el-row :gutter="20">
          <!-- 第一行：物料类别和单位 -->
          <el-col :span="12">
            <el-form-item label="物料类别" prop="category">
              <el-select v-model="materials_form.category" placeholder="请选择物料类别" clearable @change="onCategoryChange" style="width: 100%">
                <el-option v-for="item in Class_of_material_list" :key="item._id" :label="item.name" :value="item.name"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位" prop="unit">
              <el-input v-model="materials_form.unit" placeholder="自动获取" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第二行：物料编码和名称 -->
          <el-col :span="12">
            <el-form-item label="物料编码" prop="code">
              <el-input v-model="materials_form.code" placeholder="选择类别后自动生成" @blur="checkCode">
                <template slot="append">
                  <el-button @click="generateMaterialCode" :disabled="!materials_form.category" size="small">生成编码</el-button>
                </template>
              </el-input>
              <div v-if="codeCheckResult.checked" class="code-check-result">
                <span :class="codeCheckResult.available ? 'code-available' : 'code-unavailable'">
                  {{ codeCheckResult.message }}
                </span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="name">
              <el-input v-model="materials_form.name" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第三行：规格型号和描述 -->
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="materials_form.specification" placeholder="请输入规格型号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料描述">
              <el-input v-model="materials_form.description" placeholder="请输入物料描述" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第四行：标签和版本 -->
          <el-col :span="12">
            <el-form-item label="物料标签">
              <el-select v-model="materials_form.tags" multiple placeholder="选择标签" style="width: 100%">
                <el-option label="原材料" value="原材料" />
                <el-option label="半成品" value="半成品" />
                <el-option label="成品" value="成品" />
                <el-option label="包装材料" value="包装材料" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号">
              <el-input v-model="materials_form.version" placeholder="如：V1.0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第五行：物理属性 -->
          <el-col :span="8">
            <el-form-item label="密度(g/cm³)">
              <el-input-number v-model="materials_form.density" :precision="2" :min="0" placeholder="密度" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价(元)">
              <el-input-number v-model="materials_form.price" :precision="2" :min="0" placeholder="单价" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-select v-model="materials_form.status" placeholder="状态" style="width: 100%">
                <el-option label="启用" value="启用" />
                <el-option label="禁用" value="禁用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- 第六行：库存设置 -->
          <el-col :span="8">
            <el-form-item label="安全库存">
              <el-input-number v-model="materials_form.inventory" :min="0" placeholder="安全库存" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最大库存">
              <el-input-number v-model="materials_form.maxInventory" :min="0" placeholder="最大库存" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="采购周期(天)">
              <el-input-number v-model="materials_form.leadTime" :min="1" placeholder="采购周期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 图片上传 -->
        <el-form-item label="物料图片">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload">
            <img v-if="materials_form.image" :src="materials_form.image" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </span>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog title="导入物料" :visible.sync="importDialogVisible" width="60%">
      <div class="import-section">
        <el-upload class="upload-demo" drag action="" :auto-upload="false" :on-change="handleFileChange" :limit="1" accept=".xlsx,.xls">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">只能上传xlsx/xls文件，且不超过10MB</div>
        </el-upload>

        <div style="margin-top: 20px">
          <el-button type="primary" @click="executeImport" :disabled="!importFile">开始导入</el-button>
          <el-button @click="downloadTemplate">下载模板</el-button>
        </div>
      </div>

      <!-- 导入进度 -->
      <div v-if="importProgress.show" class="import-progress">
        <el-progress :percentage="importProgress.percent" :status="importProgress.percent === 100 ? 'success' : ''" />
        <p style="margin-top: 10px">{{ importProgress.status }}</p>
      </div>
    </el-dialog>

    <!-- 已删除物料对话框 -->
    <el-dialog title="已删除物料" :visible.sync="deletedDialogVisible" width="80%">
      <el-table :data="deletedTableData" size="mini" v-loading="deletedTableLoading">
        <el-table-column type="index" width="50" />
        <el-table-column prop="code" label="物料编码" width="150" />
        <el-table-column prop="name" label="物料名称" min-width="150" />
        <el-table-column prop="category" label="物料类别" width="120" />
        <el-table-column prop="deletedAt" label="删除时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.deletedAt ? new Date(scope.row.deletedAt).toLocaleString() : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="deletedBy" label="删除人" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="restoreItem(scope.row)">恢复</el-button>
            <el-button type="text" size="mini" @click="permanentDelete(scope.row)" style="color: #f56c6c">彻底删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="text-align: center; margin-top: 20px">
        <el-pagination
          @size-change="
            (size) => {
              deletedPagination.pageSize = size
              loadDeletedMaterials()
            }
          "
          @current-change="
            (page) => {
              deletedPagination.currentPage = page
              loadDeletedMaterials()
            }
          "
          :current-page="deletedPagination.currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="deletedPagination.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="deletedPagination.total" />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as materialCategory from '@/api/materialCategory'
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
  generateMaterialCode // 新增生成编码API
} from '@/api/materials'
import { getClassOfMaterials, getlist } from '@/api/classOfMaterial'

export default {
  name: 'Cailiaoshezhi',
  data() {
    return {
      // 表格数据
      tableData: [],
      filteredTableData: [],
      selectedItems: [],
      tableLoading: false,

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },

      // 搜索表单
      searchForm: {
        code: '',
        name: '',
        category: '',
        status: ''
      },

      // 物料类别列表
      Class_of_material_list: [],

      // 对话框
      dialogVisible: false,
      dialogTitle: '新增物料',
      isEdit: false,

      // 物料表单
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
        image: ''
      },

      // 表单验证规则
      formRules: {
        code: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择物料类别', trigger: 'change' }],
        unit: [{ required: true, message: '计量单位不能为空', trigger: 'blur' }]
      },

      // 编码检查结果
      codeCheckResult: {
        checked: false,
        available: false,
        message: ''
      },

      // 提交状态
      submitting: false,

      // 导入对话框
      importDialogVisible: false,
      importFile: null,
      importProgress: {
        show: false,
        percent: 0,
        status: ''
      },

      // 已删除物料对话框
      deletedDialogVisible: false,
      deletedTableData: [],
      deletedTableLoading: false,
      deletedPagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
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
          this.tableData = response.data.list
          this.filteredTableData = response.data.list
          this.pagination.total = response.data.total
        }
      } catch (error) {
        this.$message.error('加载数据失败')
        console.error(error)
      } finally {
        this.tableLoading = false
      }
    },

    // 加载物料类别
    async loadClassOfMaterials() {
      try {
        // 如果你的现有系统使用 getlist 函数
        const response = await getlist()
        // 或者使用新的 getClassOfMaterials 函数
        // const response = await getClassOfMaterials()

        if (response && response.code === 200) {
          this.Class_of_material_list = response.data || []
        }
      } catch (error) {
        console.error('加载物料类别失败:', error)
        this.$message.warning('获取物料类别失败')
        this.Class_of_material_list = []
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
      this.handleSearch()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 当前页改变
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.loadData()
    },

    // 表格选择改变
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    // 打开新增对话框
    openCreateDialog() {
      this.dialogTitle = '新增物料'
      this.isEdit = false
      this.dialogVisible = true
      this.resetForm()
    },

    // 编辑物料 - 添加编码冲突检查
    edit(row) {
      this.dialogTitle = '编辑物料'
      this.isEdit = true
      this.materials_form = { ...row }
      this.dialogVisible = true

      // 清除编码检查结果
      this.codeCheckResult = {
        checked: false,
        available: false,
        message: ''
      }
    },

    // 查看详情
    viewDetail(row) {
      this.$router.push({
        path: '/shezhi/cailiaoshezhi/detail',
        query: { id: row._id }
      })
    },

    // 删除物料
    async remove(row) {
      try {
        await this.$confirm('确认删除该物料吗？删除后可在已删除物料中恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deleteMaterial(row._id)
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
          console.error(error)
        }
      }
    },

    // 批量删除
    async batchDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要删除的物料')
        return
      }

      try {
        await this.$confirm(`确认删除选中的 ${this.selectedItems.length} 个物料吗？`, '批量删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const ids = this.selectedItems.map((item) => item._id)
        const response = await batchDeleteMaterials({ ids })

        if (response.code === 200) {
          this.$message.success(response.message)
          this.loadData()
          this.selectedItems = []
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
          console.error(error)
        }
      }
    },

    // 物料类别改变
    // 物料类别改变时自动生成编码
    async onCategoryChange(category) {
      const selectedCategory = this.Class_of_material_list.find((item) => item.name === category)
      if (selectedCategory) {
        this.materials_form.unit = selectedCategory.unit || ''

        // 如果是新增物料且编码为空，自动生成编码
        if (!this.isEdit && !this.materials_form.code) {
          await this.generateMaterialCode()
        }
      }
    },
    // 生成物料编码
    async generateMaterialCode() {
      if (!this.materials_form.category) {
        this.$message.warning('请先选择物料类别')
        return
      }

      try {
        const selectedCategory = this.Class_of_material_list.find((item) => item.name === this.materials_form.category)

        if (!selectedCategory) {
          this.$message.error('未找到对应的物料类别')
          return
        }

        const response = await generateMaterialCode({
          category: this.materials_form.category,
          categoryCode: selectedCategory.code || selectedCategory.name.substring(0, 2).toUpperCase()
        })

        if (response.code === 200) {
          this.materials_form.code = response.data.code
          this.$message.success('编码生成成功')

          // 自动检查生成的编码
          await this.checkCode()
        }
      } catch (error) {
        console.error('生成编码失败:', error)
        this.$message.error('生成编码失败')
      }
    },
    // 检查物料编码
    async checkCode() {
      if (!this.materials_form.code.trim()) {
        this.codeCheckResult.checked = false
        return
      }

      try {
        const params = {
          code: this.materials_form.code.trim()
        }

        if (this.isEdit && this.materials_form._id) {
          params.id = this.materials_form._id
        }

        const response = await checkMaterialCode(params)
        if (response.code === 200) {
          this.codeCheckResult = {
            checked: true,
            available: response.data.available,
            message: response.data.message
          }
        }
      } catch (error) {
        console.error('检查编码失败:', error)
      }
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.materialForm.validate()

        if (this.codeCheckResult.checked && !this.codeCheckResult.available) {
          this.$message.error('物料编码已存在，请修改')
          return
        }

        this.submitting = true

        let response
        if (this.isEdit) {
          response = await updateMaterial(this.materials_form._id, this.materials_form)
        } else {
          response = await createMaterial(this.materials_form)
        }

        if (response.code === 200 || response.code === 201) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功')
          this.dialogVisible = false
          this.loadData()
        }
      } catch (error) {
        if (error.response?.data?.message) {
          this.$message.error(error.response.data.message)
        } else {
          this.$message.error(this.isEdit ? '更新失败' : '创建失败')
        }
        console.error(error)
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
        image: ''
      }

      this.codeCheckResult = {
        checked: false,
        available: false,
        message: ''
      }

      if (this.$refs.materialForm) {
        this.$refs.materialForm.clearValidate()
      }
    },

    // 显示导入对话框
    showImportDialog() {
      this.importDialogVisible = true
      this.importFile = null
      this.importProgress.show = false
    },

    // 文件选择
    handleFileChange(file) {
      this.importFile = file.raw
      return false // 阻止自动上传
    },

    // 执行导入
    async executeImport() {
      if (!this.importFile) {
        this.$message.warning('请选择导入文件')
        return
      }

      const formData = new FormData()
      formData.append('file', this.importFile)

      this.importProgress.show = true
      this.importProgress.percent = 0
      this.importProgress.status = '导入中...'

      try {
        const response = await importMaterials(formData, {
          onUploadProgress: (progressEvent) => {
            this.importProgress.percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        })

        if (response.code === 200) {
          this.importProgress.status = '导入完成'
          this.$message.success(`导入成功 ${response.data.success} 条，失败 ${response.data.failed} 条`)

          if (response.data.errors.length > 0) {
            console.log('导入错误详情:', response.data.errors)
          }

          this.loadData()
          setTimeout(() => {
            this.importDialogVisible = false
          }, 2000)
        }
      } catch (error) {
        this.importProgress.status = '导入失败'
        this.$message.error('导入失败')
        console.error(error)
      }
    },

    // 下载导入模板
    async downloadTemplate() {
      try {
        const response = await fetch('/api/materials/template')
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '物料导入模板.xlsx'
        a.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.error('下载模板失败')
        console.error(error)
      }
    },

    // 显示已删除物料
    async showDeletedMaterials() {
      this.deletedDialogVisible = true
      this.loadDeletedMaterials()
    },

    // 加载已删除物料
    async loadDeletedMaterials() {
      this.deletedTableLoading = true
      try {
        const params = {
          page: this.deletedPagination.currentPage,
          limit: this.deletedPagination.pageSize
        }

        const response = await getDeletedMaterials(params)
        if (response.code === 200) {
          this.deletedTableData = response.data.list
          this.deletedPagination.total = response.data.total
        }
      } catch (error) {
        this.$message.error('加载已删除物料失败')
        console.error(error)
      } finally {
        this.deletedTableLoading = false
      }
    },

    // 恢复物料 - 修复版本
    async restoreItem(row) {
      try {
        await this.$confirm('确认恢复该物料吗？', '恢复物料', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        const response = await restoreMaterial(row._id)
        if (response.code === 200) {
          this.$message.success('恢复成功')
          this.loadDeletedMaterials()
          this.loadData()
        } else {
          this.$message.error(response.message || '恢复失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          if (error.response?.data?.message) {
            this.$message.error(error.response.data.message)
          } else {
            this.$message.error('恢复失败')
          }
          console.error(error)
        }
      }
    },

    // 彻底删除
    async permanentDelete(row) {
      try {
        await this.$confirm('确认彻底删除该物料吗？此操作不可恢复！', '彻底删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })

        const response = await permanentDeleteMaterial(row._id)
        if (response.code === 200) {
          this.$message.success('彻底删除成功')
          // 刷新已删除物料列表
          this.loadDeletedMaterials()
          // 也刷新主列表，以防有数据不一致
          this.loadData()
        } else {
          this.$message.error(response.message || '彻底删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          if (error.response?.data?.message) {
            this.$message.error(error.response.data.message)
          } else {
            this.$message.error('彻底删除失败')
          }
          console.error(error)
        }
      }
    }
  }
}
</script>

<style scoped>
.code-check-result {
  margin-top: 5px;
  font-size: 12px;
}

.code-available {
  color: #67c23a;
}

.code-unavailable {
  color: #f56c6c;
}

.import-progress {
  margin-top: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
