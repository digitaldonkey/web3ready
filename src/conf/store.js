import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const Web3ReadyPlugin = (store) => {
  // signerId set
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'signerId') {
      // eslint-disable-next-line
      // console.log('signerId@plugin', state.signerId)
      if (state.signerId === null) {
        store.commit('web3', null)
      }
      else {
        store.dispatch('web3')
      }
    }
  })
  // web3 initialized
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'web3') {
      // eslint-disable-next-line
      // console.log('web3@plugin', typeof state.web3 === 'function' && typeof state.web3() === 'object')
      if (state.web3 === null) {
        store.commit('networkId', null)
        store.commit('account', null)
      }
    }
  })
  // networkId set
  store.subscribe(async (mutation, state) => {
    if (mutation.type === 'networkId') {
      // eslint-disable-next-line
      // console.log('networkId@plugin', state.networkId)
      if (state.networkId === null) {
        store.commit('account', null)
      }
    }
  })
}


const persist = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({ signerId: state.signerId }),
})

const store = new Vuex.Store({
  plugins: [Web3ReadyPlugin, persist.plugin],
  state: {
    requiredNetwork: '42',
    // Final values
    signerId: null,
    web3: null,
    networkId: null,
    account: null,
    availableSigners: [
      {
        id: 'metamask',
        text: 'Connect to the <a href="https://metamask.io/" target="_blank"> MetaMask browser wallet</a>.',
        buttonText: 'Connect to MetaMask',
        buttonColor: 'rgb(246, 133, 27)',
      },
      {
        id: 'walletConnect',
        text: 'Scan a QR code to link your mobile wallet <a href="https://walletconnect.org/" target="_blank">using WalletConnect</a>.',
        buttonText: 'Use WalletConnect',
        buttonColor: 'rgb(64, 153, 255)',
      },
    ],
  },
  getters: {
    // eslint-disable-next-line
    isValidated: (state) => {
      return state.networkId
          && state.web3
          && state.account
          && state.networkId.toString() === state.requiredNetwork
    },
    requiredNetwork(state) {
      return state.requiredNetwork.toString()
    },
  },
  actions: {
    // Actions are required to resolve promises.
    async web3({ state, commit }) {
      const Web3Module = await import(/* webpackChunkName: "web3" */ '../web3')
      const web3 = await Vue.prototype.web3ProviderApi[state.signerId].createProvider(
        Web3Module.default(), // Web3 Factory.
        (account) => {
          store.dispatch('account', account)
        },
        (networkId) => {
          store.dispatch('networkId', networkId)
        }
      )
      commit('web3', () => web3)
    },
    async networkId({ commit }, networkId) {
      // const netId = await Vue.prototype.web3ProviderApi[state.signerId].getNetwork(state.web3())
      if (networkId) {
        commit('networkId', networkId.toString())
      }
    },
    async account({ commit }, account) {
      // await Vue.prototype.web3ProviderApi[state.signerId].getDefaultAccount(state.web3())
      commit('account', account)
    },
  },
  mutations: {
    // Mutations MUST be synchronous.
    signerId(state, signerId) {
      state.signerId = signerId
    },
    web3(state, web3) {
      state.web3 = web3
    },
    networkId(state, networkId) {
      state.networkId = networkId
    },
    account(state, account) {
      state.account = account
    },
  },
  strict: process.env.NODE_ENV !== 'production',
})

export default store
