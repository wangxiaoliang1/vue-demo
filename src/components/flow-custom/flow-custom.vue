<template>
  <div class="flow-custom">
    <!--  导航条  -->
    <div class="flow-custom-bar">
      <tool-bar @on-delete="onDelete" @handleDragEnd="handleDragEnd" @setMode="setMode"/>
    </div>
    <div class="flow-custom-content">
      <!--  流程画布  -->
      <div id="graph-container" ref="container" class="flow-custom-content-main"></div>
      <!--  右侧详情  -->
      <div class="flow-custom-content-panel">
        <div class="panel">{{infoTitle}}</div>
        <div class="panel" v-if="status === 'canvas'">
          <Checkbox v-model="showGrid" @on-change="changeGridState">显示网格</Checkbox>
        </div>
        <div class="panel" v-else>
          <Form :label-width="50" :label-colon="true" @submit.native.prevent>
            <FormItem label="名称">
              <treeselect v-show="showName" v-model="model.labelId" :options="nameList" :showCount="true"
                          :disable-branch-nodes="true" @select="modelSelect"/>
              <Input v-show="!showName" v-model="model.label" :disabled="showName" @on-change="onSave"/>
            </FormItem>
            <FormItem label="类型" v-show="status === 'edge'">
              <Select v-model="model.type" @on-select="onSave">
                <Option v-for="(item, i) in edgeTypeList" :value="item.type" :key="i">{{ item.name }}</Option>
              </Select>
            </FormItem>
            <FormItem label="选项" v-show="status === 'node'">
              <checkbox v-model="model.flowMain" @on-change="flowMainChange">是否为主流程</checkbox>
              <checkbox v-model="model.necessary" :disabled="!model.flowMain" @on-change="onSave">是否为必要站点
              </checkbox>
            </FormItem>
          </Form>
        </div>
      </div>
      <div id="mini-map"></div>
    </div>
  </div>
</template>

<script>
  import G6 from '@antv/g6'
  import global from './libs/global'
  import {newGuid} from './libs/utils'
  import ToolBar from './tool-bar'
  import Treeselect from '@riophae/vue-treeselect'

  export default {
    name: "flow-custom",
    components: {ToolBar, Treeselect},
    props: {
      // 流程配置
      options: {
        type: Object,
        default: () => {
          return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          }
        }
      },
      // 流程数据
      list: {
        type: Object,
        default: () => {
        }
      },
      // 流程节点名称数据
      nameList: {
        type: Array,
        default: () => []
      },
    },
    data() {
      return {
        graph: null,
        grid: null,
        miniMap: null,
        panelWidth: 250,
        showGrid: true,
        showName: false,
        selectElement: null,
        model: null,
        edge: null,
        addingEdge: false,
        mode: 'default',
        infoTitle: "画布",
        status: "canvas",
        initData: null,
        edgeTypeList: [
          {type: 'line', name: '直线'},
          {type: 'polyline', name: '折线'},
        ],
      }
    },
    mounted() {
      this.initData = this.list || {}
      this.init()
    },
    methods: {
      // 初始化流程
      init() {
        this.graph = new G6.Graph({
          container: "graph-container",
          width: this.options.width - this.panelWidth,
          height: this.options.height - 30,
          animate: true, // Boolean，切换布局时是否使用动画过度，默认为 false
          animateCfg: {
            duration: 500, // Number，一次动画的时长
            easing: 'linearEasing', // String，动画函数
          },
          ...global,
          // plugins: [this.grid, miniMap],
        })
        // 创建网格
        this.grid = new G6.Grid()
        // 创建小地图
        this.miniMap = new G6.Minimap({
          size: [this.panelWidth, 100],
          container: 'mini-map',
          className: 'mini-map',
          type: 'keyShape',
        });
        this.graph.addPlugin(this.grid)
        this.graph.addPlugin(this.miniMap)
        // 全局点击事件
        this.graph.on('click', e => {
          if (e.item) {
            const clickNodes = this.graph.findAllByState('node', 'click');
            clickNodes.forEach(cn => {
              this.graph.setItemState(cn, 'click', false);
            });
            const clickEdges = this.graph.findAllByState('edge', 'click');
            clickEdges.forEach(ce => {
              this.graph.setItemState(ce, 'click', false);
            });
            const {item, item: {_cfg}} = e;
            this.selectElement = item
            this.model = _cfg.model
            this.status = _cfg.type
            if (this.status === 'node') {
              this.showName = !(this.model.nodeType === 'startNode' || this.model.nodeType === 'endNode')
            } else this.showName = false
            this.graph.setItemState(item, 'click', true);
          } else {
            this.status = 'canvas'
          }
        })
        this.graph.on('mousemove', e => {
          if (this.mode === 'addEdge' && this.edge) {
            const point = {x: e.x, y: e.y}
            this.graph.updateItem(this.edge, {
              target: point
            });
          }
        })
        this.graph.on('mouseup', e => {
          if (this.mode === 'addEdge' && this.edge) {
            const {_cfg: {model, type}} = e.item
            const edgeModel = this.edge.getModel()
            if (type === 'node' && edgeModel.source !== model.id) {
              this.graph.updateItem(this.edge, {target: model.id})
            } else {
              this.graph.removeItem(this.edge)
            }
            this.edge = null
          }
        })

        //监听节点事件
        this.graph.on('node:mouseenter', e => {
          const item = e.item; // 获取鼠标进入的节点元素对象
          this.graph.setItemState(item, 'hover', true);
          let {_cfg: {model}} = item
          if (this.mode === 'addEdge') {
            model.linkPoints.top = true
            model.linkPoints.right = true
            model.linkPoints.bottom = true
            model.linkPoints.left = true
          }
          this.graph.updateItem(item, model)
        });
        this.graph.on('node:mouseleave', e => {
          const item = e.item;
          this.graph.setItemState(item, 'hover', false);
          let {_cfg: {model}} = item
          if (this.mode === 'addEdge') {
            model.linkPoints.top = false
            model.linkPoints.right = false
            model.linkPoints.bottom = false
            model.linkPoints.left = false
          }
          this.graph.updateItem(item, model)
        });
        this.graph.on('node:mousedown', e => {
          if (this.mode === 'addEdge') {
            const point = {x: e.x, y: e.y}
            const model = e.item.getModel()
            this.edge = this.graph.addItem('edge', {
              source: model.id,
              target: point,
            });
          }
        })

        //监听边事件
        this.graph.on('edge:mouseenter', e => {
          const item = e.item; // 获取鼠标进入的节点元素对象
          this.graph.setItemState(item, 'hover', true);
        });
        this.graph.on('edge:mouseleave', e => {
          const item = e.item;
          this.graph.setItemState(item, 'hover', false);
        });

        this.graph.read(this.initData)
      },
      // 添加节点，拖拽结束
      handleDragEnd(e, item) {
        const point = this.graph.getPointByClient(e.x, e.y)
        let model = {
          id: newGuid(),
          labelId: '',
          type: item.type,
          nodeType: item.nodeType,
          label: item.label,
          size: [100, 24],
          flowMain: true,
          necessary: true,
          x: point.x,
          y: point.y,
          style: {
            fill: '#ed4014',
            fillOpacity: 0.5,
            stroke: '#ed4014',
            radius: 6,
            cursor: 'pointer',
          },
        }
        let {nodes} = this.graph.save()
        if (item.nodeType !== 'flowNode') {
          let nodeItem = nodes.find(o => o.nodeType === item.nodeType)
          if (nodeItem) return this.$Message.error(item.nodeType === 'startNode' ? '只能由一个开始节点' : '只能由一个结束节点')
          else {
            model.labelId = item.nodeType === 'startNode' ? 'start' : 'end'
            model.size = [30, 24]
          }
        } else if (item.nodeType === 'diamond') model.size = [100, 50]
        this.graph.addItem('node', model)
      },
      // 设置模式
      setMode(val) {
        this.graph.setMode(val)
        this.mode = val
      },
      // 保存节点
      onSave() {
        if (this.selectElement && this.model) {
          if (this.status === 'node') {
            let color = ''
            if (this.model.flowMain && this.model.necessary) {
              color = '#ed4014'
            } else if (this.model.flowMain && !this.model.necessary) {
              color = '#19be6b'
            } else {
              color = '#990099'
            }
            this.model.style.fill = color
            this.model.style.stroke = color
          }
          this.graph.updateItem(this.selectElement, this.model)
        }
      },
      // 提交节点
      getFlowData() {
        const arr = this.graph.save()
        this.graph.destroy()
        return arr
      },
      //删除节点
      onDelete() {
        if (this.selectElement) {
          this.graph.removeItem(this.selectElement)
          this.selectElement = null
          this.status = 'canvas'
          this.model = null
          this.$Message.success('删除成功')
        } else this.$Message.warning('请选择要删除的节点')
      },
      // 是否展示网格
      changeGridState(val) {
        if (val) {
          this.grid = new G6.Grid() // 创建网格
          this.graph.addPlugin(this.grid)
        } else this.graph.removePlugin(this.grid)
      },
      // 是否为主流程复选框改变
      flowMainChange(val) {
        if (!val) this.model.necessary = val
        this.onSave()
      },
      // 下拉选项选中
      modelSelect(node) {
        this.model.label = node.label
        this.onSave()
      },
    }
  }
</script>

<style scoped lang="less">
  @panelWidth: 250px;
  .flow-custom {
    position: relative;
    z-index: 4000;
    width: 100%;
    height: 100%;
    line-height: 1;

    &-bar {
      height: 30px;
      border-bottom: 1px solid #cccccc;
    }

    &-content {
      position: relative;
      width: 100%;
      height: calc(100% - 30px);

      &-main {
        position: absolute;
        left: 0;
        top: 0;
        width: calc(100% - @panelWidth);
        height: 100%;
        overflow: auto;
      }

      &-panel {
        position: absolute;
        right: 0;
        top: 0;
        width: @panelWidth;
        height: calc(100% - 100px);
        background-color: #f7f9fb;
        border-left: 1px solid #e6e9ed;

        .panel {
          padding: 5px 10px;
          border-bottom: 1px solid #e6e9ed;
        }
      }

      #mini-map {
        position: absolute;
        right: 0;
        bottom: 0;
        width: @panelWidth;
        height: 100px;
      }

      &:after {
        content: '';
        display: block;
        clear: both;
      }
    }
  }
</style>