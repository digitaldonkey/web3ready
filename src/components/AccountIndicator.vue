<template>
  <div
    :class="className"
  >
    <span
      v-tooltip="tooltip"
      class="account-indicator--icon">

      <span
        v-if="account"
        class="account-indicator--icon-status icon-ok"
      />

      <span
        v-if="!account"
        class="account-indicator--icon-status icon-error"
      />

    </span>
    <div
      v-if="!tiny"
      class="account-indicator--info"
    >
      <div>{{ getMessage }}</div>
      <div
        v-if="account"
        class="account-indicator--address">
        {{ account }}
      </div>
    </div>
    <div
      v-if="account && tiny"
      class="account-indicator--address account-indicator--address-tiny">
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
        return 'account-indicator account-indicator--tiny'
      }
      return 'account-indicator account-indicator--large'
    }
  },
}
</script>


<style scoped lang="scss">
.account-indicator {
  display: inline-block;
  vertical-align: middle;

  &--large {
    padding-bottom: 1em;
    display: flex;
    align-items: center;
    @media (min-width: 600px) {
      & {
        padding: 1em 0;
      }
    }
  }

  &--icon {
    display: inline-block;
    position: relative;
    vertical-align: baseline;
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

  &--icon-status {
    position: absolute;
    width: 100%;
    height: 100%;
    bottom: 0;
    right: -13px;
    background-size: contain;
  }

  &--address {
    /*background-color: rgba(0, 0, 0, 0.05);*/
    height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
    line-height: 30px;
    font-size: small;
    display: inline-block;
    max-width: 100%;
  }

  &--address-tiny {
    display: inline-block;
    max-width: 6em;
    margin-left: .5em;
  }

  &--info {
    padding-left: 1em;
  }

}
</style>
