<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('organizeName')" prop="organizeName">
          <Input v-model="req.organizeName" :placeholder="$t('pleaseEnter') + $t('organizeName')"/>
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="req.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('category')" prop="category" v-show="isAdd">
          <RadioGroup v-model="req.category">
            <Radio :label="1" :disabled="isAddMenu">{{ $t('company') }}</Radio>
            <Radio :label="2">{{ $t('department') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="req.enabled">
            <span slot="open">{{ $t('open') }}</span>
            <span slot="close">{{ $t('close') }}</span>
          </i-switch>
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
                      <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                             :placeholder="$t('pleaseEnter') + $t('organizeName')"/>
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
  import {getlisttreeReq, getpagelistReq, addReq, modifyReq} from '@/api/organize-manager/organize-info'
  import {formatDate, getButtonBoolean, errorType, renderSpan} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import TreeCustom from '@/components/tree-custom'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "organize-info",
    components: {TreeCustom, ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      return {
        split: .2,
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        isAddMenu: false,
        isAddButton: false,
        drawerTitle: this.$t('add'),
        treeLoading: true, // tree加载动画
        leftTreeData: [], // 左侧树型源数据
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('organizeName'), key: 'name', sortable: 'custom'},
          {
            title: this.$t('organizeType'), key: 'category',
            render: (h, params) => {
              return h('div', params.row.category === 1 ? this.$t('company') : this.$t('department'))
            }
          },
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
          }
        ], // 表格数据
        data: [], // 表格数据
        selectObj: null, // 表格选中数据
        req: {
          id: '0',
          parentId: '0',
          treeCategory: 1,
          queryName: '',
          organizeId: '0',
          organizeParentId: '0',
          organizeName: '', // 组织名称
          category: 1, // 1组织 2部门
          enabled: true, // 1有效 0无效
          sortCode: 0,
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          organizeName: [{required: true, message: this.$t('pleaseEnter') + this.$t('organizeName'), trigger: 'blur'}]
        },
        btnData: []
      }
    },
    mounted() {
      this.getLeftMenu()
      getButtonBoolean(this, this.btnData)
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
            category: 0,
            name: this.req.queryName.trim(),
            enabled: -1
          }
        }
        getpagelistReq(obj).then(res => {
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
        getlisttreeReq().then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.leftTreeData = []
            this.initMenuNode(this.leftTreeData, res.result)
            this.pageLoad()
          } else this.$Message.error(res.message)
        }).catch(() => this.treeLoading = false)
      },
      // 处理获取的菜单数据
      initMenuNode(list, data) {
        for (let item of data) {
          let isExpand = item.category === 1
          let node = {
            id: item.id,
            title: item.name,
            category: item.category,
            parentId: item.parentId,
            icon: isExpand ? 'iconfont icon-organize' : 'iconfont icon-company',
            expand: isExpand,
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
          this.req.parentId = obj.parentId
          this.req.treeCategory = obj.category
          this.isAddMenu = obj.category === 2
        } else {
          this.isAddMenu = false
          this.treeCancel()
        }
        this.selectObj = null
        this.pageLoad()
      },
      // 清楚树型数据
      treeCancel() {
        this.req.id = '0'
        this.req.parentId = '0'
        this.req.treeCategory = 1
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true
        this.isAdd = true
        this.req.category = this.req.treeCategory
        this.drawerTitle = this.$t('add')
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              parentId: this.req.id,
              name: this.req.organizeName.trim(),
              category: this.req.category,
              enabled: this.req.enabled ? 1 : 0,
              sortCode: this.req.sortCode
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.getLeftMenu()
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
          this.req.organizeId = data.id
          this.req.organizeParentId = data.parentId
          this.req.organizeName = data.name
          this.req.category = data.category
          this.req.enabled = data.enabled === 1
          this.req.sortCode = data.sortCode
          this.drawerFlag = true
          this.isAdd = false
          this.drawerTitle = this.$t('edit')
        } else this.$Message.warning(this.$t('oneData'))
      },
      // 修改菜单、按钮
      updateClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              id: this.req.organizeId,
              parentId: this.req.organizeParentId,
              name: this.req.organizeName.trim(),
              category: this.req.category,
              enabled: this.req.enabled ? 1 : 0,
              sortCode: this.req.sortCode
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
      // 取消
      cancelClick() {
        this.drawerFlag = false
        this.isSuccess = false
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.organizeId = '0'
        this.req.organizeParentId = '0'
        this.req.organizeName = ''
        this.req.category = 1
        this.req.enabled = true
        this.req.sortCode = 0
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
