<template>
  <div class="page-style oee-charts">
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
      <Row class="card_con" :style="{ height: tableHeight }">
        <i-col span="6" v-for="(item, index) in data" :key="index">
          <div class="card_item">
            <Card>
              <div slot="title" class="card_title">
                <p>{{ $t("equipmentName") }}: {{ item.equipmentName }}</p>
                <div>
                  <p>{{ $t("mfgLine") }}:{{ item.mfgLine }}</p>
                  <p>{{ $t("station") }}:{{ item.station }}</p>
                </div>
              </div>
              <OeePie
                style="height:150px"
                :data="item"
                :ref="'oeePie' + index"
                :index="String(index)"
              />
            </Card>
          </div>
        </i-col>
      </Row>
      <Row type="flex" justify="space-around" class-name="info-card">
        <i-col span="23">
          <page-custom
            :total="req.total"
            :totalPage="req.totalPage"
            :pageIndex="req.pageIndex"
            :page-size="req.pageSize"
            @on-change="pageChange"
            @on-page-size-change="pageSizeChange"
          />
        </i-col>
      </Row>
    </div>
  </div>
</template>

<script>
import { getoeeReq } from "@/api/report-manager/oee-dataInput";
import PageCustom from "@/components/page-custom";
import OeePie from "@/components/echarts/oee-pie";
import DrawerButton from "@/components/drawer-button";
import dayjs from "dayjs";
export default {
  name: "oee-pie",
  components: { DrawerButton, PageCustom, OeePie },
  data() {
    return {
      drawerFlag: false,
      drawerTitle: this.$t("setting"),
      tableHeight: "400px",
      tableLoading: false, // table加载动画
      data: [], // 表格数据
      columns: [],
      selectObj: null, // 表格选中数据
      defaultReq: {
        dateTime: [], //日期时间选择器
        ...this.$config.pageConfig,
      },
      req: {
        dateTime: [],
        ...this.$config.pageConfig,
      },
      // 验证实体
      ruleValidate: {
        dateTime: [
          {
            type: "array",
            required: true,
            message: this.$t("pleaseEnter") + this.$t("timeHorizon"),
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    this.settingClick();
    this.autoSize();
    window.onresize = () => {
      this.autoSize();
    };
  },
  methods: {
    //日期格式化
    dateTimeFormat(time) {
      return dayjs(time).format("YYYY/MM/DD HH:mm:ss");
    },

    //日期事件选择 change 事件
    datePickerChange(e) {
      if (!e[0]) {
        this.defaultReq.dateTime = [];
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
            type: 'ALL',
            value:'',
          },
        };

        getoeeReq(params).then((res) => {
          if (res.code === 200) {
            let data = res.result;
            this.data = data.data ? data.data : [];
            this.req.total = data.total;
            this.req.totalPage = data.totalPage;
            this.$nextTick(() => {
              for (let index = 0; index < this.data.length; index++) {
                this.$refs["oeePie" + index][0].initChart();
              }
            });
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
      this.tableHeight = document.body.clientHeight - 90 + "px";
      for (let index = 0; index < this.data.length; index++) {
        this.$refs["oeePie" + index][0].pieChart.resize();
      }
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
<style scoped lang="less">
.setting_con {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  padding: 20px 20px 10px 20px;
  font-size: 18px;
  span {
    margin-right: 10px;
    font-size: 16px;
  }
  .setting {
    cursor: pointer;
  }
}

.card_con {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  overflow-y: auto;
  .card_item {
    width: 95%;
    margin: 0 auto;
    margin-bottom: 20px;
  }
}
.card_title {
  display: flex;
  align-items: center;
  p {
    font-size: 13px;
  }
  div p {
    font-size: 12px;
  }
}
</style>
