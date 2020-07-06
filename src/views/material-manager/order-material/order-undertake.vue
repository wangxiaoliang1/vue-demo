<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="800" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="100" :label-colon="true" @submit.native.prevent>
        <FormItem :label="$t('lineName')" prop="lineId">
          <Select v-model="req.lineId" clearable filterable :placeholder="$t('pleaseSelect') + $t('lineName')"
                  @on-open-change="getZoneData" @on-change="selectChange" @on-select="autoFocus = isAdd === 0 ? 1 : 2">
            <Option v-for="(item, i) in zoneData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('newWorkOrder')" prop="newWorkOrder" v-if="isAdd === 0">
          <Input v-model="req.newWorkOrder" v-focus="autoFocus === 1" @on-focus="autoFocus = 1" :maxlength="maxLength" @on-keydown.enter="autoFocus++" :placeholder="$t('pleaseEnter') + $t('newWorkOrder')"/>
        </FormItem>
        <FormItem :label="$t(oldWorkOrder)" prop="oldWorkOrder">
          <Input ref="oldWorkOrder" v-model="req.oldWorkOrder" v-focus="autoFocus === 2" @on-focus="autoFocus = 2" :maxlength="maxLength" @on-keydown.enter="getOldInputQty" :placeholder="$t('pleaseEnter') + $t(oldWorkOrder)"/>
        </FormItem>
        <FormItem :label="$t('oldInputQty')" prop="oldInputQty">
          <Input ref="oldInputQty" v-model="req.oldInputQty" type="number" v-focus="autoFocus === 3" @on-focus="autoFocus = 3" :maxlength="maxLength" @on-keydown.enter="okClick" :placeholder="$t('pleaseEnter') + $t('oldInputQty')"/>
        </FormItem>
      </Form>
      <List border v-show="errData.length > 0">
        <ListItem v-for="(item, i) in errData" :key="i">
          <Tag :color="item.errCode === 200 ? 'success' : 'error'">
            {{isAdd === 0 ? `${$t('newWorkOrder')}:${item.newWorkOrder} ` : ''}}{{`${$t(oldWorkOrder)}:${item.oldWorkOrder} ${$t('oldInputQty')}:${item.oldInputQty}`}}{{item.errCode !== 200 ? ` ${$t('errCase')}:${item.errText}` : ''}}
          </Tag>
        </ListItem>
      </List>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row type="flex" justify="space-between">
            <i-col>
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option value="workOrder">{{$t('workOrder')}}</Option>
                    <Option value="rId">{{$t('rId')}}</Option>
                    <Option value="pn">{{$t('pn')}}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t(req.selectName)"/>
                </FormItem>
                <FormItem style="width: 200px;">
                  <Select v-model="req.queryLineId" clearable filterable :placeholder="$t('pleaseSelect') + $t('lineName')">
                    <Option v-for="(item, i) in zoneData" :value="item.id" :key="i">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Form>
            </i-col>
            <i-col>
              <button-custom :btnData="btnData" @on-orderUndertake-click="orderUndertakeClick" @on-orderSet-click="orderSetClick" @on-export-click="exportClick"></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom :tableHeight="tableHeight" :tableLoading="tableLoading" :columns="columns" :data="data"
                      @on-current-change="currentClick" @on-sort-change="sortChange"></table-custom>
        <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                     @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </Card>
    </div>
  </div>
</template>

<script>
  import {getpagelistReq, modifyReq, setReq, getentityReq, exportReq} from '@/api/material-manager/order-undertake'
  import {getlisttreeauthReq} from '@/api/system-manager/area-floor'
  import {formatDate, getButtonBoolean, errorType, initTreeList, playSound, inputSelectContent, exportFile} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "order-undertake",
    components: {ButtonCustom, TableCustom, PageCustom},
    data() {
      return {
        split: .15,
        autoFocus: 0,
        drawerFlag: false,
        isAdd: 0,
        drawerTitle: this.$t('add'),
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center', fixed: 'left',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('workOrder'), key: 'work_Order', sortable: 'custom', fixed: 'left', width: 160},
          {title: this.$t('lineName'), key: 'lineName', width: 100},
          {title: this.$t('rId'), key: 'rid', width: 200},
          {title: this.$t('pn'), key: 'pn', width: 130},
          {title: this.$t('originalQTY'), key: 'original_QTY', width: 80, sortable: 'custom'},
          {title: this.$t('initialQTY'), key: 'initial_QTY', width: 80, sortable: 'custom'},
          {title: this.$t('usedQTY'), key: 'used_QTY', width: 80, sortable: 'custom'},
          {
            title: this.$t('bindingTime'), key: 'binding_Time', width: 125,
            render: (h, params) => {
              return h('div', params.row.binding_Time ? formatDate(params.row.binding_Time, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {
            title: this.$t('closeTime'), key: 'close_Time', width: 125,
            render: (h, params) => {
              return h('div', params.row.close_Time ? formatDate(params.row.close_Time, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {title: this.$t('orderStatus'), key: 'status', width: 100},
          {title: this.$t('remark'), key: 'remark', width: 240}
        ], // 表格数据
        data: [], // 表格数据
        zoneData: [], // 区段数据
        errData: [], // 区段数据
        selectObj: null, // 表格选中数据
        maxLength: 36, // 表格选中数据
        req: {
          thisUserId: this.$store.state.id,
          systemFlag: this.$store.state.systemFlag,
          selectName: 'workOrder',
          queryName: '',
          queryLineId: '',
          lineId: '', // 线体ID
          newWorkOrder: '', // 新工单
          oldWorkOrder: '', // 旧工单
          oldInputQty: null, // 老工单投入量
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          lineId: [{required: true, message: this.$t('pleaseEnter') + this.$t('lineName'), trigger: 'change'}],
          newWorkOrder: [{required: true, message: this.$t('pleaseEnter') + this.$t('newWorkOrder'), trigger: 'blur'}],
          oldWorkOrder: [{required: true, message: this.$t('pleaseEnter') + this.$t(this.oldWorkOrder), trigger: 'blur'}],
          oldInputQty: [{required: true, type: 'number', message: this.$t('pleaseEnter') + this.$t('oldInputQty'), trigger: 'blur'}]
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.pageLoad()
      this.getZoneData()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    computed: {
      oldWorkOrder() {
        return this.isAdd === 0 ? 'oldWorkOrder' : 'workOrder'
      }
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
            lineId: this.req.queryLineId,
            work_Order: this.req.selectName === 'workOrder' ? this.req.queryName.trim() : '',
            rid: this.req.selectName === 'rId' ? this.req.queryName.trim() : '',
            pn: this.req.selectName === 'pn' ? this.req.queryName.trim() : ''
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
      // 获取当前登录用户权限下的所有数据
      getZoneData() {
        const obj = {
          userId: this.req.thisUserId,
          systemFlag: this.req.systemFlag
        }
        getlisttreeauthReq(obj).then(async res => {
          if (res.code === 200) {
            const arr = []
            await initTreeList(arr, res.result)
            this.zoneData = arr.filter(item => item.category === 4)
          }
        })
      },
      // 线体选择改变时触发
      selectChange(data) {
        if (data) {
          this.req.lineName = this.zoneData.find(item => item.id === data).name
        } else {
          this.req.lineId = ''
          this.req.lineName = ''
        }
      },
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击工单结算按钮触发
      orderSetClick() {
        this.drawerFlag = true
        this.isAdd = 1
        this.autoFocus = 0
        this.drawerTitle = this.$t('orderSet')
      },
      // 点击工单承接按钮触发
      orderUndertakeClick() {
        this.drawerFlag = true
        this.isAdd = 0
        this.autoFocus = 0
        this.drawerTitle = this.$t('orderUndertake')
      },
      // 获取老工单投入量
      getOldInputQty() {
        getentityReq({workOrder: this.req.oldWorkOrder.trim()}).then(res => {
          if (res.code === 200) {
            const data = res.result
            if (data) {
              this.req.oldInputQty = data.inpuT_QTY
              this.autoFocus = 3
            } else {
              inputSelectContent(this.$refs.oldWorkOrder)
              this.$Message.error(this.$t('oldWorkOrderError'))
            }
          } else {
            playSound(this.$config.tipsVoice.NgTips)
            this.$Message.error(`${this.$t('getData')}${this.$t('oldInputQty')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
          }
        })
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              lineId: this.req.lineId,
              oldWorkOrder: this.req.oldWorkOrder.trim(),
              oldInputQty: this.req.oldInputQty
            }
            this.orderSubmitApi(obj).then(res => {
              if (res.code === 200) {
                playSound(this.$config.tipsVoice.OkTips)
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                // this.autoFocus = 0
                this.req.oldWorkOrder = ''
                this.req.newWorkOrder = ''
                this.pageLoad()
              } else {
                playSound(this.$config.tipsVoice.NgTips)
                this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
              }
              inputSelectContent(this.$refs.oldInputQty)
              this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
            })
          }
        })
      },
      // 工单提交接口
      orderSubmitApi(obj) {
        if (this.isAdd === 0) {
          obj['newWorkOrder'] = this.req.newWorkOrder.trim()
          return modifyReq(obj)
        } else return setReq(obj)
      },
      // 工单导出
      exportClick() {
        const obj = {
          lineId: this.req.queryLineId,
          work_Order: this.req.selectName === 'workOrder' ? this.req.queryName.trim() : '',
          rid: this.req.selectName === 'rId' ? this.req.queryName.trim() : '',
          pn: this.req.selectName === 'pn' ? this.req.queryName.trim() : ''
        }
        exportReq(obj).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('order-undertake')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
          exportFile(blob, fileName)
        })
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false
        this.autoFocus = 0
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.lineId = ''
        this.req.newWorkOrder = ''
        this.req.oldWorkOrder = ''
        this.req.oldInputQty = null
        this.errData = []
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
