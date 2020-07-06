export default {
  defaultNode: {
    // type: 'circle',
    size: [100],
    style: {
      fill: '#19be6b',
      fillOpacity: 0.5,
      stroke: '#19be6b',
      radius: 6,
      cursor: 'pointer',
    },
    labelCfg: {
      style: {
        fill: '#fff'
      }
    },
    linkPoints: {
      top: false,
      right: false,
      bottom: false,
      left: false,
      size: 10,
      lineWidth: 1,
      fill: '#fff',
      stroke: '#19be6b',
    },
    anchorPoints: [[0, 0.5], [0.5, 0], [1, 0.5], [0.5, 1]],
  },
  defaultEdge: {
    type: 'line',
    style: {
      lineWidth: 2,
      endArrow: true,
      cursor: 'pointer',
    },
    labelCfg: {
      autoRotate: true,
    },
  },
  // 节点应用状态后的样式，默认仅提供 active 和 selected 用户可以自己扩展
  nodeStateStyles: {
    hover: {
      fillOpacity: 0.3,
    },
    click: {
      lineWidth: 2
    }
  },
  edgeStateStyles: {
    hover: {
      lineWidth: 3,
    },
    click: {
      lineWidth: 3
    }
  },
  modes: {
    default: ["drag-canvas", "zoom-canvas", 'drag-node', "hover-node", "hover-edge",
      {
        type: 'tooltip',
        formatText(model) {
          // 提示框文本内容
          const text = `id: ${model.id}<br /> label: ${model.label}`
          return text;
        },
      },
      {
        type: 'edge-tooltip',
        formatText(model) {
          // 提示框文本内容
          const text = `source: ${model.source}<br /> target: ${model.target}`
          return text;
        },
      },
    ],
    addEdge: ["hover-node", "hover-edge", "click-select",]
  }
}