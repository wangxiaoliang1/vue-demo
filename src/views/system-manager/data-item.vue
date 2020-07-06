<template>
  <div class="page-style">
    <!-- 授权弹窗 -->
    <Modal class-name="page-style-modal" v-model="modalFlag" width="1000" :styles="{top: '20px'}"
           :title="modalTitle" :mask-closable="false" :scrollable="true" @on-cancel="modalCancel">
      <div style="height: 400px;">
        <Row>
          <i-col span="16">
            <Form inline class="card-style-form" @submit.native.prevent>
              <FormItem>
                <Select class="query_more_select" v-model="req.selectName">
                  <Option value="itemCode">{{$t('itemCode')}}</Option>
                  <Option value="itemName">{{$t('itemName')}}</Option>
                </Select>
              </FormItem>
              <FormItem>
                <Input search enter-button v-model="req.queryClassName" @on-search="searchClick"
                       :placeholder="$t('pleaseEnter') + $t(req.selectName)"/>
              </FormItem>
              <FormItem>{{req.selectTreeName ? `${req.selectTreeName}(${req.selectTreeCode})` : ''}}</FormItem>
            </Form>
          </i-col>
          <i-col span="8">
            <button-custom :btnData="buttonAuthClass" @on-add-click="addClick"
                           @on-edit-click="editClick"></button-custom>
          </i-col>
        </Row>
        <Table border highlight-row style="margin: 1px;" :height="330" :loading="dataClassTableLoading"
               :columns="dataClassColumns" :data="dataClassData" row-key="id" @on-current-change="currentClick"
               @on-sort-change="sortChange"></Table>
        <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                     @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </div>
      <div slot="footer">
        <Button @click="modalCancel">{{$t('cancel')}}</Button>
        <Button type="primary" @click="modalCancel">{{$t('ok')}}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" class="page-style-drawer" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
        <FormItem :label="$t('itemName')" prop="itemName">
          <Input v-model="req.itemName" :placeholder="$t('pleaseEnter') + $t('itemName')"/>
        </FormItem>
        <FormItem :label="$t('itemCode')" prop="itemCode">
          <Input v-model="req.itemCode" :placeholder="$t('pleaseEnter') + $t('itemCode')"/>
        </FormItem>
        <FormItem :label="$t('parent')" prop="itemParentId">
          <treeselect v-model="req.itemParentId" :options="classParentData" :showCount="true" @input="parentInput"
                      :placeholder="$t('pleaseSelect') + $t('parent')"/>
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
                <i-col span="16">
                  <Form inline class="card-style-form" @submit.native.prevent>
                    <FormItem>
                      <Select class="query_more_select" v-model="req.selectDetailName">
                        <Option value="detailCode">{{$t('itemCode')}}</Option>
                        <Option value="detailName">{{$t('itemName')}}</Option>
                      </Select>
                    </FormItem>
                    <FormItem>
                      <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                             :placeholder="$t('pleaseEnter') + $t('keyWords')"/>
                    </FormItem>
                    <FormItem>{{req.selectTreeName ? `${req.selectTreeName}(${req.selectTreeCode})` : ''}}</FormItem>
                  </Form>
                </i-col>
                <i-col span="8">
                  <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick"
                                 @on-dataClass-click="dataClassClick"></button-custom>
                </i-col>
              </Row>
            </div>
            <Table border highlight-row style="margin: 1px;" :height="tableHeight" :loading="tableLoading"
                   :columns="columns" :data="data" row-key="id" @on-current-change="currentClick"
                   @on-sort-change="sortChange"></Table>
          </Card>
        </div>
      </Split>
    </div>
  </div>
</template>

<script>
  import {
    getlisttreeReq,
    getpagelisttreeReq,
    addReq,
    modifyReq,
    getlistReq,
    adddetailReq,
    modifydetailReq
  } from '@/api/system-manager/data-item'
  import {formatDate, getButtonBoolean, errorType, renderSpan} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import TreeCustom from '@/components/tree-custom'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import PageCustom from '@/components/page-custom'
  import Treeselect from '@riophae/vue-treeselect'

  export default {
    name: "data-item",
    components: {Treeselect, TreeCustom, ButtonCustom, DrawerButton, PageCustom},
    data() {
      return {
        split: .2,
        modalFlag: false,
        modalTitle: this.$t('dataClass'),
        dataClassTableLoading: false, // table加载动画
        dataClassTableHeight: 350, // table加载动画
        dataClassColumns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('itemCode'), key: 'itemCode', sortable: 'custom', tree: true},
          {title: this.$t('itemName'), key: 'itemName'},
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
        ], // 数据字典分类表格数据
        dataClassData: [], // 数据字典分类表格数据
        classParentData: [], // 数据字典新建分类上级数据
        drawerFlag: false,
        isChangeData: false,
        isAdd: true,
        drawerTitle: this.$t('add'),
        leftTreeData: [], // 左侧树型源数据
        tableHeight: 200,
        treeLoading: true, // tree加载动画
        tableLoading: true, // table加载动画
        columns: [
          {type: 'index', width: 50, align: 'center'},
          {title: this.$t('itemName'), key: 'detailName', sortable: 'custom'},
          {title: this.$t('itemCode'), key: 'detailCode'},
          {
            title: this.$t('enabled'), key: 'enabled',
            render: (h, params) => {
              return h('div', params.row.enabled === 1 ? this.$t('open') : this.$t('close'))
            }
          },
          {title: this.$t('remark'), key: 'remark'}
        ], // 表格数据
        data: [], // 表格数据
        classSelectObj: null, // 左侧树节点选中数据
        selectObj: null, // 表格选中数据
        req: {
          id: '0',
          parentId: '0',
          selectName: 'itemName',
          selectTreeName: '',
          selectTreeCode: '',
          queryClassName: '',
          selectDetailName: 'detailName',
          queryName: '',
          itemId: '0',
          itemParentId: null,
          itemDetailId: '0',
          itemName: '', // 字典名称
          itemCode: '', // 字典编码
          enabled: true, // 1有效 0无效
          sortCode: 0,
          remark: '',
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          itemName: [{required: true, message: this.$t('pleaseEnter') + this.$t('itemName'), trigger: 'blur'}],
          itemCode: [{required: true, message: this.$t('pleaseEnter') + this.$t('itemCode'), trigger: 'blur'}]
        },
        btnData: [],
        buttonAuthClass: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      getButtonBoolean(this, this.buttonAuthClass)
      this.getLeftMenu()
      this.pageLoad()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.dataClassTableLoading = true
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            id: '',
            parentId: this.req.id,
            itemCode: this.req.selectName === 'itemCode' ? this.req.queryClassName.trim() : '',
            itemName: this.req.selectName === 'itemName' ? this.req.queryClassName.trim() : '',
            enabled: -1
          }
        }
        getpagelisttreeReq(obj).then(res => {
          this.dataClassTableLoading = false
          if (res.code === 200) {
            let data = res.result
            this.dataClassData = data.data ? data.data : []
            this.dataClassData.forEach(item => {
              if (item.children && item.children.length === 0) item['_showChildren'] = true
            })
            this.req.pageSize = data.pageSize
            this.req.pageIndex = data.pageIndex
            this.req.total = data.total
            this.req.totalPage = data.totalPage
          }
        }).catch(() => this.dataClassTableLoading = false)
      },
      // 获取明细数据
      getDetailData() {
        this.tableLoading = true
        const obj = {
          id: '',
          itemId: this.req.id,
          detailCode: this.req.selectDetailName === 'detailCode' ? this.req.queryName.trim() : '',
          detailName: this.req.selectDetailName === 'detailName' ? this.req.queryName.trim() : '',
          enabled: -1
        }
        getlistReq(obj).then(res => {
          this.tableLoading = false
          this.data = res.result ? res.result : []
        }).catch(() => this.tableLoading = false)
      },
      // 获取页面左侧菜单
      getLeftMenu() {
        this.treeLoading = true
        let obj = {
          id: '',
          parentId: '0',
          itemCode: '',
          itemName: this.req.queryClassName.trim(),
          enabled: -1
        }
        getlisttreeReq(obj).then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.leftTreeData = []
            this.classParentData = []
            this.initMenuNode(this.leftTreeData, res.result)
            this.initClassParentNode(this.classParentData, res.result)
            if (this.modalFlag) this.pageLoad()
            else this.getDetailData()
          } else this.$Message.error(res.message)
        }).catch(() => this.treeLoading = false)
      },
      // 处理获取的菜单数据
      initMenuNode(list, data) {
        for (let item of data) {
          let isExpand = hasChild(item)
          let node = {
            id: item.id,
            parentId: item.parentId,
            title: item.itemName,
            code: item.itemCode,
            icon: 'iconfont icon-dictionary',
            expand: isExpand,
            selected: false,
            children: []
          }
          if (isExpand) {
            this.initMenuNode(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 处理获取的菜单数据
      initClassParentNode(list, data) {
        for (let item of data) {
          let node = {
            id: item.id,
            label: item.itemName
          }
          if (hasChild(item)) {
            node['children'] = []
            this.initClassParentNode(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 所属上级选择变化
      parentInput(value) {
        if (!value) {
          this.req.itemParentId = null
        }
      },
      // 树型点击事件
      treeSelect(data) {
        if (data.length > 0) {
          const obj = data[0]
          this.req.id = obj.id
          this.req.parentId = obj.parentId
          this.req.selectTreeName = obj.title
          this.req.selectTreeCode = obj.code
        } else this.treeCancel()
        this.selectObj = null
        this.getDetailData()
        this.pageLoad()
      },
      // 清楚树型数据缓存
      treeCancel() {
        this.req.id = '0'
        this.req.parentId = '0'
        this.req.selectTreeName = ''
        this.req.selectTreeCode = ''
      },
      // 点击搜索按钮触发
      searchClick() {
        if (this.modalFlag) {
          this.req.pageIndex = 1
          this.pageLoad()
        } else this.getDetailData()
      },
      // 点击新增按钮触发
      addClick() {
        if (!this.modalFlag && this.req.id === '0') return this.$Message.warning(`${this.$t('pleaseSelectLeft')}${this.$t('dataClass')}`)
        this.drawerFlag = true
        this.isAdd = true
        this.drawerTitle = this.$t('add')
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              enabled: this.req.enabled ? 1 : 0,
              sortCode: this.req.sortCode,
              remark: this.req.remark
            }
            this.getAddApi(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.isChangeData = true
                this.modalFlag ? this.getLeftMenu() : this.getDetailData()
                if (this.isSuccess) this.cancelClick()
              } else this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 判断添加的是字典分类还是字典分类明细
      getAddApi(obj) {
        if (this.modalFlag) {
          obj['parentId'] = this.req.itemParentId ? this.req.itemParentId : '0'
          obj['itemName'] = this.req.itemName.trim()
          obj['itemCode'] = this.req.itemCode.trim()
          return addReq(obj)
        } else {
          obj['itemId'] = this.req.itemParentId ? this.req.itemParentId : '0'
          obj['detailName'] = this.req.itemName.trim()
          obj['detailCode'] = this.req.itemCode.trim()
          return adddetailReq(obj)
        }
      },
      // 点击新增按钮触发
      editClick() {
        if ((!this.modalFlag && this.selectObj) || (this.modalFlag && this.classSelectObj)) {
          const data = this.modalFlag ? this.classSelectObj : this.selectObj
          this.req.itemId = data.id
          this.req.itemParentId = this.modalFlag ? data.parentId : data.itemId
          this.req.itemName = this.modalFlag ? data.itemName : data.detailName
          this.req.itemCode = this.modalFlag ? data.itemCode : data.detailCode
          this.req.enabled = data.enabled === 1
          this.req.sortCode = data.sortCode
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
              id: this.req.itemId,
              enabled: this.req.enabled ? 1 : 0,
              sortCode: this.req.sortCode,
              remark: this.req.remark
            }
            this.getEditApi(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('edit')}${this.$t('success')}`)
                this.isChangeData = true
                this.modalFlag ? this.getLeftMenu() : this.getDetailData()
                if (this.isSuccess) this.cancelClick()
              } else this.$Message.error(`${this.$t('edit')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 判断编辑的是字典分类还是字典分类明细
      getEditApi(obj) {
        if (this.modalFlag) {
          obj['parentId'] = this.req.itemParentId ? this.req.itemParentId : '0'
          obj['itemName'] = this.req.itemName.trim()
          obj['itemCode'] = this.req.itemCode.trim()
          return modifyReq(obj)
        } else {
          obj['itemId'] = this.req.itemParentId ? this.req.itemParentId : '0'
          obj['detailName'] = this.req.itemName.trim()
          obj['detailCode'] = this.req.itemCode.trim()
          return modifydetailReq(obj)
        }
      },
      // 点击新增或修改并关闭按钮触发
      okOrUpdateClick() {
        this.isSuccess = true
        this.isAdd ? this.okClick() : this.updateClick()
      },
      // 点击字典分类按钮触发
      dataClassClick() {
        this.modalFlag = true
      },
      // 取消
      cancelClick() {
        this.resetCancel()
        if (this.isChangeData && this.modalFlag) this.treeCancel()
      },
      // 清楚抽屉数据缓存
      resetCancel() {
        this.drawerFlag = false
        this.isSuccess = false
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.itemId = '0'
        this.req.itemParentId = null
        this.req.itemName = ''
        this.req.itemCode = ''
        this.req.enabled = true
        this.req.sortCode = 0
        if (!this.isAdd && this.isChangeData) this.selectObj = null
        if (this.isChangeData && this.modalFlag) this.classSelectObj = null
        if (this.isChangeData) this.isChangeData = false
      },
      // 清楚弹窗数据缓存
      modalCancel() {
        this.modalFlag = false
        this.req.queryClassName = ''
        if (this.classSelectObj) this.classSelectObj = null
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 120
        this.tableHeight = height - 20
      },
      // 某一行高亮时触发
      currentClick(currentRow) {
        this.modalFlag ? this.classSelectObj = currentRow : this.selectObj = currentRow
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
