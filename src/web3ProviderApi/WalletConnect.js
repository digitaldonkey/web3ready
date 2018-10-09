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
    const WalletConnectProvider = await import(/* webpackChunkName: "walletConnect" */ '../async/walletConnect')
    return new WalletConnect(
      Web3,
      accountChange,
      networkChange,
      WalletConnectProvider.default
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

  /**
   * getNetwork()
   *
   * @return {Promise<string>}
   */
  async getNetwork() {
    console.log(this.networkId, 'this.networkId')
    if (!this.networkId) {
      console.log(this.networkId, 'this.networkId')
      this.networkId = await this.web3.eth.net.getId()
      console.log(this.networkId, 'this.networkId')
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

    console.log('getDefaultAccount() IS NOT IMPLEMENTED')
    return null
  }


  async requestAccount() {
    // eslint-disable-next-line
    console.log('requestAccount()', this.web3.currentProvider.walletconnect)
    console.log(this.web3.currentProvider.walletconnect.accounts, 'this.web3.currentProvider.walletconnect.accounts')
    console.log(this.web3.eth.getAccounts, 'this.web3.eth.getAccounts')

    try {
      let accounts = null
      console.log(accounts, 'accounts 1')
      accounts = await this.web3.eth.getAccounts()
      console.log(accounts, 'accounts 2')

      if (!accounts || !accounts.length) {
        console.log(this.web3.currentProvider, 'this.web3.currentProvider')
        const uri = this.web3.currentProvider.walletconnect.uri
        console.log(uri, 'uri')

        // Listen for session status
        await this.web3.currentProvider.walletconnect.listenSessionStatus()

        // Get Accounts Again
        accounts = await this.web3.eth.getAccounts()
      }
    }
    catch (error) {
      // eslint-disable-next-line
      console.log(error, 'ERROR@requestAccount')
    }


  }

  /**
   * Prefer Factory class
   * WalletConnect.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param WalletConnectProvider
   */
  constructor(Web3, accountChange, networkChange, WalletConnectProvider) {
    this.web3 = new Web3(new WalletConnectProvider(store.getters.walletConnectConfig))
    this.account = null
    this.networkId = null
    this.accountChange = accountChange
    // Metamask requires only initial Network set.
    // Browser reloads at Metamask Network change.
    this.networkChange = networkChange

    // Refresh every POLL_INTERVAL [ms].
    this.POLL_INTERVAL = 800

    // Account change handler.
    // this.watchAccountChange()
    // this.getNetwork()
    this.requestAccount()
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
    // await Metamask.waitFor(this.POLL_INTERVAL)
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
