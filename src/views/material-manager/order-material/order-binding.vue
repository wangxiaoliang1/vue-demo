<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="800" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true" @submit.native.prevent>
        <FormItem :label="$t('lineName')" prop="lineId" v-if="isAdd === 0">
          <Select v-model="req.lineId" clearable filterable :placeholder="$t('pleaseSelect') + $t('lineName')"
                  @on-open-change="getZoneData" @on-change="selectChange" @on-select="autoFocus = 1">
            <Option v-for="(item, i) in zoneData" :value="item.id" :key="i">{{ item.name }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('workOrder')" prop="workOrder">
          <Input v-model="req.workOrder" v-focus="autoFocus === 1" @on-focus="autoFocus = 1"
                 @on-keydown.enter="autoFocus++" :placeholder="$t('pleaseEnter') + $t('workOrder')"/>
        </FormItem>
        <FormItem :label="$t('rId')" prop="rId">
          <Input ref="rIdRefsName" v-model="req.rId" v-focus="autoFocus === 2" @on-focus="autoFocus = 2"
                 @on-keydown.enter="okClick" :placeholder="$t('pleaseEnter') + $t('rId')"/>
        </FormItem>
      </Form>
      <List border v-show="errData.length > 0">
        <ListItem v-for="(item, i) in errData" :key="i">
          <Tag :color="item.errCode === 200 ? 'success' : 'error'">
            {{isAdd === 0 ? `${$t('lineName')}:${item.lineName} ` : ''}}{{`${$t('workOrder')}:${item.work_Order}
            ${$t('rId')}:${item.rid}`}}{{item.errCode !== 200 ? ` ${$t('errCase')}:${item.errText}` : ''}}
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
                  <Select v-model="req.queryLineId" clearable filterable
                          :placeholder="$t('pleaseSelect') + $t('lineName')">
                    <Option v-for="(item, i) in zoneData" :value="item.id" :key="i">{{ item.name }}</Option>
                  </Select>
                </FormItem>
              </Form>
            </i-col>
            <i-col>
              <button-custom :btnData="btnData" @on-orderBinding-click="orderBindingClick"
                             @on-removeOrderBinding-click="removeOrderBindingClick" @on-rIdZero-click="rIdZeroClick"
                             @on-export-click="exportClick"></button-custom>
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
  import {getpagelistReq, addReq, modifyReq, getworidqtyReq, zeroReq, exportReq} from '@/api/material-manager/order-binding'
  import {getlisttreeauthReq} from '@/api/system-manager/area-floor'
  import {formatDate, getButtonBoolean, errorType, initTreeList, playSound, inputSelectContent, exportFile} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "order-binding",
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
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('workOrder'), key: 'work_Order', sortable: 'custom'},
          {title: this.$t('lineName'), key: 'lineName'},
          {title: this.$t('rId'), key: 'rid', width: 240},
          {title: this.$t('pn'), key: 'pn'},
          {title: this.$t('initialQTY'), key: 'initial_QTY'},
          {title: this.$t('orderStatus'), key: 'status'}
        ], // 表格数据
        data: [], // 表格数据
        zoneData: [], // 区段数据
        errData: [], // 区段数据
        selectObj: null, // 表格选中数据
        req: {
          thisUserId: this.$store.state.id,
          systemFlag: this.$store.state.systemFlag,
          selectName: 'workOrder',
          queryName: '',
          queryLineId: '',
          lineId: '', // 线体ID
          lineName: '', // 线体名
          rId: '', // RID
          workOrder: '', // 工单
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          lineId: [{required: true, message: this.$t('pleaseEnter') + this.$t('lineName'), trigger: 'blur'}],
          workOrder: [{required: true, message: this.$t('pleaseEnter') + this.$t('workOrder'), trigger: 'blur'}],
          rId: [{required: true, message: this.$t('pleaseEnter') + this.$t('rId'), trigger: 'blur'}]
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
            lineId: this.req.queryLineId ? this.req.queryLineId : '',
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
      // 点击导入工单按钮触发
      orderBindingClick() {
        this.getZoneData()
        this.drawerFlag = true
        this.isAdd = 0
        this.drawerTitle = this.$t('orderBinding')
      },
      // 新增菜单、按钮
      okClick() {
        if (this.isAdd === 0) this.bindingSubmit()
        else if (this.isAdd === 1) this.removeBindingSubmit()
        else this.rIdZeroSubmit()
      },
      // 工单绑定提交
      bindingSubmit() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let obj = {
              lineId: this.req.lineId,
              lineName: this.req.lineName,
              work_Order: this.req.workOrder.trim(),
              rid: this.req.rId.trim()
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                playSound(this.$config.tipsVoice.OkTips)
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
              } else {
                playSound(this.$config.tipsVoice.NgTips)
                this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
              }
              inputSelectContent(this.$refs.rIdRefsName)
              this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
            })
          }
        })
      },
      // 点击删除工单绑定按钮触发
      removeOrderBindingClick() {
        this.drawerFlag = true
        this.isAdd = 1
        this.autoFocus = 1
        this.drawerTitle = this.$t('removeOrderBinding')
      },
      // 删除工单绑定提交
      removeBindingSubmit() {
        const obj = {
          work_Order: this.req.workOrder.trim(),
          rid: this.req.rId.trim()
        }
        modifyReq(obj).then(res => {
          if (res.code === 200) {
            playSound(this.$config.tipsVoice.OkTips)
            this.$Message.success(`${this.$t('delete')}${this.$t('success')}`)
          } else {
            playSound(this.$config.tipsVoice.NgTips)
            this.$Message.error(`${this.$t('delete')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
          }
          inputSelectContent(this.$refs.rIdRefsName)
          this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
        })
      },
      // 点击删除工单绑定按钮触发
      rIdZeroClick() {
        this.drawerFlag = true
        this.isAdd = 2
        this.autoFocus = 1
        this.drawerTitle = this.$t('rIdZero')
      },
      // 点击rId清零按钮触发
      rIdZeroSubmit() {
        this.req.lineId = '123'
        this.$refs.req.validate(validate => {
          if (validate) {
            const obj = {
              work_Order: this.req.workOrder.trim(),
              rid: this.req.rId.trim()
            }
            getworidqtyReq(obj).then(res => {
              if (res.code === 200) {
                if (res.result < 50) {
                  this.resetZeroApi(obj)
                } else {
                  this.$Modal.confirm({
                    content: `${this.$t('rIdNumTipsError')} ${this.$t('count')}: ${res.result}`,
                    onOk: () => {
                      inputSelectContent(this.$refs.rIdRefsName)
                    },
                    onCancel: () => {
                      inputSelectContent(this.$refs.rIdRefsName)
                    }
                  })
                }
              } else {
                this.errData.unshift({...obj, errCode: res.code, errText: errorType(this, res.errorCode)})
                this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
              }
            })
          }
        })
      },
      // 清零接口触发
      resetZeroApi(obj) {
        zeroReq(obj).then(resq => {
          if (resq.code === 200) {
            playSound(this.$config.tipsVoice.OkTips)
            this.$Message.success(`${this.$t('resetZero')}${this.$t('success')}`)
          } else {
            playSound(this.$config.tipsVoice.NgTips)
            this.$Message.error(`${this.$t('resetZero')}${this.$t('fail')},${errorType(this, resq.errorCode)}`)
          }
          inputSelectContent(this.$refs.rIdRefsName)
          this.errData.unshift({...obj, errCode: resq.code, errText: errorType(this, resq.errorCode)})
        })
      },
      // 工单导出
      exportClick() {
        const obj = {
          lineId: this.req.queryLineId ? this.req.queryLineId : '',
          work_Order: this.req.selectName === 'workOrder' ? this.req.queryName.trim() : '',
          rid: this.req.selectName === 'rId' ? this.req.queryName.trim() : '',
          pn: this.req.selectName === 'pn' ? this.req.queryName.trim() : ''
        }
        exportReq(obj).then(res => {
          let blob = new Blob([res], {type: "application/vnd.ms-excel"})
          const fileName = `${this.$t('order-binding')}${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}.xlsx` // 自定义文件名
          exportFile(blob, fileName)
        })
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false
        this.autoFocus = 0
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.lineId = ''
        this.req.lineName = ''
        this.req.workOrder = ''
        this.req.rId = ''
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
