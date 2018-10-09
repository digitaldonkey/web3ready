<template>
  <div class="signer">
    <div
      class="signer--logo"
    />
    <div class="signer--dialog">
      <Loading v-if="!web3" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NetworkIndicator from '../NetworkIndicator'
import AccountIndicator from '../AccountIndicator'
import Loading from '../../components/Loading'

export default {
  name: 'WalletConnect',
  components: {
    Loading,
    NetworkIndicator,
    AccountIndicator,
  },
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
        justify-content:space-between;
      }
    }
    .signer--logo {
      width: 100%;
      min-height: 6em;
      margin: 0 auto;
      display: block;
      max-width: 16em;
      background: transparent url('../../assets/logos/walletConnect.svg') center center no-repeat;
      background-size: contain;
      @media (min-width: 600px) {
        & {
          height: auto;
          width: 40%;
        }
      }
    }
    .signer--dialog {
      padding: 20px;
      @media (min-width: 600px) {
        & {
          padding: 40px;
          align-self: flex-end;
          flex-grow: 1;
        }
      }
    }
  }
</style>
