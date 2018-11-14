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

  destroy() {
    this.shouldWatch = false
    this.web3.currentProvider.walletconnect.stopLastListener()
    this.web3.currentProvider.walletconnect.engine.stop()
  }

  /* ****************** NON API METHODS ****************** */

  /**
   * getNetwork()
   *
   * @return {Promise<string>}
   */
  async getNetwork() {
    if (!this.networkId) {
      this.networkId = await this.web3.eth.net.getId()
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
    this.qrImage = libraries.qrImage

    const walletConnectProvider = new libraries.WalletConnectProvider(store.getters.walletConnectConfig)

    this.web3 = new Web3(walletConnectProvider)
    this.accountChange = accountChange
    this.networkChange = networkChange

    // Display QR Code URI
    this._uri = null
    this._account = null
    this.networkId = null

    this.POLL_INTERVAL = 1000
    this.shouldWatch = true
    this.watchAccountChange()
    this.getNetwork()
  }

  get account() {
    return this._account
  }

  set account(val) {
    this._account = val
    this.accountChange(val)
  }

  get uri() {
    if (!this._uri) {
      return this.getUri()
    }
    return this._uri
  }

  get image() {
    return this.getImage()
  }

  async getUri() {
    return this.web3.currentProvider.walletconnect.uri
  }

  async getImage() {
    this._uri = await this.getUri()
    const buffer = this.qrImage.imageSync(this.uri, { type: 'svg' })
    return `data:image/svg+xml;charset=UTF-8,${buffer}`
  }

  /**
   * checkAccount.
   *
   * This function polls for account changes.
   *
   * @see https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
   *
   * @returns {Promise<void>}
   */
  async watchAccountChange() {
    if (this.web3.currentProvider.walletconnect.accounts.length) {
      [this.account] = this.web3.currentProvider.walletconnect.accounts
    }
    else if (this.shouldWatch) {
      await WalletConnect.waitFor(this.POLL_INTERVAL)
      this.watchAccountChange()
    }
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
