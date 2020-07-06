<template>
  <div class="page-style ">
    <!-- 左侧抽屉 -->
    <Drawer
      v-model="drawerFlag"
      :title="drawerTitle"
      width="520"
      :mask-closable="false"
      @on-close="cancelClick"
    >
      <Form
        ref="req"
        :model="defaultReq"
        :rules="ruleValidate"
        :label-width="80"
        :label-colon="true"
      >
        <FormItem :label="$t('timeHorizon')" prop="dateTime">
          <DatePicker
            v-model="defaultReq.dateTime"
            type="datetimerange"
            format="yyyy/MM/dd HH:mm:ss"
            :placeholder="$t('pleaseSelect') + $t('timeHorizon')"
            style="width: 100%"
            @on-change="datePickerChange"
          ></DatePicker>
        </FormItem>
        <FormItem :label="$t('type')">
          <RadioGroup v-model="defaultReq.type" @on-change="getLineOrStationList">
            <Radio label="ALL">ALL</Radio>
            <Radio label="Line">{{ $t("mfgLine") }}</Radio>
            <Radio label="Station">{{ $t("station") }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          :label="defaultReq.type === 'Line' ? $t('mfgLine') : $t('station')"
          v-if="defaultReq.type === 'Line' || defaultReq.type === 'Station'"
        >
          <Select
            v-model="defaultReq.value"
            multiple
            :max-tag-count="2"
            filterable
            :placeholder="
              defaultReq.type === 'Line'
                ? $t('pleaseSelect') + $t('mfgLine')
                : $t('pleaseSelect') + $t('station')
            "
          >
            <Option v-for="(item, index) in lineOrStationList" :value="item" :key="index"
              >{{ item }}
            </Option>
          </Select>
        </FormItem>
        <FormItem
          :label="$t('equipmentName')"
          prop="equipmentName"
          v-if="defaultReq.type === 'ALL'"
        >
          <Input
            v-model="defaultReq.equipmentName"
            :placeholder="$t('pleaseEnter') + $t('equipmentName')"
          />
        </FormItem>
        <!-- 按钮 -->
        <FormItem>
          <drawer-button
            @on-cancel="cancelClick"
            @on-ok="okOrUpdateClick"
            @on-update="okOrUpdateClick"
            @on-okOrUpdate="okOrUpdateClick"
          ></drawer-button>
        </FormItem>
      </Form>
    </Drawer>
    <!-- 页面表格 -->
    <div class="comment">
      <div class="setting_con">
        <div class="setting" @click="settingClick">
          Setting<Icon type="md-construct" color="red" />
        </div>
        <div v-if="req.dateTime.length == 2">
          <span> {{ $t("startTime") }}: {{ dateTimeFormat(req.dateTime[0]) }} </span>
          <span> {{ $t("endTime") }}:{{ dateTimeFormat(req.dateTime[1]) }} </span>
        </div>
      </div>

      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <Table
          border
          size="large"
          :height="tableHeight"
          :loading="tableLoading"
          :columns="columns"
          :data="data"
          highlight-row
          @on-current-change="currentClick"
          :row-class-name="tableRowClassName"
        ></Table>
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
import { getoeeReq, getQueryInforReq } from "@/api/report-manager/oee-dataInput";
import PageCustom from "@/components/page-custom";
import DrawerButton from "@/components/drawer-button";
import { getPercent } from "@/libs/utils";
import dayjs from "dayjs";
export default {
  name: "oee-dataInput",
  components: { DrawerButton, PageCustom },
  data() {
    return {
      interval: null, //定时器
      drawerFlag: false,
      drawerTitle: this.$t("setting"),
      tableHeight: 400,
      tableLoading: false, // table加载动画
      lineOrStationList: [], //线别/站别下拉数据
      data: [], // 表格数据
      columns: [],
      selectObj: null, // 表格选中数据
      defaultReq: {
        dateTime: [], //日期时间选择器
        type: "ALL", //类型
        value: [], //下拉多选值
        equipmentName:'',//设备名称
        ...this.$config.pageConfig,
      },
      req: {
        dateTime: [],
        type: "ALL", //类型
        value: [], //下拉多选值
        equipmentName:'',//设备名称
        ...this.$config.pageConfig,
      },
      // 验证实体
      ruleValidate: {
        dateTime: [
          {
            type: "array",
            required: true,
            message: this.$t("pleaseSelect") + this.$t("timeHorizon"),
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    this.settingClick();
    this.autoSize();
    this.setColumns();
    window.onresize = () => this.autoSize();
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    // 设置表格 columns
    setColumns() {
      this.columns = [
        {
          type: "index",
          width: 50,
          align: "center",
          indexMethod: (row) => {
            return row._index + 1;
          },
        },
        {
          title: "Production",
          key: "production",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.production, params.row.sectionTotalSecond));
          },
        },
        {
          title: "Idle",
          key: "idle",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.idle, params.row.sectionTotalSecond));
          },
        },
        {
          title: "Setup",
          key: "setup",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.setup, params.row.sectionTotalSecond));
          },
        },
        {
          title: "ChangeOver",
          key: "changeOver",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.changeOver, params.row.sectionTotalSecond));
          },
        },
        {
          title: "Repair",
          key: "repair",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.repair, params.row.sectionTotalSecond));
          },
        },
        {
          title: "Eng",
          key: "eng",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.eng, params.row.sectionTotalSecond));
          },
        },
        {
          title: "PM",
          key: "pm",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.pm, params.row.sectionTotalSecond));
          },
        },
        {
          title: "Install",
          key: "install",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.install, params.row.sectionTotalSecond));
          },
        },
        {
          title: "Other",
          key: "statusOther",
          align: "center",
          render: (h, params) => {
            return h("div", getPercent(params.row.statusOther, params.row.sectionTotalSecond));
          },
        },
      ];
      if (this.req.type === "ALL") {
        this.columns.splice(
          1,
          0,
          {
            title: this.$t("equipmentName"),
            key: "equipmentName",
            align: "center",
          },
          {
            title: this.$t("station"),
            key: "station",
            width: 90,
            resizable: true,
            align: "center",
          },
          {
            title: this.$t("mfgLine"),
            key: "mfgLine",
            width: 100,
            resizable: true,
            align: "center",
          }
        );
      } else if (this.req.type === "Line") {
        this.columns.splice(1, 0, {
          title: this.$t("mfgLine"),
          key: "mfgLine",
          width: 120,
          resizable: true,
          align: "center",
        });
      } else if (this.req.type === "Station") {
        this.columns.splice(1, 0, {
          title: this.$t("station"),
          key: "station",
          width: 170,
          resizable: true,
          align: "center",
        });
      }
    },
    // 格式化时间
    dateTimeFormat(time) {
      return dayjs(time).format("YYYY/MM/DD HH:mm:ss");
    },
    //日期事件选择 change 事件
    datePickerChange(e) {
      if (!e[0]) {
        this.defaultReq.dateTime = [];
      }
    },
    // 获取线别或站别下拉列表
    getLineOrStationList(type) {
      this.lineOrStationList = [];
      this.defaultReq.value = [];
      if (type != "ALL") {
        this.defaultReq.equipmentName=''
        getQueryInforReq({
          type: type,
        }).then((res) => {
          if (res.code === 200) {
            this.lineOrStationList = res.result || [];
          }
        });
      }
    },
    // 获取列表数据
    pageLoad() {
      if (this.req.dateTime.length == 2) {
        let params = {
          orderField: this.req.orderField, // 排序字段
          ascending: this.req.ascending, // 是否升序
          pageSize: this.req.pageSize, // 分页大小
          pageIndex: this.req.pageIndex, // 当前页码
          data: {
            starttime: this.dateTimeFormat(this.req.dateTime[0]),
            endtime: this.dateTimeFormat(this.req.dateTime[1]),
            type: this.req.type,
            value: this.req.value.join(",") || this.lineOrStationList.join(","),
            equipmentName:this.req.equipmentName.trim()
          },
        };
        this.data = [];
        this.req.total = 0;
        this.req.totalPage = 0;
        getoeeReq(params).then((res) => {
          if (res.code === 200) {
            let data = res.result;
            this.data = data.data ? data.data : [];
            this.req.total = data.total;
            this.req.totalPage = data.totalPage;
          }
        });
      }
    },

    // 点击设置按钮触发
    settingClick() {
      this.defaultReq = Object.assign({}, this.req);
      this.drawerFlag = true;
    },
    // 点击确定按钮触发
    async okOrUpdateClick() {
      this.$refs.req.validate((validate) => {
        if (validate) {
          this.req = { ...this.defaultReq, pageIndex: 1 };
          this.setColumns();
          this.pageLoad();
          this.cancelClick();
        }
      });
    },
    // 左侧抽屉取消
    cancelClick() {
      this.drawerFlag = false;
    },
    // 自动改变表格高度
    autoSize() {
      let height = document.body.clientHeight - 90;
      this.tableHeight = height;
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
    tableRowClassName(row) {
      if (row.limitNum < 0) {
        return "table_cell_bg_color_red";
      } else if (row.limitNum > 1 && row.limitNum < 30) {
        return "table_cell_bg_color_yellow";
      }
      return "";
    },
  },
};
</script>
<style scoped lang="less">
.setting_con {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  font-size: 18px;
  span {
    margin-right: 10px;
    font-size: 16px;
  }
}
.setting {
  cursor: pointer;
}
</style>
