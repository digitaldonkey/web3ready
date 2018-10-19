<template>
  <div class="signer">
    <div class="signer--logo" />
    <div class="signer--dialog">

      <Loading v-if="!provider" />
      <NetworkIndicator
        v-if="provider"
        :network_id="networkId"
        :required_network="requiredNetwork"
      />
      <AccountIndicator
        v-if="provider"
        :account="account"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import NetworkIndicator from '../NetworkIndicator'
import AccountIndicator from '../AccountIndicator'
import Loading from '../Loading'

export default {
  name: 'Metamask',
  components: {
    NetworkIndicator,
    AccountIndicator,
    Loading
  },
  computed: {
    isValidNetwork() {
      return this.networkId === this.requiredNetwork
    },
    isAccountUnLocked() {
      return !this.account
    },
    ...mapGetters([
      'provider'
    ]),
    ...mapState([
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
      background: transparent url('../../assets/logos/metamask-stacked.svg') center center no-repeat;
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
