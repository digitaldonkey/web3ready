<template>
  <div :class="$style.signer">
    <div :class="$style.logo"/>
    <div :class="$style.dialog">

      <Loading v-if="!provider" :centered="true"/>

      <NetworkIndicator
          v-if="provider"
          :network_id="networkId"
          :required_network="requiredNetwork"
      />

      <div v-if="isListening && qrImage">
        <img :src="qrImage"/>
      </div>
      <div
        v-if="isListening"
        :class="$style.info">
        {{ $t("app.walletConnect.deviceStatus.waitingQr") }}
        <a :href="uri">{{ $t("app.walletConnect.deviceStatus.clickOnMobile") }}</a>
      </div>

      <div :class="$style.restartListening" v-if="qrImage && !isListening">
        <div :class="$style.restartListeningContent">
          <div>
            {{ $t("app.walletConnect.deviceStatus.retry.instructions") }}
            <button
              :class="$style.button"
              @click="listenSessionStatus"
            >{{ $t("app.walletConnect.deviceStatus.retry.buttonText") }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Loading from '../Loading'
import NetworkIndicator from '../NetworkIndicator'


export default {
  name: 'WalletConnect',
  data() {
    return {
      POLL_INTERVAL: 1000, // 1 sec
      TIMEOUT: 5 * 60 * 1000, // 5 min. 5 * 60 * 1000
      qrImage: null,
      isListening: null,
    }
  },
  components: {
    Loading,
    NetworkIndicator,
  },
  created() {
    if (this.provider) {
      this.initSession()
    }
  },
  watch: {
    provider: {
      handler(provider) {
        console.log('provider CHANGED at watch')
        if (provider) {
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
    account: {
      handler(account) {
        if (account) {
          this.listenSessionStatus()
        }
      }
    },
  },
  computed: {
    uri() {
      return this.provider.uri.replace('ethereum:', 'ethereum://')
    },
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

      console.log('init Session @ connected:', this.provider.walletConnector.connected)

      if (this.provider.walletConnector.connected) {
        console.log('Found Session', this.provider)
        this.provider.getNetwork()
        this.provider.getDefaultAccount()
      }
      else {
        console.log('Creating Session')
        this.provider.walletConnector.createSession()
          .then(this.listenSessionStatus.bind(this))
      }
    },
    async listenSessionStatus() {
      console.log('HERE listenSessionStatus()')

      console.log('is connected?', this.provider.walletConnector && this.provider.walletConnector.connected)

      if (this.provider.walletConnector && this.provider.walletConnector.connected) {
        this.isListening = false
        this.qrImage = null
        this.provider.getNetwork()
        this.provider.getDefaultAccount()
      }
      else {
        this.isListening = true
        this.qrImage = this.provider.image
      }
    },
  },
}
</script>

<style lang="scss" module>
  @import "../../styles/_abstract";

  .signer {
    @extend %modal-background;

    @media (min-width: 550px) {
      & {
        display: flex;
        justify-content:space-between;
      }
    }

    .logo {
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
          width: 50%;
          margin-left: 1em;
        }
      }
      @media (min-width: 700px) {
        & {
          height: auto;
          margin-left: 2em;
        }
      }
    }

    .dialog {
      padding: 0 1em;
      @media (min-width: 550px) {
        & {
          padding: 1em;
          align-self: flex-end;
          width: 50%;
        }
      }
      @media (min-width: 700px) {
        & {
          padding: 2em 1em;
        }
      }

      img {
        display: block;
      }

      .restartListening{
        // Keep square shape as QR-image.
        padding-bottom: 100%;
        width: 100%;
        position: relative;
        .restartListeningContent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;

          .button {
            @extend %button;
            font-size: .78571429rem;
            background: $color_walletConnect;
            color: $color_primary_contrast;
            display: block;
            margin:  1em auto 0;
          }
        }
      }

      .info {
        text-align: center;
        padding: 0.5em 0.5em 1em;
        @media (min-width: 550px) {
          & {
            padding-bottom: 0;
          }
        }
      }
    }
  }
</style>
