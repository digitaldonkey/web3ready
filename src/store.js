import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import 'custom-event-polyfill'

import defaultProps from './conf/default.props'

Vue.use(Vuex)

const Web3ReadyPlugin = (store) => {
  // signerId set
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'signerId') {
      // console.log('signerId@plugin', state.signerId)
      if (state.signerId === null) {
        if (state.provider) {
          if (typeof store.getters.provider.destroy === 'function') {
            store.getters.provider.destroy()
          }
          store.commit('provider', null)
        }
      }
      else {
        store.dispatch('provider')
      }
    }
  })
  // web3 initialized
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'provider') {
      // console.log('web3@plugin', typeof state.provider === 'function' && state.provider().web3)
      if (state.provider === null) {
        store.commit('networkId', null)
        store.commit('account', null)
      }
    }
  })
  // networkId set
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'networkId') {
      // console.log('networkId@plugin', state.networkId)
      if (state.networkId === null) {
        store.commit('account', null)
      }
    }
  })
}


const persist = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({
    signerId: state.signerId,
    // Persisting only data for selected provider.
    lastAccountData: state.lastAccountData,
  })
})

const store = new Vuex.Store({
  plugins: [Web3ReadyPlugin, persist.plugin],
  state: {
    enabledProviders: null,
    dappName: null,
    rpcUrl: null,
    lastAccountData: null,
    walletConnect: null,
    // Final values
    signerId: null,
    provider: null,
    networkId: null,
    account: null,
  },
  getters: {
    provider(state) {
      if (typeof state.provider === 'function') {
        return state.provider()
      }
      return null
    },
    isValidated: (state) => {
      return state.networkId
          && state.provider
          && state.account
          && state.networkId.toString() === state.requiredNetwork
    },
    requiredNetwork(state) {
      return state.requiredNetwork.toString()
    },
    walletConnectConfig(state) {
      return {
        bridgeUrl: state.walletConnect.bridgeUrl,
        dappName: state.dappName,
        rpcUrl: state.rpcUrl
      }
    },
    ledgerConfig(state) {
      return {
        dappName: state.dappName,
        rpcUrl: state.rpcUrl,
        networkId: state.requiredNetwork,
      }
    }
  },
  actions: {
    // Initially setup store and verify required properties.
    async initStore({ commit }, propsData) {
      // Verify dappName
      if (propsData.dappName) {
        commit('dappName', propsData.dappName)
      }
      else {
        throw new Error('Property dappName missing.')
      }

      // Verify requiredNetwork
      if (propsData.requiredNetwork) {
        commit('requiredNetwork', propsData.requiredNetwork)
      }
      else {
        throw new Error('Property requiredNetwork is missing')
      }

      // Verify rpcUrl
      if (propsData.rpcUrl) {
        commit('rpcUrl', propsData.rpcUrl)
      }
      else {
        throw new Error('Property rpcUrl is missing')
      }

      // Verify optional enabled providers.
      if (propsData.enableProviders) {
        const providers = propsData.enableProviders.split(',')

        if (providers.length) {
          // eslint-disable-next-line
          commit('enabledProviders', providers.map((provider) => {
            return { id: provider }
          }))
        }
        else {
          throw new Error('No provider is enabled. Require at least one. Remove property to use defaults.')
        }
      }
      else {
        commit('enabledProviders', defaultProps.enabledProviders)
      }

      // Verify optional WalletConnect settings.
      if (typeof propsData.walletConnect === 'object' && propsData.walletConnect.bridgeUrl) {
        if (propsData.enableProviders.length) {
          commit('walletConnect', propsData.walletConnect)
        }
        else {
          // throw new Info('WalletConnect settings ore wrong. Using default.')
        }
      }
      else {
        commit('walletConnect', defaultProps.walletConnect)
      }
    },

    async provider({ state, commit }) {
      const Web3Module = await import(/* webpackChunkName: "web3" */ './async/web3')
      const provider = await Vue.prototype.web3ProviderApi[state.signerId].createProvider(
        Web3Module.default, // Web3 Factory.
        (account) => {
          this.dispatch('account', account)
        },
        (networkId) => {
          this.dispatch('networkId', networkId)
        },
        () => {
          this.dispatch('resetProvider')
        }
      )
      commit('provider', () => provider)
    },

    async providerAutoValidate({ state, commit }) {
      const Web3Module = await import(/* webpackChunkName: "web3" */ './async/web3')
      const provider = await Vue.prototype.web3ProviderApi[state.signerId].createAutovalidateProvider(
        Web3Module.default, // Web3 Factory.
        (account) => {
          this.dispatch('account', account)
        },
        (networkId) => {
          this.dispatch('networkIdRequired', networkId)
        },
        () => {
          this.dispatch('resetProvider')
        },
        true
      )
      if (provider) {
        commit('provider', () => provider)
      }
      else {
        commit('signerId', null)
      }
    },

    async resetProvider({ commit }) {
      commit('signerId', null)
      commit('provider', null)
      commit('account', null)
    },

    async networkId({ commit }, networkId) {
      if (networkId) {
        commit('networkId', networkId.toString())
      }
      this.dispatch('callWeb3Ready')
    },

    async networkIdRequired({ commit }, networkId) {
      if (networkId && networkId === this.getters.requiredNetwork) {
        commit('networkId', networkId)
        this.dispatch('callWeb3Ready')
      }
      else {
        this.dispatch('resetProvider')
      }
    },

    async account({ commit }, account) {
      commit('account', account)
      this.dispatch('callWeb3Ready')
    },

    callWeb3Ready({ getters }) {
      if (getters.isValidated) {
        const event = new CustomEvent('web3Ready', {
          detail: {
            web3: getters.provider.web3,
            account: this.state.account,
          }
        })
        window.dispatchEvent(event)
      }
    }
  },
  mutations: {
    // Mutations MUST be synchronous.
    requiredNetwork(state, requiredNetwork) {
      state.requiredNetwork = requiredNetwork
    },
    dappName(state, dappName) {
      state.dappName = dappName
    },
    rpcUrl(state, rpcUrl) {
      state.rpcUrl = rpcUrl
    },
    enabledProviders(state, enabledProviders) {
      state.enabledProviders = enabledProviders
    },
    walletConnect(state, walletConnect) {
      state.walletConnect = walletConnect
    },
    signerId(state, signerId) {
      state.signerId = signerId
    },
    provider(state, provider) {
      state.provider = provider
    },
    networkId(state, networkId) {
      state.networkId = networkId
    },
    account(state, account) {
      state.account = account
    },
    lastAccountData(state, lastAccountData) {
      state.lastAccountData = lastAccountData
    },
  },
  strict: process.env.NODE_ENV !== 'production',
})

export default store
