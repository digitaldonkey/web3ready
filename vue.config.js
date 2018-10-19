const fs = require('fs')

module.exports = {
  chainWebpack: config => {
    // Change default SVG loader.
    const svgRule = config.module.rule('svg')
    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear()
    // add replacement loader(s)
    svgRule
      .test(/\.(svg)(\?.*)?$/)
      .use('svg-url-loader')
      .loader('svg-url-loader')
      .end()
  },
  devServer: {
    open: process.platform === 'darwin',
    host: 'localhost', // You may set 0.0.0.0, but it will brake ssl setup.
    port: 8080,
    hotOnly: false,
    https: {
      key: fs.readFileSync('./ssl/server.key'),
      cert: fs.readFileSync('./ssl/server.crt'),
      ca: fs.readFileSync('./ssl/rootCA.pem'),
    },
  },
}
