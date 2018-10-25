import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import 'custom-event-polyfill'

import config from './conf/example.data'

Vue.use(Vuex)

const Web3ReadyPlugin = (store) => {
  // signerId set
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'signerId') {
      // eslint-disable-next-line
      console.log('signerId@plugin', state.signerId)
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
      // eslint-disable-next-line
      console.log('web3@plugin', typeof state.provider === 'function' && state.provider().web3)
      if (state.provider === null) {
        store.commit('networkId', null)
        store.commit('account', null)
      }
    }
  })
  // networkId set
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'networkId') {
      // eslint-disable-next-line
      console.log('networkId@plugin', state.networkId)
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
    requiredNetwork: config.requiredNetwork,
    availableSigners: config.availableSigners,
    dappName: config.dappName,
    rpcUrl: config.rpcUrl,
    lastAccountData: null,
    walletConnect: {
      bridgeUrl: config.walletConnect.bridgeUrl
    },
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
      const isValidated = state.networkId
          && state.provider
          && state.account
          && state.networkId.toString() === state.requiredNetwork
      // eslint-disable-next-line
      console.log('isValidated @ isValidated()', isValidated)
      return isValidated
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
    // Actions are required to resolve promises.
    async provider({ state, commit }) {
      const Web3Module = await import(/* webpackChunkName: "web3" */ './async/web3')
      const provider = await Vue.prototype.web3ProviderApi[state.signerId].createProvider(
        Web3Module.default, // Web3 Factory.
        (account) => {
          this.dispatch('account', account)
        },
        (networkId) => {
          this.dispatch('networkId', networkId)
        }
      )
      commit('provider', () => provider)
    },
    async resetProvider({ commit }) {
      commit('signerId', null)
      commit('provider', null)
      commit('account', null)
    },
    async networkId({ commit }, networkId) {
      // const netId = await Vue.prototype.web3ProviderApi[state.signerId].getNetwork(state.web3())
      if (networkId) {
        commit('networkId', networkId.toString())
      }
      this.dispatch('callWeb3Ready')
    },
    async account({ commit }, account) {
      // await Vue.prototype.web3ProviderApi[state.signerId].getDefaultAccount(state.web3())
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
