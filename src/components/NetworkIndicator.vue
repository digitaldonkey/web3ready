<template>
  <div
    :class="className"
  >
    <span
      v-tooltip="tooltip"
      class="network-indicator--icon"
    >

      <span
        v-if="isOk"
        class="network-indicator--icon-status icon-ok"
      />

      <span
        v-if="isUnknown"
        class="network-indicator--icon-status icon-unknown"
      />

      <span
        v-if="isError"
        class="network-indicator--icon-status icon-error"
      />
    </span>
    <span
      v-if="!tiny"
      class="network-indicator--info"
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
        signer: this.$t(`globals.providers.${this.signerId}.label`),
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
        return 'network-indicator network-indicator--tiny'
      }
      return 'network-indicator network-indicator--large'
    }
  },
}
</script>


<style scoped lang="scss">

  .network-indicator {
    display: flex;
    align-items: center;

    &--large {
      padding-bottom: 1em;
      @media (min-width: 600px) {
        & {
          padding: 1em 0;
        }
      }
    }
    &--tiny {
      display: inline-block;
      vertical-align: middle;
    }
    &--icon {
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
    &--icon-status {
      position: absolute;
      width: 100%;
      height: 100%;
      bottom: 0;
      right: -10px;
    }
    &--info {
      padding-left: 1em;
    }
  }
</style>
