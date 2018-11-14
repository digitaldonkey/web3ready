const fs = require('fs')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// module.exports = {
//   // other options...
//   module: {
//     rules: [
//       // ... other rules omitted
//       {
//         test: /\.css$/,
//         use: [
//           process.env.NODE_ENV !== 'production'
//             ? 'vue-style-loader'
//             : MiniCssExtractPlugin.loader,
//           'css-loader'
//         ]
//       }
//     ]
//   },
//   plugins: [
//     // ... Vue Loader plugin omitted
//     new MiniCssExtractPlugin({
//       filename: 'style.css'
//     })
//   ]
// }

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
  // configureWebpack: {
  //   plugins: [
  //     new MiniCssExtractPlugin({
  //       filename: 'style.css'
  //     })
  //   ],
  // },
  chainWebpack: (config) => {
    // console.log(config)

    // config.externals({
    //   web3: {
    //     commonjs: 'web3',
    //     commonjs2: 'web3',
    //     root: 'Web3'
    //   }
    // })

    // const vueLoader = config.module.rule('vue-loader').use('vue-loader')
    // console.log(vueLoader)
    // // vueLoader.set('shadowMode', true)

    // config.module
    //   .rule('vue')
    //   .use('vue-loader')
    //   .loader('vue-loader')
    //   .tap((options) => {
    //     return { ...options, ...{ shadowMode: true } }
    //   })

    // const test = config.plugin('demo-html')
    //   .use('html-webpack-plugin')
    //   .set('template', path.resolve(__dirname, './public/demo-wc.html'))
    //


    // .use('html-webpack-plugin')
    // .set('template', './public/demo-wc.html')


    // const scssRule = config.module.rule('scss')
    // // console.log(scssRule.defaultRules)
    // scssRule.uses.clear()
    // scssRule.test(/\.scss$/)
    //   .rule({
    //     oneOf: [
    //       // this matches `<style module>`
    //       {
    //         resourceQuery: /module/,
    //         use: [
    //           'vue-style-loader',
    //           {
    //             loader: 'sass-loader',
    //             options: {
    //               modules: true,
    //               localIdentName: '[local]_[hash:base64:5]'
    //             }
    //           }
    //         ]
    //       },
    //       // this matches plain `<style>` or `<style scoped>`
    //       {
    //         use: [
    //           'vue-style-loader',
    //           'sass-loader'
    //         ]
    //       }
    //     ]
    //   })
    //   .loader('sass-loader')
    //   .end()

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
