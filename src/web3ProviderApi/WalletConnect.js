import store from '../store'

export default class WalletConnect {
  /**
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @return {*}
   */
  static async createProvider(Web3, accountChange, networkChange) {
    const libraries = await import(/* webpackChunkName: "walletConnect" */ '../async/walletConnect')
    return new WalletConnect(
      Web3,
      accountChange,
      networkChange,
      libraries
    )
  }

  /**
   * isAvailable()
   *
   * @return {boolean}
   */
  static isAvailable() {
    return true
  }

  static destroy() {
    // TODO Don't know ho to stop.
  }

  /* ****************** NON API METHODS ****************** */

  /**
   * getNetwork()
   *
   * @return {Promise<string>}
   */
  async getNetwork() {
    if (!this.networkId) {
      this.networkId = this.walletConnector.chainId
      this.networkChange(this.networkId)
    }
    return this.networkId
  }

  /**
   * getDefaultAccount()
   *
   * @return {Promise<String>}
   */
  async getDefaultAccount() {
    return this.account
  }

  /**
   * Prefer Factory class
   * WalletConnect.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param libraries
   */
  constructor(Web3, accountChange, networkChange, libraries) {
    this.accountChange = accountChange
    this.networkChange = networkChange
    this._uri = null
    this._account = null
    this._networkId = null


    this.qrImage = libraries.qrImage

    const config = Object.assign({}, store.getters.walletConnectConfig, { qrcode: false })

    this.walletConnectProvider = new libraries.WalletConnectProvider(config)
    this.web3 = new Web3(this.walletConnectProvider)

    // TODO The getConnector Method doesn't seem to work. Revalidate.
    // eslint-disable-next-line
    this.walletConnector = this.walletConnectProvider._walletConnector

    this.walletConnector.on('connect', (error, payload) => {
      // Single OnConnect. Not Reconnect.
      if (error) {
        throw error
      }
      // Get provided accounts and chainId
      // console.log("walletConnector.on('connect')", payload.params[0])
      [this.account] = payload.params[0].accounts
      this.networkId = payload.params[0].chainId
    })

    this.walletConnector.on('session_update', (error, payload) => {
      if (error) {
        throw error
      }
      // get updated accounts and chainId
      // console.log("walletConnector.on('session_update')", payload.params[0])
      [this.account] = payload.params[0].accounts
      this.networkId = payload.params[0].chainId
    })
  }

  get networkId() {
    if (!this._networkId) {
      this.networkId = this.walletConnector.chainId
    }
    return this._networkId
  }

  set networkId(val) {
    this._networkId = val
    this.networkChange(val)
  }

  get account() {
    if (!this._account) {
      [this.account] = this.walletConnector.accounts
    }
    return this._account
  }

  set account(val) {
    this._account = val
    this.accountChange(val)
  }

  get uri() {
    if (!this._uri) {
      this._uri = this.walletConnector.uri
    }
    return this._uri
  }

  get image() {
    const buffer = this.qrImage.imageSync(this.uri, { type: 'svg' })
    return `data:image/svg+xml;charset=UTF-8,${buffer}`
  }

  /**
   *
   * @param ms
   * @returns {*}
   */
  static waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
