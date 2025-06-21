<template>
  <div class="card-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="物料类型" name="物料类型">
        <!-- 物料类型 -->
        <el-card size="mini" shadow="hover">
          <el-form :inline="true" class="search-form" size="mini">
            <el-form-item label="物料类型">
              <el-input v-model="MaterialType_Form.name" placeholder="物料类型" />
            </el-form-item>
            <el-form-item label="类别编码">
              <el-input v-model="MaterialType_Form.code" placeholder="请输入类别编码" />
            </el-form-item>
            <el-form-item label="单位">
              <el-input v-model="MaterialType_Form.unit" placeholder="请输入单位" />
            </el-form-item>
            <el-form-item label="编码规则">
              <el-input v-model="MaterialType_Form.codeRule" placeholder="编码规则" @keyup.enter.native="MaterialType_add" />
            </el-form-item>
            <el-form-item style="float: right">
              <el-button type="primary" @click="MaterialType_add">新增</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="MaterialType_tableData" size="mini" height="700">
            <el-table-column label="#" type="index" />
            <el-table-column prop="name" label="物料类型" />
            <el-table-column prop="code" label="类别编码" />
            <el-table-column prop="unit" label="单位" />
            <el-table-column prop="codeRule" label="编码规则" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="MaterialType_remove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="MaterialType_total > MaterialType_pageSize"
            :current-page="MaterialType_currentPage"
            :page-size="MaterialType_pageSize"
            :total="MaterialType_total"
            small
            @current-change="MaterialType_handlePageChange" />
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="表面处理" name="表面处理">
        <!-- 表面处理 -->
        <el-card size="mini" shadow="hover">
          <el-form :inline="true" class="search-form" size="mini">
            <el-form-item label="表面处理">
              <el-input v-model="Surface_Form.name" placeholder="请输入表面处理方式" />
            </el-form-item>
            <el-form-item label="单价">
              <el-input v-model="Surface_Form.price" placeholder="单价 mm²/元" @keyup.enter.native="Surface_Form_add" />
            </el-form-item>
            <el-form-item style="float: right">
              <el-button type="primary" @click="Surface_Form_add">新增</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="SurfaceData" size="mini" height="700">
            <el-table-column label="#" type="index" />
            <el-table-column prop="name" label="表面处理" />
            <el-table-column prop="price" label="单价 mm²/元" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="Surface_Form_remove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="SurfaceTotal > 1"
            :current-page="Surface_Form.page"
            :page-size="Surface_Form.limit"
            :total="SurfaceTotal"
            small
            @current-change="SurfaceTotal_handlePageChange" />
        </el-card>
      </el-tab-pane>
      <!-- 工序设置 -->
      <el-tab-pane label="工序设置" name="工序设置">
        <el-card size="mini" shadow="hover">
          <el-form :inline="true" class="search-form" size="mini">
            <el-form-item style="float: right">
              <el-button type="primary" @click="showAddProcessDialogS">新增</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="processData" size="mini" height="700">
            <el-table-column label="#" type="index" />
            <el-table-column prop="name" label="工序名称" />
            <el-table-column prop="code" label="工序代号" />
            <el-table-column prop="resourceGroup" label="资源组" />
            <el-table-column prop="price" label="单价 元/小时" />
            <el-table-column prop="isOutsourced" label="是否委外">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.isOutsourced" disabled />
              </template>
            </el-table-column>
            <el-table-column prop="isInspected" label="是否检验">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.isInspected" disabled />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="editProcess(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" @click="removeProcess(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="processTotal > 1"
            :current-page="processForm.page"
            :page-size="processForm.limit"
            :total="processTotal"
            small
            @current-change="handleProcessPageChange" />
        </el-card>
        <el-dialog :visible.sync="addProcessDialogVisible" title="新增工序设置" width="30%">
          <el-form ref="addProcessForm" :model="addProcessForm" :rules="addProcessFormRules" label-width="100px">
            <el-form-item label="工序名称" prop="name">
              <el-input v-model="addProcessForm.name" placeholder="请输入工序名称" />
            </el-form-item>
            <el-form-item label="工序代号" prop="code">
              <el-input v-model="addProcessForm.code" placeholder="请输入工序代号" />
            </el-form-item>
            <el-form-item label="资源组" prop="resourceGroup">
              <el-input v-model="addProcessForm.resourceGroup" placeholder="请输入资源组" />
            </el-form-item>
            <el-form-item label="单价" prop="price">
              <el-input v-model="addProcessForm.price" placeholder="请输入单价" />
            </el-form-item>
            <el-form-item label="是否委外" prop="isOutsourced">
              <el-switch v-model="addProcessForm.isOutsourced" />
            </el-form-item>
            <el-form-item label="是否检验" prop="isInspected">
              <el-switch v-model="addProcessForm.isInspected" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addProcessDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addProcess">确 定</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as materialCategory from '@/api/materialCategory'
import * as surfaceTreatment from '@/api/surfaceTreatment'
import * as processSteps from '@/api/processStep'

// MaterialType 物料类型
export default {
  name: 'Danweishezhi',
  data() {
    return {
      // //////////////////////////
      activeName: '物料类型',
      MaterialType_tableData: [],
      MaterialType_Form: {
        name: '',
        code: '', // 添加类别编码字段
        unit: '',
        codeRule: ''
      },
      // 表面处理表单
      SurfaceData: [],
      SurfaceTotal: '',
      Surface_Form: {
        name: '',
        price: '',
        page: 1,
        limit: 15
      },

      MaterialType_searchName: '',
      MaterialType_currentPage: 1,
      MaterialType_pageSize: 15,
      MaterialType_total: 0,
      MaterialType_totalPages: 0,
      // 工序设置
      processData: [],
      processTotal: 0,
      processForm: {
        page: 1,
        limit: 10
      },
      addProcessDialogVisible: false,
      addProcessForm: {
        name: '',
        code: '',
        resourceGroup: '',
        price: '',
        isOutsourced: false,
        isInspected: true
      },
      addProcessFormRules: {
        name: [{ required: true, message: '请输入工序名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入工序代号', trigger: 'blur' }],
        resourceGroup: [{ required: false, message: '请输入资源组', trigger: 'blur' }],
        price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
      }
    }
  },

  methods: {
    // /////////////////////  表面处理 /////////////////////// /
    async Surface_Form_get() {
      const res = await surfaceTreatment.getlist(this.Surface_Form)
      this.SurfaceData = res.data
      this.SurfaceTotal = res.count
    },
    async Surface_Form_add() {
      if (!this.Surface_Form.name || !this.Surface_Form.price) {
        this.$message.warning('请填写完整信息')
        return
      }
      try {
        await surfaceTreatment.add(this.Surface_Form)
        this.$message.success('添加成功')
        this.Surface_Form.name = ''
        this.Surface_Form.price = ''
        this.Surface_Form_get()
      } catch (error) {
        this.$message.error('添加失败')
      }
    },

    // /////////////////////  物料类型 /////////////////////// /
    async MaterialType_search() {
      try {
        const res = await materialCategory.getlist({
          name: this.MaterialType_searchName,
          page: this.MaterialType_currentPage,
          limit: this.MaterialType_pageSize
        })
        // 根据后端返回的数据结构调整
        this.MaterialType_tableData = res.data.list || res.data
        this.MaterialType_total = res.data.total || res.count
      } catch (error) {
        this.$message.error('获取数据失败')
      }
    },

    async MaterialType_add() {
      if (!this.MaterialType_Form.name || !this.MaterialType_Form.code) {
        this.$message.warning('物料类型和类别编码不能为空')
        return
      }

      // 检查编码规则是否重复
      if (this.MaterialType_Form.codeRule) {
        const existingItem = this.MaterialType_tableData.find((item) => item.codeRule === this.MaterialType_Form.codeRule)
        if (existingItem) {
          this.$message.warning(`编码规则 "${this.MaterialType_Form.codeRule}" 已存在，请使用不同的编码规则`)
          return
        }
      }

      try {
        await materialCategory.add(this.MaterialType_Form)
        this.$message.success('添加成功')
        this.MaterialType_Form.name = ''
        this.MaterialType_Form.code = ''
        this.MaterialType_Form.unit = ''
        this.MaterialType_Form.codeRule = ''
        this.MaterialType_search()
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          const errorMsg = error.response.data.error
          if (errorMsg.includes('duplicate key error') && errorMsg.includes('codeRule')) {
            this.$message.error('编码规则已存在，请使用不同的编码规则')
          } else if (errorMsg.includes('duplicate key error') && errorMsg.includes('code')) {
            this.$message.error('类别编码已存在，请使用不同的类别编码')
          } else {
            this.$message.error('添加失败：' + error.response.data.message)
          }
        } else {
          this.$message.error('添加失败')
        }
      }
    },

    async MaterialType_edit(row) {
      // 检查编码规则是否与其他记录重复（排除当前记录）
      if (row.codeRule) {
        const existingItem = this.MaterialType_tableData.find((item) => item._id !== row._id && item.codeRule === row.codeRule)
        if (existingItem) {
          this.$message.warning(`编码规则 "${row.codeRule}" 已存在，请使用不同的编码规则`)
          return
        }
      }

      try {
        await materialCategory.put(row._id, {
          name: row.name,
          code: row.code,
          unit: row.unit,
          codeRule: row.codeRule
        })
        this.$message.success('修改成功')
        this.MaterialType_search()
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          const errorMsg = error.response.data.error
          if (errorMsg.includes('duplicate key error') && errorMsg.includes('codeRule')) {
            this.$message.error('编码规则已存在，请使用不同的编码规则')
          } else if (errorMsg.includes('duplicate key error') && errorMsg.includes('code')) {
            this.$message.error('类别编码已存在，请使用不同的类别编码')
          } else {
            this.$message.error('修改失败：' + error.response.data.message)
          }
        } else {
          this.$message.error('修改失败')
        }
      }
    },

    async MaterialType_remove(row) {
      const confirmed = await this.$confirm(`确认删除 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => false)
      if (confirmed) {
        try {
          await materialCategory.deletes(row._id)
          this.$message.success('删除成功')
          this.MaterialType_search()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }
    },

    MaterialType_handlePageChange(page) {
      this.MaterialType_currentPage = page
      this.MaterialType_search()
    },

    SurfaceTotal_handlePageChange(page) {
      this.Surface_Form.page = page
      this.Surface_Form_get()
    },

    async Surface_Form_remove(row) {
      const confirmed = await this.$confirm(`确认删除 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => false)
      if (confirmed) {
        try {
          await surfaceTreatment.deletes(row._id)
          this.$message.success('删除成功')
          this.Surface_Form_get()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }
    },

    // 工序设置
    async getProcess() {
      try {
        const res = await processSteps.get(this.processForm)
        this.processData = res.data.list || res.data
        this.processTotal = res.data.total || res.count
      } catch (error) {
        this.$message.error('获取工序数据失败')
      }
    },

    showAddProcessDialogS() {
      this.addProcessDialogVisible = true
      // 重置表单
      this.addProcessForm = {
        name: '',
        code: '',
        resourceGroup: '',
        price: '',
        isOutsourced: false,
        isInspected: true
      }
    },

    async addProcess() {
      try {
        await this.$refs.addProcessForm.validate()
        if (this.addProcessForm._id) {
          // 编辑工序
          await processSteps.update(this.addProcessForm._id, this.addProcessForm)
          this.$message.success('修改成功')
        } else {
          // 新增工序
          await processSteps.add(this.addProcessForm)
          this.$message.success('添加成功')
        }
        this.addProcessDialogVisible = false
        this.getProcess()
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    async removeProcess(row) {
      const confirmed = await this.$confirm(`确认删除 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => false)
      if (confirmed) {
        try {
          await processSteps.deletes(row._id)
          this.$message.success('删除成功')
          this.getProcess()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }
    },

    async editProcess(row) {
      // 编辑工序
      this.addProcessForm = { ...row } // 使用展开运算符避免直接引用
      this.addProcessDialogVisible = true
    },

    async handleProcessPageChange(page) {
      this.processForm.page = page
      this.getProcess()
    },

    // 添加缺失的 handleClick 方法
    handleClick(tab) {
      this.activeName = tab.name
    }
  },

  // eslint-disable-next-line vue/order-in-components
  async mounted() {
    this.Surface_Form_get()
    this.MaterialType_search()
    this.getProcess()
  }
}
</script>

<style>
.card-container {
  /* display: flex;
  flex-direction: row; */
  /* 宽度一致 */
  width: 50%;
  /* 高度=剩余高度 */
  height: calc(100vh - 100px);

  /* 子元素垂直居中 */
  /* align-items: center;
  justify-content: space-around; */
}
.card-container > * {
  margin: 5px 15px;
}
</style>
