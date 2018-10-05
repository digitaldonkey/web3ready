export default class Metamask {
  /**
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @return {*}
   */
  static createProvider(Web3, accountChange, networkChange) {
    if (Metamask.isAvailable()) {
      return new Metamask(Web3, accountChange, networkChange)
    }
    return null
  }

  /**
   * Prefer Factory class
   * Metamask.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   */
  constructor(Web3, accountChange, networkChange) {
    this.web3 = this.constructor.createWeb3Instance(Web3)
    this.account = null
    this.networkId = null
    this.accountChange = accountChange
    // Metamask requires only initial Network set.
    // Browser reloads at Metamask Network change.
    this.networkChange = networkChange

    // Refresh every POLL_INTERVAL [ms].
    this.POLL_INTERVAL = 800

    // Account change handler.
    this.watchAccountChange()
    this.getNetwork()
  }

  static isAvailable() {
    return window.ethereum || (window.web3 !== 'undefined' && window.web3.currentProvider)
  }
  static createWeb3Instance(Web3) {
    // window.ethereum is the new default.
    // window.web3.currentProvider is a legacy fallback.
    if (window.ethereum) {
      return new Web3(window.ethereum)
    }
    return new Web3(window.web3.currentProvider)
  }
  async getNetwork() {
    if (!this.networkId) {
      this.networkId = await this.web3.eth.net.getId()
      this.networkChange(this.networkId)
    }
    return this.networkId
  }
  async getDefaultAccount() {
    let accounts = null

    try {
      if (window.ethereum) {
        // eslint-disable-next-line
        accounts = await ethereum.enable()
      }
      else {
        accounts = await this.web3.eth.getAccounts()
      }
    }
    catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }

    if (accounts && accounts.length > 0) {
      return accounts[0].toLowerCase()
    }
    return null
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
    await Metamask.waitFor(this.POLL_INTERVAL)
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
