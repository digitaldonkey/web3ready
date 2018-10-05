<template>
  <div
    :class="className"
  >
    <span
      v-tooltip="tooltip"
      class="connect-web3--network-indicator-icon"
    >
      <img
        v-if="isOk"
        class="img ok"
        src="../assets/statusIndicator/ok.svg"
        alt="ok"
      >
      <img
        v-if="isUnknown"
        class="img warning"
        src="../assets/statusIndicator/unknown.svg"
        alt="warning"
      >
      <img
        v-if="isError"
        class="img error"
        src="../assets/statusIndicator/error.svg"
        alt="error"
      >
    </span>
    <span
      v-if="!tiny"
      class="connect-web3--network-indicator-info"
    >
      {{ getMessage }}
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import createTooltip from '../mixins/createTooltip'

export default {
  mixins: [createTooltip],
  props: {
    network_id: {
      type: String,
      default: null,
    },
    required_network: {
      type: String,
      required: true,
    },
    tiny: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState([
      'signerId',
      'networkId',
    ]),
    getMessage() {
      if (this.isUnknown) {
        return this.noRequiredInfo
      }
      if (this.isOk) {
        return this.connectedWithInfo
      }
      return this.networkMismatchInfo
    },
    tooltip() {
      return this.createTooltip(this.getMessage)
    },
    connectedWithInfo() {
      return this.$t('app.networkStatus.connectedWithInfo', {
        signer: this.$t(`globals.signers.${this.signerId}.label`),
        network: this.$t(`globals.networks.${this.networkId}.label`),
      })
    },
    noRequiredInfo() {
      return this.$t('app.networkStatus.noRequiredInfo')
    },
    networkMismatchInfo() {
      return this.$t('app.networkStatus.networkMismatchInfo', {
        networkLabel: this.$t(`globals.networks.${this.required_network}.label`),
        networkId: this.required_network,
      })
    },
    isUnknown() {
      return this.required_network === '*'
    },
    isOk() {
      return !this.isUnknown && this.required_network === this.network_id
    },
    isError() {
      return !this.isUnknown && this.required_network !== this.network_id
    },
    className() {
      if (this.tiny) {
        return 'connect-web3--network-indicator connect-web3--network-indicator-tiny'
      }
      return 'connect-web3--network-indicator connect-web3--network-indicator-large'
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.connect-web3--network-indicator {
  display: flex;
  align-items: center;
}
.connect-web3--network-indicator-large {
  padding-bottom: 1em;
}
@media (min-width: 600px) {
  .connect-web3--network-indicator-large {
    padding: 1em 0;
  }
}
@media (min-width: 600px) {
  .connect-web3--network-indicator-large {
    padding: 1em 0;
  }
}
.connect-web3--network-indicator-icon {
  position: relative;
  background: transparent url('../assets/statusIndicator/ethereum.svg') center left no-repeat;
  background-size: contain;
  vertical-align: top;
  margin: 0 10px 0 5px;
  cursor: help;
  display: inline-block;
  height: 30px;
  width: 28px;
  flex-basis: 28px;
  flex-grow: 0;
  flex-shrink: 0;
}
.connect-web3--network-indicator-icon .img {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  right: -10px;
}
.connect-web3--network-indicator-tiny {
  display: inline-block;
}
.connect-web3--network-indicator-info {
  padding-left: 1em;
}
</style>
