<template>
  <div
    class="signer"
  >
    <img
      :src="logo"
      class="signer--logo"
    >
    <div class="signer--dialog">
      <!--<div>isValidNetwork: {{ isValidNetwork }}</div>-->
      <!--<div>isAccountUnLocked: {{ isAccountUnLocked }}</div>-->


      <NetworkIndicator
        :network_id="networkId"
        :required_network="requiredNetwork"
      />

      <AccountIndicator :account="account" />
    </div>
  </div>
</template>

<script>

// import MetamaskLogic from '../web3ProviderApi/Metamask'
import { mapState } from 'vuex'
import NetworkIndicator from './NetworkIndicator'
import AccountIndicator from './AccountIndicator'


export default {
  name: 'Metamask',
  components: { NetworkIndicator, AccountIndicator },
  computed: {
    logo() {
      // eslint-disable-next-line
      return require(`../assets/logos/metamask-stacked.svg`)
    },
    isValidNetwork() {
      return this.networkId === this.requiredNetwork
    },
    isAccountUnLocked() {
      return !this.account
    },
    ...mapState([
      'web3',
      'networkId',
      'account',
      'requiredNetwork',
    ])
  },
}
</script>

<style scoped>
  .signer {
    min-height: 102px;
    max-height: 100%;
    overflow: scroll;
  }
  @media (min-width: 600px) {
    .signer {
      display: flex;
    }
  }
  .signer--dialog {
    padding: 20px;
  }
  @media (min-width: 600px) {
    .signer--dialog {
      padding: 40px;
    }
  }
</style>
