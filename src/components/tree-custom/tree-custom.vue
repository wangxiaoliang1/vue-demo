<template>
  <div class="treeContent">
    <Tree ref="treeEl" :data="treeData" :show-checkbox="showCheckbox" @on-select-change="treeSelectChange"
          @on-toggle-expand="treeExpand" @on-check-change="treeCheckChange"></Tree>
    <Spin fix v-if="treeLoading"></Spin>
  </div>
</template>
<script>
  export default {
    name: 'TreeCustom',
    props: {
      initData: {
        type: Array,
        default: () => []
      },
      showCheckbox: {
        type: Boolean,
        default: () => false
      },
      treeLoading: {
        type: Boolean,
        default: () => false
      }
    },
    data() {
      return {
        treeData: []
      }
    },
    mounted() {
      this.treeData = []
      this.initTreeData(this.treeData, this.initData)
    },
    watch: {
      initData(val) {
        this.treeData = []
        this.initTreeData(this.treeData, val)
      }
    },
    methods: {
      /**
       * 点击节点触发
       * @param data
       */
      treeSelectChange(data) {
        this.$emit('on-select-change', data)
      },
      /**
       * 数据展开时触发
       * @param data
       */
      treeExpand(data) {
        this.$emit('on-toggle-expand', data)
      },
      /**
       * 复选框改变时触发
       * @return 半选或全选的数据
       */
      treeCheckChange() {
        const getNodesData = this.$refs.treeEl.getCheckedAndIndeterminateNodes()
        this.$emit('on-check-change', getNodesData)
      },
      // 处理获取的树型结构
      initTreeData(list, data) {
        data.forEach(item => {
          let obj = {}
          for (let [key, value] of Object.entries(item)) {
            if (key !== 'children') obj[key] = value
          }
          let node = {
            ...obj,
            render: (h, {data}) => {
              return h('span', [
                h('Icon', {
                  props: {
                    custom: item.icon,
                    size: 12
                  },
                  style: {
                    marginRight: '8px',
                    verticalAlign: 0
                  }
                }),
                h('span', data.title)
              ])
            }
          }
          if (item.children && item.children.length > 0) {
            node['children'] = []
            this.initTreeData(node.children, item.children)
          }
          list.push(node)
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .treeContent {
    height: calc(100%);
    padding-left: 5px;
    overflow: auto;
    position: relative;
  }
</style>
