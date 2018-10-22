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
    console.log('I WANT TO STOP LISTENING NOW', this.walletconnect)
    // this.walletconnect.deleteLocalSession()
  }

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
    console.log(this.networkId, 'this.networkId @ web3ProviderApi/WalletConnect.js')
    return this.networkId
  }

  /**
   * getDefaultAccount()
   *
   * @return {Promise<String>}
   */
  async getDefaultAccount() {
    const sessionStatus = this.walletconnect.getSessionStatus()
    console.log(sessionStatus, 'this.walletconnect.getSessionStatus')
    if (this.walletconnect.accounts.length) {
      console.log('FOUND ACCOUNT NOW')
      return this.walletconnect.accounts[0]
    }
    console.log('NO ACCOUNT')
    return null
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

    this.account = null
    this.networkId = null

    this.walletconnect = this.web3.currentProvider.walletconnect
    this.accountChange = accountChange
    // Metamask requires only initial Network set.
    // Browser reloads at Metamask Network change.
    this.networkChange = networkChange

    // Display QR Code URI
    this.uri = null

    // Async init walletConnect session.
    this.requestAccount()

    this.POLL_INTERVAL = 800
    this.TIMEOUT = 5 * 60 * 1000 // 5 min.
  }

  getImage() {
    if (this.uri) {
      const buffer = this.qrImage.imageSync(this.uri, { type: 'svg' })
      return `data:image/svg+xml;charset=UTF-8,${buffer}`
    }
    return null
  }

  async requestAccount() {

    try {
      if (!this.account) {
        let accounts = await this.web3.eth.getAccounts()
        console.log('accounts 1', accounts)

        if (!accounts.length) {
          // Display QR Code URI
          this.uri = await this.walletconnect.uri

          console.log('accounts URI', this.uri)
          this.session = await this.walletconnect.listenSessionStatus(this.POLL_INTERVAL, this.TIMEOUT)
          console.log('this.session', this.session)

          accounts = await this.web3.eth.getAccounts()
          console.log('accounts 2', accounts)
        }
        console.log(this.account, 'accounts 2 (after init session')
      }
    }
    catch (error) {
      // eslint-disable-next-line
      console.log(error, 'ERROR @ web3ProviderApi/WalletConnect.js')
    }
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
    const account = await this.getDefaultAccount()
    if (this.account !== account) {
      this.account = account
      this.accountChange(account)
    }
    await WalletConnect.waitFor(this.POLL_INTERVAL)
    this.watchAccountChange()
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
