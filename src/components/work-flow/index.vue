<template>
  <div id="app11"></div>
</template>

<script>
  import $ from "./jquery.min.js";
  import './utility.js'
  import './mousewheel/mousewheel.js'
  import './scroll/scroll.js'
  import './workflow/workflow-ui.js'
  import './scroll/scroll.css'
  import './workflow/workflow-ui.css'

  export default {
    props: {
      // 初始化数据对象
      initData: {
        type: Object,
        default: () => {
          return {
            nodes: [],
            lines: []
          }
        }
      },
      // 选择数据 {name: '', value: ''}name展示用 value返回用
      list: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        updateText: '',
        updateId: '',
      };
    },
    mounted() {
      this.init(this.initData);
    },
    methods: {
      init(jsonpData) {
        let _that = this
        $(function () {
          // 设计页面初始化
          $("#app11").workflow({
            openNode: function (node) {
              let $node = $('#' + node.newid)
              _that.updateText = node.name
              _that.updateId = node.id || ''
              _that.$Modal.confirm({
                width: '600px',
                render: (h) => {
                  return h('div', {
                    style: {
                      display: 'flex',
                      justifyContent: 'flex-star',
                      width: '100%',
                    }
                  }, [
                    h('div', {
                      style: {
                        width: '60%',
                        height: '350px',
                        overflowY: 'auto',
                      }
                    }, [
                      h('Tree', {
                        props: {
                          data: _that.list,
                        },
                        on: {
                          'on-select-change': (val) => {
                            _that.updateText = val[0].title
                            _that.updateId = val[0].id
                          }
                        }
                      })
                    ]),
                    h('div', {
                      style: {
                        width: '40%',
                        height: '100%',
                      }
                    }, [
                      h('Checkbox', {
                        props: {
                          value: node.flowMain,
                        },
                        on: {
                          'on-change': (val) => {
                            node.flowMain = val
                          }
                        }
                      }, '是否为主流程'),
                      h('Checkbox', {
                        props: {
                          value: node.necessary,
                        },
                        on: {
                          'on-change': (val) => {
                            node.necessary = val
                          }
                        }
                      }, '是否为必要站'),
                    ])
                  ])
                },
                onOk: () => {
                  //更新节点名称
                  node.name = _that.updateText
                  if (!node.flowMain) node.necessary = node.flowMain
                  let color = ''
                  if (node.flowMain && node.necessary) {
                    color ='#ed4014'
                  } else if (node.flowMain && !node.necessary) {
                    color ='#19be6b'
                  } else {
                    color ='#990099'
                  }

                  $node.css({backgroundColor: color, color: '#fff'})
                  $node[0].dfop.node.forEach(o => {
                    if (o.newid === node.newid) o.id = _that.updateId
                  })
                  $("#app11").workflowSet("updateNodeName", {nodeId: node.newid,});
                }
              })

              //获取整个流程图信息
              // var shcemeData = $("#app11").workflowGet();
              // console.log(shcemeData);
            },
            // openLine: function(line) {
            //   console.log(line);
            // },
          });

          //初始化流程图
          $("#app11").workflowSet("set", {data: jsonpData});
        });
      },
      getFlowData() {
        return $('#app11').workflowGet()
      }
    },
  };
</script>


<style></style>
