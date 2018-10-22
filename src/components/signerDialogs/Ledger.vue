<template>
  <div class="signer">
    <div class="signer--logo" />
    <div class="signer--dialog">

      <Loading v-if="!provider" />

      <div
        v-if="provider && !accountSelect"
        class="signer--device-status"
      >
        <div>
          <h3 class="headline">{{ $t("app.ledger.deviceStatus.heading") }}</h3>
          <p class="text">{{ $t("app.ledger.deviceStatus.introText") }}</p>
        </div>
        <div class="signer--device-status-listener">
          <div  v-if="isListeningForAccounts">
            <div class="status">{{ $t("app.ledger.deviceStatus.waitingForDevice") }}</div>
            <Loading :centered="true"/>
          </div>
          <div v-if="provider && !accountSelect && !isListeningForAccounts">
            <p class="text">{{ $t("app.ledger.deviceStatus.retry.instructions") }}</p>
            <button
              class="button mini"
              :style="backgroundColor"
              @click="listenForAccounts"
            >{{ $t("app.ledger.deviceStatus.retry.buttonText") }}
            </button>
          </div>
        </div>
      </div>

      <div
        class="signer--select-account"
        v-if="provider && accountSelect"
      >
        <h3 class="headline">{{ $t("app.ledger.selectAccount.heading") }}</h3>
        <div class="options">
          <div
            class="options--item"
            v-for="(account, index) in accountSelect"
            :key="index"
            :value="index"
          >
            <input
              :label="account"
              type="radio"
              class="input"
              :id="account"
              :value="index"
              v-model="accountSelected"
            />
            <label class="label-address" :for="account">{{ account }}</label>
          </div>
          <div>
            <div class="remember-account">
              <input class="input" type="checkbox" id="rememberAccount" v-model="rememberAccount">
              <label class="label-remember"  for="rememberAccount">{{ $t("app.ledger.selectAccount.shouldRemember") }}</label>
            </div>
            <button
              class="button mini"
              :style="backgroundColor"
              @click="selectedAccount"
            >
              {{ $t("app.ledger.selectAccount.selectAccount") }}
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

export default {
  name: 'Ledger',
  components: {
    Loading,
  },
  data() {
    return {
      isListeningForAccounts: false,
      accountSelect: null,
      accountSelected: 0,
      rememberAccount: true,
    }
  },
  watch: {
    accountSelect: {
      handler(accounts) {
        if (accounts && accounts.length) {
          accounts.every((address) => {
            if (this.provider.web3.utils.sha3(address) === this.$store.state.lastAccountData) {
              this.provider.defaultAccount = address
              this.selectedAccount()
            }
            return false
          })
        }
      },
    },
    provider: {
      handler(provider) {
        if (provider.web3) {
          this.listenForAccounts()
        }
      }
    }
  },
  created() {
    if (this.provider && this.provider.web3) {
      this.listenForAccounts()
    }
  },
  methods: {
    selectedAccount() {
      const selectedAddress = this.accountSelect[this.accountSelected]
      if (this.rememberAccount) {
        const hash = this.provider.web3.utils.sha3(selectedAddress)
        this.$store.commit('lastAccountData', hash)
      }
      this.provider.defaultAccount = selectedAddress
    },
    async listenForAccounts() {
      this.isListeningForAccounts = true
      try {
        this.accountSelect = await this.provider.web3.eth.getAccounts()
      }
      catch (error) {
        // eslint-disable-next-line
        // console.log(error, 'ERROR @ Ledger::listenForAccounts()')
      }
      this.isListeningForAccounts = false
    },
  },
  computed: {
    backgroundColor() {
      return { backgroundColor: this.$t('globals.signers.ledger.buttonColor') }
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
      'lastAccountData',
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
        align-items: center;
        justify-content: flex-start;
      }
    }
    .signer--logo {
      width: 100%;
      height: 4em;
      margin: 1em auto 0;
      display: block;
      max-width: 13em;
      background: transparent url('../../assets/logos/ledger.svg') 1em center no-repeat;
      background-size: 83%;
      @media (min-width: 600px) {
        & {
          margin-top: 0;
          height: 6em;
          min-width: 25%;
        }
      }
      @media (min-width: 751px) {
        & {
          background-position: 2em center;
        }
      }
    }
    .signer--dialog {
      padding: 1em;
      width: 100%;
      text-align: center;

      @media (min-width: 600px) {
        & {
          padding: 2em 2em 2em 0;
          max-width: 75%;

        }
      }

      .headline {
        margin: 1em 0;
        font-size: 1.3em;
        font-weight: bold;
        display: block;
        color: #4c4c4c;

      }
      .text {
        padding: 0 2em .5em;
        max-width: 31.75em;
        display: inline-block;
      }

      .button {
        display: inline-block;
        color: #fff;
      }
    }
    .signer--device-status {

      .signer--device-status-listener {
        width: 80%;
        display: inline-block;
        padding: 1em;
        border: 2px dashed #dedede;
        max-width: 20em;
        margin-bottom: 1em;
        min-height: 160px;

        .status {
          color: #bdbdbd;
          display: inline-block;
          font-size: small;
          padding-top: 1.5em;
        }

        .text {
          color: #7f7f7f;
        }
      }
    }
    .signer--select-account {
      .options {
        text-align: left;
        margin: auto 0;
        padding: .5em;
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        line-height: 2;

        .input {
          vertical-align: middle;
        }

        .options--item {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space:nowrap;
          .label-address {
            padding: .25em .25em .25em .5em;
            margin-bottom: .5em;
            width: 100%;
          }
        }
      }
      .remember-account {
        margin: .5em 0 1em;
        .label-remember {
          padding-left: .5em;
        }
      }
    }
  }
</style>
