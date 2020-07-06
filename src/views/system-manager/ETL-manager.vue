<template>
  <div class="page-style">
    <Modal v-model="modalFlag" :fullscreen="modalFullscreen" :mask-closable="false" :title="modalTitle" @on-cancel="modalCancel">
      <div v-if="modalType === 'logs'">
        <Timeline>
          <TimelineItem v-for="(item, i) in logsData" :key="i" :color="logsColor">
            <p class="time">{{item.objectId}}</p>
            <p class="content" v-html="item.objectName"></p>
          </TimelineItem>
        </Timeline>
      </div>
      <div v-if="modalType === 'cron'">
        <Row class="row_hover" v-for="(item, i) in cronData" :key="i" @dblclick.native="cronRowClick(item)">
          <i-col span="8">{{item.name}}</i-col>
          <i-col span="16">{{item.value}}</i-col>
        </Row>
      </div>
      <div slot="footer">
        <Button @click="modalCancel">{{ $t("cancel") }}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="800" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="100" :label-colon="true" v-if="isForm">
        <FormItem :label="$t('jobEncode')" prop="jobEncode">
          <Input v-model="req.jobEncode" :disabled="!isAdd" :placeholder="$t('pleaseEnter') + $t('jobEncode')"/>
        </FormItem>
        <FormItem :label="$t('description')" prop="description">
          <Input v-model="req.description" :placeholder="$t('pleaseEnter') + $t('description')"/>
        </FormItem>
        <FormItem :label="$t('executeType')" prop="executeType">
          <Select v-model="req.executeType" :clearable="true" :disabled="!isAdd" :placeholder="$t('pleaseSelect') + $t('executeType')" @on-change="executeTypeChange">
            <Option v-for="(item, i) in executeTypeData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('cron')" prop="cron">
          <Input v-model="req.cron" icon="ios-more" :placeholder="`${$t('pleaseEnter')}${$t('cron')},${$t('cronFormat')}`" @on-click="cronClick"/>
        </FormItem>
        <FormItem :label="$t('stopDayOfErrorCount')" prop="stopDayOfErrorCount">
          <InputNumber v-model="req.stopDayOfErrorCount" :min="0"></InputNumber>&nbsp;
          <Tag color="warning">{{$t('stopDayOfErrorCountDescription')}}</Tag>
        </FormItem>
        <FormItem :label="$t('dataBaseName')" prop="dataBaseName" v-if="req.executeType === '0'">
          <Select v-model="req.dataBaseName" :clearable="true" :placeholder="$t('pleaseSelect') + $t('dataBaseName')">
            <Option v-for="(item, i) in databaseData" :value="item.detailCode" :key="i">{{ item.detailName }}</Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('sqls')" prop="sqls" v-if="req.executeType === '0'">
          <Row type="flex" justify="space-between" class-name="rule-row-center">
            <i-col span="1">#</i-col>
            <i-col span="21">{{$t('sqls')}}</i-col>
            <i-col span="1"><Button type="primary" custom-icon="iconfont icon-add" @click="sqlAddClick('sqls')"/></i-col>
          </Row>
          <Row type="flex" justify="space-between" class-name="rule-row-center" v-for="(item, i) in req.sqls" :key="i">
            <i-col span="1">{{i + 1}}</i-col>
            <i-col span="21">
              <Input v-model="item.value" type="textarea" :rows="5" :placeholder="$t('pleaseEnter') + $t('sqls')"/>
            </i-col>
            <i-col span="1"><Button type="primary" custom-icon="iconfont icon-subtract" @click="sqlRemoveClick(i, 'sqls')"/></i-col>
          </Row>
        </FormItem>
        <FormItem :label="$t('sqlParameter')" prop="sqlParameter" v-if="req.executeType === '0'">
          <Row type="flex" justify="space-between" class-name="rule-row-center">
            <i-col span="1">#</i-col>
            <i-col span="11">{{$t('sqlParameterName')}}</i-col>
            <i-col span="10">{{$t('sqlParameterValue')}}</i-col>
            <i-col span="1"><Button type="primary" custom-icon="iconfont icon-add" @click="sqlAddClick('sqlParameter')"/></i-col>
          </Row>
          <Row type="flex" justify="space-between" class-name="rule-row-center" v-for="(item, i) in req.sqlParameter" :key="i">
            <i-col span="1">{{i + 1}}</i-col>
            <i-col span="11">
              <Input v-model="item.name" :placeholder="$t('pleaseEnter') + $t('sqlParameterName')"/>
            </i-col>
            <i-col span="10">
              <Input v-model="item.value" :placeholder="$t('pleaseEnter') + $t('sqlParameterValue')"/>
            </i-col>
            <i-col span="1"><Button type="primary" custom-icon="iconfont icon-subtract" @click="sqlRemoveClick(i, 'sqlParameter')"/></i-col>
          </Row>
        </FormItem>
        <FormItem :label="$t('useTran')" prop="useTran" v-if="req.executeType === '0'">
          <i-switch size="large" v-model="req.useTran">
            <span slot="open">{{ $t('yes') }}</span>
            <span slot="close">{{ $t('no') }}</span>
          </i-switch>&nbsp;
          <Tag color="warning">{{$t('useTranDescription')}}</Tag>
        </FormItem>
        <FormItem :label="$t('url')" prop="url" v-if="req.executeType === '1'">
          <Input v-model="req.url" :placeholder="$t('pleaseEnter') + $t('url')"/>
        </FormItem>
        <FormItem :label="$t('postJsonData')" prop="postJsonData" v-if="req.executeType === '1'">
          <Input type="textarea" :rows="15" v-model="req.postJsonData" :placeholder="$t('pleaseEnter') + $t('postJsonData')"/>
        </FormItem>
        <FormItem :label="$t('pluginName')" prop="pluginName" v-if="req.executeType === '2'">
          <Input v-model="req.pluginName" :placeholder="$t('pluginNameTips')"/>
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
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row>
            <i-col span="8">
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option value="jobName">{{$t('jobName')}}</Option>
                    <Option value="jobGroup">{{$t('jobGroup')}}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('keyWords')"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col span="16">
              <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick" @on-stopTask-click="taskSubmit('stopJob')"
                             @on-starTask-click="taskSubmit('starJob')" @on-deleteTask-click="taskSubmit('deleteJob')"
                             @on-stopAll-click="taskSubmit('stopAll')" @on-starAll-click="taskSubmit('starAll')"
                             @on-forceAll-click="taskSubmit('forceStar')"></button-custom>
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
  import {getpagelistReq, addReq, modifyReq, modifyadvancedReq, getlogReq} from '@/api/system-manager/ETL-manager'
  import {getlistReq} from '@/api/system-manager/data-item'
  import {formatDate, getButtonBoolean, errorType} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "ETL-manager",
    components: {ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      return {
        split: .15,
        drawerFlag: false,
        drawerTitle: this.$t('add'),
        modalFlag: false,
        modalTitle: this.$t('logs'),
        modalFullscreen: false,
        modalType: '',
        logsData: [],
        logsColor: '',
        isForm: true,
        isSuccess: false,
        isAdd: true,
        isHead: false,
        tableHeight: 200,
        tableLoading: true, // table加载动画
        columns: [
          {
            type: 'index', width: 50, align: 'center',
            indexMethod: row => {
              return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1
            }
          },
          {title: this.$t('jobName'), key: 'job_Name', sortable: 'custom'},
          {title: this.$t('description'), key: 'description'},
          {title: this.$t('cron'), key: 'cron'},
          {
            title: this.$t('e'), key: 'e', width: 80,
            render: (h, params) => {
              return h('div', [
                params.row.e ? h('Tag', {
                  props: {
                    color: 'error'
                  },
                  style: {
                    cursor: 'pointer'
                  },
                  nativeOn: {
                    click: () => {
                      this.modalTitle = `${params.row.job_Name}${this.$t('e')}${this.$t('logs')}`
                      this.modalType = 'logs'
                      this.logsColor = 'red'
                      this.getLogsData({jobName: params.row.job_Name, executeType: 'Error'})
                    }
                  }
                }, params.row.e) : 0
              ])
            }
          },
          {
            title: this.$t('r'), key: 'r', width: 80,
            render: (h, params) => {
              return h('div', [
                params.row.r ? h('Tag', {
                  props: {
                    color: 'success'
                  },
                  style: {
                    cursor: 'pointer'
                  },
                  nativeOn: {
                    click: () => {
                      this.modalTitle = `${params.row.job_Name}${this.$t('r')}${this.$t('logs')}`
                      this.modalType = 'logs'
                      this.logsColor = 'blue'
                      this.getLogsData({jobName: params.row.job_Name, executeType: 'Successful'})
                    }
                  }
                }, params.row.r) : 0
              ])
            }
          },
          {
            title: this.$t('triggerState'), key: 'trigger_State',
            render: (h, params) => {
              let val = ''
              switch (params.row.trigger_State) {
                case 'ACQUIRED':
                case 'WAITING':
                  val = 'success'
                  break
                case 'BLOCKED':
                  val = 'cyan'
                  break
                case 'PAUSED':
                case 'PAUSED_BLOCK':
                  val = 'warning'
                  break
                case 'ERROR':
                  val = 'error'
                  break
                default:
                  val = 'default'
              }
              return h('Tag', {
                props: {
                  color: val
                }
              }, params.row.trigger_State)
            }
          },
          {
            title: this.$t('prevFireTime'), key: 'prev_Fire_Time', width: 125,
            render: (h, params) => {
              return h('div', params.row.prev_Fire_TimeDt ? formatDate(params.row.prev_Fire_TimeDt, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          },
          {
            title: this.$t('nextFireTime'), key: 'next_Fire_Time', width: 125,
            render: (h, params) => {
              return h('div', params.row.next_Fire_TimeDt ? formatDate(params.row.next_Fire_TimeDt, 'yyyy-MM-dd hh:mm:ss') : null)
            }
          }
        ], // 表格数据
        data: [], // 表格数据
        executeTypeData: [], // Job执行类型源数据
        databaseData: [], // 数据库名称源数据
        cronData: [
          {name: this.$t('cronTime1'), value: '0 */20 * * * ?'},
          {name: this.$t('cronTime2'), value: '0 0 0/2 * * ?'},
          {name: this.$t('cronTime3'), value: '1/30 * * * * ?'}
        ], // cron表达式源数据
        modifyData: {
          starJob: 0,
          stopJob: 1,
          deleteJob: 2,
          starAll: 3,
          stopAll: 4,
          forceStar: 5
        }, // 任务按钮类型源数据
        selectObj: null, // 表格选中数据
        req: {
          systemFlag: this.$store.state.systemFlag,
          selectName: 'jobName',
          queryName: '',
          jobName: '', // 任务编号
          jobGroup: '', // 任务编号
          triggerName: '', // 任务编号
          triggerGroup: '', // 任务编号
          jobEncode: '', // 任务编号
          description: '', // 描述
          executeType: null, // Job执行类型 0:SQL,SQL; 1:API,API; 2:Plugin,Plugin;
          cron: '', // 表达式
          stopDayOfErrorCount: 0, // 当天错误多少次自动停止任务,小于0永不停止
          dataBaseName: '', // 数据库名称
          sqls: [], // SQL语句
          sqlParameter: [], // SQL参数
          useTran: false, // SQL如果多条是否使用事务,（单条SQL默认不使用）
          url: '', // 请求地址,待开发:只接受Post接口并且是Json数据
          postJsonData: '', // Post数据
          pluginName: '', // 插件名称,待开发:必须继承IPlugin,并重写Run方法
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          jobEncode: [{required: true, message: this.$t('pleaseEnter') + this.$t('jobEncode'), trigger: 'blur'}],
          description: [{required: true, message: this.$t('pleaseEnter') + this.$t('description'), trigger: 'blur'}],
          executeType: [{required: true, message: this.$t('pleaseEnter') + this.$t('executeType'), trigger: 'change'}],
          cron: [{required: true, message: this.$t('pleaseEnter') + this.$t('cron'), trigger: 'blur'}],
          stopDayOfErrorCount: [{required: true, type: 'number', message: this.$t('pleaseEnter') + this.$t('stopDayOfErrorCount'), trigger: 'change'}]
        },
        btnData: []
      }
    },
    mounted() {
      this.req.orderField = 'JOB_NAME'
      this.pageLoad()
      getButtonBoolean(this, this.btnData)
      this.getDataItemData()
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
            jobName: this.req.selectName === 'jobName' ? this.req.queryName.trim() : '',
            jobGroup: this.req.selectName === 'jobGroup' ? this.req.queryName.trim() : ''
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
      // 获取失败和成功日志信息
      getLogsData(data) {
        getlogReq({jobName: data.jobName, executedType: data.executeType}).then(res => {
          if (res.code === 200) {
            this.modalFullscreen = true
            this.modalFlag = true
            this.logsData = res.result ? res.result : []
            this.logsData.forEach(o => {
              let str = o.objectName.slice(o.objectName.indexOf('"Message"'), o.objectName.indexOf('"DataBaseName"') - 1)
              o.objectName = o.objectName.replace(str, `<span style="color: ${this.logsColor};">${str}</span>`)
            })
          }
        })
      },
      // 点击编码规则中的加号按钮触发
      async getDataItemData() {
        this.executeTypeData = await this.getDataItemDetailList('JopExecuteType')
        this.databaseData = await this.getDataItemDetailList('baizeSystemDB')
      },
      async getDataItemDetailList(itemCode) {
        const obj = {
          itemCode,
          enabled: 1
        }
        let arr = []
        await getlistReq(obj).then(res => {
          if (res.code === 200) arr = res.result || []
        })
        return arr
      },
      // 执行类型改变时触发
      executeTypeChange(name) {
        this.isForm = false
        let obj = {
          jobEncode: [{required: true, message: this.$t('pleaseEnter') + this.$t('jobEncode'), trigger: 'blur'}],
          description: [{required: true, message: this.$t('pleaseEnter') + this.$t('description'), trigger: 'blur'}],
          executeType: [{required: true, message: this.$t('pleaseEnter') + this.$t('executeType'), trigger: 'change'}],
          cron: [{required: true, message: this.$t('pleaseEnter') + this.$t('cron'), trigger: 'blur'}],
          stopDayOfErrorCount: [{required: true, type: 'number', message: this.$t('pleaseEnter') + this.$t('stopDayOfErrorCount'), trigger: 'change'}]
        }
        if (name === '0') {
          obj['dataBaseName'] = [{required: true, message: this.$t('pleaseEnter') + this.$t('dataBaseName'), trigger: 'blur'}]
          obj['sqls'] = [{required: true, type: 'array', message: this.$t('pleaseEnter') + this.$t('sqls'), trigger: 'change'}]
        } else if (name === '1') {
          obj['url'] = [{required: true, message: this.$t('pleaseEnter') + this.$t('url'), trigger: 'blur'}]
        } else if (name === '2') {
          obj['pluginName'] = [{required: true, message: this.$t('pleaseEnter') + this.$t('pluginName'), trigger: 'blur'}]
        }
        this.ruleValidate = {...obj}
        this.isForm = true
      },
      // 点击cron表达式中的...触发
      cronClick() {
        this.modalFlag = true
        this.modalType = 'cron'
        this.modalFullscreen = false
        this.modalTitle = this.$t('cron')
      },
      // 点击cron表达式中的...触发
      cronRowClick(item) {
        this.req.cron = item.value
        this.modalFlag = false
      },
      // 点击SQL语句中的加号按钮触发
      sqlAddClick(name) {
        if (name === 'sqls') this.req[name].push({value: ''})
        else this.req[name].push({name: '',value: ''})
      },
      // 点击SQL语句中的减号按钮触发
      sqlRemoveClick(index, name) {
        this.req[name].splice(index, 1)
      },
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true
        this.isAdd = true
        this.drawerTitle = this.$t('add')
      },
      // 新增菜单、按钮
      okClick() {
        this.okOrUpdateSubmit()
      },
      // 点击新增按钮触发
      editClick() {
        if (this.selectObj) {
          const data = JSON.parse(this.selectObj.job_DataJson)
          this.req.jobEncode = this.selectObj.job_Name
          this.req.jobName = this.selectObj.job_Name
          this.req.jobGroup = this.selectObj.job_Group
          this.req.triggerName = this.selectObj.trigger_Name
          this.req.triggerGroup = this.selectObj.trigger_Group
          if (data) {
            this.req.description = data.Description
            this.req.executeType = data.ExecuteType.toString()
            this.executeTypeChange(this.req.executeType)
            this.req.cron = data.Cron
            this.req.stopDayOfErrorCount = data.StopDayOfErrorCount
            this.req.dataBaseName = data.DataBaseName
            this.req.sqls = data.Sqls.map(o => {return {value: o}})
            this.req.sqlParameter = data.SqlParameter ? Object.entries(data.SqlParameter).map(o => {return {name: o[0], value: o[1]}}) : []
            this.req.useTran = data.UseTran
            this.req.url = data.Url
            this.req.postJsonData = data.PostJsonData
            this.req.pluginName = data.PluginName
          }
          this.drawerFlag = true
          this.isAdd = false
          this.drawerTitle = this.$t('edit')
        } else this.$Message.warning(this.$t('oneData'))
      },
      // 修改菜单、按钮
      updateClick() {
        this.okOrUpdateSubmit()
      },
      // 点击新增或修改并关闭按钮触发
      okOrUpdateSubmit() {
        this.$refs.req.validate(validate => {
          if (validate) {
            let sqlPrarms = {}
            this.req.sqlParameter.forEach(o => {
              sqlPrarms[o.name] = o.value
            })
            const executeType = this.req.executeType ? Number(this.req.executeType) : null
            let obj = {
              jobEncode: this.req.jobEncode.trim(),
              description: this.req.description.trim(),
              executeType: executeType,
              cron: this.req.cron.trim(),
              stopDayOfErrorCount: this.req.stopDayOfErrorCount,
              dataBaseName: executeType === 0 ? this.req.dataBaseName : '',
              sqls:  executeType === 0 ? this.req.sqls.map(o => o.value) : [],
              sqlParameter:  executeType === 0 ? sqlPrarms : null,
              useTran:  executeType === 0 ? this.req.useTran : false,
              pluginName:  executeType === 2 ? this.req.pluginName.trim() : '',
              url:  executeType === 1 ? this.req.url.trim() : '',
              postJsonData:  executeType === 1 ? this.req.postJsonData.trim() : ''
            }
            this.okOrUpdateApi(obj).then(res => {
              if (res.code === 200) {
                this.selectObj = null
                this.pageLoad()
                if (this.isSuccess) this.cancelClick()
                this.$Message.success(this.$t('success'))
              } else this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 新增或修改api判断
      okOrUpdateApi(obj) {
        if (!this.isAdd) {
          obj['jobName'] = this.req.jobName
          obj['jobGroup'] = this.req.jobGroup
          obj['triggerName'] = this.req.triggerName
          obj['triggerGroup'] = this.req.triggerGroup
        }
        return this.isAdd ? addReq(obj) : modifyReq(obj)
      },
      // 点击新增或修改并关闭按钮触发
      okOrUpdateClick() {
        this.isSuccess = true
        this.isAdd ? this.okClick() : this.updateClick()
      },
      // 点击停止任务按钮触发
      taskSubmit(name) {
        if (name.includes('All')) {
          this.$Modal.confirm({
            title: this.$t('isSure'),
            onOk: () => {
              let obj = {
                jobName: this.selectObj.job_Name,
                jobGroup: this.selectObj.job_Group,
                modifyType: this.modifyData[name]
              }
              modifyadvancedReq(obj).then(res => {
                if (res.code === 200) {
                  this.selectObj = null
                  this.pageLoad()
                  this.$Message.success(`${this.$t('success')}`)
                } else this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
              })
            }
          })
        } else {
          if (this.selectObj) {
            this.$Modal.confirm({
              title: this.$t('isSure'),
              onOk: () => {
                let obj = {
                  jobName: this.selectObj.job_Name,
                  jobGroup: this.selectObj.job_Group,
                  modifyType: this.modifyData[name]
                }
                modifyadvancedReq(obj).then(res => {
                  if (res.code === 200) {
                    this.selectObj = null
                    this.pageLoad()
                    this.$Message.success(`${this.$t('success')}`)
                  } else this.$Message.error(`${this.$t('fail')},${errorType(this, res.errorCode)}`)
                })
              }
            })
          } else this.$Message.warning(this.$t('oneData'))
        }
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false
        this.isSuccess = false
        this.req.jobName = ''
        this.req.jobGroup = ''
        this.req.triggerName = ''
        this.req.triggerGroup = ''
        this.$refs.req.resetFields() //清除表单红色提示
        this.req.executeType = null
        this.req.sqls = []
        this.req.sqlParameter = []
      },
      // 关闭弹窗触发
      modalCancel() {
        this.modalFlag = false
        this.logsColor = ''
        this.logsData = []
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

<style lang="less">
  .rule-row-center {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
