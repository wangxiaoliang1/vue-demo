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
        <FormItem :label="$t('accountName')" prop="name">
          <Input v-model="submitData.name" :placeholder="$t('pleaseEnter') + $t('accountName')" />
        </FormItem>
        <FormItem :label="$t('accountId')" prop="account">
          <Input v-model="submitData.account" :placeholder="$t('pleaseEnter') + $t('accountId')" />
        </FormItem>
        <FormItem :label="$t('cardNumber')" prop="cardNumber">
          <Input
            v-model="submitData.cardNumber"
            :placeholder="$t('pleaseEnter') + $t('cardNumber')"
          />
        </FormItem>
        <FormItem :label="$t('departmentName')" prop="departmentName">
          <Input
            v-model="submitData.departmentName"
            :placeholder="$t('pleaseEnter') + $t('departmentName')"
          />
        </FormItem>
        <FormItem :label="$t('supervisorAccount')" prop="supervisorAccount">
          <Input
            v-model="submitData.supervisorAccount"
            :placeholder="$t('pleaseEnter') + $t('supervisorAccount')"
          />
        </FormItem>
        <FormItem :label="$t('adminUser')" prop="adminUser">
          <Input
            v-model="submitData.adminUser"
            :placeholder="$t('pleaseEnter') + $t('adminUser')"
          />
        </FormItem>
        <FormItem :label="$t('project')" prop="project">
          <Input v-model="submitData.project" :placeholder="$t('pleaseEnter') + $t('project')" />
        </FormItem>

        <FormItem :label="$t('enabled')" prop="enabled">
          <i-switch size="large" v-model="submitData.enabled" :true-value="1" :false-value="0">
            <span slot="open">{{ $t("open") }}</span>
            <span slot="close">{{ $t("close") }}</span>
          </i-switch>
        </FormItem>
        <FormItem :label="$t('remark')" prop="remark">
          <Input v-model="submitData.remark" :placeholder="$t('pleaseEnter') + $t('remark')" />
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
} from "@/api/organize-manager/attendance-personnel";
import { formatDate, getButtonBoolean, errorType, renderSpan, exportFile } from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import DrawerButton from "@/components/drawer-button";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";
import UploadCustom from "@/components/upload-custom";

export default {
  name: "attendance-personnel",
  components: { ButtonCustom, DrawerButton, TableCustom, PageCustom, UploadCustom },
  data() {
    return {
      uploadUrl: this.$store.state.attendancePersonnelUploadUrl, //批量导入考勤人员Excel文件
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
        { title: this.$t("accountName"), key: "name", sortable: "custom" },

        { title: this.$t("accountId"), key: "account" },
        { title: this.$t("cardNumber"), key: "cardNumber" },
        { title: this.$t("departmentName"), key: "departmentName" },
        { title: this.$t("supervisorAccount"), key: "supervisorAccount" },
        { title: this.$t("adminUser"), key: "adminUser" },
        { title: this.$t("project"), key: "project" },
        { title: this.$t("remark"), key: "remark" },
        {
          title: this.$t("enabled"),
          key: "enabled",
          width: 70,
          render: (h, params) => {
            return renderSpan(this, h, params.row.enabled);
          },
        },
        {
          title: this.$t("createDate"),
          key: "createDate",
          width: 125,
          render: (h, params) => {
            return h(
              "div",
              params.row.createDate
                ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss")
                : null
            );
          },
        },
        {
          title: this.$t("modifyDate"),
          key: "modifyDate",
          width: 125,
          render: (h, params) => {
            return h(
              "div",
              params.row.modifyDate
                ? formatDate(params.row.modifyDate, "yyyy-MM-dd hh:mm:ss")
                : null
            );
          },
        },
      ], // 表格数据
      selectNameList: [
        { title: "accountName", value: "name" },
        { title: "accountId", value: "account" },
        { title: "cardNumber", value: "cardNumber" },
        { title: "departmentName", value: "departmentName" },
        { title: "supervisorAccount", value: "supervisorAccount" },
        { title: "adminUser", value: "adminUser" },
        { title: "project", value: "project" },
        { title: "remark", value: "remark" },
      ], //搜索项列表
      req: {
        selectName: "name", //搜索项
        queryName: "", //搜索名称
        ...this.$config.pageConfig,
      }, //查询数据
      submitData: {
        id: "",
        name: "", //姓名
        account: "", //工号
        cardNumber: "", //卡号
        departmentName: "", //部门名称
        supervisorAccount: "", //主管人的工号
        adminUser: "", //助理工号
        project: "", //所在项目
        enabled: 1, // 1有效 0无效
        remark: "", // 描述
      },
      // 验证实体
      ruleValidate: {
        name: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("accountName"),
            trigger: "change",
          },
        ],
        account: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("accountId"),
            trigger: "change",
          },
        ],
        cardNumber: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("cardNumber"),
            trigger: "change",
          },
        ],
        departmentName: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("departmentName"),
            trigger: "change",
          },
        ],
        supervisorAccount: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("supervisorAccount"),
            trigger: "change",
          },
        ],
        adminUser: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("adminUser"),
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
        let {
          id,
          name,
          account,
          cardNumber,
          departmentName,
          supervisorAccount,
          adminUser,
          project,
          enabled,
          remark,
        } = this.selectObj;
        this.submitData = {
          id,
          name,
          account,
          cardNumber,
          departmentName,
          supervisorAccount,
          adminUser,
          project,
          enabled,
          remark,
        };
        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    //提交
    submitClick(isClose = false) {
      this.$refs.submitReq.validate((validate) => {
        if (validate) {
          let trimList = [
            "name",
            "account",
            "cardNumber",
            "departmentName",
            "supervisorAccount",
            "adminUser",
          ];
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
        const fileName = `${this.$t("attendance-personnel")}${formatDate(
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
        const fileName = this.$t("attendancePersonnelTemplate") + ".xlsx"; // 自定义文件名
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
