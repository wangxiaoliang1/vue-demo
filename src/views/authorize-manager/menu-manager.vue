<template>
  <div class="page-style">
    <!-- 授权弹窗 -->
    <Modal class-name="page-style-modal" :width="800" :styles="{top: '20px'}" v-model="modalFlag" :title="$t('iconName')">
      <icon-custom style="max-height: 400px;overflow-y: auto;" @on-copy="getIconClass"></icon-custom>
      <div slot="footer">
        <Button type="primary" @click="modalFlag = false">{{$t('ok')}}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('routerName')" prop="routerName">
          <Input v-model="req.routerName" :placeholder="$t('pleaseEnter') + $t('routerName')"/>
        </FormItem>
        <FormItem :label="$t('routerTitle')" prop="routerTitle">
            <Input v-model="req.routerTitle" :placeholder="$t('pleaseEnter') + $t('routerTitle')"/>
        </FormItem>
        <FormItem :label="$t('routerIcon')" prop="routerIcon">
          <Input v-model="req.routerIcon" icon="ios-more" :placeholder="$t('pleaseEnter') + $t('routerIcon')" @on-click="modalFlag = true"/>
        </FormItem>
        <FormItem :label="$t('component')" prop="component">
          <Input v-model="req.component" :placeholder="$t('pleaseEnter') + $t('component')"/>
        </FormItem>
        <FormItem :label="$t('theParent')" prop="routerParentId">
          <treeselect v-model="req.routerParentId" :options="leftTreeData" :showCount="true" @input="theParentInput"
                      :placeholder="$t('pleaseSelect') + $t('theParent')"/>
        </FormItem>
        <FormItem :label="$t('apiName')" prop="apis">
          <Select v-model="req.apis" multiple clearable filterable :max-tag-count="1"
                  :placeholder="$t('pleaseSelect') + $t('apiName')">
            <Option v-for="(item, i) in apiData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="req.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('category')" prop="category" v-show="isAdd">
          <RadioGroup v-model="req.category">
            <Radio :label="1" :disabled="isAddMenu">{{ $t('menu') }}</Radio>
            <Radio :label="2" :disabled="isAddButton">{{ $t('btn') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="req.enabled">
            <span slot="open">{{ $t('open') }}</span>
            <span slot="close">{{ $t('close') }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="req.remark" :placeholder="$t('pleaseEnter') + $t('remark')"/>
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button :isAdd="isAdd" @on-cancel="cancelClick" @on-ok="okClick" @on-update="updateClick"
                         @on-okOrUpdate="okOrUpdateClick"></drawer-button>
        </FormItem>
      </Form>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <Split v-model="split">
        <div slot="left" class="split-pane">
          <tree-custom :initData="leftTreeData" :treeLoading="treeLoading" @on-select-change="treeSelect"></tree-custom>
        </div>
        <div slot="right" class="split-pane">
          <Card :bordered="false" dis-hover class="card-style split-right-card">
            <div slot="title">
              <Row>
                <i-col span="12">
                  <Form inline class="card-style-form" @submit.native.prevent>
                    <FormItem>
                      <Input search enter-button v-model="req.queryTitle" @on-search="searchClick"
                             :placeholder="$t('pleaseEnter') + $t('routerTitle')"/>
                    </FormItem>
                  </Form>
                </i-col>
                <i-col span="12">
                  <button-custom :btnData="btnData" @on-add-click="addClick"
                                 @on-edit-click="editClick"></button-custom>
                </i-col>
              </Row>
            </div>
            <table-custom :tableHeight="tableHeight" :tableLoading="tableLoading" :columns="columns" :data="data"
                          @on-current-change="currentClick" @on-sort-change="sortChange"></table-custom>
            <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                         @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
          </Card>
        </div>
      </Split>
    </div>
  </div>
</template>

<script>
  import {getlisttreecurrentuserReq, getpagelisttreeReq, addReq, modifyReq} from '@/api/authorize-manager/menu-manager'
  import {getlistReq} from '@/api/authorize-manager/api-manager'
  import {formatDate, getButtonBoolean, errorType, renderSpan} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import TreeCustom from '@/components/tree-custom'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'
  import IconCustom from '@/components/icon-custom'
  import Treeselect from '@riophae/vue-treeselect'

  export default {
    name: "menu-manager",
    components: {TreeCustom, ButtonCustom, DrawerButton, TableCustom, PageCustom, IconCustom, Treeselect},
    data() {
      return {
        split: .2,
        modalFlag: false,
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        isAddMenu: false,
        isAddButton: false,
        drawerTitle: this.$t('add'),
        leftTreeData: [], // 左侧树型源数据
        apiData: [], // api数据
        tableHeight: 200,
        treeLoading: true, // tree加载动画
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('routerTitle'), key: 'title', sortable: 'custom'},
          {title: this.$t('routerName'), key: 'name', sortable: 'custom'},
          {title: this.$t('component'), key: 'component'},
          {
            title: this.$t('enabled'), key: 'enabled',
            render: (h, params) => {
              return renderSpan(this, h, params.row.enabled)
            }
          },
          {
            title: this.$t('createDate'), key: 'createDate', width: 125,
            render: (h, params) => {
              return h('div', params.row.createDate ? formatDate(params.row.createDate, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {
            title: this.$t('modifyDate'), key: 'modifyDate', width: 125,
            render: (h, params) => {
              return h('div', params.row.modifyDate ? formatDate(params.row.modifyDate, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {title: this.$t('remark'), key: 'remark'}
        ], // 表格数据
        data: [], // 表格数据
        selectObj: null, // 表格选中数据
        req: {
          id: '0',
          parentId: '',
          treeCategory: 1,
          source: 1, // 1web 2app
          queryName: '',
          queryTitle: '',
          routerId: '0',
          routerParentId: null,
          routerPath: '', // 路由路径
          routerName: '', // 路由名称
          routerTitle: '', // 标题
          routerIcon: '',
          component: '', // 组件
          apis: [], // api接口
          sortCode: 0,
          category: 1, // 1菜单 2按钮
          enabled: true, // 1有效 0无效
          remark: '', // 描述
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          routerName: [{required: true, message: this.$t('pleaseEnter') + this.$t('routerName'), trigger: 'blur'}],
          routerTitle: [{required: true, message: this.$t('pleaseEnter') + this.$t('routerTitle'), trigger: 'blur'}],
          routerIcon: [{required: true, message: this.$t('pleaseEnter') + this.$t('routerIcon'), trigger: 'blur'}],
          component: [{required: true, message: this.$t('pleaseEnter') + this.$t('component'), trigger: 'blur'}],
          routerParentId: [{required: true, message: this.$t('pleaseEnter') + this.$t('theParent'), trigger: 'change'}],
          apis: [{required: true, type: 'array', message: this.$t('pleaseEnter') + this.$t('apiName'), trigger: 'change'}],
        },
        btnData: []
      }
    },
    mounted() {
      this.getLeftMenu()
      getButtonBoolean(this, this.btnData)
      this.getApiData()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            id: '',
            parentId: this.req.id,
            category: this.req.treeCategory,
            name: this.req.queryName.trim(),
            title: this.req.queryTitle.trim(),
            enabled: -1
          }
        }
        getpagelisttreeReq(obj).then(res => {
          this.tableLoading = false
          if (res.code === 200) {
            let data = res.result
            this.data = data.data ? data.data : []
            this.req.pageSize = data.pageSize
            this.req.pageIndex = data.pageIndex
            this.req.total = data.total
            this.req.totalPage = data.totalPage
          }
        }).catch(() => this.tableLoading = false)
      },
      // 获取页面左侧菜单
      getLeftMenu() {
        this.treeLoading = true
        getlisttreecurrentuserReq().then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.leftTreeData = []
            this.initMenuNode(this.leftTreeData, res.result)
            this.pageLoad()
          } else this.$Message.error(errorType(this, res.errorCode))
        }).catch(() => this.treeLoading = false)
      },
      // 处理获取的菜单数据
      initMenuNode(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            title: item.title,
            label: item.title,
            name: item.name,
            category: item.category,
            parentId: item.parentId,
            icon: item.icon,
            component: item.component,
            expand: item.category === 1,
            selected: false,
            children: []
          }
          if (hasChild(item)) {
            this.initMenuNode(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 树型点击事件
      treeSelect(data) {
        if (data.length > 0) {
          const obj = data[0]
          this.req.id = obj.id
          this.req.treeCategory = obj.children && obj.children.length > 0 ? 1 : 2
        } else this.treeCancel()
        this.selectObj = null
        this.pageLoad()
      },
      // 树型选中清除
      treeCancel() {
        this.req.id = '0'
        this.req.treeCategory = 1
      },
      // 树型选中清除
      getApiData() {
        getlistReq({roleIds: this.$store.state.roleIds, systemFlag: this.$store.state.systemFlag}).then(res => {
          if (res.code === 200) {
            let data = res.result || []
            this.apiData = data.filter(o => o.whiteApi === 0)
          }
        })
      },
      // 点击搜索按钮触发
      searchClick() {
        this.pageLoad()
      },
      // 点击搜索按钮触发
      getIconClass(name) {
        this.req.routerIcon = name
        this.modalFlag = false
      },
      // 所属上级选择操作
      theParentInput(value) {
        if (!value) {
          this.req.routerParentId = null
        }
      },
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true
        this.isAdd = true
        this.drawerTitle = this.$t('add')
        this.req.routerParentId = this.req.id
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            const routerName = this.req.routerName.trim()
            let obj = {
              parentId: this.req.routerParentId,
              href: this.req.component === 'Main' ? `/${routerName}` : routerName,
              name: routerName,
              title: this.req.routerTitle.trim(),
              icon: this.req.routerIcon.trim(),
              component: this.req.component.trim(),
              apis: this.req.apis.join(','),
              category: this.req.category,
              source: this.req.source,
              sortCode: this.req.sortCode
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.pageLoad()
                if (this.isSuccess) {
                  this.treeCancel()
                  this.cancelClick()
                }
              } else this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 点击新增按钮触发
      editClick() {
        if (this.selectObj) {
          const data = this.selectObj
          this.req.routerId = data.id
          this.req.routerParentId = data.parentId
          this.req.routerPath = data.href
          this.req.routerName = data.name
          this.req.routerTitle = data.title
          this.req.routerIcon = data.icon
          this.req.component = data.component
          this.req.apis = data.apis && (data.apis.includes(',') ? data.apis.split(',') : [data.apis]) || []
          this.req.sortCode = data.sortCode
          this.req.enabled = data.enabled === 1
          this.req.remark = data.remark
          this.isAddMenu = this.req.category === 2
          this.isAddButton = this.req.category === 1
          this.drawerFlag = true
          this.isAdd = false
          this.drawerTitle = this.$t('edit')
        } else this.$Message.warning(this.$t('oneData'))
      },
      // 修改菜单、按钮
      updateClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            const routerName = this.req.routerName.trim()
            let obj = {
              id: this.req.routerId,
              parentId: this.req.routerParentId,
              href: this.req.component.trim() === 'Main' ? `/${routerName}` : routerName,
              name: routerName,
              title: this.req.routerTitle.trim(),
              icon: this.req.routerIcon.trim(),
              component: this.req.component.trim(),
              apis: this.req.apis.join(','),
              enabled: this.req.enabled ? 1 : 0,
              source: this.req.source,
              sortCode: this.req.sortCode,
              remark: this.req.remark
            }
            modifyReq(obj).then(res => {
              if (res.code === 200) {
                this.selectObj = null
                this.getLeftMenu()
                if (this.isSuccess) {
                  this.treeCancel()
                  this.cancelClick()
                }
                this.$Message.success(`${this.$t('edit')}${this.$t('success')}`)
              } else this.$Message.error(`${this.$t('edit')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 点击新增或修改并关闭按钮触发
      okOrUpdateClick() {
        this.isSuccess = true
        this.isAdd ? this.okClick() : this.updateClick()
      },
      cancelClick() {
        this.drawerFlag = false
        this.isSuccess = false
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.routerId = '0'
        this.req.routerParentId = '0'
        this.req.routerPath = ''
        this.req.routerName = ''
        this.req.routerTitle = ''
        this.req.routerIcon = ''
        this.req.component = ''
        this.req.apis = []
        this.req.sortCode = 0
        this.req.category = 1
        this.req.enabled = true
        this.req.remark = ''
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 120
        this.tableHeight = height - 60
      },
      // 某一行高亮时触发
      currentClick(currentRow) {
        this.selectObj = currentRow
      },
      // 排序时有效，当点击排序时触发
      sortChange(data) {
        this.req.orderField = data.key.toUpperCase()
        this.req.ascending = data.order === 'asc'
        this.pageLoad()
      },
      // 选择第几页
      pageChange(index) {
        this.req.pageIndex = index
        this.pageLoad()
      },
      // 选择一页有条数据
      pageSizeChange(index) {
        this.req.pageIndex = 1
        this.req.pageSize = index
        this.pageLoad()
      }
    }
  }
</script>
