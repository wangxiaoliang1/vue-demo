<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="520" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="90" :label-colon="true">
        <FormItem :label="$t('areaFloorName')" prop="areaFloorName">
          <Input v-model="req.areaFloorName" :maxlength="maxLength" :placeholder="$t('pleaseEnter') + $t('areaFloorName')"/>
        </FormItem>
        <FormItem :label="$t('databaseName')" prop="databaseName">
          <Select v-model="req.databaseName" :clearable="true" :placeholder="$t('pleaseSelect') + $t('databaseName')">
            <Option v-for="(item, i) in databaseTreeData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="req.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('category')" prop="category">
          <RadioGroup v-model="req.category">
            <Radio :label="1" :disabled="!(req.treeCategory === 0)">{{ $t('zone') }}</Radio>
            <Radio :label="2" :disabled="!(req.treeCategory === 1)">{{ $t('area') }}</Radio>
            <Radio :label="3" :disabled="!(req.treeCategory === 2)">{{ $t('floor') }}</Radio>
            <Radio :label="4" :disabled="!(req.treeCategory === 3)">{{ $t('line') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('parent')" prop="areaFloorParentId" v-if="!isAdd">
          <Select v-model="req.areaFloorParentId" :clearable="true" :placeholder="$t('pleaseSelect') + $t('parent')">
            <Option v-for="(item, i) in parentList" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
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
                             :placeholder="$t('pleaseEnter') + $t('areaFloorName')"/>
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
  import {getlisttreeReq, getpagelisttreeReq, addReq, modifyReq} from '@/api/system-manager/area-floor'
  import {getlistReq} from '@/api/system-manager/data-item'
  import {formatDate, getButtonBoolean, errorType, floorLineType, getZoneIcon, renderSpan,initTreeList} from '@/libs/tools'
  import {hasChild} from '@/libs/utils'
  import TreeCustom from '@/components/tree-custom'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "area-floor",
    components: {TreeCustom, ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      return {
        split: .25,
        maxLength: 36,
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        drawerTitle: this.$t('add'),
        leftTreeData: [], // 左侧树型源数据
        databaseTreeData: [], // 数据字典源数据
        treeLoading: true, // tree加载动画
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('areaFloorName'), key: 'name', sortable: 'custom'},
          {
            title: this.$t('category'), key: 'category',
            render: (h, params) => {
              return h('div', floorLineType(this, params.row.category))
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
        selectCategory: 1, // 选中类别
        req: {
          systemFlag: this.$store.state.systemFlag,
          id: '0',
          parentId: '0',
          treeCategory: 0, // 类型 0所有
          source: 1, // 1web 2app
          queryName: '',
          areaFloorId: '0',
          areaFloorParentId: '0',
          areaFloorName: '', // 楼层名称
          databaseName: '', // 数据库名称
          sortCode: 0,
          category: 1, // 类型 1 区段 2 区域 3 楼层 4 线体
          enabled: true, // 1有效 0无效
          remark: '', // 描述
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          areaFloorName: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('areaFloorName')}`, trigger: 'blur'}],
          databaseName: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('databaseName')}`, trigger: 'change'}],
          areaFloorParentId:[{required: true, message: `${this.$t('pleaseSelect')}${this.$t('parent')}`, trigger: 'change'}]
        },
        btnData: [],
        treeList:[],
        parentList:[]//编辑父级数组
      }
    },
    mounted() {
      this.getLeftMenu()
      this.getDataItemData()
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
            systemFlag: this.req.systemFlag,
            id: '',
            parentId: this.req.id,
            category: this.selectCategory === 5 ? 4 : this.selectCategory,
            name: this.req.queryName.trim(),
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
        const obj = {
          systemFlag: this.req.systemFlag,
          id: '',
          parentId: '0',
          name: '',
          category: 0,
          enabled: -1
        }
        getlisttreeReq(obj).then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.leftTreeData = []
            this.treeList=[];
            this.initMenuNode(this.leftTreeData, res.result)
            initTreeList(this.treeList, res.result)
            this.pageLoad()
          } else this.$Message.error(res.message)
        }).catch(() => this.treeLoading = false)
      },
      // 处理获取的菜单数据
      initMenuNode(list, data) {
        for (let item of data) {
          // let isExpand = false
          // if (hasChild(item)) isExpand = true
          let node = {
            id: item.id,
            parentId: item.parentId,
            title: item.name,
            category: item.category,
            icon: getZoneIcon(item.category),
            expand: item.category === 1 || item.category === 2,
            selected: false,
            children: []
          }
          if (hasChild(item)) {
            this.initMenuNode(node.children, item.children)
          }
          list.push(node)
        }
      },
      // 获取数据字典数据
      getDataItemData() {
        const obj = {
          enabled: 1,
          itemCode:'LineWorkOrderDb'
          // itemId: '1cadf3e9-2fb6-482c-8c32-ecd95bde4c40',
        }
        getlistReq(obj).then(res => {
          this.treeLoading = false
          if (res.code === 200) {
            this.databaseTreeData = res.result || []
          } else this.$Message.error(res.message)
        }).catch(() => this.treeLoading = false)
      },
      // 树型点击事件
      treeSelect(data) {
        if (data.length > 0) {
          const obj = data[0]
          this.req.id = obj.id
          this.req.parentId = obj.parentId
          this.req.treeCategory = obj.category
          this.selectCategory = obj.category + 1
          this.req.category = this.selectCategory
        } else {
          this.treeCancel()
          this.selectCategory = 1
          this.req.category = 1
        }
        this.selectObj = null
        this.pageLoad()
      },
      // 清楚树型数据
      treeCancel() {
        this.req.id = '0'
        this.req.parentId = '0'
        this.req.treeCategory = 0
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击新增按钮触发
      addClick() {
        if (this.selectCategory === 5) return this.$Message.warning(this.$t('addChildNode'))
        this.drawerFlag = true
        this.isAdd = true
        this.drawerTitle = this.$t('add')
        this.req.areaFloorId = this.req.id
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            this.req.category = this.selectCategory
            let obj = {
              systemFlag: this.req.systemFlag,
              parentId: this.req.areaFloorId,
              name: this.req.areaFloorName.trim(),
              databaseName: this.req.databaseName,
              category: this.req.category,
              enabled: this.req.enabled ? 1 : 0,
              sortCode: this.req.sortCode
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.getLeftMenu()
                if (this.isSuccess) {
                  this.cancelClick()
                  this.treeCancel()
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
          this.parentList=this.treeList.filter(o=>o.category===data.category-1)
          this.req.areaFloorId = data.id
          this.req.areaFloorParentId = data.parentId
          this.req.areaFloorName = data.name
          this.req.databaseName = data.databaseName
          this.req.sortCode = data.sortCode
          this.req.enabled = data.enabled === 1
          this.req.remark = data.remark
          this.req.category = data.category
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
              id: this.req.areaFloorId,
              parentId: this.req.areaFloorParentId,
              name: this.req.areaFloorName.trim(),
              databaseName: this.req.databaseName,
              enabled: this.req.enabled ? 1 : 0,
              category: this.req.category,
              sortCode: this.req.sortCode
            }
            modifyReq(obj).then(res => {
              if (res.code === 200) {
                this.selectObj = null
                this.getLeftMenu()
                this.$Message.success(`${this.$t('edit')}${this.$t('success')}`)
                if (this.isSuccess) {
                  this.cancelClick()
                  this.treeCancel()
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
        this.req.areaFloorId = '0'
        this.req.areaFloorParentId = '0'
        this.req.areaFloorName = ''
        this.req.databaseName = ''
        this.req.sortCode = 0
        this.selectCategory = 1
        this.req.category = 1
        this.req.enabled = true
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
