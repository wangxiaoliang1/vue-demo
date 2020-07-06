<template>
  <div class="page-style">
    <!-- 页面图表 -->
    <div class="comment">
      <Card :bordered="false" dis-hover class="card-style split-right-card">
        <div slot="title">
          <Row type="flex" flex-direction="row-reverse">
            <RadioGroup
              class="charts-mr-8"
              v-model="req.radioValue"
              type="button"
              style="margin-right:10px"
              @on-change="echartsRadioChange"
            >
              <Radio label="realTime">实时</Radio>
              <Radio label="month">时间选择</Radio>
            </RadioGroup>
            <div v-if="req.radioValue === 'realTime'">
              {{ $t("dataAcquisitionTime(s)") }}
              <InputNumber
                :max="60"
                :min="1"
                v-model="req.minute"
                @on-change="inputNumberChange"
              ></InputNumber>
            </div>
            <DatePicker
              v-else
              v-model="req.dateTime"
              type="datetimerange"
              format="yyyy/MM/dd HH:mm:ss"
              style="width: 300px"
              :placeholder="$t('pleaseSelect') + $t('timeHorizon')"
              @on-change="datePickerChange"
            ></DatePicker>
          </Row>
        </div>
        <lineThb index="1" ref="charts" :data="chartsData" />
      </Card>
    </div>
  </div>
</template>

<script>
import { getGasMongoReq } from "@/api/report-manager/steel-manager";
import lineThb from "@/components/echarts/line-thb";
import { formatDate } from "@/libs/tools";
import dayjs from "dayjs";
import _ from "lodash";
export default {
  name: "steel-charts",
  components: { lineThb },
  data() {
    return {
      timeOut: null,
      interval: null, //定时器
      req: {
        minute: 15,
        radioValue: "realTime",
        dateTime: [],
      },
      chartsData: {
        xData: [],
        series: [],
        seriesName: "",
      },
    };
  },

  mounted() {
    this.settingTime();
    this.pageLoad();
    window.onresize = () => {
      this.$refs.charts.lineChart.resize();
    };
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    //日期事件选择 change 事件
    datePickerChange(e) {
      if (!e[0]) {
        this.req.dateTime = [];
      } else {
        this.pageLoad();
      }
    },
    //查询状态 change
    echartsRadioChange(e) {
      if (e === "month") {
        clearInterval(this.interval);
        this.req.dateTime = [
          dayjs()
            .subtract(1, "months")
            .format("YYYY-MM-DD HH:mm:ss"),
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ];
      } else {
        this.settingTime();
      }
      this.pageLoad();
    },
    // 搜索防抖
    inputNumberChange() {
      if (this.timeOut) {
        clearTimeout(this.timeOut);
      }
      this.timeOut = setTimeout(() => {
        this.pageLoad();
      }, 1000);
    },

    // 定时一分钟刷新数据
    settingTime() {
      this.interval = setInterval(() => {
        this.pageLoad();
      }, 15000);
    },
    // 获取列表数据
    pageLoad() {
      let obj = {};
      if (this.req.radioValue === "realTime") {
        obj = {
          category: "An",
          desc: false,
          orderField : "FromDate",
          fromStartDate: dayjs().subtract(this.req.minute, "second"), //在当前基础上减少minute秒
          fromEndDate: new Date(),
        };
      } else {
        obj = {
          category: "An",
          by: "M",
          desc: false,
          orderField : "FromDate",
          fromStartDate: new Date(this.req.dateTime[0]),
          fromEndDate: new Date(this.req.dateTime[1]),
        };
      }

      getGasMongoReq(obj)
        .then((res) => {
          if (res.code === 200) {
            let data = res.result || [];
            let newData = _.groupBy(data, "fromName");
            let index = 0;
            if (data.length > 0) {
              for (let item in newData) {
                if (index === 0) {
                  this.chartsData.xData = newData[item].map((o) =>
                    formatDate(o.fromDate, "yyyy-MM-dd hh:mm:ss")
                  );
                }
                let seriesItem = {
                  name: item,
                  data: newData[item].map((o) => o.dataDecimal),
                };
                this.chartsData.series[index] = seriesItem;
                index = index + 1;
              }
            }else{
              this.chartsData.xData=[]
              this.chartsData.series=[]
            }

            this.$refs.charts.initChart();
          }
        })
        .catch((err) => {
          this.$Message.error(`${err.status} ${err.statusText}`);
        });
    },
  },
};
</script>
