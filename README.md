# 项目名称：及时库存管理系统

## 项目简介
这是一个用于管理库存的及时库存管理系统。该系统提供了库存信息的实时查看、搜索和编辑功能，旨在帮助用户高效地管理库存数据。

## 文件结构
```
liuxu_mes
├── src
│   ├── views
│   │   └── cangku
│   │       └── Jishikucun
│   │           ├── index.vue               # 及时库存页面的主组件
│   │           ├── components
│   │           │   ├── InventoryTable.vue  # 显示库存数据的表格组件
│   │           │   ├── SearchForm.vue      # 提供搜索功能的组件
│   │           │   └── StockDialog.vue     # 显示库存详情或编辑库存信息的对话框组件
│   │           └── types
│   │               └── inventory.ts        # 定义库存相关的类型和接口
│   ├── api
│   │   └── inventory.ts                     # 与库存相关的API请求函数
│   ├── stores
│   │   └── inventory.ts                     # 库存的状态管理
│   └── utils
│       └── index.ts                         # 通用的工具函数
├── package.json                              # npm的配置文件
└── README.md                                 # 项目的文档
```

## 安装与运行
1. 克隆项目到本地：
   ```
   git clone <repository-url>
   ```
2. 进入项目目录：
   ```
   cd liuxu_mes
   ```
3. 安装依赖：
   ```
   npm install
   ```
4. 启动开发服务器：
   ```
   npm run serve
   ```

## 使用说明
- 访问及时库存页面以查看当前库存信息。
- 使用搜索功能过滤库存数据。
- 点击库存项以查看或编辑详细信息。

## 贡献
欢迎任何形式的贡献！请提交问题或拉取请求。

## 许可证
本项目采用 MIT 许可证。