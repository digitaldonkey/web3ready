import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from '../translations/default'

Vue.use(VueI18n)

export default new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})
