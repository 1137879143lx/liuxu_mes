import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  // {
  //   path: '/documentation',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/documentation/index'),
  //       name: 'Documentation',
  //       meta: { title: 'documentation', icon: 'documentation', affix: true }
  //     }
  //   ]
  // },
  {
    path: '/xiaoshou',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'xiaoshou',
    meta: {
      title: '销售',
      icon: 'el-icon-s-flag',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'xiaoshoubaojia',
        component: () => import('@/views/xiaoshou/xiaoshoubaojia/index'),
        name: 'xiaoshoubaojia',
        meta: { title: '销售报价', icon: 'documentation', affix: true }
      },
      {
        path: 'xiaoshoudingdan',
        component: () => import('@/views/xiaoshou/xiaoshoudingdan/index'),
        name: 'xiaoshoudingdan',
        meta: { title: '销售订单', icon: 'documentation', affix: true }
      },
      {
        path: 'kehu',
        component: () => import('@/views/xiaoshou/kehu/index'),
        name: 'kehu',
        meta: { title: '客户', icon: 'documentation', affix: true }
      },
      {
        path: 'baojiaxiangqing',
        component: () => import('@/views/xiaoshou/baojiaxiangqing/index'),
        name: 'baojiaxiangqing',
        meta: { title: '报价详情', icon: 'documentation', affix: true },
        hidden: true
      }
    ]
  },
  {
    path: '/caigou',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'caigou',
    meta: {
      title: '采购',
      icon: 'money',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'caigoushenqing',
        component: () => import('@/views/caigou/caigoushenqing/index'),
        name: 'caigoushenqing',
        meta: { title: '采购申请', icon: 'documentation', affix: true }
      },
      {
        path: 'caigoushenqing_xinzeng',
        component: () => import('@/views/caigou/caigoushenqing_xinzeng/index'),
        name: 'caigoushenqing_xinzeng',
        meta: { title: '采购申请 新增', icon: 'documentation', affix: true },
        hidden: true
      },
      {
        path: 'caigoudingdan',
        component: () => import('@/views/caigou/caigoudingdan/index'),
        name: 'caigoudingdan',
        meta: { title: '采购订单', icon: 'documentation', affix: true }
      },
      {
        path: 'index3',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '采购入库', icon: 'documentation', affix: true }
      },
      {
        path: 'index4',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '采购退货', icon: 'documentation', affix: true }
      },
      {
        path: 'index5',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '采购对账', icon: 'documentation', affix: true }
      },
      {
        path: 'index6',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '委外加工', icon: 'documentation', affix: true }
      },
      {
        path: 'index7',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '委外对账', icon: 'documentation', affix: true }
      },
      {
        path: 'gongyingshang',
        component: () => import('@/views/caigou/gongyingshang/index'),
        name: 'gongyingshang',
        meta: { title: '供应商', icon: 'documentation', affix: true }
      },
      {
        path: 'index9',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '委外需求', icon: 'documentation', affix: true }
      }
    ]
  },
  {
    path: '/shengchan',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'shengchan',
    meta: {
      title: '生产',
      icon: 'el-icon-s-finance',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'shengchanrenwu',
        component: () => import('@/views/shengchan/shengchanrenwu/index'),
        name: 'shengchanrenwu',
        meta: { title: '生产任务', icon: 'documentation', affix: true }
      },
      {
        path: 'shengchanbaogong',
        component: () => import('@/views/shengchan/shengchanbaogong/index'),
        name: 'shengchanbaogong',
        meta: { title: '生产报工', icon: 'documentation', affix: true }
      },
      {
        path: 'xialiaoliebiao',
        component: () => import('@/views/shengchan/xialiaoliebiao/index'),
        name: 'xialiaoliebiao',
        meta: { title: '下料列表', icon: 'documentation', affix: true }
      },
      {
        path: 'gongzhuangguanli',
        component: () => import('@/views/shengchan/gongzhuangguanli/index'),
        name: 'gongzhuangguanli',
        meta: { title: '工装管理', icon: 'documentation', affix: true }
      },
      {
        path: 'shenchanbuliao',
        component: () => import('@/views/shengchan/shenchanbuliao/index'),
        name: 'shenchanbuliao',
        meta: { title: '生产补料', icon: 'documentation', affix: true }
      },
      {
        path: 'index7',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '统计报表', icon: 'documentation', affix: true }
      },
      {
        path: 'renwuxiangqing',
        component: () => import('@/views/shengchan/shengchanxiangqing/index'),
        name: 'renwuxiangqing',
        meta: {
          title: '任务详情',
          icon: 'documentation',
          affix: true
        },
        hidden: true
      },
      {
        path: 'biaoqiandaying',
        component: () => import('@/views/shengchan/biaoqiandaying/index'),
        name: 'biaoqiandaying',
        meta: {
          title: '标签打印',
          icon: 'documentation',
          affix: true
        },
        hidden: false
      }
    ]
  },
  {
    path: '/pinzhi',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'pinzhi',
    meta: {
      title: '品质',
      icon: 'el-icon-s-check',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'jianyanjinzhan',
        component: () => import('@/views/pingzhi/jianyanjinzhan/index'),
        name: 'jianyanjinzhan',
        meta: { title: '检验进站', icon: 'documentation', affix: true }
      },
      {
        path: 'jianyanjilu',
        component: () => import('@/views/pingzhi/jianyanjilu/index'),
        name: 'jianyanjilu',
        meta: { title: '检验记录', icon: 'documentation', affix: true }
      },
      {
        path: 'pinzhibaobiao',
        component: () => import('@/views/pingzhi/pinzhibaobiao/index.vue'),
        name: 'pinzhibaobiao',
        meta: { title: '品质报表', icon: 'documentation', affix: true }
      },
      {
        path: 'liangjujieyong',
        component: () => import('@/views/pingzhi/liangjujieyong/index'),
        name: 'liangjujieyong',
        meta: { title: '量具借用', icon: 'documentation', affix: true }
      }
    ]
  },
  {
    path: '/shezhi',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'shezhi',
    meta: {
      title: '设置',
      icon: 'el-icon-setting',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/shezhi/xitongshezhi/index'),
        name: 'xitongshezhi',
        meta: { title: '系统设置', icon: 'documentation', affix: true }
      },
      {
        path: 'index2',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '价格设置', icon: 'documentation', affix: true }
      },
      {
        path: 'cailiaoshezhi',
        component: () => import('@/views/shezhi/cailiaoshezhi/index'),
        name: 'cailiaoshezhi',
        meta: { title: '物料设置', icon: 'documentation', affix: true }
      },

      {
        path: 'danweishezhi',
        component: () => import('@/views/shezhi/danweishezhi/index'),
        name: 'danweishezhi',
        meta: { title: '其它设置', icon: 'documentation', affix: true }
      },

      {
        path: 'index4',
        component: () => import('@/views/documentation/index'),
        name: 'caigou',
        meta: { title: '机台设置', icon: 'documentation', affix: true }
      },
      {
        path: 'yonghushezhi',
        component: () => import('@/views/shezhi/yonghushezhi/index'),
        name: 'yonghushezhi',
        meta: { title: '用户设置', icon: 'documentation', affix: true }
      }
    ]
  },
  {
    path: '/cangku',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'cangku',
    meta: {
      title: '仓库',
      icon: 'el-icon-s-help',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'ruku',
        component: () => import('@/views/cangku/ruku/index'),
        name: 'ruku',
        meta: { title: '入库', icon: 'documentation', affix: true }
      },
      {
        path: 'jishikucun',
        component: () => import('@/views/cangku/jishikucun/index'),
        name: 'jishikucun',
        meta: { title: '即时库存', icon: 'documentation', affix: true }
      },
      {
        path: 'chuku',
        component: () => import('@/views/cangku/chuku/index'),
        name: 'chuku',
        meta: { title: '出库', icon: 'documentation', affix: true }
      },
      {
        path: 'saomaruku',
        component: () => import('@/views/cangku/saomaruku/index'),
        name: 'saomaruku',
        meta: { title: '物料标识卡', icon: 'documentation', affix: true }
      }
    ]
  }
  // ,
  // {
  //   path: '/guide',
  //   component: Layout,
  //   redirect: '/guide/index',
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/guide/index'),
  //       name: 'Guide',
  //       meta: { title: 'guide', icon: 'guide', noCache: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/profile',
  //   component: Layout,
  //   redirect: '/profile/index',
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/profile/index'),
  //       name: 'Profile',
  //       meta: { title: 'profile', icon: 'user', noCache: true }
  //     }
  //   ]
  // }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
// export const asyncRoutes = [
//   {
//     path: '/permission',
//     component: Layout,
//     redirect: '/permission/page',
//     alwaysShow: true, // will always show the root menu
//     name: 'Permission',
//     meta: {
//       title: 'permission',
//       icon: 'lock',
//       roles: ['admin', 'editor'] // you can set roles in root nav
//     },
//     children: [
//       {
//         path: 'page',
//         component: () => import('@/views/permission/page'),
//         name: 'PagePermission',
//         meta: {
//           title: 'pagePermission',
//           roles: ['admin'] // or you can only set roles in sub nav
//         }
//       },
//       {
//         path: 'directive',
//         component: () => import('@/views/permission/directive'),
//         name: 'DirectivePermission',
//         meta: {
//           title: 'directivePermission'
//           // if do not set roles, means: this page does not require permission
//         }
//       },
//       {
//         path: 'role',
//         component: () => import('@/views/permission/role'),
//         name: 'RolePermission',
//         meta: {
//           title: 'rolePermission',
//           roles: ['admin']
//         }
//       }
//     ]
//   },

//   {
//     path: '/icon',
//     component: Layout,
//     children: [
//       {
//         path: 'index',
//         component: () => import('@/views/icons/index'),
//         name: 'Icons',
//         meta: { title: 'icons', icon: 'icon', noCache: true }
//       }
//     ]
//   },

//   /** when your routing map is too long, you can split it into small modules **/
//   componentsRouter,
//   chartsRouter,
//   nestedRouter,
//   tableRouter,

//   {
//     path: '/example',
//     component: Layout,
//     redirect: '/example/list',
//     name: 'Example',
//     meta: {
//       title: 'example',
//       icon: 'el-icon-s-help'
//     },
//     children: [
//       {
//         path: 'create',
//         component: () => import('@/views/example/create'),
//         name: 'CreateArticle',
//         meta: { title: 'createArticle', icon: 'edit' }
//       },
//       {
//         path: 'edit/:id(\\d+)',
//         component: () => import('@/views/example/edit'),
//         name: 'EditArticle',
//         meta: {
//           title: 'editArticle',
//           noCache: true,
//           activeMenu: '/example/list'
//         },
//         hidden: true
//       },
//       {
//         path: 'list',
//         component: () => import('@/views/example/list'),
//         name: 'ArticleList',
//         meta: { title: 'articleList', icon: 'list' }
//       }
//     ]
//   },

//   {
//     path: '/tab',
//     component: Layout,
//     children: [
//       {
//         path: 'index',
//         component: () => import('@/views/tab/index'),
//         name: 'Tab',
//         meta: { title: 'tab', icon: 'tab' }
//       }
//     ]
//   },

//   {
//     path: '/error',
//     component: Layout,
//     redirect: 'noRedirect',
//     name: 'ErrorPages',
//     meta: {
//       title: 'errorPages',
//       icon: '404'
//     },
//     children: [
//       {
//         path: '401',
//         component: () => import('@/views/error-page/401'),
//         name: 'Page401',
//         meta: { title: 'page401', noCache: true }
//       },
//       {
//         path: '404',
//         component: () => import('@/views/error-page/404'),
//         name: 'Page404',
//         meta: { title: 'page404', noCache: true }
//       }
//     ]
//   },

//   {
//     path: '/error-log',
//     component: Layout,
//     children: [
//       {
//         path: 'log',
//         component: () => import('@/views/error-log/index'),
//         name: 'ErrorLog',
//         meta: { title: 'errorLog', icon: 'bug' }
//       }
//     ]
//   },

//   {
//     path: '/excel',
//     component: Layout,
//     redirect: '/excel/export-excel',
//     name: 'Excel',
//     meta: {
//       title: 'excel',
//       icon: 'excel'
//     },
//     children: [
//       {
//         path: 'export-excel',
//         component: () => import('@/views/excel/export-excel'),
//         name: 'ExportExcel',
//         meta: { title: 'exportExcel' }
//       },
//       {
//         path: 'export-selected-excel',
//         component: () => import('@/views/excel/select-excel'),
//         name: 'SelectExcel',
//         meta: { title: 'selectExcel' }
//       },
//       {
//         path: 'export-merge-header',
//         component: () => import('@/views/excel/merge-header'),
//         name: 'MergeHeader',
//         meta: { title: 'mergeHeader' }
//       },
//       {
//         path: 'upload-excel',
//         component: () => import('@/views/excel/upload-excel'),
//         name: 'UploadExcel',
//         meta: { title: 'uploadExcel' }
//       }
//     ]
//   },

//   {
//     path: '/zip',
//     component: Layout,
//     redirect: '/zip/download',
//     alwaysShow: true,
//     name: 'Zip',
//     meta: { title: 'zip', icon: 'zip' },
//     children: [
//       {
//         path: 'download',
//         component: () => import('@/views/zip/index'),
//         name: 'ExportZip',
//         meta: { title: 'exportZip' }
//       }
//     ]
//   },

//   {
//     path: '/pdf',
//     component: Layout,
//     redirect: '/pdf/index',
//     children: [
//       {
//         path: 'index',
//         component: () => import('@/views/pdf/index'),
//         name: 'PDF',
//         meta: { title: 'pdf', icon: 'pdf' }
//       }
//     ]
//   },
//   {
//     path: '/pdf/download',
//     component: () => import('@/views/pdf/download'),
//     hidden: true
//   },

//   {
//     path: '/theme',
//     component: Layout,
//     children: [
//       {
//         path: 'index',
//         component: () => import('@/views/theme/index'),
//         name: 'Theme',
//         meta: { title: 'theme', icon: 'theme' }
//       }
//     ]
//   },

//   {
//     path: '/clipboard',
//     component: Layout,
//     children: [
//       {
//         path: 'index',
//         component: () => import('@/views/clipboard/index'),
//         name: 'ClipboardDemo',
//         meta: { title: 'clipboardDemo', icon: 'clipboard' }
//       }
//     ]
//   },

//   {
//     path: '/i18n',
//     component: Layout,
//     children: [
//       {
//         path: 'index',
//         component: () => import('@/views/i18n-demo/index'),
//         name: 'I18n',
//         meta: { title: 'i18n', icon: 'international' }
//       }
//     ]
//   },

//   {
//     path: 'external-link',
//     component: Layout,
//     children: [
//       {
//         path: 'https://github.com/PanJiaChen/vue-element-admin',
//         meta: { title: 'externalLink', icon: 'link' }
//       }
//     ]
//   },

//   // 404 page must be placed at the end !!!
//   { path: '*', redirect: '/404', hidden: true }
// ]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
