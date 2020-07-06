<template>
  <div :id="'lineChart' + index" class="lineChart"></div>
</template>
<script>
import echarts from "echarts";
export default {
  props: {
    index: {
      type: String, // String, Number, Object
      required: false,
      default: "0",
    },
    data: {},
  },
  data() {
    return {
      lineChart: {},
    };
  },
  methods: {
    initChart() {
      let option = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.data.series.map((o) => o.name),
        },
        xAxis: {
          data: this.data.xData.map((str) => {
            return str.replace(" ", "\n");
          }),
        },
        yAxis: {
          // min: 0,
          // max: 2,
        },
        dataZoom: [
          {
            startValue: "2014-06-01",
          },
          {
            type: "inside",
          },
        ],
        // visualMap: {
        //   show: false,
        //   // pieces: [
        //   //   {
        //   //     gt: 0.04,
        //   //     lte: 0.06,
        //   //     color: "#096",
        //   //   },
        //   // ],
        //   outOfRange: {
        //     color: "#cc0033",
        //   },
        // },
        series: [],
      };
      let seriesOption = {
        type: "line",
        // markLine: {
        //   silent: true,
        //   data: [
        //     {
        //       yAxis: 0.04,
        //       itemStyle: {
        //         normal: { color: "blue" },
        //       },
        //     },
        //     {
        //       yAxis: 0.06,
        //       itemStyle: {
        //         normal: { color: "blue" },
        //       },
        //     },
        //   ],
        // },
      };
      for (let index = 0; index < this.data.series.length; index++) {
        this.data.series[index] = { ...this.data.series[index], ...seriesOption };
      }
      option.series = this.data.series;
      // 基于准备好的dom，初始化echarts实例
      this.lineChart = echarts.init(document.getElementById("lineChart" + this.index));
      // 绘制图表
      this.lineChart.setOption(option);
    },
  },
  mounted() {
    this.initChart();
  },
};
</script>
<style lang="less" scoped>
.lineChart {
  width: 100%;
  height: 100%;
}
</style>
