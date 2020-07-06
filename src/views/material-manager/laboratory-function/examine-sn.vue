<template>
  <div class="page-style">
    <!-- 左侧抽屉 -->
    <Drawer
      v-model="drawerFlag"
      :title="drawerTitle"
      width="650"
      :mask-closable="false"
      @on-close="cancelClick"
    >
      <div v-if="drawerTitle === $t('examine-sn')">
        <Form
          ref="req"
          :model="req"
          :rules="ruleValidate"
          :label-width="80"
          :label-colon="true"
          @submit.native.prevent
        >
          <FormItem label="SN" prop="sn">
            <Input
              ref="sn"
              v-model="req.sn"
              v-focus="autoFocus === 1"
              @on-keydown.enter="okClick"
              :placeholder="$t('pleaseEnter') + 'SN'"
            />
          </FormItem>
        </Form>
        <List border v-show="errData.length > 0">
          <ListItem v-for="(item, i) in errData" :key="i">
            <Tag :color="item.isSuccess ? 'success' : 'error'">
              {{ "SN：" + item.sn + "，" + item.text }}
            </Tag>
          </ListItem>
        </List>
      </div>
      <div v-if="drawerTitle === $t('snImport')" class="import_con">
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
      <div v-if="drawerTitle === $t('edit')">
        <Form ref="req" :model="req" :rules="ruleValidate" :label-width="80" :label-colon="true">
          <FormItem :label="$t('sn')" prop="sn">
            <Input v-model="req.sn" :placeholder="$t('pleaseEnter') + $t('sn')" disabled />
          </FormItem>
          <FormItem :label="$t('sortNumber')" prop="sortNumber">
            <InputNumber v-model="req.sortNumber" :min="0"></InputNumber>
          </FormItem>
          <FormItem :label="$t('checkContent')" prop="checkContent">
            <Input
              v-model="req.checkContent"
              :placeholder="$t('pleaseEnter') + $t('checkContent')"
            />
          </FormItem>
          <FormItem :label="$t('remark')" prop="remark">
            <Input v-model="req.remark" :placeholder="$t('pleaseEnter') + $t('remark')" />
          </FormItem>
          <!-- 按钮 -->
          <FormItem>
            <drawer-button
              :isAdd="isAdd"
              @on-cancel="cancelClick"
              @on-ok="okClick"
              @on-update="updateClick"
              @on-okOrUpdate="updateClick"
            ></drawer-button>
          </FormItem>
        </Form>
      </div>
    </Drawer>

    <!-- 页面表格 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row type="flex" justify="space-between">
            <i-col>
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Input
                    search
                    enter-button
                    v-model="req.queryName"
                    @on-search="searchClick"
                    :placeholder="$t('pleaseEnter') + 'SN'"
                  />
                </FormItem>
              </Form>
            </i-col>
            <i-col>
              <button-custom
                :btnData="btnData"
                @on-snImport-click="examineSn('snImport')"
                @on-examine-sn-click="examineSn('examine-sn')"
                @on-export-click="exportClick"
                @on-edit-click="editClick"
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
          @on-expand="expandChange"
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
  downloadReq,
  getlistReq,
  getsnReq,
  exportReq,
  modifyReq,
} from "@/api/material-manager/examine-sn";
import { formatDate, getButtonBoolean, inputSelectContent, exportFile, speak } from "@/libs/tools";
import ButtonCustom from "@/components/button-custom";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";
import UploadCustom from "@/components/upload-custom";
import DrawerButton from "@/components/drawer-button";

export default {
  name: "examine-sn",
  components: { ButtonCustom, TableCustom, PageCustom, UploadCustom, DrawerButton },
  data() {
    return {
      tablekey: 0,
      uploadUrl: this.$store.state.checksnUploadUrl, //批量导入SN检查Excel文件
      checksnTemplateUploadUrl: this.$store.state.checksnTemplateUploadUrl, //下载SN防呆模板
      split: 0.15,
      autoFocus: 0,
      isAdd: true,
      drawerFlag: false,
      drawerTitle: this.$t("add"),
      tableHeight: 200,
      tableLoading: true, // table加载动画
      columns: [
        {
          type: "expand",
          width: 50,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  padding: "5px 0 5px 50px",
                  backgroundColor: "#fff",
                },
              },
              [
                h("Table", {
                  props: {
                    border: true,
                    columns: this.columns1,
                    data: this.data[params.index].children || [],
                    tablekey: this.tablekey,
                  },
                }),
              ]
            );
          },
        },
        {
          type: "index",
          width: 50,
          align: "center",
          indexMethod: (row) => {
            return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
          },
        },
        { title: this.$t("sn"), key: "sn", sortable: "custom" },
        { title: this.$t("sortNumber"), key: "sortNumber", width: 200 },
        { title: this.$t("checkContent"), key: "checkContent" },
        { title: this.$t("remark"), key: "remark" },
      ], // 表格数据
      data: [], // 表格数据
      columns1: [
        {
          type: "index",
          width: 50,
          align: "center",
          fixed: "left",
          indexMethod: (row) => {
            return row._index + 1;
          },
        },
        {
          title: this.$t("examineName"),
          key: "createUserName",
        },
        {
          title: this.$t("examineDate"),
          key: "createDate",
          render: (h, params) => {
            return h(
              "div",
              params.row.createDate
                ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss")
                : null
            );
          },
        },
      ],
      errData: [], // 表格数据
      selectObj: null, // 表格选中数据
      req: {
        queryName: "",
        id: "",
        sn: "", // SN
        sortNumber: 0, //序号
        checkContent: "", //测试内容
        remark: "", //描述
        ...this.$config.pageConfig,
      },
      // 验证实体
      ruleValidate: {
        sn: [
          {
            required: true,
            message: this.$t("pleaseEnter") + "SN",
            trigger: "change",
          },
        ],
        sortNumber: [
          {
            type: "number",
            required: true,
            message: this.$t("pleaseEnter") + this.$t("sortNumber"),
            trigger: "change",
          },
        ],
        checkContent: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("checkContent"),
            trigger: "change",
          },
        ],
      },
      btnData: [],
    };
  },
  mounted() {
    this.pageLoad();
    getButtonBoolean(this, this.btnData);
    this.autoSize();
    window.onresize = () => this.autoSize();
  },
  methods: {
    // 点击新增按钮触发
    editClick() {
      if (this.selectObj) {
        const data = this.selectObj;
        this.req.id = data.id;
        this.req.sn = data.sn;
        this.req.sortNumber = Number(data.sortNumber);
        this.req.checkContent = data.checkContent;
        this.req.remark = data.remark;
        this.drawerFlag = true;
        this.isAdd = false;
        this.drawerTitle = this.$t("edit");
      } else this.$Message.warning(this.$t("oneData"));
    },
    // 修改按钮
    updateClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            id: this.req.id,
            sn: this.req.sn,
            sortNumber: String(this.req.sortNumber),
            checkContent: this.req.checkContent,
            remark: this.req.remark,
            enabled: 1,
          };
          modifyReq(obj).then((res) => {
            if (res.code === 200) {
              this.selectObj = null;
              this.pageLoad();
              this.$Message.success(`${this.$t("edit")}${this.$t("success")}`);
              this.cancelClick();
            } else this.$Message.error(`${this.$t("edit")}${this.$t("fail")}`);
          });
        }
      });
    },
    //多级table展开或收起
    expandChange(row, status) {
      if (status) {
        this.getlist(row);
      }
    },
    //获取SN检查日志记录
    getlist(row) {
      this.tableLoading = true;
      const obj = {
        sn: row.sn,
      };
      getlistReq(obj)
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            this.data.forEach((item) => {
              if (item.id === row.id) {
                item.children = res.result || [];
              }
            });
            ++this.tablekey;
          }
        })
        .catch(() => (this.tableLoading = false));
    },
    //下载模板
    download() {
      downloadReq().then((res) => {
        let blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileName = "SN" + this.$t("template") + ".xlsx"; // 自定义文件名
        exportFile(blob, fileName);
      });
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
          enabled: -1,
          sn: this.req.queryName.trim(),
        },
      };
      getpagelistReq(obj)
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let data = res.result;
            this.data = data.data ? data.data : [];
            this.req.pageSize = data.pageSize;
            this.req.pageIndex = data.pageIndex;
            this.req.total = data.total;
            this.req.totalPage = data.totalPage;
          }
        })
        .catch(() => (this.tableLoading = false));
    },
    // 点击搜索按钮触发
    searchClick() {
      this.req.pageIndex = 1;
      this.pageLoad();
    },
    // SN检查导入成功触发
    uploadSuccess() {
      this.$Message.success(`${this.$t("snImport")}${this.$t("success")}`);
    },
    // 右侧弹窗打开
    examineSn(title) {
      this.drawerFlag = true;
      this.autoFocus = 1;
      this.isAdd = true;
      this.drawerTitle = this.$t(title);
      if (title == "examine-sn") {
        this.$nextTick(() => {
          inputSelectContent(this.$refs.sn);
        });
      }
    },
    // SN检查
    okClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            sn: this.req.sn.trim(),
          };
          getsnReq(obj).then((res) => {
            if (res.code === 200) {
              if (res.result === null) {
                speak({ text: this.$t("isEmpty") });
                let errorText = this.$t("examine-sn") + ":" + this.req.sn + this.$t("isEmpty");
                this.$Message.error(errorText);
              } else {
                speak({ text: res.result.sortNumber });
                this.$Message.success(`${this.$t("examine-sn")}${this.$t("success")}`);
              }
            }
            inputSelectContent(this.$refs.sn);
            this.errData.unshift({
              ...obj,
              isSuccess: res.result === null ? false : true,
              text:
                res.result === null
                  ? this.$t("isEmpty")
                  : this.$t("sortNumber") +
                    "：" +
                    res.result.sortNumber +
                    "，" +
                    this.$t("checkContent") +
                    "：" +
                    res.result.checkContent +
                    "，" +
                    this.$t("remark") +
                    "：" +
                    res.result.remark,
            });
          });
        }
      });
    },
    // SN导出
    exportClick() {
      const obj = {
        sn: this.req.queryName.trim(),
        enabled: -1,
      };
      exportReq(obj).then((res) => {
        let blob = new Blob([res], { type: "application/vnd.ms-excel" });
        const fileName = `${this.$t("snexamine")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
      this.autoFocus = 0;
      this.errData = [];
      if (this.$refs.req) {
        this.$refs.req.resetFields(); //清除表单红色提示
      }
      this.req.sn = "";
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
