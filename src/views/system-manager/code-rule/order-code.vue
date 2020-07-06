<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="800" :mask-closable="false" @on-close="cancelClick">
      <Form ref="req" :model="req" :rules="ruleValidate" :label-width="90" :label-colon="true">
        <FormItem :label="$t('code')" prop="encode">
          <Input v-model="req.encode" :placeholder="$t('pleaseEnter') + $t('code')"/>
        </FormItem>
        <FormItem :label="$t('name')" prop="name">
          <Input v-model="req.name" :placeholder="$t('pleaseEnter') + $t('name')"/>
        </FormItem>
        <FormItem :label="$t('category')" prop="category">
          <RadioGroup v-model="req.category">
            <Radio :label="0">{{ $t("productionNo") }}</Radio>
            <Radio :label="1">{{ $t("shipment") }}</Radio>
            <Radio :label="2">{{ $t("caseNo") }}</Radio>
            <Radio :label="3">{{ $t("pallet") }}</Radio>
            <Radio :label="4">{{ $t("doubleHane") }}</Radio>
          </RadioGroup>
        </FormItem>

        <FormItem :label="$t('ruleFormatJson')" prop="ruleFormatJson">
          <Row type="flex" justify="space-between" class-name="rule-row-center">
            <i-col span="1">#</i-col>
            <i-col span="4">{{$t('formatType')}}</i-col>
            <i-col span="6">{{$t('formatString')}}</i-col>
            <i-col span="2">{{$t('initValue')}}</i-col>
            <i-col span="2">{{$t('ary')}}</i-col>
            <i-col span="2">{{$t('customized')}}</i-col>
            <i-col span="2">{{$t('automaticReset')}}</i-col>
            <i-col span="1"><Button type="primary" custom-icon="iconfont icon-add" @click="ruleAddClick"/></i-col>
          </Row>
          <Row type="flex" justify="space-between" class-name="rule-row-center" v-for="(item, i) in req.ruleFormatJson" :key="i">
            <i-col span="1">{{i + 1}}</i-col>
            <i-col span="4">
              <Select v-model="item.formatType" @on-change="(e)=>formatTypeChange(e,i)">
                <Option v-for="(code, codeIndex) in codeType" :key="codeIndex" :value="code.id" :disabled="(code.id === 1 && isHead) || (code.id === 3 && isDate) || (code.id === 4 && isSerialNumber)">{{code.label}}</Option>
              </Select>
            </i-col>
            <i-col span="6">
              <Input v-model="item.formatString" v-if="item.formatType === 1 || item.formatType === 2||item.formatType === 9||item.formatType === 10"/>
              <Select v-model="item.formatString" v-else :disabled="item.formatType === 5||item.formatType === 6||item.formatType === 7||item.formatType === 8||item.formatType === 12">
                <Option v-for="(code, codeIndex) in setFormatList(item.formatType)" :key="codeIndex" :value="code">{{code}}</Option>
              </Select>
            </i-col>
            <i-col span="2">
              <InputNumber style="width:100%" v-model="item.initValue" :disabled="item.formatType !== 4"/>
            </i-col>
            <i-col span="2">
              <Select v-model="item.toBase" :disabled="item.formatType !== 4">
                <Option v-for="(code, codeIndex) in aryList" :key="codeIndex" :value="code.id">{{code.label}}</Option>
              </Select>
            </i-col>
            <i-col span="2">
              <!-- 自定义 -->
              <Poptip v-if="item.formatType === 5||item.formatType === 6||item.formatType === 7||item.formatType === 8" v-model="item.poptipModal" class="poptip-style" placement="right-start" width="60">
                <Input :value="item.diyDate.join()" readonly/>
                <div class="poptip-style-content" slot="content">
                   <Table border :columns="columns1" :data="item.tableData" max-height='200' :key='item.tableData.length' >
                      <template slot-scope="{ row,index }" slot="num">
                        <Input v-model="item.diyDate[index]" />
                      </template>
                   </Table>
                </div>
              </Poptip>
              <Input v-else :disabled='item.formatType !== 11&&item.formatType !== 12' v-model="item.diyDate[0]"/>
            </i-col>
            <i-col span="2">
              <!-- 自动重启 -->
              <i-switch size="large" v-model="item.reset" :disabled="item.formatType === 1||item.formatType === 2||item.formatType === 3||item.formatType === 4||item.formatType === 9||item.formatType === 10||item.formatType === 11">
                <span slot="open">{{ $t('yes') }}</span>
                <span slot="close">{{ $t('no') }}</span>
              </i-switch>
            </i-col>
            <i-col span="1"><Button type="primary" custom-icon="iconfont icon-subtract" @click="ruleRemoveClick(i)"/></i-col>
          </Row>
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
            <i-col span="12">
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="req.selectName">
                    <Option value="code">{{$t('code')}}</Option>
                    <Option value="name">{{$t('name')}}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('name')"/>
                </FormItem>
                <FormItem style="width: 120px;">
                  <Select
                    v-model="req.categorySelect"
                    clearable
                    filterable
                    :placeholder="$t('pleaseSelect') + $t('category')"
                  >
                    <Option :value="0">{{ $t("productionNo") }}</Option>
                    <Option :value="1">{{ $t("shipment") }}</Option>
                    <Option :value="2">{{ $t("caseNo") }}</Option>
                    <Option :value="3">{{ $t("pallet") }}</Option>
                    <Option :value="4">{{ $t("doubleHane") }}</Option>
                  </Select>
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
  </div>
</template>

<script>
  import {getpagelistReq, addReq, modifyReq} from '@/api/system-manager/order-code'
  import {formatDate, getButtonBoolean, errorType, renderSpan,ordertCodeCategory} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import DrawerButton from '@/components/drawer-button'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'

  export default {
    name: "order-code",
    components: {ButtonCustom, DrawerButton, TableCustom, PageCustom},
    data() {
      return {
        poptipModal: false,
        split: .15,
        drawerFlag: false,
        isSuccess: false,
        isAdd: true,
        isHead: false,
        isDate: false,
        isSerialNumber: false,
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
          {title: this.$t('code'), key: 'encode', sortable: 'custom'},
          {title: this.$t('name'), key: 'name'},
          {
          title: this.$t("category"),
          key: "category",
          render: (h, params) => {
            return h("div", ordertCodeCategory(params.row.category));
          },
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
        codeType: [
          {id: 1, label: this.$t('orderFirst'), disabled: false},
          {id: 2, label: this.$t('orderMiddle')},
          {id: 3, label: this.$t('orderDate')},
          {id: 4, label: this.$t('serialNumber')},
          {id: 11, label: this.$t('customNumber')},
          {id: 12, label: this.$t('Y')},
          {id: 5, label: this.$t('m')},
          {id: 8, label: this.$t('d')},
          {id: 6, label: this.$t('w')},
          {id: 7, label: this.$t('k')},
          {id: 9, label: this.$t('customFun')},
          {id: 10, label: 'CheckSum'},
        ], // 表格数据
        aryList: [
          {id: 10, label: '10' || this.$t('ary10')},
          {id: 16, label: '16' || this.$t('ary16')}
        ], // 表格数据
        selectObj: null, // 表格选中数据
        req: {
          systemFlag: this.$store.state.systemFlag,
          selectName: 'code',
          categorySelect:null,
          queryName: '',
          orderId: '', // 单据编码id
          encode: '', // 单据编码名称
          category:0, //类别
          name: '', // 单据编码名称
          ruleFormatJson: [], // 编码规则
          sortCode: 0, // 排序码
          enabled: true, // 1有效 0无效
          remark: '', // 描述
          ...this.$config.pageConfig
        },
        // 验证实体
        ruleValidate: {
          encode: [{required: true, message: this.$t('pleaseEnter') + this.$t('code'), trigger: 'blur'}],
          name: [{required: true, message: this.$t('pleaseEnter') + this.$t('name'), trigger: 'blur'}],
          ruleFormatJson: [{required: true, type: 'array',validator: this.isDiyDateOk,trigger: 'change'}]
        },
        btnData: [],
        columns1: [
          {title: this.$t('orderDate'), key: 'date', width:35},
          {title: this.$t('value'), key: 'num', slot: 'num',},
        ],
        tableData: [
          // {date: '1',num: ''},
        ],
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
            encode: this.req.selectName === 'code' ? this.req.queryName.trim() : '',
            name: this.req.selectName === 'name' ? this.req.queryName.trim() : '',
            category:  this.req.categorySelect,
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
      // 点击搜索按钮触发
      searchClick() {
        this.req.pageIndex = 1
        this.pageLoad()
      },
      // 点击编码规则中的加号按钮触发
      ruleAddClick() {
        this.req.ruleFormatJson.push({
          formatType: null, // 编码前缀类型 1-单据首 2-单据中 3-日期 4-流水号
          formatString: '', // 格式化字符串
          toBase: 10, // 10进制、16进制
          initValue: 0, // 初始值，默认：1
          diyDate:[], //提交的自定义值
          tableData:[],//自定义的表格
          poptipModal:false, //自定义参数显示框
          reset:false, //是否重设
        })
      },
      // 点击编码规则中的减号按钮触发
      ruleRemoveClick(index) {
        this.req.ruleFormatJson.splice(index, 1)
        //重置编码规则的验证
        this.$refs.req.validateField('ruleFormatJson')
      },
      //判断自定义不能为空
      isDiyDateOk(rule, value, callback){
        if (value.length===0) {
          callback(new Error(this.$t('pleaseEnter') + this.$t('ruleFormatJson')));
        }else{
          value.map((item,index)=>{
            if (item.formatType===5||item.formatType===6||item.formatType===7||item.formatType===8) {
              let count=0;
              item.diyDate.map(item1=>{
                if(item1==='' ){
                  count=count+1
                }
              })
              if (count>0 && count<=item.diyDate.length ) {
                callback(new Error(this.$t('in')+(index+1)+this.$t('BarCodingRuleCustomValuesCannotBeEmpty')));
              }
            }
          })
          callback();
        }
      },
      // 编码前缀类型改变时触发
      formatTypeChange(e,index,item) {
        let obj={ 5:12,6:53,7:7,8:31 }
        this.req.ruleFormatJson[index].tableData=[]
        if(item){
          this.req.ruleFormatJson[index].diyDate=item.diyDate||[]
          if(e===5||e===6||e===7||e===8){
            for (let i = 0; i < obj[e]; i++) {
              this.req.ruleFormatJson[index].tableData.push({date: i+1,num: item.diyDate[i]})
            }
          }
        }else{
          this.req.ruleFormatJson[index].diyDate=[]
          if(e===5||e===6||e===7||e===8){
            for (let i = 0; i < obj[e]; i++) {
              this.req.ruleFormatJson[index].diyDate.push(String(i+1))
              this.req.ruleFormatJson[index].tableData.push({date: i+1,num: '' })
            }
          }
        }
        this.isHead = this.req.ruleFormatJson.filter(o => o.formatType === 1).length > 0
        this.isDate = this.req.ruleFormatJson.filter(o => o.formatType === 3).length > 0
        this.isSerialNumber = this.req.ruleFormatJson.filter(o => o.formatType === 4).length > 0
      },
      // 格式化字符串数据源设置
      setFormatList(type) {
        return type === 3 ? ['MMdd', 'ddMM', 'MMyy', 'yyMM', 'yyyyMM', 'yyyyMMdd', 'yyyyMMddHH', 'yyyyMMddHHmm', 'yyyyMMddHHmmss'] : ['000', '0000', '00000', '000000']
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
              encode: this.req.encode.trim(),
              name: this.req.name.trim(),
              category:this.req.category,
              ruleFormatJson: this.req.ruleFormatJson,
              sortCode: this.req.sortCode,
              enabled: this.req.enabled ? 1 : 0
            }
            addReq(obj).then(res => {
              if (res.code === 200) {
                this.$Message.success(`${this.$t('add')}${this.$t('success')}`)
                this.pageLoad()
                if (this.isSuccess) this.cancelClick()
              } else this.$Message.error(`${this.$t('add')}${this.$t('fail')},${errorType(this, res.errorCode)}`)
            })
          }
        })
      },
      // 点击新增按钮触发
      editClick() {
        if (this.selectObj) {
          const data =this.selectObj
          this.req.orderId = data.id
          this.req.encode = data.encode
          this.req.category = data.category
          this.req.name = data.name
          this.req.ruleFormatJson =JSON.parse(JSON.stringify(data.ruleFormatJson))
          this.req.sortCode = data.sortCode
          this.req.enabled = data.enabled === 1
          this.req.ruleFormatJson.map((item,index)=>{
            this.formatTypeChange(item.formatType,index,item)
          })
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
              id: this.req.orderId,
              encode: this.req.encode.trim(),
              name: this.req.name.trim(),
              category:this.req.category,
              ruleFormatJson: this.req.ruleFormatJson,
              sortCode: this.req.sortCode,
              enabled: this.req.enabled ? 1 : 0
            }
            modifyReq(obj).then(res => {
              if (res.code === 200) {
                this.selectObj = null
                this.pageLoad()
                if (this.isSuccess) this.cancelClick()
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
        this.isDate = false
        this.isSerialNumber = false
        this.req.orderId = '0'
        this.req.encode = ''
        this.req.name = ''
        this.req.ruleFormatJson = []
        this.req.sortCode = 0
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

<style lang="less">
  .rule-row-center {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
  .btn_con{
    margin-top: 10px;
    display: flex;
    justify-content: space-around;
  }
</style>
