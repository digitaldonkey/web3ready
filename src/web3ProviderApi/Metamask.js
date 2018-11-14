export default class Metamask {
  /**
   * createProvider()
   *
   * Required function to initialize provider and web3.
   *
   * @param Web3
   * @param accountChange
   *   Commit account change to App.
   * @param networkChange
   *  Commit network change to App.
   * @param resetProvider Function
   *   Resets the App state to default.
   * @return {*}
   */
  static async createProvider(Web3, accountChange, networkChange, resetProvider) {
    if (Metamask.isAvailable()) {
      return new Metamask(Web3, accountChange, networkChange, resetProvider, false)
    }
    return null
  }

  /**
   * createAutovalidateProvider()
   *
   * Optionally provide a auto-initializing provider.
   * If the provider supports it provider can try to do "reconnect".
   * In case reconnect fails you must call resetProvider(). This limits states to
   * "connected" and "no provider selected".
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @return {*}
   */
  static async createAutovalidateProvider(Web3, accountChange, networkChange, resetProvider) {
    if (Metamask.isAvailable()) {
      return new Metamask(Web3, accountChange, networkChange, resetProvider, true)
    }
    return null
  }

  /**
   * isAvailable()
   *
   *  Testing if the provider is available in the current environment.
   *  The result is used to disable buttons.
   *
   * @return {boolean}
   */
  static isAvailable() {
    return window.ethereum || (typeof window.web3 !== 'undefined' && window.web3.currentProvider)
  }

  /**
   * Optionally destroy watchers, if you need.
   */
  destroy() {
    this.shouldWatch = false
  }

  /* ****************** NON API METHODS ****************** */

  /**
   * Prefer Factory class
   * Metamask.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param resetProvider
   *
   */
  constructor(Web3, accountChange, networkChange, resetProvider, shouldAutovalidate) {
    this.web3 = this.constructor.createWeb3Instance(Web3)
    this.account = null
    this.networkId = null
    this.accountChange = accountChange
    // Metamask requires only initial Network set.
    // Browser reloads at Metamask Network change.
    this.networkChange = networkChange
    // Reset the provider if validation fails or lock status change.
    this.resetProvider = resetProvider

    // Refresh every POLL_INTERVAL [ms].
    this.POLL_INTERVAL = 800
    this.shouldWatch = true

    // Ask unlock only if user requested it.
    // If auto validation fails we will silently unset the provider.
    if (shouldAutovalidate) {
      this.tryAutoConnect()
    }
    else {
      this.getDefaultAccount()
    }
    this.getNetwork()
  }

  /**
   * getNetwork()
   *
   * @return {Promise<String>}
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
   * Ask user to unlock account.
   *
   * @return {Promise<String>}
   */
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
      this.account = accounts[0]
      this.accountChange(this.account)
      this.watchAccountChange()
    }
  }

  /**
   * tryAutoConnect()
   *
   * Get account if unlocked.
   * If locked we'll unset provider, so that the user will never get unlock
   * requests from MM without previous "Connect to Ethereum" click.
   *
   * @return {Promise<void>}
   */
  async tryAutoConnect() {
    const account = await this.getAccount()
    if (account) {
      this.accountChange(account)
      this.watchAccountChange()
    }
    else {
      this.resetProvider()
    }
  }

  /**
   * getAccount()
   *
   * Get account, Don't request unlock.
   *
   * @return {Promise<String|null>}
   *   If account available return account.
   */
  async getAccount() {
    const accounts = await this.web3.eth.getAccounts()
    if (accounts.length > 0) {
      return accounts[0]
    }
    return null
  }

  /**
   * createWeb3Instance()
   *
   * @param Web3
   * @return {*}
   */
  static createWeb3Instance(Web3) {
    // window.ethereum is the new default.
    // window.web3.currentProvider is a legacy fallback.
    if (window.ethereum) {
      return new Web3(window.ethereum)
    }
    if (window.web3 && window.web3.currentProvider) {
      return new Web3(window.web3.currentProvider)
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
    const account = await this.getAccount()
    // Changed account
    if (this.account !== account) {
      this.account = account
      this.accountChange(this.account)
      // Changed to null/account is locked.
      if (!account) {
        this.resetProvider()
      }
    }
    await Metamask.waitFor(this.POLL_INTERVAL)
    if (this.shouldWatch) {
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
