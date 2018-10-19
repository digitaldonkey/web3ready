// Web3 init interface.
import MetamaskLogic from '../web3ProviderApi/Metamask'
import WalletConnect from '../web3ProviderApi/WalletConnect'
import Ledger from '../web3ProviderApi/Ledger'

export default {
  // Key must match signer.id
  metamask: MetamaskLogic,
  walletConnect: WalletConnect,
  ledger: Ledger,
}
