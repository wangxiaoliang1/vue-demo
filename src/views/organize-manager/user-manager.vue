<template>
  <div class="page-style">
    <!-- 授权弹窗 -->
    <Modal class-name="page-style-modal" :styles="{top: '20px'}" v-model="modalFlag" :title="modalTitle" :mask-closable="false"
           :scrollable="true" @on-cancel="modalCancel">
      <div v-if="isResetPwd">
        <Form :label-width="50" @submit.native.prevent>
          <FormItem :label="$t('newPwd')" prop="newPwd">
            <Input v-model="req.newPwd" :placeholder="$t('pleaseEnter') + $t('newPwd')"/>
          </FormItem>
        </Form>
      </div>
      <div v-if="isDatabaseAuthorize">
        <table-custom refName="databaseSelect" :tableHeight="430" :highlightRow="false" :columns="databaseColumns" :data="databaseData"
                      @on-select-change="selectChange"></table-custom>
      </div>
      <div v-if="isZoneAuthorize" style="height: 450px;">
        <tree-custom :initData="initZoneTreeData" :treeLoading="treeLoading" :showCheckbox="true" @on-check-change="treeCheckChange"></tree-custom>
      </div>
      <div slot="footer">
        <Button @click="modalCancel">{{$t('cancel')}}</Button>
        <Button type="primary" @click="modalOk">{{$t('ok')}}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('account')" prop="account" v-if="isAdd">
          <Input v-model="req.account" :maxlength="36" :placeholder="$t('pleaseEnter') + $t('account')"/>
        </FormItem>
        <FormItem :label="$t('name')" prop="userName">
          <Input v-model="req.userName" :maxlength="36" :placeholder="$t('pleaseEnter') + $t('name')"/>
        </FormItem>
        <FormItem :label="$t('password')" prop="password" v-if="isAdd">
          <Input v-model="req.password" :placeholder="$t('pleaseEnter') + $t('password')"/>
        </FormItem>
        <FormItem :label="$t('phone')" prop="phone">
          <Input v-model="req.phone" :placeholder="$t('pleaseEnter') + $t('phone')"/>
        </FormItem>
        <FormItem :label="$t('email')" prop="email">
          <Input v-model="req.email" :placeholder="$t('pleaseEnter') + $t('email')"/>
        </FormItem>
        <FormItem :label="$t('companyName')" prop="companyId">
          <treeselect v-model="req.companyId" :options="companyData" :showCount="true" @input="companyInput"
                      :placeholder="$t('pleaseSelect') + $t('companyName')"/>
        </FormItem>
        <FormItem :label="$t('departmentName')" prop="departmentId">
          <treeselect v-model="req.departmentId" :options="departmentData" :showCount="true" @open="getDepartmentData"
                      :placeholder="$t('pleaseSelect') + $t('departmentName')"/>
        </FormItem>
        <FormItem :label="$t('systemFlag')" prop="systemFlags">
          <Select v-model="req.systemFlags" :multiple="true" :max-tag-count="3" :clearable="true"
                  :placeholder="$t('pleaseSelect') + $t('systemFlag')">
            <Option v-for="(item, i) in systemFlagData" :value="item" :key="i">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('roleName')" prop="roles">
          <treeselect v-model="req.roles" :options="roleData" :showCount="true" :multiple="true" :flat="true"
                      :placeholder="$t('pleaseSelect') + $t('roleName')"/>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled" v-if="!isAdd">
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
                      <Select class="query_more_select" v-model="req.selectName">
                        <Option value="userName">{{$t('userName')}}</Option>
                        <Option value="account">{{$t('account')}}</Option>
                      </Select>
                    </FormItem>
                    <FormItem>
                      <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                             :placeholder="$t('pleaseEnter') + $t('keyWords')"/>
                    </FormItem>
                  </Form>
                </i-col>
                <i-col span="12">
                  <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick"
                                 @on-resetPwd-click="resetPwdClick" @on-databaseAuthorize-click="databaseAuthorizeClick" @on-zoneAuthorize-click="zoneAuthorizeClick"></button-custom>
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
  import {getpagelistReq, addReq, modifyReq, resetpasswordReq} from '@/api/organize-manager/user-manager'
  import {getlimitlisttreeReq, getlisttreeReq} from '@/api/organize-manager/organize-info'
  import {getlisttreeReq as getRoleListTreeReq} from '@/api/authorize-manager/role-manager'
  import {getlistReq, adddatabaseauthorizeReq, modifydatabaseauthorizeReq} from '@/api/system-manager/database-manager'
  import {getlisttreeauthReq, floorlineauthorizeaddReq, floorlineauthorizemodifyReq} from '@/api/system-manager/area-floor'
  import {formatDate, getButtonBoolean, errorType, getZoneIcon, getTreeEffectiveData, initTreeList, renderSpan} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import {encryptDes, sha1_to_base64} from '@/libs/des'
  import {mapActions} from "vuex"
  import Treeselect from '@riophae/vue-treeselect'
  import TreeCustom from '@/components/tree-custom'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "user-manager",
    components: {Treeselect, TreeCustom, ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      // 自定义验证方式
      const validatePhone = (rule, value, callback) => {
        if (!(/^1[3456789]\d{9}$/.test(value))) callback(new Error(this.$t('pleaseEnterPerfect') + this.$t('phone')))
        else callback()
      }
      return {
        split: .2,
        isResetPwd: false,
        isDatabaseAuthorize: false,
        isZoneAuthorize: false,
        modalFlag: false,
        modalTitle: this.$t('updatePwd'),
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        drawerTitle: this.$t('add'),
        treeLoading: true, // tree加载动画
        leftTreeData: [], // 左侧树型源数据
        companyData: [], // 公司下拉树数据源
        departmentData: [], // 部门下拉树数据源
        roleData: [], // 角色下拉树数据源
        databaseColumns: [
          {type: 'selection', width: 50, align: 'center'},
          {title: this.$t('databaseName'), key: 'name'},
          {title: this.$t('databaseType'), key: 'databaseType'}
        ], // 数据库数据源
        databaseData: [], // 数据库数据源
        zoneData: [], // 楼层线体数据源
        zoneAuthorizeData: [], // 楼层线体已授权数据源
        initZoneTreeData: [], // 楼层线体树数据源
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('account'), key: 'account', sortable: 'custom'},
          {title: this.$t('userName'), key: 'name'},
          {title: this.$t('phone'), key: 'phone', width: 90},
          {title: this.$t('email'), key: 'email', width: 250},
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
        treeSelectObj: null, // 左侧树节点选中数据
        selectObj: null, // 表格选中数据
        req: {
          thisUserId: this.$store.state.id,
          systemFlag: this.$store.state.systemFlag,
          roleId: this.$store.state.roleIds,
          id: '',
          parentId: '0',
          treeCategory: 1,
          selectName: 'userName',
          queryName: '',
          newPwd: '',
          userId: '',
          headIcon: 'ios-body', // 用户头像
          account: '', // 用户账号
          userName: '', // 用户名称
          simpleSpelling: '', // 用户简拼
          password: '', // 密码
          phone: '', // 手机号
          email: '', // 邮箱
          companyId: null, // 公司id
          departmentId: null, // 部门id
          systemFlags: [this.$store.state.systemFlag], // 系统标识集合
          roles: null, // 角色集合
          category: 1, // 1组织 2部门
          enabled: true, // 1有效 0无效
          remark: '',
          isAddOrModify: true,
          selectDatabaseId: [],
          selectZoneId: [],
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          account: [{required: true, type: 'string', message: `${this.$t('pleaseEnter')}${this.$t('account')},${this.$t('validateTips')}`, trigger: 'blur'}],
          userName: [{required: true, type: 'string', message: `${this.$t('pleaseEnter')}${this.$t('userName')},${this.$t('validateTips')}`, trigger: 'blur'}],
          password: [{required: true, message: this.$t('pleaseEnter') + this.$t('password'), trigger: 'blur'}],
          phone: [{required: true, validator: validatePhone, trigger: 'blur'}],
          email: [{required: true, type: 'email', message: this.$t('pleaseEnterPerfect') + this.$t('email'), trigger: 'blur'}],
          companyId: [{required: true, message: this.$t('pleaseSelect') + this.$t('companyName'), trigger: 'change'}],
          systemFlags: [{required: true, type: 'array', message: this.$t('pleaseSelect') + this.$t('systemFlag'), trigger: 'change'}],
          roles: [{required: true, type: 'array', message: this.$t('pleaseSelect') + this.$t('roleName'), trigger: 'change'}]
        },
        btnData: []
      }
    },
    mounted() {
      this.getLeftMenu()
      getButtonBoolean(this, this.btnData)
      this.getRoleTreeData()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    computed: {
      systemFlagData() {
        return this.req.systemFlag.includes(',') ? this.req.systemFlag.split(',') : [this.req.systemFlag]
      }
    },
    methods: {
      ...mapActions(['handleTimer']),
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            roleId: '',
            account: this.req.selectName === 'account' ? this.req.queryName.trim() : '',
            organizeId: this.req.id,
            name: this.req.selectName === 'userName' ? this.req.queryName.trim() : '',
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
        getlisttreeReq().then(async res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.leftTreeData = []
            this.companyData = []
            await this.initMenuNode(this.leftTreeData, res.result)
            this.getCompanyData(this.companyData, this.leftTreeData)
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
      // 获取公司树型数据
      getCompanyData(list, data) {
        for (let item of data) {
          if (item.category === 1) {
            let node = {
              id: item.id,
              label: item.title
            }
            if (hasChild(item)) {
              node['children'] = []
              this.getCompanyData(node.children, item.children)
            }
            list.push(node)
          }
        }
      },
      // 公司选择操作
      companyInput(value) {
        if (!value) {
          this.departmentData = []
          this.req.departmentId = null
        }
      },
      // 获取部门数据
      getDepartmentData() {
        if (!this.req.companyId) this.$Message.warning(`${this.$t('pleaseSelect')}${this.$t('company')}`)
        else {
          const obj = {
            organizeId: this.$store.state.departmentIds,
            systemFlag: this.req.systemFlag,
            category: 2
          }
          getlimitlisttreeReq(obj).then(res => {
            if (res.code === 200) {
              let arr = res.result ? res.result : []
              this.departmentData = []
              this.initDepartmentData(this.departmentData, arr)
            }
          })
        }
      },
      // 获取公司树型数据
      initDepartmentData(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            label: item.name
          }
          if (hasChild(item)) {
            node['children'] = []
            this.initDepartmentData(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 获取角色数据
      getRoleTreeData() {
        const obj = {
          id: '',
          parentId: '0',
          name: '',
          enabled: -1
        }
        getRoleListTreeReq(obj).then(res => {
          if (res.code === 200) {
            this.roleData = []
            this.initRoleTreeData(this.roleData, res.result)
          }
        })
      },
      // 获取角色树型数据
      initRoleTreeData(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            label: item.name
          }
          if (hasChild(item)) {
            node['children'] = []
            this.initRoleTreeData(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 获取数据库数据
      async getAllDatabaseData() {
        await this.getDatabaseData()
        await this.getDatabaseAuthorizeData()
      },
      // 获取当前登录用户权限下的所有数据
      getDatabaseData() {
        const obj = {
          userId: this.req.thisUserId,
          systemFlag: this.req.systemFlag
        }
        getlistReq(obj).then(res => {
          if (res.code === 200) {
            let arr = res.result ? res.result : []
            this.databaseData = []
            if (arr.length > 0) {
              arr.forEach(item => {
                item['_checked'] = false
              })
              this.databaseData.push(...arr)
            }
          }
        })
      },
      // 获取当前选择用户权限下的已授权数据
      getDatabaseAuthorizeData() {
        const obj = {
          userId: this.selectObj.id,
          systemFlag: this.req.systemFlag
        }
        getlistReq(obj).then(res => {
          if (res.code === 200) {
            this.req.selectDatabaseId = res.result ? res.result.map(o => o.id) : []
            this.req.isAddOrModify = this.req.selectDatabaseId.length === 0
            this.databaseData.forEach(o => {
              const item = this.req.selectDatabaseId.find(x => x === o.id)
              o._checked = item !== undefined
            })
          }
        })
      },
      // 获取数据库数据
      async getAllZoneData() {
        await this.getZoneData()
        await this.getZoneAuthorizeData()
        this.initZoneTreeData = []
        this.initFloorTreeData(this.initZoneTreeData, this.zoneData)
      },
      // 获取当前登录用户权限下的所有数据
      async getZoneData() {
        const obj = {
          userId: this.req.thisUserId,
          systemFlag: this.req.systemFlag
        }
        await getlisttreeauthReq(obj).then(res => {
          if (res.code === 200) {
            this.zoneData = res.result ? res.result : []
          }
        })
      },
      // 获取当前选择用户权限下的已授权数据
      async getZoneAuthorizeData() {
        const obj = {
          userId: this.selectObj.id,
          systemFlag: this.req.systemFlag
        }
        await getlisttreeauthReq(obj).then(res => {
          if (res.code === 200) {
            this.zoneAuthorizeData = []
            let arr = []
            this.req.isAddOrModify = res.result.length === 0
            initTreeList(arr, res.result)
            getTreeEffectiveData(this.zoneAuthorizeData, arr, this.zoneData)
            this.req.selectZoneId = arr.map(o => o.id)
          }
        })
      },
      // 获取楼层线体树型数据
      initFloorTreeData(list, data) {
        for (let item of data) {
          let isCheck = false
          if (this.zoneAuthorizeData.find(o => o.id === item.id)) isCheck = true
          let node = {
            id: item.id,
            title: item.name,
            icon: getZoneIcon(item.category),
            expand: hasChild(item),
            checked: isCheck,
            children: []
          }
          if (hasChild(item)) {
            this.initFloorTreeData(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 根据账号获取用户数据
      async getUserDataByAccount() {
        const obj = {
          orderField: 'CREATEDATE', // 排序字段
          ascending: true, // 是否升序
          pageSize: 10, // 分页大小
          pageIndex: 1, // 当前页码
          data: {
            roleId: '',
            account: this.selectObj.account,
            organizeId: '',
            name: '',
            enabled: -1
          }
        }
        let data = null
        await getpagelistReq(obj).then(res => {
          data = res.result.data[0]
        })
        if (!data) return null
        else {
          return {
            roles: data.roles,
            systemFlags: data.systemFlags
          }
        }
      },
      // 树型点击事件
      treeSelect(data) {
        if (data.length > 0) {
          const obj = data[0]
          this.req.id = obj.id
          this.req.parentId = obj.parentId
          this.req.treeCategory = obj.category
        } else this.treeCancel()
        this.selectObj = null
        this.pageLoad()
      },
      // 清楚树型数据
      treeCancel() {
        this.req.id = ''
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
        this.drawerTitle = this.$t('add')
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              headIcon: this.req.headIcon,
              account: this.req.account.trim(),
              name: this.req.userName.trim(),
              simpleSpelling: this.req.userName.trim(),
              password: sha1_to_base64(encryptDes(this.req.password.trim(), 'baize#66', 'lxeP@ssx')),
              phone: this.req.phone.trim(),
              email: this.req.email.trim(),
              companyId: this.req.companyId,
              departmentId: this.req.departmentId,
              systemFlags: this.req.systemFlags,
              roles: this.req.roles
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
      // 点击编辑按钮触发
      async editClick() {
        if (this.selectObj) {
          const data = this.selectObj
          this.req.userId = data.id
          this.req.account = data.account
          this.req.userName = data.name
          this.req.simpleSpelling = data.simpleSpelling
          this.req.phone = data.phone
          this.req.email = data.email
          this.req.companyId = data.companyId
          await this.getDepartmentData(this.req.companyId)
          this.req.departmentId = data.departmentId
          const userObj = await this.getUserDataByAccount()
          this.req.systemFlags = userObj.systemFlags
          this.req.roles = userObj.roles
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
              id: this.req.userId,
              name: this.req.userName.trim(),
              headIcon: '',
              phone: this.req.phone.trim(),
              email: this.req.email.trim(),
              companyId: this.req.companyId,
              departmentId: this.req.departmentId,
              systemFlags: this.req.systemFlags,
              roles: this.req.roles,
              enabled: this.req.enabled ? 1 : 0,
              remark: this.req.remark
            }
            modifyReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('edit')}${this.$t('success')}`)
                this.selectObj = null
                if (obj.id === this.req.thisUserId) this.handleTimer()
                this.pageLoad()
                if (this.isSuccess) {
                  this.treeCancel()
                  this.cancelClick()
                }
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
        this.req.userId = ''
        this.req.account = ''
        this.req.userName = ''
        this.req.simpleSpelling = ''
        this.req.password = ''
        this.req.phone = ''
        this.req.email = ''
        this.req.companyId = null
        this.req.departmentId = null
        this.req.systemFlags = [this.$store.state.systemFlag]
        this.req.roles = []
        this.req.enabled = true
      },
      // 点击数据库授权触发
      databaseAuthorizeClick() {
        if (!this.selectObj) return this.$Message.warning(this.$t('oneData'))
        this.getAllDatabaseData()
        this.modalFlag = true
        this.isDatabaseAuthorize = true
        this.modalTitle = this.$t('databaseAuthorize')
      },
      // 点击区段授权触发
      async zoneAuthorizeClick() {
        if (!this.selectObj) return this.$Message.warning(this.$t('oneData'))
        this.modalFlag = true
        this.isZoneAuthorize = true
        await this.getAllZoneData()
        this.modalTitle = this.$t('zoneAuthorize')
      },
      // 点击重置密码触发
      resetPwdClick() {
        if (!this.selectObj) return this.$Message.warning(this.$t('oneData'))
        this.modalFlag = true
        this.isResetPwd = true
        this.modalTitle = this.$t('resetPwd')
      },
      // 弹窗取消触发
      modalCancel() {
        this.modalFlag = false
        this.isResetPwd = false
        this.isDatabaseAuthorize = false
        this.isZoneAuthorize = false
        this.req.newPwd = ''
        this.req.selectDatabaseId = []
      },
      // 弹窗确定触发
      modalOk() {
        if (this.isResetPwd) this.resetPwdFn()
        else if (this.isDatabaseAuthorize) this.databaseAuthorizeAddFn()
        else if (this.isZoneAuthorize) this.zoneAuthorizeAddFn()
      },
      // 重置密码调用方法
      resetPwdFn() {
        if (!this.req.newPwd) return this.$Message.warning(this.$t('pleaseEnter') + this.$t('newPwd'))
        const obj = {
          id: this.selectObj.id,
          password: sha1_to_base64(encryptDes(this.req.newPwd.trim(), 'baize#66', 'lxeP@ssx'))
        }
        resetpasswordReq(obj).then(res => {
          if (res.code === 200) {
            this.modalCancel()
            this.$Message.success(this.$t('success'))
          } else this.$Message.error(res.message)
        })
      },
      // 数据库权限调用方法
      databaseAuthorizeAddFn() {
        const obj = {
          userId: this.selectObj.id,
          databaseIds: this.req.selectDatabaseId
        }
        this.submitDatabaseAuthorize(obj).then(res => {
          if (res.code === 200) {
            this.modalCancel()
            this.$Message.success(this.$t('success'))
          } else this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
        })
      },
      // 判断调用新增还是修改接口
      submitDatabaseAuthorize(obj) {
        return this.req.isAddOrModify ? adddatabaseauthorizeReq(obj) : modifydatabaseauthorizeReq(obj)
      },
      // 区段权限调用方法
      zoneAuthorizeAddFn() {
        const obj = {
          userId: this.selectObj.id,
          areaFloorLineIds: this.req.selectZoneId
        }
        this.submitZoneAuthorize(obj).then(res => {
          if (res.code === 200) {
            this.modalCancel()
            this.$Message.success(this.$t('success'))
          } else this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
        })
      },
      // 判断调用新增还是修改接口
      submitZoneAuthorize(obj) {
        return this.req.isAddOrModify ? floorlineauthorizeaddReq(obj) : floorlineauthorizemodifyReq(obj)
      },
      // 弹窗树型数据变化触发事件
      treeCheckChange(data) {
        this.req.selectZoneId = data.map(item => item.id)
      },
      // 弹窗数据库选项发生改变时触发
      selectChange(data) {
        this.req.selectDatabaseId = data.map(o => o.id)
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
