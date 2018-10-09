<template>
  <div class="connect-web3">

    <span class="connect-web3--info">
      <button
        v-if="signerId === null && !isValidated"
        class="button button--primary"
        @click="selectDialogOpen = true"
      >
        {{ $t("app.main.connectButton") }}
      </button>

      <span v-if="signerId !== null && !isValidated">
        <span class="loading-image"/>
      </span>

      <span v-if="signerId !== null && isValidated">
        <NetworkIndicator
          :network_id="networkId"
          :required_network="requiredNetwork"
          :tiny="true"
        />
        <AccountIndicator
          :account="account"
          :tiny="true"
        />
        <button
          class="button mini button--transparent"
          @click="resetProvider"
        >{{ $t("app.main.changeButton") }}</button>
      </span>
    </span>

    <Modal
      v-if="selectDialogOpen && !isValidated"
      :signerId="signerId"
      :clickHandler="dialogClick"
    >
      <SelectSigner
        v-if="!signerId"
        :signers="availableSigners"/>

      <Metamask
        v-if="signerId === 'metamask' && !isValidated"
        class="modal-background"
      />
    </Modal>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SelectSigner from './components/SelectSigner'
import Metamask from './components/Metamask'
import NetworkIndicator from './components/NetworkIndicator'
import AccountIndicator from './components/AccountIndicator'
import Modal from './components/Modal'


export default {
  name: 'App',
  components: {
    Metamask,
    SelectSigner,
    NetworkIndicator,
    AccountIndicator,
    Modal,
  },
  data() {
    return {
      selectDialogOpen: !this.$store.isValidated,
    }
  },
  computed: {
    ...mapState([
      'availableSigners',
      'signerId',
      'account',
      'networkId',
      'requiredNetwork',
    ]),
    ...mapGetters([
      'isValidated',
    ]),
  },
  beforeCreate() {
    // Validate based on last provider selected.
    if (this.$store.state.signerId) {
      this.$store.dispatch('web3')
    }
  },
  methods: {
    async selectProvider(id) {
      this.$store.commit('signerId', id)
    },
    async resetProvider() {
      this.selectDialogOpen = true
      this.$store.commit('signerId', null)
    },
    dialogClick(event) {
      if (event.target.hash === '#back') {
        this.$store.commit('signerId', null)
        event.preventDefault()
      }
      else if (!this.isDialogContent(event)) {
        this.selectDialogOpen = false
        if (!this.isValidated) {
          this.$store.commit('signerId', null)
        }
        event.preventDefault()
      }
      if (event.target.tagName === 'BUTTON') {
        this.selectProvider(event.target.id)
      }
    },
    isDialogContent(event) {
      if (!event.path) {
        return false
      }
      for (let i = 0, len = event.path.length; i < len; i += 1) {
        if (!event.path[i].classList) {
          return false
        }
        if (event.path[i].classList.contains('modal-content')) {
          return true
        }
      }
      return false
    },
  },
}
</script>

<style scoped lang="scss">
  .loading-image {
    display: inline-block;
    vertical-align: bottom;
    width: 30px;
    height: 28px;
    background: transparent url('./assets/loader.svg') center left no-repeat;
    background-size: contain;
  }
</style>

<style lang="scss">
  .connect-web3,
  .tooltip {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "SF Pro Text", Roboto, Helvetica, Arial, sans-serif;
    font-size: 1rem;
  }

  .connect-web3 {
    * {
      box-sizing: border-box;
    }

    .icon-ok {
      background: transparent url('./assets/statusIndicator/ok.svg') center left no-repeat;
      background-size: contain;
    }
    .icon-error {
      background: transparent url('./assets/statusIndicator/error.svg') center left no-repeat;
      background-size: contain;
    }
    .icon-unknown {
      background: transparent url('./assets/statusIndicator/unknown.svg') center left no-repeat;
      background-size: contain;
    }


    .button {
      cursor: pointer;
      display: inline-block;
      min-height: 1em;
      outline: 0;
      border: 1px solid transparent;
      vertical-align: baseline;
      margin: 0 .25em 0 0;
      padding: .78571429em 1.5em .78571429em;
      text-transform: none;
      text-shadow: none;
      line-height: inherit;
      font-size: 1rem;
      font-style: normal;
      text-align: center;
      text-decoration: none;
      border-radius: .28571429rem;
      will-change: transform;
      transition: all 0.15s ease 0s;
      white-space: nowrap;
      max-width: 19.75em;

      &.mini {
        font-size: .78571429rem;
      }
      &:disabled {
        background: rgb(217, 217, 217);
        color: rgb(133, 133, 133);
        cursor: not-allowed;
      }
      &:hover {
        box-shadow: none;
        opacity: .9;
      }

      &--primary {
        color: rgba(255, 255, 255, 0.96);
        background: rgb(64, 153, 255);
        box-shadow: rgba(50, 50, 93, 0.11) 0 4px 6px 0, rgba(0, 0, 0, 0.08) 0 1px 3px 0, rgba(0, 0, 0, 0.06) 0 0 1px 0 inset;
      }
      &--transparent {
        text-decoration: underline;
        background: none;

        &:hover {
          border: 1px solid #d6d6d6;
          background: rgba(133, 133, 133, 0.49);
          box-shadow: rgba(50, 50, 93, 0.11) 0 4px 6px 0, rgba(0, 0, 0, 0.08) 0 1px 3px 0, rgba(0, 0, 0, 0.06) 0 0 1px 0 inset;
        }
      }
    }

  }

  .tooltip {
    display: block !important;
    z-index: 10000;
    .tooltip-inner {
      background: rgba(64, 64, 64, 0.93);
      color: white;
      border-radius: 16px;
      padding: 5px 10px 4px;
    }
    .tooltip-arrow {
      width: 0;
      height: 0;
      border-style: solid;
      position: absolute;
      margin: 5px;
      border-color: rgba(64, 64, 64, 0.93);
      z-index: 1;
    }
    &[x-placement^="top"] {
      margin-bottom: 5px;
      .tooltip-arrow {
        border-width: 5px 5px 0 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        bottom: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    &[x-placement^="bottom"] {
      margin-top: 5px;
      .tooltip-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-top-color: transparent !important;
        top: -5px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
      }
    }
    &[x-placement^="right"] {
      margin-left: 5px;
      .tooltip-arrow {
        border-width: 5px 5px 5px 0;
        border-left-color: transparent !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        left: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
      }
    }
    &[x-placement^="left"] {
      margin-right: 5px;
      .tooltip-arrow {
        border-width: 5px 0 5px 5px;
        border-top-color: transparent !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        right: -5px;
        top: calc(50% - 5px);
        margin-left: 0;
        margin-right: 0;
      }
    }
    &.popover {
      .popover-inner {
        background: #f9f9f9;
        color: rgba(64, 64, 64, 0.93);
        padding: 24px;
        border-radius: 5px;
        box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
      }
      .popover-arrow {
        border-color: #f9f9f9;
      }
    }
    &[aria-hidden='true'] {
      visibility: hidden;
      opacity: 0;
      transition: opacity .15s, visibility .15s;
    }
    &[aria-hidden='false'] {
      visibility: visible;
      opacity: 1;
      transition: opacity .15s;
    }
  }
</style>
