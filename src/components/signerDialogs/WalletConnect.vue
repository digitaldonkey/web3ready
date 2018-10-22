<template>
  <div class="signer">
    <div class="signer--logo"/>
    <div class="signer--dialog">

      <Loading v-if="!qrImage" :centered="true"/>

      <div v-if="qrImage">
        <img :src="qrImage"/>
        <p>{{ $t("app.walletConnect.instructions.summary") }}</p>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import NetworkIndicator from '../NetworkIndicator'
import AccountIndicator from '../AccountIndicator'
import Loading from '../../components/Loading'

export default {
  name: 'WalletConnect',
  data() {
    return {
      qrImage: null
    }
  },
  components: {
    Loading,
    NetworkIndicator,
    AccountIndicator,
  },
  watch: {
    provider: {
      handler(provider) {
        if (provider) {
          this.getQrImage()
        }
      }
    },
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
  methods: {
    async getQrImage() {
      if (this.provider && this.provider.web3 && this.provider.getImage) {
        const image = await this.provider.getImage()
        if (image) {
          this.qrImage = image
        }
        else {
          await this.waitFor(500)
          this.getQrImage()
        }
      }
    },
    async waitFor(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
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
      margin: 10px auto;
      display: block;
      max-width: 16em;
      background: transparent url('../../assets/logos/walletConnect.svg') center no-repeat;
      background-size: contain;
      @media (min-width: 600px) {
        & {
          height: auto;
          width: 40%;
          margin-left: 40px;
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
