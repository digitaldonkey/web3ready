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
  }
}
