import Vue from 'vue'
import VTooltip from 'v-tooltip'

import App from './App'
import store from './store'
import i18n from './conf/i18n'
// import tooltip from './tooltip'
import web3ApiProviderApi from './conf/web3ProviderApi'

Vue.use(VTooltip)

Object.defineProperty(Vue.prototype, 'web3ProviderApi', {
  value: web3ApiProviderApi,
})

Vue.config.productionTip = false

new Vue({
  store,
  i18n,
  VTooltip,
  render: h => h(App),
}).$mount('#app')
