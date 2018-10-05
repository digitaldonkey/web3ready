// Web3 init interface.
import MetamaskLogic from './web3ProviderApi/Metamask'
import WalletConnectLogic from './web3ProviderApi/WalletConnect'

export default {
  // Key must match signer.id
  metamask: MetamaskLogic,
  walletConnect: WalletConnectLogic,
}


// Interface with Metamask examples {
//
//   /**
//    * Test if the provider is currently available in the used browser.
//    * Returning false will disable the Button to select this provider.
//    * @return {boolean}
//    */
//   static isAvailable() {
//     return (window.web3 !== 'undefined' && window.web3.currentProvider.isMetamask)
//   }
//
//   /**
//    *
//    * @param Web3
//    *   Web3 factory.
//    * @return {object}
//    *   Instantiated web3. This allows to override standard web3 methods with
//    *   provider specific ones.
//    */
//   static createWeb3Instance(Web3) {
//     return new Web3(window.web3.currentProvider)
//   }
//
//   /**
//    * Return current network ID.
//    *
//    * @param web3
//    *   Web3 Instance from this::createWeb3Instance()
//    * @return {Promise<String>}
//    *   The current network ID or '*' if the provider doesn't care.
//    */
//   static async getNetwork(web3) {
//     return web3.eth.net.getId()
//   }
//
//   /**
//    * Get Ethereum Address
//    *
//    * @param web3
//    *   Web3 Instance from this::createWeb3Instance()
//    * @return {Promise<string> | null}
//    *   0x prefixed 40 letters hex address.
//    *   Must return null if not available.
//    */
//   static async getDefaultAccount(web3) {
//     const accounts = await web3.eth.getAccounts()
//     if (accounts.length > 0) {
//       return accounts[0].toLowerCase()
//     }
//     return null
//   }
// }
