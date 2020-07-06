const path = require('path')
const resolve = dir => path.join(__dirname, dir)

module.exports = {
  chainWebpack: config => {
    // 配置路径引用
    config.resolve.alias
        .set('@', resolve('src'))
  },
  // 设为false打包时不生成.map文件
  productionSourceMap: false,
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
}
