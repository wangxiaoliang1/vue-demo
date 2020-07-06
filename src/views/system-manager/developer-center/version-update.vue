<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer v-model="drawerFlag" :title="drawerTitle" width="500" :mask-closable="false" @on-close="cancelClick">
      <Form ref="submitReq" :model="submitData" :rules="ruleValidate" :label-width="100" :label-colon="true"
            @submit.native.prevent>
        <!-- 版本 -->
        <FormItem :label="$t('version')" prop="version">
          <Input v-model="submitData.version" :placeholder="$t('pleaseEnter') + $t('version')"/>
        </FormItem>
        <!-- 更新标题 -->
        <FormItem :label="$t('title')" prop="title">
          <Input v-model="submitData.title" :placeholder="$t('pleaseEnter') + $t('title')"/>
        </FormItem>
        <!-- 更新内容 -->
        <FormItem :label="$t('content')" prop="content">
          <Input type="textarea" v-model="submitData.content" :rows="4" :placeholder="$t('pleaseEnter') + $t('content')"/>
        </FormItem>
        <!-- 颜色 -->
        <FormItem :label="$t('color')" prop="color">
          <ColorPicker v-model="submitData.color" />
        </FormItem>
        <FormItem :label="$t('sortCode')" prop="sortCode">
          <InputNumber v-model="submitData.sortCode" :min="0"></InputNumber>
        </FormItem>
        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="submitData.enabled" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("open") }}</span>
            <span slot="close">{{ $t("close") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="submitData.remark" :placeholder="$t('pleaseEnter') + $t('remark')"/>
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button :isAdd="isAdd" @on-cancel="cancelClick" @on-ok="submitClick" @on-update="submitClick"
                         @on-okOrUpdate="submitClick(true)"></drawer-button>
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
                    <Option v-for="(item, i) in selectNameList" :value="item.value" :key="i">{{ $t(item.title) }}</Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input search enter-button v-model="req.queryName" @on-search="searchClick"
                         :placeholder="$t('pleaseEnter') + $t('keyWords')"/>
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom :btnData="btnData" @on-add-click="addClick" @on-edit-click="editClick"></button-custom>
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
  import {getpagelistReq, addReq, modifyReq} from '@/api/system-manager/developer-center'
  import {formatDate, getButtonBoolean, errorType} from '@/libs/tools'
  import ButtonCustom from '@/components/button-custom'
  import TableCustom from '@/components/table-custom'
  import PageCustom from '@/components/page-custom'
  import DrawerButton from "@/components/drawer-button"

  export default {
    name: "developer-center",
    components: {ButtonCustom, TableCustom, PageCustom, DrawerButton},
    data() {
      return {
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
          {title: this.$t('version'), key: 'version', sortable: 'custom', width: 60},
          {title: this.$t('title'), key: 'title'},
          {title: this.$t('content'), key: 'content'},
          {title: this.$t('color'), key: 'color', width: 80},
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
          {title: this.$t('remark'), key: 'remark'},
        ], // 表格数据
        data: [], // 表格数据
        selectObj: null, // 表格选中数据
        selectNameList: [
          { title: "version", value: "version" },
          { title: "remark", value: "remark" },
        ], //搜索项列表
        req: {
          selectName: "version", //搜索项
          queryName: "", //搜索名称
          id: '', // 主键Id
          version: '',// 版本
          remark: '',// 描述
          enabled: -1, // 是否有效 -1:所有 0:无效 1:有效
          ...this.$config.pageConfig
        },
        submitData: {
          id: '', // 主键Id
          version: '',// 版本
          title: '',// 更新标题
          content: '',// 更新内容
          color: '',// 颜色
          remark: '',//描述
          sortCode: 0,//排序码
          enabled: 1//是否有效
        },
        // 验证实体
        ruleValidate: {
          version: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('version')}`, trigger: 'blur'}],
          title: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('title')}`, trigger: 'blur'}],
          content: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('content')}`, trigger: 'blur'}],
          color: [{required: true, message: `${this.$t('pleaseEnter')}${this.$t('color')}`, trigger: 'blur'}],
        },
        btnData: []
      }
    },
    mounted() {
      getButtonBoolean(this, this.btnData)
      this.req.orderField = 'version'
      this.req.ascending = false
      this.pageLoad()
      this.autoSize()
      window.onresize = () => this.autoSize()
    },
    methods: {
      // 获取分页列表数据
      pageLoad() {
        this.tableLoading = true
        let {id, enabled} = this.req
        const obj = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {id, [this.req.selectName]: this.req.queryName.trim(), enabled}
        };
        getpagelistReq(obj).then(res => {
          this.tableLoading = false
          if (res.code === 200) {
            let data = res.result
            this.data = data.data || []
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
      // 点击新增按钮触发
      addClick() {
        this.drawerFlag = true;
        this.isAdd = true;
        this.drawerTitle = this.$t("add");
      },
      // 点击编辑按钮触发
      editClick() {
        if (this.selectObj) {
          let {id, version, title, content, color, remark, sortCode, enabled} = this.selectObj;
          this.submitData = {id, version, title, content, color, remark, sortCode, enabled};
          this.drawerFlag = true;
          this.isAdd = false;
          this.drawerTitle = this.$t("edit");
        } else this.$Message.warning(this.$t("oneData"));
      },
      //提交
      submitClick(isClose = false) {
        this.$refs.submitReq.validate((validate) => {
          if (validate) {
            let trimArr = ['version', 'title', 'content', 'color']
            trimArr.forEach(o => {
              this.submitData[o] = this.submitData[o] ? this.submitData[o].trim() : ''
            })
            let obj = { ...this.submitData, processId: this.submitData.processId || '' };
            let request = this.isAdd ? addReq(obj) : modifyReq(obj);
            request.then((res) => {
              if (res.code === 200) {
                this.selectObj = null;
                this.$Message.success(`${this.drawerTitle}${this.$t("success")}`);
                this.pageLoad();
                if (isClose) this.cancelClick();
              } else this.$Message.error(`${this.drawerTitle}${this.$t("fail")},${errorType(this, res.errorCode)}`);
            });
          }
        });
      },
      // 左侧抽屉取消
      cancelClick() {
        this.drawerFlag = false;
        this.$refs.submitReq.resetFields(); //清除表单红色提示
        this.submitData.id = "";
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
        this.req.orderField = data.key.toUpperCase();
        this.req.ascending = data.order === "asc";
        this.pageLoad();
      },
      // 选择第几页
      pageChange(index) {
        this.req.pageIndex = index;
        this.pageLoad();
      },
      // 选择一页有条数据
      pageSizeChange(index) {
        this.req.pageIndex = 1;
        this.req.pageSize = index;
        this.pageLoad();
      },
    }
  }
</script>

<style scoped lang="less">
  .modal_record {
    display: flex;
    justify-content: space-between;
    padding: 5px 20px;
  }
</style>
