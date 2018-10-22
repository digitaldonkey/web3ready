import store from '../store'

export default class Ledger {
  /**
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @return {*}
   */
  static async createProvider(Web3, accountChange, networkChange) {
    const lib = await import(/* webpackChunkName: "ledger" */ '../async/ledger')
    return new Ledger(Web3, accountChange, networkChange, lib)
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
    // @todo We might test if rpcUrl is available and match network.
    return document.location.protocol === 'https:'
  }


  destroy() {
    console.log('DeSTROY PROVIDER')
  }

  /* ****************** NON API METHODS ******************
   *
   * Web3 provider API
   *
   * A web3 provider consists of a Vue signerDialog Component
   * and a web3ProviderApi Class.
   *
   * The Web3 provider API provides a Web3 instance which takes care of any
   * special provider dependent problems. This includes non standard solutions
   * and the WebUI required to interact with the providers.
   *
   * On the DAPP dev side of things you can use
   *
   *  web3Ready(web3, account = null) ???
   *
   *
  */

  /**
   * Prefer Factory class
   * Ledger.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param lib
   *    Async loaded lib.
   */
  constructor(Web3, accountChange, networkChange, lib) {
    this.cnf = {
      ...{
        dappName: 'Unknown Dapp Name',
        rpcUrl: 'http://localhost:7545',
        networkId: '1',
        timeout: 60 * 1000, // [ms]
        accountsLength: 8,
      },
      ...store.getters.ledgerConfig
    }
    this.accountChange = accountChange
    this.networkChange = networkChange


    // Web3 ProviderEngine
    const engine = new lib.ProviderEngine()
    // TransportU2F factory
    this.TransportU2F = lib.TransportU2F

    // Init Ledger web3Provider
    engine.addProvider(lib.createLedgerSubprovider(() => this.getTransport(), {
      networkId: this.cnf.networkId,
      path: "44'/60'/0'/0", // ledger default derivation path
      askConfirm: false,
      accountsLength: this.cnf.accountsLength, // DEFAULT 1
      accountsOffset: 0,
    }))

    engine.addProvider(new lib.RpcSubprovider({ rpcUrl: this.cnf.rpcUrl }))
    engine.start()

    this.web3 = new Web3(engine)
    this.getNetwork()
  }

  set defaultAccount(val) {
    if (!this.web3.utils.isAddress(val)) {
      throw new Error('Not a valid Ethereum address @ Ledger->SET defaultAccount')
    }
    this.accountChange(val)
  }
  get defaultAccount() {
    return this.defaultAccount ? this.defaultAccount : null
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
  }

  /**
   *
   * @return {Promise<TransportU2F instance>}
   */
  async getTransport() {
    const ledgerConnection = await this.TransportU2F.create()
    ledgerConnection.setExchangeTimeout(this.cnf.timeout)
    return ledgerConnection
  }
}
