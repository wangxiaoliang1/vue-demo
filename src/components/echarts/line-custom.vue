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
        type: "line",
        smooth: true,
        label: {
          normal: {
            show: true,
            position: "top",
          },
        },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: 0.4,
              itemStyle: {
                normal: { color: "blue" },
              },
            },
            {
              yAxis: 0.8,
              itemStyle: {
                normal: { color: "blue" },
              },
            },
          ],
        },
      };

      for (let index = 0; index < this.data.series.length; index++) {
        this.data.series[index]={...this.data.series[index],...option}
      }

      // 基于准备好的dom，初始化echarts实例
      this.lineChart = echarts.init(
        document.getElementById("lineChart" + this.index)
      );
      // 绘制图表
      this.lineChart.setOption({
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: this.data.series.map((o) => o.name),
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.data.xData,
        },
        yAxis: {
          type: "value",
          // scale: true,
          max: 1,
          min: 0,
        },
        series: this.data.series,
      });
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
