<template>
  <div class="page-style">
    <!-- 变更记录页面弹窗 -->
    <Modal
      class-name="page-style-modal"
      v-model="modalFlag"
      width="1000"
      :styles="{ top: '20px' }"
      :title="modalTitle"
      :mask-closable="false"
      :scrollable="true"
      @on-cancel="modalCancel"
    >
      <div class="modal_record">
        <div>{{ $t("onlyStateChangesAreRecorded") }}</div>
        <div>
          <Button
            class="button-right-style"
            type="primary"
            custom-icon="icon-download"
            @click="changeRecordExport()"
            >{{ $t("export") }}</Button
          >
        </div>
      </div>
      <table-custom :tableHeight="300" :columns="columnsDetails" :data="dataDetails"></table-custom>
      <page-custom
        :total="req.modalTotal"
        :totalPage="req.modalTotalPage"
        :pageIndex="req.modalPageNum"
        :page-size="req.modalPageSize"
        @on-change="pageChangeModal"
        @on-page-size-change="pageSizeChangeModal"
      />
      <div slot="footer">
        <Button type="primary" @click="modalCancel">{{ $t("cancel") }}</Button>
      </div>
    </Modal>
    <!-- 左侧抽屉 -->
    <Drawer
      v-model="drawerFlag"
      :title="drawerTitle"
      width="650"
      :mask-closable="false"
      @on-close="cancelClick"
    >
      <Form
        ref="req"
        :model="submitData"
        :rules="ruleValidate"
        :label-width="100"
        :label-colon="true"
        @submit.native.prevent
      >
        <FormItem :label="$t('returnLine')" prop="lineName">
          <Select
            v-model="submitData.lineName"
            :clearable="true"
            filterable
            @on-open-change="getNamelistData"
            @on-select="autoFocus = 1"
            :placeholder="$t('pleaseSelect') + $t('returnLine')"
          >
            <Option v-for="(item, index) in namelist" :value="item.lineName" :key="index"
              >{{ item.lineName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('recuser')" prop="recuser">
          <Input
            v-model="submitData.recuser"
            v-focus="autoFocus === 1"
            @on-focus="autoFocus = 0"
            @on-keydown.enter="autoFocus = 2"
            :placeholder="$t('pleaseEnter') + $t('jobNumberOrName')"
          />
        </FormItem>
        <FormItem :label="$t('warehouse')" prop="warehouse">
          <Select
            v-model="submitData.warehouse"
            clearable
            filterable
            filter-by-label
            @on-open-change="getDatabaseCategoryData"
            @on-select="autoFocus = 2"
            :placeholder="$t('pleaseSelect') + $t('warehouse')"
          >
            <Option
              v-for="(item, index) in WareHouseData"
              :value="item.detailCode"
              :label="item.detailName"
              :key="index"
              >{{ item.detailName }}
            </Option>
          </Select>
        </FormItem>
        <FormItem :label="$t('fidFidl')" prop="feeder">
          <Input
            ref="feeder"
            v-model="submitData.feeder"
            v-focus="autoFocus === 2"
            @on-focus="autoFocus = 0"
            @on-keydown.enter="okClick"
            :placeholder="$t('pleaseEnter') + $t('fidFidl')"
          />
        </FormItem>
        <List border v-show="errData.length > 0">
          <ListItem v-for="(item, i) in errData" :key="i">
            <Tag :color="item.isSuccess ? 'success' : 'error'">
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
          <Row type="flex" justify="space-between">
            <i-col>
              <Form inline class="card-style-form" @submit.native.prevent>
                <FormItem>
                  <Select class="query_more_select" v-model="req.floor" @on-change="searchClick()">
                    <Option v-for="(item, index) in databaseData" :value="item.name" :key="index"
                      >{{ item.name }}
                    </Option>
                  </Select>
                </FormItem>
                <FormItem>
                  <Input
                    search
                    enter-button
                    v-model="req.queryName"
                    @on-search="searchClick"
                    :placeholder="$t('pleaseEnter') + $t('fidFidl')"
                  />
                </FormItem>
              </Form>
            </i-col>
            <i-col>
              <button-custom
                :btnData="btnData"
                @on-putInStorage-click="putInStorageClick"
                @on-changeRecord-click="changeRecordClick"
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
  getsinglefeederlogReq,
  exportsinglefeederlogReq,
  getnamelistReq,
  setfeederinReq,
} from "@/api/material-manager/feeder-in";
import { getdatabaselistReq } from "@/api/public";
import {
  formatDate,
  getButtonBoolean,
  errorType,
  exportFile,
  formatOperationType,
  playSound,
  inputSelectContent,
} from "@/libs/tools";
import { getlistReq } from "@/api/system-manager/data-item";
import ButtonCustom from "@/components/button-custom";
import TableCustom from "@/components/table-custom";
import PageCustom from "@/components/page-custom";

export default {
  name: "feeder-in",
  components: { ButtonCustom, TableCustom, PageCustom },
  data() {
    return {
      split: 0.15,
      autoFocus: 0,
      modalFlag: false,
      modalTitle: this.$t("changeRecord"),
      drawerFlag: false,
      drawerTitle: this.$t("add"),
      tableHeight: 200,
      tableLoading: true, // table加载动画
      columns: [
        {
          type: "index",
          width: 50,
          align: "center",
          fixed: "left",
          indexMethod: (row) => {
            return (this.req.pageIndex - 1) * this.req.pageSize + row._index + 1;
          },
        },
        {
          title: this.$t("fidFidl"),
          key: "fidFidl",
          sortable: "custom",
          width: 130,
          fixed: "left",
        },
        {
          title: this.$t("status"),
          key: "fidStt",
          width: 70,
          render: (h) => {
            return h("div", "在库房");
          },
        },
        { title: "CPKX", key: "fidSlt", width: 50 },
        {
          title: "CPKY",
          key: "fidSslt",
          width: 50,
        },
        { title: "Feeder" + this.$t("type"), key: "fidNam", width: 110 },
        { title: this.$t("fidCnt"), key: "fidCnt", width: 130 },
        { title: this.$t("fidNpc"), key: "fidNpc", width: 100 },
        { title: this.$t("fidPer"), key: "fidPer", width: 100 },
        { title: this.$t("fidErr"), key: "fidErr", width: 100 },
        { title: this.$t("fidBnpc"), key: "fidBnpc", width: 100 },
        { title: this.$t("fidBper"), key: "fidBper", width: 120 },
        { title: this.$t("fidBerr"), key: "fidBerr", width: 120 },
        { title: this.$t("fidBusr"), key: "fidBusr", width: 100 },
        { title: this.$t("fidFmc"), key: "fidFmc", width: 100 },
        // {
        //   title: "上次维护日期",
        //   key: "createDate",
        //   width: 125,
        //   render: (h, params) => {
        //     return h(
        //       "div",
        //       params.row.createDate
        //         ? formatDate(params.row.createDate, "yyyy-MM-dd hh:mm:ss")
        //         : null
        //     );
        //   },
        // },
      ], // 表格数据
      data: [], // 表格数据
      columnsDetails: [
        { type: "index", width: 50, align: "center", fixed: "left" },
        { title: "Feeder", key: "feederId", width: 130, fixed: "left" },
        {
          title: this.$t("operationType"),
          key: "operationType",
          width: 100,
          render: (h, params) => {
            return h("div", formatOperationType(params.row.operationType));
          },
        },
        {
          title: this.$t("operationDate"),
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
        { title: this.$t("createUserName"), key: "createUserName", width: 70 },
        { title: this.$t("lineName"), key: "lineName", width: 100 },
        { title: this.$t("recUser"), key: "recUser", width: 100 },
        { title: this.$t("lineWarehouse"), key: "wareHouseLine", width: 100 },
        { title: this.$t("reason"), key: "reason" },
      ], // 变更记录表格数据
      dataDetails: [], // 变更记录表格数据
      selectObj: null, // 表格选中数据
      req: {
        thisUserId: this.$store.state.id,
        systemFlag: this.$store.state.systemFlag,
        floor: "",
        queryName: "",
        workOrder: "", // 工单
        modalTotal: 0,
        modalTotalPage: 0,
        modalPageSize: 20,
        modalPageNum: 1,
        ...this.$config.pageConfig,
      },
      submitData: {
        feeder: "",
        recuser: "",
        lineName: "",
        warehouse: "",
      },
      // 验证实体
      ruleValidate: {
        feeder: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("fidFidl"),
            trigger: "change",
          },
        ],
        recuser: [
          {
            required: true,
            message: this.$t("pleaseEnter") + this.$t("jobNumberOrName"),
            trigger: "change",
          },
        ],
        lineName: [
          {
            required: true,
            message: this.$t("pleaseSelect") + this.$t("returnLine"),
            trigger: "change",
          },
        ],
        warehouse: [
          {
            required: true,
            message: this.$t("pleaseSelect") + this.$t("warehouse"),
            trigger: "change",
          },
        ],
      },
      btnData: [],
      namelist: [], // 数据字典源数据
      databaseData: [], //数据库字典
      WareHouseData: [], //库房数据字典
      errData: [], // 报错数据
    };
  },
  mounted() {
    this.req.orderField = "fidFidl";
    this.getDataBaseData();
    getButtonBoolean(this, this.btnData);
    this.autoSize();
    window.onresize = () => this.autoSize();
  },
  methods: {
    getDatabaseCategoryData() {
      const obj = {
        itemCode: "WareHouse",
        enabled: 1,
      };
      getlistReq(obj).then((res) => {
        if (res.code === 200) {
          this.WareHouseData = res.result || [];
        }
      });
    },

    // 新增菜单、按钮
    okClick1() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            floor: this.req.floor,
            feeder: this.submitData.feeder.trim(),
            recuser: this.submitData.recuser.trim(),
            lineName: this.submitData.lineName,
            warehouse: Number(this.submitData.warehouse),
            enabled: 1,
          };
          setfeederinReq(obj).then((res) => {
            if (res.code === 200) {
              this.$Message.success(`${this.$t("putInStorage")}${this.$t("success")}`);
              this.pageLoad();
              if (this.isSuccess) {
                this.cancelClick();
              }
            } else
              this.$Message.error(
                `${this.$t("putInStorage")}${this.$t("fail")},${errorType(this, res.errorCode)}`
              );
          });
        }
      });
    },
    // 出库菜单、按钮
    okClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          let obj = {
            floor: this.req.floor,
            feeder: this.submitData.feeder.trim(),
            recuser: this.submitData.recuser.trim(),
            lineName: this.submitData.lineName,
            warehouse: Number(this.submitData.warehouse),
            enabled: 1,
          };
          setfeederinReq(obj).then((res) => {
            if (res.code === 200) {
              playSound(this.$config.tipsVoice.OkTips);
              let errText = `${this.$t("putInStorage")}${this.$t("success")}`;
              this.$Message.success(errText);
              this.errData.unshift({
                isSuccess: true,
                text: errText,
              });
            } else {
              playSound(this.$config.tipsVoice.NgTips);
              let errText = `${this.$t("putInStorage")}${this.$t("fail")},${errorType(
                this,
                res.errorCode
              )}`;
              this.$Message.error(errText);
              this.errData.unshift({
                isSuccess: false,
                text: errText,
              });
            }
            inputSelectContent(this.$refs.feeder);
          });
        }
      });
    },
    // 获取数据库数据
    getDataBaseData() {
      let obj = {
        enabled: 1,
        userId: this.req.thisUserId,
        systemFlag: this.req.systemFlag,
        sortCode: 0,
        remark: "",
      };
      getdatabaselistReq(obj).then((data) => {
        this.databaseData = data;
        this.req.floor = this.databaseData[0].name;
        this.pageLoad();
      });
    },
    // 获取线别Name 数据源
    getNamelistData(e) {
      if (e) {
        getnamelistReq({ floor: this.req.floor }).then((res) => {
          if (res.code === 200) {
            this.namelist = res.result || [];
          }
        });
      }
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
          feeder: this.req.queryName.trim(),
          fidStt: "1001",
          floor: this.req.floor,
          feederName: "",
          lineWarehouseName: "",
          warehouse: "",
        },
      };
      getpagelistReq(obj)
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 200) {
            let data = res.result;
            this.data = data.data.notUsedFeederResponses || data.data.usedFeederResponses || [];
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
    // 点击导入工单按钮触发
    putInStorageClick() {
      this.drawerFlag = true;
      this.autoFocus = 2;
      this.drawerTitle = this.$t("putInStorage");
    },
    //获取变更记录
    changeRecordClick() {
      if (this.selectObj) {
        let obj = {
          orderField: "createDate" || this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            feederId: this.selectObj.fidFidl,
          },
        };
        getsinglefeederlogReq(obj).then((res) => {
          if (res.code === 200) {
            this.modalFlag = true;
            let data = res.result;
            this.dataDetails = data.data || [];
            this.req.modalPageSize = data.pageSize;
            this.req.modalPageNum = data.pageIndex;
            this.req.modalTotal = data.total;
            this.req.modalTotalPage = data.totalPage;
          }
        });
        this.drawerTitle = this.$t("changeRecord");
      } else this.$Message.warning(this.$t("oneData"));
    },

    // 导出变更记录
    changeRecordExport() {
      const obj = {
        feederId: this.selectObj.fidFidl,
      };
      exportsinglefeederlogReq(obj).then((res) => {
        let blob = new Blob([res], { type: "application/vnd.ms-excel" });
        const fileName = `Feeder${this.$t("changeRecord")}${formatDate(
          new Date(),
          "yyyy-MM-dd hh:mm:ss"
        )}.xlsx`; // 自定义文件名
        exportFile(blob, fileName);
      });
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
      this.isSuccess = false;
      this.autoFocus = 0;
      this.$refs.req.resetFields(); //清除表单红色提示
      this.errData = [];
    },
    // 清楚变更记录数据
    modalCancel() {
      this.modalFlag = false;
      this.dataDetails = [];
    },
    // 自动改变表格高度
    autoSize() {
      let height = document.body.clientHeight - 120;
      this.tableHeight = height - 60;
    },
    // 排序时有效，当点击排序时触发
    sortChange(data) {
      this.req.orderField = data.key.toUpperCase();
      this.req.ascending = data.order === "asc";
      this.pageLoad();
    },
    // 某一行高亮时触发
    currentClick(currentRow) {
      this.selectObj = currentRow;
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
    // 选择第几页
    pageChangeModal(index) {
      this.req.modalPageNum = index;
      this.getAllApiAuthorizeData();
    },
    // 选择一页有条数据
    pageSizeChangeModal(index) {
      this.req.modalPageNum = 1;
      this.req.modalPageSize = index;
      this.getAllApiAuthorizeData();
    },
  },
};
</script>
<style lang="less" scoped>
.modal_record {
  padding: 5px 20px;
  display: flex;
  justify-content: space-between;
}
</style>
