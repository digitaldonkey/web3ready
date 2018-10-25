<template>
  <div class="signer">
    <div class="signer--logo"/>
    <div class="signer--dialog">

      <Loading v-if="!qrImage" :centered="true"/>

      <div  v-if="!account">
        <div v-if="qrImage && isListening">
          <img :src="qrImage"/>
        </div>

        <div class="restart-listening" v-if="qrImage && !isListening">
          <div class="restart-listening--content">
            <div>
              {{ $t("app.ledger.deviceStatus.retry.instructions") }}
              <button
                class="button mini"
                @click="listenSessionStatus"
              >{{ $t("app.ledger.deviceStatus.retry.buttonText") }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="qrImage"
          class="info">
          {{ $t("app.walletConnect.instructions.summary") }}
        </div>
      </div>

      <NetworkIndicator
        v-if="provider"
        :network_id="networkId"
        :required_network="requiredNetwork"
      />

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
      POLL_INTERVAL: 1000, // 1 sec
      TIMEOUT: 5 * 60 * 1000, // 5 min. 5 * 60 * 1000
      qrImage: null,
      isListening: null,
      wcSession: null,
    }
  },
  components: {
    Loading,
    NetworkIndicator,
    AccountIndicator,
  },
  created() {
    if (this.provider) {
      // this.getQrImage()
      this.initSession()
    }
  },
  watch: {
    provider: {
      handler(provider) {
        if (provider) {
          // this.getQrImage()
          this.initSession()
        }
      }
    },
    qrImage: {
      handler(img) {
        if (img) {
          this.listenSessionStatus()
        }
      }
    },
    wcSession: {
      handler(session) {
        if (session) {
          this.provider.web3.eth.getAccounts()
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
    async initSession() {
      // This will cause walletConnect to initialize a Session.
      await this.provider.web3.eth.getAccounts()
      this.qrImage = await this.provider.image
    },
    async listenSessionStatus() {
      if (this.qrImage) {
        this.isListening = true
        try {
          this.wcSession = await this.provider.web3.currentProvider.walletconnect.listenSessionStatus(this.POLL_INTERVAL, this.TIMEOUT)
        }
        catch (e) {
          // eslint-disable-next-line
          console.log(e, 'ERROR or TIMEOUT @ walletconnect.listenSessionStatus()')
        }
        this.isListening = false
      }
    }
  },
}
</script>

<style scoped lang="scss">
  .signer {
    min-height: 102px;
    max-height: 100%;
    overflow: scroll;
    @media (min-width: 550px) {
      & {
        display: flex;
        justify-content:space-between;
      }
    }
    .signer--logo {
      width: 100%;
      min-height: 5em;
      margin: 10px auto;
      display: block;
      max-width: 250px;
      background: transparent url('../../assets/logos/walletConnect.svg') center no-repeat;
      background-size: contain;
      @media (min-width: 379px) {
        & {
          margin-top: 1em;
        }
      }
      @media (min-width: 550px) {
        & {
          height: auto;
          width: 55%;
          margin-left: 1em;
        }
      }
      @media (min-width: 700px) {
        & {
          height: auto;
          width: 50%;
          margin-left: 2em;
        }
      }
    }
    .signer--dialog {
      padding: 0 1em;
      img {
        display: block;
      }
      .restart-listening{
        // Keep square shape as QR-image.
        padding-bottom: 100%;
        width: 100%;
        position: relative;
        .restart-listening--content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          .button {
            display: block;
            margin:  1em auto 0;
          }
        }

      }
      .info {
        text-align: center;
        margin-top: .5em;
      }

      @media (min-width: 550px) {
        & {
          padding: 1em;
          align-self: flex-end;
          flex-grow: 1;
        }
      }
      @media (min-width: 700px) {
        & {
          padding: 2em 1em;
        }
      }
    }
  }
</style>
