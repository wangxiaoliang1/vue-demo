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
      <div v-if="drawerTitle === $t('import')" class="import_con">
        <upload-custom
          class="upload-con"
          :uploadUrl="uploadUrl"
          :uploadHeight="33"
          uploadIcon="ios-cloud-upload-outline"
          :uploadFormat="['xlsx']"
          @upload-success="uploadSuccess"
        >
          <div slot="button">
            <Button type="success">{{ $t("clickUpload") }}</Button>
          </div>
        </upload-custom>

        <div class="download">
          {{ $t("pleaseSpecifyTheExcelFormatInTheSpecifiedFormat") }}
          <span @click="download()">
            {{ $t("downloadTemplate") }}
          </span>
        </div>
      </div>
      <Form
        v-else
        ref="submitReq"
        :model="submitData"
        :rules="ruleValidate"
        :label-width="90"
        :label-colon="true"
      >
        <FormItem :label="$t('accountId')" prop="account">
          <Input v-model="submitData.account" :placeholder="$t('pleaseEnter') + $t('accountId')" />
        </FormItem>
        <FormItem :label="$t('w1')" prop="w1">
          <i-switch size="large" v-model="submitData.w1" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('w2')" prop="w2">
          <i-switch size="large" v-model="submitData.w2" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('w3')" prop="w3">
          <i-switch size="large" v-model="submitData.w3" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('w4')" prop="w4">
          <i-switch size="large" v-model="submitData.w4" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('w5')" prop="w5">
          <i-switch size="large" v-model="submitData.w5" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('w6')" prop="w6">
          <i-switch size="large" v-model="submitData.w6" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('w7')" prop="w7">
          <i-switch size="large" v-model="submitData.w7" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("workday") }}</span>
            <span slot="close">{{ $t("dayOff") }}</span>
          </i-switch>
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button
            :isAdd="isAdd"
            @on-cancel="cancelClick"
            @on-ok="submitClick"
            @on-update="submitClick"
            @on-okOrUpdate="submitClick(true)"
          ></drawer-button>
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
                    <Option
                      v-for="(item, index) in selectNameList"
                      :value="item.value"
                      :key="index"
                      >{{ $t(item.title) }}</Option
                    >
                  </Select>
                </FormItem>
                <FormItem>
                  <Input
                    search
                    enter-button
                    v-model="req.queryName"
                    @on-search="searchClick"
                    :placeholder="$t('pleaseEnter') + $t('keyWords')"
                  />
                </FormItem>
              </Form>
            </i-col>
            <i-col span="12">
              <button-custom
                :btnData="btnData"
                @on-add-click="addClick"
                @on-edit-click="editClick"
                @on-export-click="exportClick"
                @on-import-click="importClick"
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
import {
  getpagelistReq,
  addReq,
  modifyReq,
  exportReq,
  downloadReq,
} from "@/api/organize-manager/useratt-limit";
import { formatDate, getButtonBoolean, errorType, exportFile,renderDate } from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";
import UploadCustom from "@/components/upload-custom";

export default {
  name: "useratt-limit",
  components: { ButtonCustom, DrawerButton, TableCustom, PageCustom, UploadCustom },
  data() {
    return {
      uploadUrl: this.$store.state.userattlimitUploadUrl, //批量导入url
      split: 0.15,
      drawerFlag: false,
      isAdd: true,
      drawerTitle: this.$t("add"),
      tableHeight: 200,
      tableLoading: true, // table加载动画
      selectObj: null, // 表格选中数据
      data: [], // 表格数据
      btnData: [],
      columns: [
        {
          type: "index",
          width: 50,
          align: "center",
          indexMethod: (row) => {
            return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
          },
        },
        { title: this.$t("accountId"), key: "account" },
        { title: this.$t("accountName"), key: "name" },
        { title: this.$t("w1"), key: "w1", render: this.workdayrender },
        { title: this.$t("w2"), key: "w2", render: this.workdayrender },
        { title: this.$t("w3"), key: "w3", render: this.workdayrender },
        { title: this.$t("w4"), key: "w4", render: this.workdayrender },
        { title: this.$t("w5"), key: "w5", render: this.workdayrender },
        { title: this.$t("w6"), key: "w6", render: this.workdayrender },
        { title: this.$t("w7"), key: "w7", render: this.workdayrender },
        {
          title: this.$t("createDate"),
          key: "createDate",
          width: 125,
          render: renderDate,
        },
        {
          title: this.$t("modifyDate"),
          key: "modifyDate",
          width: 125,
          render: renderDate,
        },
      ], // 表格数据
      selectNameList: [
        { title: "accountId", value: "account" },
        { title: "remark", value: "remark" },
      ], //搜索项列表
      req: {
        selectName: "account", //搜索项
        queryName: "", //搜索名称
        ...this.$config.pageConfig,
      }, //查询数据
      submitData: {
        id: "",
        account: "", //工号
        w1: 1, //周一
        w2: 1, //周二
        w3: 1, //周三
        w4: 1, //周四
        w5: 1, //周五
        w6: 1, //周六
        w7: 0, //周天
        enabled: 1, // 1有效 0无效
        remark: "", // 描述
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
    this.pageLoad();
    getButtonBoolean(this, this.btnData);
    this.autoSize();
    window.onresize = () => this.autoSize();
  },
  methods: {
    workdayrender(h, params) {
      return h("div", params.row[params.column.key] === 1 ? "" : "休");
    },
    // 获取分页列表数据
    pageLoad() {
      this.tableLoading = true;
      const obj = {
        orderField: this.req.orderField, // 排序字段
        ascending: this.req.ascending, // 是否升序
        pageSize: this.req.pageSize, // 分页大小
        pageIndex: this.req.pageIndex, // 当前页码
        data: {
          [this.req.selectName]: this.req.queryName.trim(),
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
      this.drawerTitle = this.$t("add");
    },
    // 点击编辑按钮触发
    editClick() {
      if (this.selectObj) {
        let { id, account, w1, w2, w3, w4, w5, w6, w7 } = this.selectObj;
        this.submitData = { id, account, w1, w2, w3, w4, w5, w6, w7 };
        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    //提交
    submitClick(isClose = false) {
      this.$refs.submitReq.validate((validate) => {
        if (validate) {
          let trimList = ["account"];
          trimList.map((item) => {
            this.submitData[item] = this.submitData[item] ? this.submitData[item].trim() : "";
          });

          let obj = this.submitData;
          let request = this.isAdd ? addReq(obj) : modifyReq(obj);
          request.then((res) => {
            if (res.code === 200) {
              this.selectObj = null;
              this.$Message.success(`${this.drawerTitle}${this.$t("success")}`);
              this.pageLoad();
              if (isClose) this.cancelClick();
            } else
              this.$Message.error(
                `${this.drawerTitle}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
          });
        }
      });
    },
    // 导出
    exportClick() {
      const obj = {
        [this.req.selectName]: this.req.queryName.trim(),
        enabled: -1,
      };
      exportReq(obj).then((res) => {
        let blob = new Blob([res], { type: "application/vnd.ms-excel" });
        const fileName = `${this.$t("useratt-limit")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
    },

    //下载模板
    download() {
      downloadReq().then((res) => {
        let blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileName = this.$t("userattLimitTemplate") + ".xlsx"; // 自定义文件名
        exportFile(blob, fileName);
      });
    },
    // 右侧弹窗打开
    importClick() {
      this.drawerFlag = true;
      this.drawerTitle = this.$t("import");
    },
    // SN检查导入成功触发
    uploadSuccess() {
      this.$Message.success(`${this.$t("import")}${this.$t("success")}`);
    },
    // 点击搜索按钮触发
    searchClick() {
      this.req.pageIndex = 1;
      this.pageLoad();
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
      if (this.$refs.submitReq) {
        this.$refs.submitReq.resetFields(); //清除表单红色提示
      }
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
