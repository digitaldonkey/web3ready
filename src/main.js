import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

/**
 * This is only used in development.
*/
export default new Vue({
  render: h => h(App),
}).$mount('#app')
