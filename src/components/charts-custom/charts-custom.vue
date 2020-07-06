<template>
  <canvas id="myChart" :width="width" :height="height"></canvas>
</template>

<script>
import Chart from "chart.js";
export default {
  name: "charts-custom",
  props: {
    width: Number,
    height: Number,
    chartType: String,
    xData: Array,
    yData: Array,
    options: Object,
  },
  mounted() {
    this.initEcharts();
  },
  watch: {
    xData() {
       this.initEcharts();
    },
  },

  methods: {
    initEcharts() {
      let ctx = document.getElementById("myChart").getContext("2d");
      new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: this.xData,
          datasets: this.yData,
        },
        options: this.options,
      });
    },
  },
};
</script>

<style scoped></style>
