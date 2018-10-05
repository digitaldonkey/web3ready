<template>
  <div
    :class="className"
  >
    <span
      v-tooltip="tooltip"
      class="connect-web3--account-indicator-icon">
      <img
        v-if="account"
        class="img ok"
        src="../assets/statusIndicator/ok.svg"
        alt="ok"
      >
      <img
        v-if="!account"
        class="img error"
        src="../assets/statusIndicator/error.svg"
        alt="error"
      >
    </span>
    <div
      v-if="!tiny"
      class="connect-web3--account-indicator-info"
    >
      <div>{{ getMessage }}</div>
      <div
        v-if="account"
        class="connect-web3--account-indicator-address">
        {{ account }}
      </div>
    </div>
    <div
      v-if="account && tiny"
      class="connect-web3--account-indicator-address connect-web3--account-indicator-address-tiny">
      {{ account }}
    </div>
  </div>
</template>

<script>
import createTooltip from '../mixins/createTooltip'


export default {
  name: 'AccountIndicator',
  mixins: [createTooltip],
  props: {
    account: {
      type: String,
      default: null,
    },
    tiny: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    getMessage() {
      if (this.account) {
        return this.accountOkInfo
      }
      return this.accountLockedInfo
    },
    tooltip() {
      return this.createTooltip(this.getMessage)
    },
    accountOkInfo() {
      return this.$t('app.accountStatus.accountOkInfo', {
        account: this.account,
      })
    },
    accountLockedInfo() {
      return this.$t('app.accountStatus.accountLockedInfo')
    },
    className() {
      if (this.tiny) {
        return 'connect-web3--account-indicator connect-web3--account-indicator-tiny'
      }
      return 'connect-web3--account-indicator connect-web3--account-indicator-large'
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.connect-web3--account-indicator {
  display: inline-block;
}
.connect-web3--account-indicator-large {
  padding-bottom: 1em;
  display: flex;
  align-items: center;
}
@media (min-width: 600px) {
  .connect-web3--account-indicator-large {
    padding: 1em 0;
  }
}
.connect-web3--account-indicator-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  background: transparent url('../assets/statusIndicator/user.svg') center left no-repeat;
  background-size: contain;
  height: 30px;
  width: 28px;
  flex-basis: 28px;
  flex-grow: 0;
  flex-shrink: 0;
  margin: 0 10px 0 5px;
  cursor: help;
}
.connect-web3--account-indicator-icon .img {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  right: -13px;
}
.connect-web3--account-indicator-address {
  /*background-color: rgba(0, 0, 0, 0.05);*/
  height: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
  line-height: 30px;
  font-size: small;
  display: inline-block;
  max-width: 100%;
}
.connect-web3--account-indicator-info {
  padding-left: 1em;
}
.connect-web3--account-indicator-address-tiny {
  display: inline-block;
  max-width: 6em;
}
</style>

