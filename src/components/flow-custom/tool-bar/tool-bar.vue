<template>
  <div class="tool-bar">
    <div class="icon-node">
      <i v-for="(item, i) in list" :key="i" :class="item.iconClass" draggable
         @dragstart="handleDragstart" @dragend="handleDragEnd($event, item)" :title="item.label"/>
    </div>
    <div class="icon-node">
      <i class="iconfont icon-mouse-pointer" :class="{isActive: isClick}" title="默认" @click="setMode('default')"/>
      <i class="iconfont icon-line-arrow" :class="{isActive: !isClick}" title="连线" @click="setMode('addEdge')"/>
    </div>
    <div class="icon-node">
      <i class="iconfont icon-delete" title="删除" @click="deleteNode"/>
<!--      <i class="iconfont icon-save" title="保存" @click="saveNode"/>-->
    </div>
  </div>
</template>

<script>
  export default {
    name: "tool-bar",
    data() {
      return {
        isClick: true,
        list: [
          {
            label: "开始",
            type: "rect",
            nodeType: "startNode",
            iconClass: 'iconfont icon-kaishi',
          },
          {
            label: "结束",
            type: "rect",
            nodeType: "endNode",
            iconClass: 'iconfont icon-jieshu1',
          },
          {
            label: "普通节点",
            type: "rect",
            nodeType: "flowNode",
            iconClass: 'iconfont icon-box',
          },
          // {
          //   label: "条件节点",
          //   type: "diamond",
          //   nodeType: "flowNode",
          //   iconClass: 'iconfont icon-rhombus',
          // },
        ]
      }
    },
    mounted() {
    },
    methods: {
      handleDragstart(e) {
        this.$emit('handleDragstart', e)
      },
      handleDragEnd(e, item) {
        this.$emit('handleDragEnd', e, item)
      },
      //删除节点
      deleteNode() {
        this.$emit('on-delete')
      },
      //保存节点
      saveNode() {
        this.$emit('on-save')
      },
      //设置模式
      setMode(val) {
        this.isClick = val === 'default'
        this.$emit('setMode', val)
      },
    }
  }
</script>

<style scoped lang="less">
  @color: #19be6b;
  .border {
    border: 1px solid @color;
  }
  .tool-bar {
    background-color: #fff;

    .icon-node {
      display: inline-block;
      padding: 5px;
      border-right: 1px solid #999;

      &:last-child {
        border-right: none;
      }

      & > i {
        font-size: 20px;
        vertical-align: middle;
        padding: 2px;
        margin: 0 3px;
        border: 1px solid #f7f7f7;
        border-radius: 5px;

        &:hover {
          color: @color;
          cursor: pointer;
        }
      }

      .isActive {
        .border;
        color: @color;
      }
    }
  }
</style>