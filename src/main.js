import Vue from 'vue'
import Web3 from 'web3'
import VTooltip from 'v-tooltip'

import App from './App.vue'
import store from './store'
import i18n from './i18n'
// import tooltip from './tooltip'
import web3ApiProviderApi from './web3ProviderApi'

Vue.use(VTooltip)

Object.defineProperty(Vue.prototype, 'web3ProviderApi', {
  value: web3ApiProviderApi,
})

Object.defineProperty(Vue.prototype, 'Web3', {
  value: Web3,
})

Vue.config.productionTip = false

new Vue({
  store,
  i18n,
  VTooltip,
  render: h => h(App),
}).$mount('#app')
