import Main from '@/components/main'
import parentView from '@/components/parent-view'

//登录页面路由模块
const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: 'Login - 登录',
    hideInMenu: true,
    notCache: true
  },
  component: () => import('@/views/login/login.vue')
}

// 其他页面路由模块
const otherRouter = [
  {
    path: '/',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [{
      path: '/home',
      name: 'home',
      meta: {
        hideInMenu: true,
        title: '首页',
        notCache: true,
        icon: 'iconfont icon-home'
      },
      component: () => import('@/views/other-page/home')
    }]
  },
  {
    path: '/locking',
    name: 'locking',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/components/main/components/lockscreen/components/locking-page.vue')
  },
  {
    path: '/usb',
    name: 'usb',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/system-manager/heart-check.vue')
  },

  {
    path: '/steel',
    name: 'steel',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/steel-manager.vue')
  },
  {
    path: '/gas',
    name: 'gas',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/steel-charts.vue')
  },
  {
    path: '/gas_mongo',
    name: 'gas_mongo',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/gas-mongo.vue')
  },
  {
    path: '/thb-mongo',
    name: 'thb-mongo',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/thb-mongo.vue')
  },
  {
    path: '/twmaterialreport',
    name: 'twmaterialreport',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/tw-material.vue')
  },
  {
    path: '/oee',
    name: 'oee',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/oee-dataInput.vue')
  },
  {
    path: '/oeepie',
    name: 'oeepie',
    meta: {
      hideInMenu: true,
      notCache: true
    },
    component: () => import('@/views/report-manager/oee-pie.vue')
  },
  {
    path: '/tv',
    name: 'tv',
    component: () => import('@/views/system-manager/public-video.vue'),
    meta: {
      hideInMenu: true,
      notCache: true
    }
  },
  {
    path: '/userInfo',
    name: 'userInfo',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [{
      path: 'user-info',
      name: 'user-info',
      meta: {
        icon: 'iconfont icon-person',
        title: '个人档案'
      },
      component: () => import('@/views/other-page/userInfo/user-info.vue')
    }]
  }
]

// 业务页面路由模块
const mainRouter = [
  {
    path: '/authorize-manager',
    name: 'authorize-manager',
    component: Main,
    meta: {
      title: '权限管理',
      hideInMenu: true,
      icon: 'iconfont icon-authorize'
    },
    children: [
      {
        path: 'menu-manager',
        name: 'menu-manager',
        meta: {
          title: '菜单管理',
          icon: 'iconfont icon-menu'
        },
        component: () => import('@/views/authorize-manager/menu-manager.vue')
      },
      {
        path: 'role-manager',
        name: 'role-manager',
        meta: {
          title: '角色管理',
          icon: 'iconfont icon-role'
        },
        component: () => import('@/views/authorize-manager/role-manager.vue')
      },
      {
        path: 'api-manager',
        name: 'api-manager',
        meta: {
          title: 'api管理',
          icon: 'iconfont icon-link'
        },
        component: () => import('@/views/authorize-manager/api-manager.vue')
      }
    ]
  },
  {
    path: '/basis-info',
    name: 'basis-info',
    component: Main,
    meta: {
      title: '基础信息',
      hideInMenu: true,
      icon: 'iconfont icon-setting'
    },
    children: [
      {
        path: 'product-info',
        name: 'product-info',
        component: parentView,
        meta: {
          title: '产品信息',
          icon: 'iconfont icon-read'
        },
        children: [
          {
            path: 'model-manager',
            name: 'model-manager',
            component: () => import('@/views/basis-info/product-info/model-manager.vue'),
            meta: {
              title: '机种管理',
              icon: 'iconfont icon-processMgr'
            }
          },
          {
            path: 'packing-specification',
            name: 'packing-specification',
            component: () => import('@/views/basis-info/product-info/packing-specification.vue'),
            meta: {
              title: '包装规格',
              icon: 'iconfont icon-area'
            }
          },
          {
            path: 'order-info',
            name: 'order-info',
            component: () => import('@/views/basis-info/product-info/order-info.vue'),
            meta: {
              title: '工单信息',
              icon: 'iconfont icon-info'
            }
          },
          {
            path: 'part-master',
            name: 'part-master',
            component: () => import('@/views/basis-info/product-info/part-master.vue'),
            meta: {
              title: '料号信息',
              icon: 'iconfont icon-processMgr'
            }
          },
          {
            path: 'workorder-bom',
            name: 'workorder-bom',
            component: () => import('@/views/basis-info/product-info/workorder-bom.vue'),
            meta: {
              title: '工单BOM',
              icon: 'iconfont icon-area'
            }
          },
          {
            path: 'wobom-avl',
            name: 'wobom-avl',
            component: () => import('@/views/basis-info/product-info/wobom-avl.vue'),
            meta: {
              title: '工单BOM替代料',
              icon: 'iconfont icon-area'
            }
          },
          {
            path: 'ebom-avl',
            name: 'ebom-avl',
            component: () => import('@/views/basis-info/product-info/ebom-avl.vue'),
            meta: {
              title: 'EBOMAVL',
              icon: 'iconfont icon-info'
            }
          },
          {
            path: 'ebom',
            name: 'ebom',
            component: () => import('@/views/basis-info/product-info/ebom.vue'),
            meta: {
              title: 'EBOM',
              icon: 'iconfont icon-info'
            }
          },
        ]
      }
    ]
  },
  {
    path: '/organize-manager',
    name: 'organize-manager',
    component: Main,
    meta: {
      title: '组织架构',
      hideInMenu: true,
      icon: 'iconfont icon-organize'
    },
    children: [
      {
        path: 'user-manager',
        name: 'user-manager',
        meta: {
          title: '用户管理',
          icon: 'iconfont icon-person'
        },
        component: () => import('@/views/organize-manager/user-manager.vue')
      },
      {
        path: 'organize-info',
        name: 'organize-info',
        meta: {
          title: '机构管理',
          icon: 'iconfont icon-organize'
        },
        component: () => import('@/views/organize-manager/organize-info.vue')
      },
      {
        path: 'attendance-manage',
        name: 'attendance-manage',
        component: parentView,
        meta: {
          title: '考勤管理',
          icon: 'iconfont icon-date'
        },
        children: [
          {
            path: 'attendance-personnel',
            name: 'attendance-personnel',
            component: () => import('@/views/organize-manager/attendance-manage/attendance-personnel.vue'),
            meta: {
              title: '考勤人员维护',
              icon: 'iconfont icon-adduser'
            }
          },
          {
            path: 'useratt-limit',
            name: 'useratt-limit',
            component: () => import('@/views/organize-manager/attendance-manage/useratt-limit.vue'),
            meta: {
              title: '考勤排班',
              icon: 'iconfont icon-clock'
            }
          },
          {
            path: 'attendance-clock',
            name: 'attendance-clock',
            component: () => import('@/views/organize-manager/attendance-manage/attendance-clock.vue'),
            meta: {
              title: '考勤打卡',
              icon: 'iconfont icon-clock'
            }
          },
        ]
      },
    ]
  },
  {
    path: '/system-manager',
    name: 'system-manager',
    component: Main,
    meta: {
      title: '系统管理',
      hideInMenu: true,
      icon: 'iconfont icon-setting'
    },
    children: [
      {
        path: 'assets-manager',
        name: 'assets-manager',
        component: parentView,
        meta: {
          title: '资源管理',
          icon: 'iconfont icon-floder'
        },
        children: [
          {
            path: 'assets-type',
            name: 'assets-type',
            component: () => import('@/views/system-manager/assets-manager/assets-type.vue'),
            meta: {
              title: '静态资源类别管理',
              icon: 'iconfont icon-buffer'
            }
          },
          {
            path: 'assets-upload',
            name: 'assets-upload',
            component: () => import('@/views/system-manager/assets-manager/assets-upload.vue'),
            meta: {
              title: '静态资源上传',
              icon: 'iconfont icon-buffer'
            }
          },
        ]
      },
      {
        path: 'code-rule',
        name: 'code-rule',
        component: parentView,
        meta: {
          title: '编码规则',
          icon: 'iconfont icon-bill'
        },
        children: [
          {
            path: 'order-code',
            name: 'order-code',
            component: () => import('@/views/system-manager/code-rule/order-code.vue'),
            meta: {
              title: '单据编码',
              icon: 'iconfont icon-paper'
            }
          },
          {
            path: 'code-set',
            name: 'code-set',
            component: () => import('@/views/system-manager/code-rule/code-set.vue'),
            meta: {
              title: '编码集合',
              icon: 'iconfont icon-paper'
            }
          },

        ]
      },
      {
        path: 'system-config',
        name: 'system-config',
        component: parentView,
        meta: {
          title: '系统配置',
          icon: 'iconfont icon-settings'
        },
        children: [
          {
            path: 'area-floor',
            name: 'area-floor',
            component: () => import('@/views/system-manager/system-config/area-floor.vue'),
            meta: {
              title: '线体管理',
              icon: 'iconfont icon-area'
            }
          },
          {
            path: 'customer-vendor',
            name: 'customer-vendor',
            component: () => import('@/views/system-manager/system-config/customer-vendor.vue'),
            meta: {
              title: '厂商客户管理',
              icon: 'iconfont icon-area'
            }
          },
          {
            path: 'equipment-manage',
            name: 'equipment-manage',
            component: () => import('@/views/system-manager/system-config/equipment-manage.vue'),
            meta: {
              title: '设备管理',
              icon: 'iconfont icon-area'
            }
          },
        ]
      },
      {
        path: 'message-info',
        name: 'message-info',
        component: () => import('@/views/system-manager/message-info.vue'),
        meta: {
          title: '消息中心',
          icon: 'iconfont icon-notice'
        }
      },
      {
        path: 'database-manager',
        name: 'database-manager',
        component: () => import('@/views/system-manager/database-manager.vue'),
        meta: {
          title: '数据库管理',
          icon: 'iconfont icon-buffer'
        }
      },
      {
        path: 'data-item',
        name: 'data-item',
        component: () => import('@/views/system-manager/data-item.vue'),
        meta: {
          title: '数据字典',
          icon: 'iconfont icon-dictionary'
        }
      },
      {
        path: 'ETL-manager',
        name: 'ETL-manager',
        component: () => import('@/views/system-manager/ETL-manager.vue'),
        meta: {
          title: 'ETL管理',
          icon: 'iconfont icon-buffer'
        }
      },
      {
        path: 'rule-info',
        name: 'rule-info',
        component: () => import('@/views/system-manager/rule-info.vue'),
        meta: {
          title: 'Rule信息',
          icon: 'iconfont icon-buffer'
        }
      },
      {
        path: 'developer-center',
        name: 'developer-center',
        component: parentView,
        meta: {
          title: '开发者中心',
          icon: 'iconfont icon-role'
        },
        children: [
          {
            path: 'version-update',
            name: 'version-update',
            component: () => import('@/views/system-manager/developer-center/version-update.vue'),
            meta: {
              title: '后台版本发布',
              icon: 'iconfont icon-update'
            }
          },
        ]
      },
    ]
  },
  {
    path: '/material-manager',
    name: 'material-manager',
    component: Main,
    meta: {
      title: '物料管理',
      hideInMenu: true,
      icon: 'iconfont icon-net'
    },
    children: [
      {
        path: 'order-material',
        name: 'order-material',
        component: parentView,
        meta: {
          title: '工单物料',
          icon: 'iconfont icon-net'
        },
        children: [
          {
            path: 'order-import',
            name: 'order-import',
            component: () => import('@/views/material-manager/order-material/order-import.vue'),
            meta: {
              title: '工单导入',
              icon: 'iconfont icon-bill'
            }
          },
          {
            path: 'order-binding',
            name: 'order-binding',
            component: () => import('@/views/material-manager/order-material/order-binding.vue'),
            meta: {
              title: '工单绑定',
              icon: 'iconfont icon-link'
            }
          },
          {
            path: 'order-undertake',
            name: 'order-undertake',
            component: () => import('@/views/material-manager/order-material/order-undertake.vue'),
            meta: {
              title: '工单承接',
              icon: 'iconfont icon-paper'
            }
          },
          {
            path: 'order-report',
            name: 'order-report',
            component: () => import('@/views/material-manager/order-material/order-report.vue'),
            meta: {
              title: '工单报表',
              icon: 'iconfont icon-bill'
            }
          }
        ]
      },
      {
        path: 'laboratory-function',
        name: 'laboratory-function',
        component: parentView,
        meta: {
          title: '实验室功能',
          icon: 'iconfont icon-bulb'
        },
        children: [
          {
            path: 'examine-sn',
            name: 'examine-sn',
            component: () => import('@/views/material-manager/laboratory-function/examine-sn.vue'),
            meta: {
              title: '检查SN',
              icon: 'iconfont icon-eye'
            }
          }
        ]
      },
      {
        path: 'feeder-manager',
        name: 'feeder-manager',
        component: parentView,
        meta: {
          title: 'Feeder管理',
          icon: 'iconfont icon-bill'
        },
        children: [
          {
            path: 'feeder-search',
            name: 'feeder-search',
            component: () => import('@/views/material-manager/feeder-manager/feeder-search.vue'),
            meta: {
              title: 'Feeder查询',
              icon: 'iconfont icon-search'
            }
          },
          {
            path: 'feeder-maintain',
            name: 'feeder-maintain',
            component: () => import('@/views/material-manager/feeder-manager/feeder-maintain.vue'),
            meta: {
              title: '维修保养',
              icon: 'iconfont icon-setting'
            }
          },
          {
            path: 'feeder-in',
            name: 'feeder-in',
            component: () => import('@/views/material-manager/feeder-manager/feeder-in.vue'),
            meta: {
              title: 'Feeder入库',
              icon: 'iconfont icon-in'
            }
          },
          {
            path: 'feeder-out',
            name: 'feeder-out',
            component: () => import('@/views/material-manager/feeder-manager/feeder-out.vue'),
            meta: {
              title: 'Feeder入库',
              icon: 'iconfont icon-out'
            }
          }
        ]
      }
    ]
  },
  {
    path: '/flow-manager',
    name: 'flow-manager',
    component: Main,
    meta: {
      title: '流程管理',
      hideInMenu: true,
      icon: 'iconfont icon-net'
    },
    children: [
      {
        path: 'made-manager',
        name: 'made-manager',
        component: parentView,
        meta: {
          title: '制程管理',
          icon: 'iconfont icon-net'
        },
        children: [
          {
            path: 'zone-manage',
            name: 'zone-manage',
            component: () => import('@/views/flow-manager/made-manager/zone-manage.vue'),
            meta: {
              title: '制程管理',
              icon: 'iconfont icon-area'
            }
          },
          {
            path: 'zone-category',
            name: 'zone-category',
            component: () => import('@/views/flow-manager/made-manager/zone-category.vue'),
            meta: {
              title: '制程类别管理',
              icon: 'iconfont icon-area'
            }
          },
        ]
      },
      {
        path: 'wf-route',
        name: 'wf-route',
        component: () => import('@/views/flow-manager/wf-route.vue'),
        meta: {
          title: '产线流程管理',
          icon: 'iconfont icon-area'
        }
      },
      {
        path: 'flow-work',
        name: 'flow-work',
        component: parentView,
        meta: {
          title: '流程管理',
          icon: 'iconfont icon-net'
        },
        children: [
          {
            path: 'flow-card',
            name: 'flow-card',
            component: () => import('@/views/flow-manager/flow-work/flow-card.vue'),
            meta: {
              title: '流程卡',
              icon: 'iconfont icon-area'
            }
          },
        ]
      },
    ]
  },
]

// 错误页面路由模块
const errorRouter = [
  {
    path: '/401',
    name: 'error-401',
    meta: {
      title: '401',
      hideInMenu: true
    },
    component: () => import('@/views/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error-500',
    meta: {
      title: '500',
      hideInMenu: true
    },
    component: () => import('@/views/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error-404',
    meta: {
      title: '404',
      hideInMenu: true
    },
    component: () => import('@/views/error-page/404.vue')
  }
]

export const fixRouter = [
  loginRouter,
  ...otherRouter,
  ...errorRouter
]

export default [
  ...mainRouter,
  ...fixRouter
]