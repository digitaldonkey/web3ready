const fs = require('fs')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  baseUrl: '.',
  productionSourceMap: false,
  css: {
    modules: true,

  },
  /**
   * If the value is an Object, it will be merged into the final config using webpack-merge.
   * If the value is a function, it will receive the resolved config as the argument.
   *   The function can either mutate the config and return nothing,
   *   OR return a cloned or merged version of the config.
   */
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        {
          from: './public/web3Ready-example.html',
          to: 'web3Ready-example.html',
        }
      ]),
    ],
  },
  chainWebpack: (config) => {
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
