<template>
  <div class="signer">
    <div
      class="signer--logo"
    />
    <div class="signer--dialog">
      <NetworkIndicator
        :network_id="networkId"
        :required_network="requiredNetwork"
      />
      <AccountIndicator
        :account="account"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NetworkIndicator from './NetworkIndicator'
import AccountIndicator from './AccountIndicator'

export default {
  name: 'Metamask',
  components: { NetworkIndicator, AccountIndicator },
  computed: {
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

<style scoped lang="scss">
  .signer {
    min-height: 102px;
    max-height: 100%;
    overflow: scroll;
    @media (min-width: 600px) {
      & {
        display: flex;
      }
    }
    .signer--logo {
      width: 100%;
      height: 11em;
      margin: 0 auto;
      display: block;
      max-width: 13em;
      background: transparent url('../assets/logos/metamask-stacked.svg') center center no-repeat;
      @media (min-width: 600px) {
        & {
          height: auto;
        }
      }
    }
    .signer--dialog {
      padding: 20px;
      @media (min-width: 600px) {
        & {
          padding: 40px;
        }
      }
    }
  }
</style>
