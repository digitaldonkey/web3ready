<template>
  <div class="connect-web3">

    <span class="connect-web3--info">
      <button
        v-if="signerId === null || !isValidated"
        class="button button--primary"
        @click="selectDialogOpen = true"
      >{{ $t("app.main.connectButton") }}</button>

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

    <div
      v-if="selectDialogOpen && !isValidated"
      class="connect-web3--modal modal"
      @click="dialogClick"
    >
      <div class="modal-body">

        <div class="modal-header">
          <a
            v-if="signerId"
            class="modal-actions--left"
            href="#back"
          ><span class="modal-actions--back">←</span>{{ $t("app.modal.backLink") }}</a>
          <a
            class="modal-actions--close-x"
            href="#"
          >&times;</a>
        </div>

        <div class="modal-content">

          <SelectSigner
            v-if="!signerId"
            :signers="availableSigners"/>

          <Metamask
            v-if="signerId === 'metamask' && !isValidated"
            class="modal-background"
          />

        </div>
        <a
          class="modal-actions--close-text"
          href="#close"
        >{{ $t("app.modal.closeText") }}</a>
      </div>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SelectSigner from './components/SelectSigner'
import Metamask from './components/Metamask'
import NetworkIndicator from './components/NetworkIndicator'
import AccountIndicator from './components/AccountIndicator'

export default {
  name: 'App',
  components: { Metamask, SelectSigner, NetworkIndicator, AccountIndicator },
  data() {
    return {
      selectDialogOpen: false,
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
        event.preventDefault()
      }
      if (event.target.tagName === 'BUTTON') {
        this.selectProvider(event.target.id)
      }
      return false
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

<style scoped>
  .modal-background {
    background: rgb(245, 246, 250);
    border-radius: 14px 10px 10px 14px;
    margin-bottom: 1em;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap-reverse;
    line-height: 26px;
    height: 26px;
    margin-bottom: 10px;
    color: #fff;
  }
  .modal-header > a {
    color: #fff;
    text-decoration: none;
  }
  .modal-actions--left {
    font-size: 120%;
    display: inline-block;
    font-weight: bold;
    text-transform: uppercase;
  }
  .modal-actions--back {
    font-size: 20px;
    display: inline-block;
    padding-right: 5px;
  }
  .modal-actions--close-x {
    display: inline-block;
    font-size: 44px;
    text-align: right;
    flex-grow: 1;
    line-height: 18px;
  }
  .modal-actions--close-text {
    color: #fff;
    text-decoration: none;
    font-size: small;
    padding-bottom: 20px;
  }
  .modal {
    background-color: rgba(0,0,0,.6);
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    max-height: 100%;
    overflow: scroll;
  }
  .modal-body {
    width: 100%;
    max-width: 880px;
    padding: 20px;
    max-height: 100%;
  }
  .modal-content {
    text-align: left;
  }
</style>

<style>
  .connect-web3,
  .tooltip {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "SF Pro Text", Roboto, Helvetica, Arial, sans-serif;
    font-size: 1rem;
  }
  .connect-web3 * {
    box-sizing: border-box;
  }
  .connect-web3 .button {
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
    line-height: 1em;
    font-size: 1rem;
    font-style: normal;
    text-align: center;
    text-decoration: none;
    border-radius: .28571429rem;
    will-change: transform;
    transition: all 0.15s ease 0s;
    white-space: nowrap;
    max-width: 19.75em;
  }
  .connect-web3 .button--primary {
    color: rgba(255, 255, 255, .96);
    background: rgb(64, 153, 255);
    box-shadow: rgba(50, 50, 93, 0.11) 0 4px 6px 0, rgba(0, 0, 0, 0.08) 0 1px 3px 0, rgba(0, 0, 0, 0.06) 0 0 1px 0 inset;
  }
  .connect-web3 .button--transparent {
    text-decoration: underline;
    background: none;
  }
  .connect-web3 .button--transparent:hover {
    border: 1px solid #d6d6d6;
    background: rgba(133, 133, 133, 0.49);
    box-shadow: rgba(50, 50, 93, 0.11) 0 4px 6px 0, rgba(0, 0, 0, 0.08) 0 1px 3px 0, rgba(0, 0, 0, 0.06) 0 0 1px 0 inset;
  }
  .connect-web3 .button.mini {
    font-size: .78571429rem;
  }
  .connect-web3 .button:disabled {
    background: rgb(217, 217, 217);
    color: rgb(133, 133, 133);
    cursor: not-allowed;
  }
  .connect-web3 .button:hover {
    box-shadow: none;
    opacity: .9;
  }


  .tooltip {
    display: block !important;
    z-index: 10000;
  }
  .tooltip-inner{
    word-break: break-word;
  }
  .tooltip .tooltip-inner {
    background: rgba(64, 64, 64, 0.93);
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }
  .tooltip .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: rgba(64, 64, 64, 0.93);
    z-index: 1;
  }
  .tooltip[x-placement^="top"] {
    margin-bottom: 5px;
  }
  .tooltip[x-placement^="top"] .tooltip-arrow {
    border-width: 5px 5px 0 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }
  .tooltip[x-placement^="bottom"] {
    margin-top: 5px;
  }
  .tooltip[x-placement^="bottom"] .tooltip-arrow {
    border-width: 0 5px 5px 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-top-color: transparent !important;
    top: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }
  .tooltip[x-placement^="right"] {
    margin-left: 5px;
  }
  .tooltip[x-placement^="right"] .tooltip-arrow {
    border-width: 5px 5px 5px 0;
    border-left-color: transparent !important;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
    left: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }
  .tooltip[x-placement^="left"] {
    margin-right: 5px;
  }
  .tooltip[x-placement^="left"] .tooltip-arrow {
    border-width: 5px 0 5px 5px;
    border-top-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    right: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }
  .tooltip.popover .popover-inner {
    background: #f9f9f9;
    color: rgba(64, 64, 64, 0.93);
    padding: 24px;
    border-radius: 5px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, .1);
  }
  .tooltip.popover .popover-arrow {
    border-color: #f9f9f9;
  }
  .tooltip[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }
  .tooltip[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
</style>
