import Vue from 'vue'
import App from './App'
import config from './example-props'

Vue.config.productionTip = false

/**
 * This is only used in development.
*/
export default new Vue({
  render: h => h(App, {
    props: {
      dappName: config.dappName,
      requiredNetwork: config.requiredNetwork,
      rpcUrl: config.rpcUrl,
      providers: config.providers,
    }
  }),
}).$mount('#app')
