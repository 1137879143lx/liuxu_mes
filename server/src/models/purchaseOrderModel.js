const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const db = require('../config/db')
const purchaseOrderSchema = new mongoose.Schema({
    // 订单编号
    orderNo: {
        type: String,
        required: [true, '订单编号不能为空'],
        unique: true,
        trim: true,
        maxlength: [50, '订单编号不能超过50个字符']
    },

    // 供应商信息
    supplier: {
        type: String,
        trim: true,
        maxlength: [100, '供应商名称不能超过100个字符']
    },

    // 联系人
    contact: {
        type: String,
        trim: true,
        maxlength: [50, '联系人不能超过50个字符']
    },

    // 联系电话
    contactPhone: {
        type: String,
        trim: true,
        maxlength: [20, '联系电话不能超过20个字符']
    },

    // 订单状态
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'executing', 'partial', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },

    // 紧急程度
    urgency: {
        type: String,
        enum: ['normal', 'urgent', 'emergency'],
        default: 'normal'
    },

    // 期望到货日期
    expectedDate: {
        type: Date,
        required: [true, '期望到货日期不能为空']
    },

    // 收货地址
    deliveryAddress: {
        type: String,
        trim: true,
        maxlength: [200, '收货地址不能超过200个字符']
    },

    // 物料明细
    items: [{
        materialCode: {
            type: String,
            required: [true, '物料编码不能为空'],
            trim: true
        },
        materialName: {
            type: String,
            required: [true, '物料名称不能为空'],
            trim: true
        },
        specification: {
            type: String,
            trim: true
        },
        unit: {
            type: String,
            trim: true
        },
        quantity: {
            type: Number,
            required: [true, '数量不能为空'],
            min: [0, '数量不能小于0']
        },
        unitPrice: {
            type: Number,
            required: [true, '单价不能为空'],
            min: [0, '单价不能小于0']
        },
        amount: {
            type: Number,
            required: [true, '金额不能为空'],
            min: [0, '金额不能小于0']
        },
        remark: {
            type: String,
            trim: true
        }
    }],

    // 总金额
    totalAmount: {
        type: Number,
        required: [true, '总金额不能为空'],
        min: [0, '总金额不能小于0']
    },

    // 下单日期
    orderDate: {
        type: Date,
        default: Date.now,
        index: true
    },

    // 创建人
    creator: {
        type: String,
        required: [true, '创建人不能为空'],
        trim: true
    },

    // 创建人ID
    creatorId: {
        type: String,
        trim: true
    },

    // 确认人
    confirmer: {
        type: String,
        trim: true
    },

    // 确认时间
    confirmTime: {
        type: Date
    },

    // 收货记录
    receiveRecords: [{
        receiveDate: {
            type: Date,
            required: true
        },
        receiver: {
            type: String,
            required: true,
            trim: true
        },
        remark: {
            type: String,
            trim: true
        },
        createTime: {
            type: Date,
            default: Date.now
        }
    }],
    // 在采购订单模型中添加以下字段

    // 来源申请信息
    sourceRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseRequest',
        index: true
    },
    sourceRequestNo: {
        type: String,
        trim: true,
        maxlength: [50, '来源申请单号不能超过50个字符'],
        index: true
    },

    // 备注
    remark: {
        type: String,
        trim: true,
        maxlength: [500, '备注不能超过500个字符']
    },

    // 软删除标记
    enable_flag: {
        type: String,
        enum: ['Y', 'N'],
        default: 'Y'
    }
}, {
    timestamps: true,
    versionKey: false
});

// 索引
purchaseOrderSchema.index({ orderNo: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: 1 });
purchaseOrderSchema.index({ enable_flag: 1 });

module.exports = db.model('PurchaseOrder', purchaseOrderSchema);