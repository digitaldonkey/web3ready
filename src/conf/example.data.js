export default {
  requiredNetwork: '1',
  dappName: 'INSERT_A_UNIQUE_DAPP_NAME',
  rpcUrl: 'https://mainnet.infura.io/drupal',
  walletConnect: {
    bridgeUrl: 'https://bridge.walletconnect.org',
    // bridgeUrl: 'https://test-bridge.walletconnect.org',
  },
  availableSigners: [
    { id: 'metamask' },
    { id: 'walletConnect' },
    { id: 'ledger' },
  ],
}
