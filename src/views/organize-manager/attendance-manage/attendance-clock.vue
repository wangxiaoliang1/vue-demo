<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer
      v-model="drawerFlag"
      :title="drawerTitle"
      width="520"
      :mask-closable="false"
      @on-close="cancelClick"
    >
      <Form
        @submit.native.prevent
        ref="submitReq"
        :model="submitData"
        :rules="ruleValidate"
        :label-width="90"
        :label-colon="true"
      >
        <FormItem :label="$t('accountId')" prop="account">
          <Input
            ref="account"
            v-model="submitData.account"
            v-focus="autoFocus === 1"
            @on-keydown.enter="submitClick"
            :placeholder="$t('pleaseEnter') + $t('accountId')"
          />
        </FormItem>
        <List border v-show="errData.length > 0">
          <ListItem v-for="(item, i) in errData" :key="i">
            <Tag :color="item.color">
              {{ item.text }}
            </Tag>
          </ListItem>
        </List>
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
                  <Input
                    search
                    enter-button
                    v-model="req.queryName"
                    @on-search="searchClick"
                    :placeholder="$t('pleaseEnter') + $t('accountId')"
                  />
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom
                :btnData="btnData"
                @on-clock-click="addClick"
                @on-edit-click="editClick"
                @on-export-click="exportClick"
              ></button-custom>
            </i-col>
          </Row>
        </div>
        <table-custom
          :tableHeight="tableHeight"
          :tableLoading="tableLoading"
          :columns="columns"
          :data="data"
          @on-current-change="currentClick"
          @on-sort-change="sortChange"
        ></table-custom>
        <page-custom
          :total="req.total"
          :totalPage="req.totalPage"
          :pageIndex="req.pageIndex"
          :page-size="req.pageSize"
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
        />
      </Card>
    </div>
  </div>
</template>

<script>
import { getpagelistReq, addReq, exportReq } from "@/api/organize-manager/attendance-clock";
import {
  formatDate,
  getButtonBoolean,
  errorType,
  exportFile,
  inputSelectContent,
  playSound,
} from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";

export default {
  name: "attendance-clock",
  components: { ButtonCustom, TableCustom, PageCustom },
  data() {
    return {
      autoFocus: 1,
      split: 0.15,
      drawerFlag: false,
      isAdd: true,
      drawerTitle: this.$t("clock"),
      tableHeight: 200,
      tableLoading: true, // table加载动画
      selectObj: null, // 表格选中数据
      data: [], // 表格数据
      btnData: [],
      errData: [], // 错误信息数据
      columns: [
        {
          type: "index",
          width: 50,
          align: "center",
          indexMethod: (row) => {
            return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
          },
        },
        { title: this.$t("accountId"), key: "account", sortable: "custom" },
        { title: this.$t("accountName"), key: "name" },
        { title: this.$t("adminUser"), key: "adminUser" },
        { title: this.$t("supervisorAccount"), key: "supervisorAccount" },
        {
          title: this.$t("postDate"),
          key: "inDate",
          render: (h, params) => {
            return h(
              "div",
              params.row.inDate ? formatDate(params.row.inDate, "yyyy-MM-dd hh:mm:ss") : null
            );
          },
        },
      ], // 表格数据
      req: {
        queryName: "", //搜索名称
        ...this.$config.pageConfig,
      }, //查询数据
      submitData: {
        account: "", //工号
      },
      // 验证实体
      ruleValidate: {
        account: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("accountId"),
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    this.req.orderField = "inDate";
    this.pageLoad();
    getButtonBoolean(this, this.btnData);
    this.autoSize();
    window.onresize = () => this.autoSize();
  },
  methods: {
    // 获取分页列表数据
    pageLoad() {
      this.tableLoading = true;
      const obj = {
        orderField: this.req.orderField, // 排序字段
        ascending: this.req.ascending, // 是否升序
        pageSize: this.req.pageSize, // 分页大小
        pageIndex: this.req.pageIndex, // 当前页码
        data: {
          account: this.req.queryName.trim(),
          enabled: -1,
        },
      };
      getpagelistReq(obj)
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let { data, pageSize, pageIndex, total, totalPage } = res.result;
            this.req = { ...this.req, pageSize, pageIndex, total, totalPage };
            this.data = data || [];
          }
        })
        .catch(() => (this.tableLoading = false));
    },
    // 点击新增按钮触发
    addClick() {
      this.drawerFlag = true;
      this.isAdd = true;
      this.drawerTitle = this.$t("clock");
    },
    // 点击编辑按钮触发
    editClick() {
      if (this.selectObj) {
        this.submitData = this.selectObj.account;
        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    //提交
    submitClick() {
      this.$refs.submitReq.validate((validate) => {
        if (validate) {
          let obj = { account: this.submitData.account.trim() };
          addReq(obj).then((res) => {
            if (res.code === 200) {
              this.selectObj = null;
              this.$Message.success(`${this.drawerTitle}${this.$t("success")}`);
              if (res.result.weekCount === 5) {
                playSound(this.$config.tipsVoice.NgTips);
                this.errData.unshift({
                  color: "warning",
                  text: `${res.result.account} ${res.result.name} ${this.$t(
                    "theClockInThisWeek"
                  )}: ${res.result.weekCount}${this.$t("days")}`,
                });
              } else {
                playSound(this.$config.tipsVoice.OkTips);
                this.errData.unshift({
                  color: "success",
                  text: res.result.account + " " + res.result.name,
                });
              }
              this.pageLoad();
            } else {
              playSound(this.$config.tipsVoice.NgTips);
              this.$Message.error(
                `${this.drawerTitle}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
              this.errData.unshift({
                color: "error",
                text: `${this.submitData.account.trim()} ${errorType(this, res.errorCode)}`,
              });
            }
          });
          inputSelectContent(this.$refs.account);
        }
      });
    },
    // 导出
    exportClick() {
      const obj = {
        account: this.req.queryName.trim(),
        enabled: -1,
      };
      exportReq(obj).then((res) => {
        let blob = new Blob([res], { type: "application/vnd.ms-excel" });
        const fileName = `${this.$t("attendance-clock")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
    },
    // 点击搜索按钮触发
    searchClick() {
      this.req.pageIndex = 1;
      this.pageLoad();
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
      this.errData = [];
      this.$refs.submitReq.resetFields(); //清除表单红色提示
      this.submitData.id = "";
    },
    // 自动改变表格高度
    autoSize() {
      let height = document.body.clientHeight - 120;
      this.tableHeight = height - 60;
    },
    // 某一行高亮时触发
    currentClick(currentRow) {
      this.selectObj = currentRow;
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
  },
};
</script>
