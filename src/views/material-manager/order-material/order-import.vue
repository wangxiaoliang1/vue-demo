<template>
  <div class="page-style">
    <!-- 页面弹窗 -->
    <Modal class-name="page-style-modal" v-model="modalFlag" width="1000" :styles="{top: '20px'}"
           :title="modalTitle" :mask-closable="false" :scrollable="true" @on-cancel="modalCancel">
      <table-custom :tableHeight="300" :columns="columnsDetails" :data="dataDetails"></table-custom>
      <div slot="footer">
        <Button type="primary" @click="modalCancel">{{$t('cancel')}}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="650" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true" @submit.native.prevent>
        <FormItem :label="$t('workOrder')" prop="workOrder">
          <Input ref="workOrder" v-model="req.workOrder" v-focus="autoFocus === 1" @on-keydown.enter="okClick" :placeholder="$t('pleaseEnter') + $t('workOrder')"/>
        </FormItem>
      </Form>
      <List border v-show="errData.length > 0">
        <ListItem v-for="(item, i) in errData" :key="i">
          <Tag :color="item.errCode === 200 ? 'success' : 'error'">
            {{`${$t('workOrder')}:${item.workOrder}`}}{{item.errCode !== 200 ? ` ${$t('errCase')}:${item.errText}` : ''}}
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
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('workOrder')"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col>
              <button-custom :btnData="btnData" @on-orderImport-click="orderImportClick" @on-export-click="exportClick"></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom :tableHeight="tableHeight" :tableLoading="tableLoading" :columns="columns" :data="data"
                      @on-cell-click="cellClick" @on-sort-change="sortChange"></table-custom>
        <page-custom :total="req.total" :totalPage="req.totalPage" :pageIndex="req.pageIndex" :page-size="req.pageSize"
                     @on-change="pageChange" @on-page-size-change="pageSizeChange"/>
      </Card>
    </div>
  </div>
</template>

<script>
  import {getpagelistReq, getlistdetailbywopnReq, addReq, exportReq} from '@/api/material-manager/order-import'
  import {formatDate, getButtonBoolean, errorType, playSound, inputSelectContent, exportFile} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "order-import",
    components: {ButtonCustom, TableCustom, PageCustom},
    data() {
      return {
        split: .15,
        autoFocus: 0,
        modalFlag: false,
        modalTitle: this.$t('workOrderDetails'),
        isAdd: true,
        drawerFlag: false,
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
          {title: this.$t('workOrder'), key: 'work_Order', sortable: 'custom', width: 160, fixed: 'left'},
          {title: this.$t('pnUsedCount'), key: 'pN_Used_Count', width: 70},
          {title: this.$t('issueQTY'), key: 'issue_QTY', width: 100},
          {
            title: this.$t('pn'), key: 'pn', width: 150,
            render: (h, params) => {
              return h('div', {
                'class': 'table_cell_font_color primary_font_color',
                style: {
                  cursor: 'pointer'
                }
              }, [h('Icon', {
                props: {
                  custom: 'iconfont icon-eye'
                },
                style: {
                  marginRight: '5px'
                }
              }),
                h('span', params.row.pn)
              ])
            }
          },
          {title: this.$t('cpn'), key: 'cpn', width: 120},
          {title: this.$t('inputQTY'), key: 'input_QTY', width: 70},
          {title: this.$t('targetQTY'), key: 'target_QTY', width: 70},
          {title: this.$t('outputUnitIdQTY'), key: 'output_UnitId_QTY', width: 70},
          {title: this.$t('orderStatus'), key: 'status', width: 70},
          {title: this.$t('importPerson'), key: 'createUserName', width: 70},
          {
            title: this.$t('importDate'), key: 'createDate', width: 125,
            render: (h, params) => {
              return h('div', params.row.createDate ? formatDate(params.row.createDate, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {title: this.$t('madeLocation'), key: 'location', width: 300, tooltip: true}
        ], // 表格数据
        data: [], // 表格数据
        columnsDetails: [
          {type: 'index', width: 50, align: 'center', fixed: 'left'},
          {title: this.$t('workOrder'), key: 'work_Order', width: 160, fixed: 'left'},
          {title: this.$t('pn'), key: 'part_No', width: 100},
          {title: this.$t('empName'), key: 'emp_Name', width: 70},
          {
            title: this.$t('updateDate'), key: 'update_Time', width: 125,
            render: (h, params) => {
              return h('div', params.row.update_Time ? formatDate(params.row.update_Time, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {title: this.$t('rId'), key: 'reel_No', width: 200},
          {title: this.$t('dc'), key: 'dateCode', width: 70},
          {title: this.$t('lot'), key: 'lot', width: 70,},
          {title: this.$t('lotNo'), key: 'lot_No', width: 100},
          {title: this.$t('QTY'), key: 'real_Qty', width: 70},
          {title: this.$t('line'), key: 'pdLine_Name', width: 100},
          {title: this.$t('status'), key: 'flag', width: 100}
        ], // 工单明细表格数据
        dataDetails: [], // 工单明细表格数据
        errData: [], // 表格数据
        selectObj: null, // 表格选中数据
        req: {
          queryName: '',
          orderId: '0', // 工单id
          workOrder: '', // 工单
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          workOrder: [{required: true, message: this.$t('pleaseEnter') + this.$t('workOrder'), trigger: 'blur'}]
        },
        btnData: []
      }
    },
    mounted() {
      this.pageLoad()
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
            keyWords: this.req.queryName.trim()
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
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击导入工单按钮触发
      orderImportClick() {
        this.drawerFlag = true
        this.autoFocus = 1
        this.isAdd = true
        this.drawerTitle = this.$t('orderImport')
      },
      // 新增菜单、按钮
      okClick() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              workOrder: this.req.workOrder.trim()
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                playSound(this.$config.tipsVoice.OkTips)
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.req.workOrder = ''
              } else {
                playSound(this.$config.tipsVoice.NgTips)
                this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
              }
              inputSelectContent(this.$refs.workOrder)
              this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
            })
          }
        })
      },
      // 工单导出
      exportClick() {
        if (this.req.queryName) {
          const obj = {
            keyWords: this.req.queryName.trim()
          }
          exportReq(obj).then(res => {
            let blob = new Blob([res], {type: "application/vnd.ms-excel"})
            const fileName = `${this.$t('order-import')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
            exportFile(blob, fileName)
          })
        } else this.$Message.error(this.$t('pleaseEnter') + this.$t('workOrder'))
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false
        this.autoFocus = 0
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.orderId = '0'
        this.req.workOrder = ''
        this.errData = []
      },
      // 清楚历史数据
      modalCancel() {
        this.modalFlag = false
        this.dataDetails = []
      },
      // 自动改变表格高度
      autoSize() {
        let height = document.body.clientHeight - 120
        this.tableHeight = height - 60
      },
      // 排序时有效，当点击排序时触发
      sortChange(data) {
        this.req.orderField = data.key.toUpperCase()
        this.req.ascending = data.order === 'asc'
        this.pageLoad()
      },
      // 排序时有效，当点击排序时触发
      cellClick(row, column) {
        if (column.key === 'pn') {
          getlistdetailbywopnReq({workOrder: row.work_Order, part_No: row.pn}).then(res => {
            if (res.code === 200) {
              this.dataDetails = res.result
              this.modalFlag = true
            } else {
              this.$Message.error(`${errorType(this, res.errorCode)}`)
            }
          })
        }
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
