<template>
  <div class="page-style">
    <!-- 授权弹窗 -->
    <Modal class-name="page-style-modal" v-model="modalFlag" :styles="{top: '20px'}" :title="modalTitle"
           :width="modalWidth" :mask-closable="false" :scrollable="true" @on-cancel="modalCancel">
      <div v-if="isAddMenu" style="height: 450px;">
        <tree-custom :initData="initMenuTreeData" :treeLoading="treeLoading" :showCheckbox="true" @on-check-change="treeCheckChange"></tree-custom>
      </div>
      <div v-if="isAddApi">
        <Input search enter-button v-model="req.modalQueryName" :placeholder="$t('pleaseEnter') + $t('name')" @on-search="apiSearch"/>
        <table-custom refName="apiSelect" :tableHeight="370" :highlightRow="false" style="margin-top: 5px;" :columns="apiColumns" :data="apiData"
                      @on-select-change="selectChange"></table-custom>
        <page-custom :total="req.modalTotal" :totalPage="req.modalTotalPage" :pageIndex="req.modalPageNum"
                     :page-size="req.modalPageSize" @on-change="pageChangeModal"
                     @on-page-size-change="pageSizeChangeModal"/>
      </div>
      <div slot="footer">
        <Button @click="modalCancel">{{$t('cancel')}}</Button>
        <Button type="primary" @click="modalOk">{{$t('ok')}}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('roleName')" prop="roleName">
          <Input v-model="req.roleName" :placeholder="$t('pleaseEnter') + $t('roleName')"/>
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="req.sortCode" :min="0"></InputNumber>
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
                      <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                             :placeholder="$t('pleaseEnter') + $t('name')"/>
                    </FormItem>
                  </Form>
                </i-col>
                <i-col span="12">
                  <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick"
                                 @on-roleAuthorize-click="roleAuthorizeClick"
                                 @on-apiAuthorize-click="apiAuthorizeClick"></button-custom>
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
  import {getlisttreeReq, getpagelistReq, addReq, modifyReq, addroleauthorizeReq, modifyroleauthorizeReq} from '@/api/authorize-manager/role-manager'
  import {getlisttreeauthReq} from '@/api/authorize-manager/menu-manager'
  import {getlistReq, getpagelistReq as getapipagelistReq, addapiauthorizeReq, modifyapiauthorizeReq} from '@/api/authorize-manager/api-manager'
  import {formatDate, getButtonBoolean, errorType, getTreeEffectiveData, initTreeList, renderSpan} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import TreeCustom from '@/components/tree-custom'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "role-manager",
    components: {TreeCustom, ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      return {
        split: .2,
        modalFlag: false,
        modalTitle: this.$t('roleAuthorize'),
        modalWidth: 400,
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        drawerTitle: this.$t('add'),
        checkbox: true,
        indeterminate: false,
        checkAll: false,
        isAddMenu: false,
        isAddApi: false,
        tableHeight: 200,
        tableLoading: true, // table加载动画
        treeLoading: true, // tree加载动画
        leftTreeData: [], // 左侧树型源数据
        menuTreeData: [], // 树型源数据
        initMenuTreeData: [], // 初始化后获得的树型源数据
        roleAuthorizeData: [], // 该角色已有权限
        apiColumns: [
          {type: 'selection', width: 50, align: 'center'},
          {title: this.$t('apiName'), key: 'name'},
          {title: this.$t('api'), key: 'api'}
        ], // 该角色api数据源
        apiData: [], // 该角色api数据源
        apiAuthorizeData: [], // 该角色已有api权限
        columns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('name'), key: 'name', sortable: 'custom'},
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
          roleIds: this.$store.state.roleIds,
          systemFlag: this.$store.state.systemFlag,
          id: '',
          parentId: '',
          queryName: '',
          roleId: '', // 角色id
          roleParentId: '', // 角色父级id
          roleName: '', // 角色名称
          sortCode: 0, // 排序码
          enabled: true, // 1有效 0无效
          remark: '', // 描述
          isAddOrModify: true, // 新增或者修改角色权限 true新增 false修改
          selectMenuButtonId: [], // 选中的按钮或菜单的id和category
          selectApiId: [], // 选中的api的id
          modalQueryName: '',
          modalTotal: 0,
          modalTotalPage: 0,
          modalPageSize: 20,
          modalPageNum: 1,
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          roleName: [{required: true, message: this.$t('pleaseEnter') + this.$t('roleName'), trigger: 'blur'}]
        },
        btnData: []
      }
    },
    mounted() {
      this.getLeftTree()
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
      // 获取角色权限数据
      async getTreeData() {
        this.treeLoading = true
        await getlisttreeauthReq({
          roleIds: this.req.roleIds,
          systemFlag: this.req.systemFlag,
          type: 0, //分类 0 获取自己拥有的, 1 获取选择的角色
          category: 0
        }).then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.menuTreeData = res.result
          } else this.$Message.error(res.message)
        }).catch(() => this.treeLoading = false)
      },
      // 获取该角色已有权限
      async getRoleAuthorizeData() {
        await getlisttreeauthReq({
          roleIds: this.selectObj.id,
          systemFlag: this.selectObj.systemFlag,
          type: 1, //分类 0 获取自己拥有的, 1 获取选择的角色
          category: 0
        }).then(res => {
          if (res.code === 200) {
            this.roleAuthorizeData = []
            let arr = []
            this.req.isAddOrModify = res.result.length === 0
            initTreeList(arr, res.result)
            getTreeEffectiveData(this.roleAuthorizeData, arr, this.menuTreeData)
            this.req.selectMenuButtonId = arr.map(item => {
              return {menuButtonId: item.id, category: item.category}
            })
          } else this.$Message.error(res.message)
        })
      },
      // 处理获取的菜单数据
      initMenuNode(list, data) {
        for (let item of data) {
          let isExpand = false
          if (hasChild(item)) isExpand = item.category === 1
          let isCheck = false
          if (this.roleAuthorizeData.find(o => o.id === item.id)) isCheck = true
          let node = {
            id: item.id,
            title: item.title,
            name: item.name,
            category: item.category,
            parentId: item.parentId,
            icon: item.icon,
            component: item.component,
            expand: isExpand,
            checked: isCheck,
            children: []
          }
          if (hasChild(item)) {
            this.initMenuNode(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 获取角色api权限数据
      async getApiData() {
        let obj = {
          orderField: 'CREATEDATE', // 排序字段
          ascending: true, // 是否升序
          pageSize: this.req.modalPageSize, // 分页大小
          pageIndex: this.req.modalPageNum, // 当前页码
          data: {
            systemFlag: this.req.systemFlag,
            api: '',
            name: this.req.modalQueryName,
            enabled: -1
          }
        }
        await getapipagelistReq(obj).then(res => {
          if (res.code === 200) {
            let data = res.result
            const arr = data.data ? data.data : []
            this.apiData = []
            if (arr.length > 0) {
              arr.forEach(item => {
                item['_checked'] = false
              })
              this.apiData.push(...arr)
            }
            this.req.modalPageSize = data.pageSize
            this.req.modalPageNum = data.pageIndex
            this.req.modalTotal = data.total
            this.req.modalTotalPage = data.totalPage
          } else this.$Message.error(res.message)
        })
      },
      // 获取该角色已有api权限
      async getApiAuthorizeData() {
        await getlistReq({roleIds: this.selectObj.id, systemFlag: this.selectObj.systemFlag}).then(res => {
          if (res.code === 200) {
            const arr = res.result ? res.result : []
            this.req.selectApiId = arr.map(o => o.id)
            this.req.isAddOrModify = arr.length === 0
            this.apiData.forEach(o => {
              const item = this.req.selectApiId.find(x => x === o.id)
              o._checked = item !== undefined
            })
          } else this.$Message.error(res.message)
        })
      },
      // 获取该角色已有api权限
      async getAllApiAuthorizeData() {
        await this.getApiData()
        await this.getApiAuthorizeData()
      },
      // 处理获取的菜单数据
      initTreeNode(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            parentId: item.parentId,
            title: item.name,
            icon: 'iconfont icon-role',
            systemFlag: item.systemFlag,
            sortCode: item.sortCode,
            enabled: item.enabled,
            expand: true,
            selected: false,
            children: []
          }
          if (hasChild(item)) {
            this.initTreeNode(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 获取页面左侧菜单
      getLeftTree() {
        this.treeLoading = true
        getlisttreeReq({id: '', parentId: '', name: '', enabled: -1}).then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.leftTreeData = []
            this.initTreeNode(this.leftTreeData, res.result)
            this.pageLoad()
          } else this.$Message.error(res.result)
        }).catch(() => this.treeLoading = false)
      },
      // 树型点击事件
      treeSelect(data) {
        if (data.length > 0) {
          const obj = data[0]
          this.req.id = obj.id
          this.req.parentId = obj.parentId
        } else this.treeCancel()
        this.selectObj = null
        this.pageLoad()
      },
      // 树型选中清除
      treeCancel() {
        this.req.id = ''
        this.req.parentId = ''
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击搜索按钮触发
      apiSearch() {
        this.req.modalPageNum = 1
        this.getAllApiAuthorizeData()
      },
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true
        this.isAdd = true
        this.drawerTitle = this.$t('add')
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            if (!this.req.id) return this.$Message.error(this.$t('selectRoleTips'))
            let obj = {
              parentId: this.req.id,
              name: this.req.roleName.trim(),
              sortCode: this.req.sortCode,
              systemFlag: this.req.systemFlag,
              remark: this.req.remark
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.getLeftTree()
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
          this.req.roleId = data.id
          this.req.roleParentId = data.parentId
          this.req.roleName = data.name
          this.req.sortCode = data.sortCode
          this.req.enabled = data.enabled === 1
          this.req.remark = data.remark
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
              id: this.req.roleId,
              parentId: this.req.roleParentId,
              name: this.req.roleName.trim(),
              sortCode: this.req.sortCode,
              enabled: this.req.enabled ? 1 : 0,
              remark: this.req.remark
            }
            modifyReq(obj).then(res => {
              if (res.code === 200) {
                this.selectObj = null
                this.getLeftTree()
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
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false
        this.isSuccess = false
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.roleId = ''
        this.req.roleParentId = ''
        this.req.roleName = ''
        this.req.sortCode = 0
        this.req.enabled = true
        this.req.remark = ''
      },
      // 点击角色授权按钮触发
      async roleAuthorizeClick() {
        if (this.selectObj) {
          this.$Spin.show()
          this.modalFlag = true
          this.modalTitle = this.$t('roleAuthorize')
          this.modalWidth = 550
          await this.getTreeData()
          await this.getRoleAuthorizeData()
          this.initMenuNode(this.initMenuTreeData, this.menuTreeData)
          this.isAddMenu = true
          this.$Spin.hide()
        } else this.$Message.warning(this.$t('oneData'))
      },
      // 点击api授权按钮触发
      async apiAuthorizeClick() {
        if (this.selectObj) {
          this.$Spin.show()
          this.modalFlag = true
          this.modalTitle = this.$t('apiAuthorize')
          this.modalWidth = 800
          await this.getAllApiAuthorizeData()
          this.isAddApi = true
          this.$Spin.hide()
        } else this.$Message.warning(this.$t('oneData'))
      },
      // 授权弹窗取消
      modalCancel() {
        this.modalFlag = false
        this.menuTreeData = []
        this.initMenuTreeData = []
        this.roleAuthorizeData = []
        this.apiData = []
        this.apiAuthorizeData = []
        this.req.selectMenuButtonId = []
        this.req.selectApiId = []
        this.req.isAddOrModify = false
        this.isAddApi = false
        this.isAddMenu = false
      },
      // 授权弹窗确定
      modalOk() {
        if (this.isAddMenu) this.menuSubmit()
        else if (this.isAddApi) this.apiSubmit()
      },
      // 菜单或按钮提交
      menuSubmit() {
        const obj = {
          roleId: this.selectObj.id,
          menuButtonCategorys: this.req.selectMenuButtonId,
          source: 1
        }
        this.submitRoleAuthorize(obj).then(res => {
          if (res.code === 200) {
            this.$Message.success(this.$t('success'))
            this.modalCancel()
          } else this.$Message.error(res.message)
        })
      },
      // 筛选使用新增还是用修改接口
      submitRoleAuthorize(obj) {
        return this.req.isAddOrModify ? addroleauthorizeReq(obj) : modifyroleauthorizeReq(obj)
      },
      // api提交
      apiSubmit() {
        if (!this.req.isAddOrModify && this.req.selectApiId.length < 2) return this.$Message.warning(this.$t('apiModifyTips'))
        const obj = {
          roleId: this.selectObj.id,
          apiIds: this.req.selectApiId
        }
        this.submitApiAuthorize(obj).then(res => {
          if (res.code === 200) {
            this.$Message.success(this.$t('success'))
            this.modalCancel()
          } else this.$Message.error(res.message)
        })
      },
      // 筛选使用新增还是用修改接口
      submitApiAuthorize(obj) {
        return this.req.isAddOrModify ? addapiauthorizeReq(obj) : modifyapiauthorizeReq(obj)
      },
      // 弹窗树型数据变化触发事件
      treeCheckChange(data) {
        if (this.isAddMenu) {
          this.req.selectMenuButtonId = data.map(item => {
            return {menuButtonId: item.id, category: item.category}
          })
        }
      },
      // 弹窗api权限数据发生改变时触发
      selectChange(data) {
        this.req.selectApiId = data.map(o => o.id)
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
      },
      // 选择第几页
      pageChangeModal(index) {
        this.req.modalPageNum = index
        this.getAllApiAuthorizeData()
      },
      // 选择一页有条数据
      pageSizeChangeModal(index) {
        this.req.modalPageNum = 1
        this.req.modalPageSize = index
        this.getAllApiAuthorizeData()
      }
    }
  }
</script>
