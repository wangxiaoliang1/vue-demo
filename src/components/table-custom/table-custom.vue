<template>
  <Table border :ref="refName"
         :height="tableHeight" :loading="tableLoading" :draggable="draggable"
         :columns="columns" :data="data" :highlight-row="highlightRow"
         @on-current-change="currentClick"
         @on-row-click="rowClick"
         @on-cell-click="cellClick"
         @on-sort-change="sortChange"
         @on-selection-change="selectChange"
         @on-select="singleSelect"
         @on-select-cancel="singleSelectCancel"
         @on-select-all="allSelect"
         @on-select-all-cancel="allSelectCancel"
         @on-expand="expandChange"
  ></Table>
</template>

<script>
  export default {
    name: "table-custom",
    props: {
      // 表格高度
      refName: {
        type: String,
        default: () => ''
      },
      // 表格高度
      tableHeight: Number,
      // 表格是否处于加载状态
      tableLoading: Boolean,
      // 表格是否处于加载状态
      draggable: Boolean,
      // 表格头部数据
      columns: {
        type: Array,
        default: () => []
      },
      // 表格数据
      data: {
        type: Array,
        default: () => []
      },
      // 是否显示高亮
      highlightRow: {
        type: Boolean,
        default: () => true
      }
    },
    methods: {
      /**
       * 某一行高亮时触发
       * @param currentRow Object 当前行的数据
       * @param oldCurrentRow Object 上一次选择的数据
       */
      currentClick(currentRow, oldCurrentRow) {
        this.$emit('on-current-change', currentRow, oldCurrentRow)
      },
      /**
       * 单击某一行时触发
       * @param data 当前点击行的数据
       * @param index Number 当前点击行的索引
       */
      rowClick(data, index) {
        if (this.refName) this.$refs[this.refName].toggleSelect(index)
        this.$emit('on-row-click', data, index)
      },
      /**
       * 单击某单元格时触发
       * @param row 当前点击行的数据
       * @param column 当前点击列的属性
       */
      cellClick(row, column) {
        this.$emit('on-cell-click', row, column)
      },
      /**
       * 排序时有效，当点击排序时触发
       * @param data Object 排序时的参数
       */
      sortChange(data) {
        this.$emit('on-sort-change', data)
      },
      /**
       * 在多选模式下 选项发生了变化后触发
       * @param selection Array 当前行的数据
       */
      selectChange(selection) {
        this.$emit('on-select-change', selection)
      },
      /**
       * 在多选模式下有效，选中某一项时触发
       * @param data Array 返回所有已选中的数据
       */
      singleSelect(data) {
        this.$emit('on-select', data)
      },
      /**
       * 在多选模式下有效，取消选中某一项时触发
       * @param data Array 删除选中的数据，返回当前选中的所有数据
       */
      singleSelectCancel(data) {
        this.$emit('on-select-cancel', data)
      },
      /**
       * 在多选模式下有效，点击全选时触发
       * @param data Array 返回全部数据
       */
      allSelect(data) {
        this.$emit('on-select-all', data)
      },
      /**
       * 在多选模式下有效，点击取消全选时触发
       * @param data Array 返回空数组
       */
      allSelectCancel(data) {
        this.$emit('on-select-all-cancel', data)
      },
      expandChange(row,status) {
        this.$emit('on-expand', row,status)
      },


    }
  }
</script>
