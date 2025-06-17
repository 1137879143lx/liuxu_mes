<template>
  <div>
    <el-card class="cardbox" :body-style="{ padding: '5px' }">
      <div slot="header" class="clearfix">
        <span>物料标识卡</span>
        <el-button icon="el-icon-printer" style="float: right; padding: 0px 3px" type="text"
          @click="print()">保存并打印</el-button>
        <el-button style="float: right; padding: 0px 3px" type="text" @click="showEditDialog = true">添加物料信息</el-button>
        <!-- ...existing code... -->
        <el-button style="float: right; padding: 0px 3px" type="text" @click="triggerImport">导入列表表格</el-button>
        <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display:none" @change="handleFileChange">
        <!-- ...existing code... -->
      </div>
      <el-descriptions border column="2">
        <el-descriptions-item label="工单号">
          <el-input autofocus placeholder="请输入工单号" />
        </el-descriptions-item>
        <el-descriptions-item label="实际入库数量">
          <el-input placeholder="请输入当前入库数量" />
        </el-descriptions-item>
      </el-descriptions>
      <br>
      <br>
      <div id="print-content" class="custom-desc">
        <div class="desc-title">物料信息 <span class="desc-extra">重庆梅杰电子科技有限公司</span></div>
        <table class="desc-table">
          <tr>
            <td class="desc-label">客户</td>
            <td>{{ materialInfo.customer }}</td>
            <td class="desc-label">批次号</td>
            <td>{{ materialInfo.batch }}</td>
          </tr>
          <tr>
            <td class="desc-label">物料编码</td>
            <td>{{ materialInfo.code }}</td>
            <td class="desc-label">物料名称</td>
            <td>{{ materialInfo.name }}</td>
          </tr>
          <tr>
            <td class="desc-label">版本</td>
            <td>{{ materialInfo.version }}</td>
            <td class="desc-label">生产类型</td>
            <td>{{ materialInfo.type }}</td>
          </tr>
          <tr>
            <td class="desc-label">表面处理方式</td>
            <td>{{ materialInfo.surface }}</td>
            <td class="desc-label">数量</td>
            <td>{{ materialInfo.qty }}</td>
          </tr>
          <tr>
            <td class="desc-label">生产日期</td>
            <td>{{ materialInfo.date }}</td>
            <!-- <td class="desc-label">二维码</td>
            <td>
              <div id="qrCode" ref="qrCodeDiv" />
            </td> -->
          </tr>
        </table>
      </div>
    </el-card>
    <!-- 用于显示导入进来的表格 -->
    <el-table v-if="importedTableData.length" :data="importedTableData" style="width: 100%; margin-top: 20px" border>
      <el-table-column v-for="col in tableColumns" :key="col.prop" :prop="col.prop" :label="col.label"
        :width="col.width" />
    </el-table>

    <el-dialog title="编辑物料信息" :visible.sync="showEditDialog" close-on-click-modal="false" width="40%">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="客户">
          <el-input v-model="editForm.customer" />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="editForm.batch" />
        </el-form-item>
        <el-form-item label="物料编码">
          <el-input v-model="editForm.code" />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="editForm.version" />
        </el-form-item>
        <el-form-item label="生产类型">
          <el-input v-model="editForm.type" />
        </el-form-item>
        <el-form-item label="表面处理">
          <el-input v-model="editForm.surface" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input v-model="editForm.qty" />
        </el-form-item>
        <el-form-item label="生产日期">
          <el-input v-model="editForm.date" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">完成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import QRCode from 'qrcodejs2'
import printJS from 'print-js'
import { el } from 'date-fns/locale'
export default {
  name: 'QrCode',
  data() {
    return {
      showEditDialog: false,
      editForm: {
        customer: '南天门研发所',
        batch: 'M202310182222',
        code: '02-62-00-0369-00',
        name: '天天快乐水',
        version: '02',
        type: '打样',
        surface: '黑色阳极',
        orderQty: '15',
        qty: '15',
        inQty: '0',
        date: '2023-10-19'
      },
      materialInfo: {
        customer: '南天门研发所',
        batch: 'M202310182222',
        code: '02-62-00-0369-00',
        name: '天天快乐水',
        version: '02',
        type: '打样',
        surface: '黑色阳极',
        orderQty: '15',
        qty: '15',
        inQty: '0',
        date: '2023-10-19'
      },
      Batch_number: 'M202310182222',
      importedTableData: [], // 存储导入的数据
      tableColumns: [
        { prop: 'name', label: '名称', width: 120 },
        { prop: 'code', label: '编码', width: 120 },
        { prop: 'qty', label: '数量', width: 80 }
        // 根据实际数据结构添加更多列
      ]
    }
  },
  // eslint-disable-next-line space-before-function-paren
  mounted: function () {
    // eslint-disable-next-line space-before-function-paren
    this.$nextTick(function () {
      this.bindQRCode()
    })
  },
  methods: {
    saveEdit() {
      this.materialInfo = { ...this.editForm }
      this.showEditDialog = false
    },

    triggerImport() {
      this.$refs.fileInput.click()
    },
    handleFileChange(e) {
      const files = e.target.files
      if (!files.length) return
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (evt) => {
        const data = evt.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        this.importedTableData = jsonData
        // 自动生成表头
        if (jsonData.length) {
          this.tableColumns = Object.keys(jsonData[0]).map(key => ({
            prop: key,
            label: key,
            width: 120
          }))
        }
      }
      reader.readAsBinaryString(file)
      // 清空文件选择
      e.target.value = ''
    },
    // eslint-disable-next-line space-before-function-paren
    bindQRCode: function () {
      new QRCode(this.$refs.qrCodeDiv, {
        text: this.Batch_number,
        width: 70,
        height: 70,
        colorDark: '#000000', // 二维码颜色
        colorLight: '#ffffff', // 二维码背景色
        correctLevel: QRCode.CorrectLevel.M // 容错率，L/M/H
      })
    },
    print() {
      const printContent = document.getElementById('print-content')
      const originalContents = document.body.innerHTML

      // 创建一个新窗口用于打印
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
    <html>
      <head>
        <title>物料标识卡</title>
        <style>
          @page {
            size: 70mm 40mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-wrapper {
            width: 70mm;
            height: 40mm;
            box-sizing: border-box;
            overflow: hidden;
          }
          /* 复制相关样式 */
          ${Array.from(document.styleSheets)
          .filter(sheet => sheet.href === null) // 只获取内部样式
          .map(sheet => Array.from(sheet.cssRules)
            .filter(rule => rule.selectorText && rule.selectorText.includes('.custom-desc'))
            .map(rule => rule.cssText)
            .join('\n')
          ).join('\n')}
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${printContent.outerHTML}
        </div>
      </body>
    </html>
  `)

      printWindow.document.close()
      printWindow.focus()

      // 等待内容加载完成后打印
      printWindow.onload = function () {
        printWindow.print()
        printWindow.close()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/* 屏幕显示样式 */
.custom-desc {
  width: 264px;
  height: 151px;
  margin: 0 auto;
  box-sizing: border-box;
  color: #000;
  font-size: 12px;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  overflow: hidden;
  padding: 0;
  border: 1px solid #000;
}

.desc-title {
  font-weight: bold;
  font-size: 14px;
  text-align: left;
  margin: 0 0 1px 0;
  color: #000;
  border-bottom: 1px solid #000;
  padding: 1px 2px;
}

.desc-extra {
  float: right;
  font-size: 12px;
  font-weight: normal;
}

.desc-table {
  width: 100%;
  border-collapse: collapse;
  color: #000;
  margin: 0;
}

.desc-table td {
  border: 1px solid #000;
  padding: 1px 2px;
  color: #000;
  vertical-align: middle;
  word-break: break-all;
  font-size: 11px;
  height: 22px;
}

.desc-label {
  background: #fff;
  font-weight: bold;
  width: 18mm;
  color: #000;
}

/* 打印样式 */
@media print {
  @page {
    size: 70mm 40mm;
    margin: 0;
  }

  body * {
    visibility: hidden !important;
  }

  #print-content,
  #print-content * {
    visibility: visible !important;
    color: #000 !important;
    border-color: #000 !important;
  }

  #print-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 70mm !important;
    height: 40mm !important;
    max-width: 70mm !important;
    max-height: 40mm !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    background: #fff !important;
    box-sizing: border-box;
    transform-origin: top left;
    transform: scale(1);
  }

  .desc-table {
    width: 100% !important;
    height: calc(40mm - 20px) !important;
  }

  .desc-table td {
    padding: 0 2px !important;
    font-size: 3mm !important;
    line-height: 1.1 !important;
  }

  .desc-title {
    margin: 0 !important;
    padding: 1px 2px !important;
    font-size: 3.5mm !important;
    line-height: 1.2 !important;
  }
}
</style>
