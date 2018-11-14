<template>
  <div :class="$style.signer">
    <div :class="$style.logo" />
    <div :class="$style.dialog">

      <Loading v-if="!provider" />

      <div
        v-if="provider && !accountSelect"
        :class="$style.deviceStatus"
      >
        <div>
          <h3 :class="$style.headline">{{ $t("app.ledger.deviceStatus.heading") }}</h3>
          <p :class="$style.text">{{ $t("app.ledger.deviceStatus.introText") }}</p>
        </div>
        <div :class="$style.listening">
          <div  v-if="isListeningForAccounts">
            <div :class="$style.status">{{ $t("app.ledger.deviceStatus.waitingForDevice") }}</div>
            <Loading :centered="true"/>
          </div>
          <div v-if="provider && !accountSelect && !isListeningForAccounts">
            <p :class="$style.text">{{ $t("app.ledger.deviceStatus.retry.instructions") }}</p>
            <button
              :class="$style.button"
              @click="listenForAccounts"
            >{{ $t("app.ledger.deviceStatus.retry.buttonText") }}
            </button>
          </div>
        </div>
      </div>

      <div
        :class="$style.selectAccount"
        v-if="provider && accountSelect"
      >
        <h3 :class="$style.headline">{{ $t("app.ledger.selectAccount.heading") }}</h3>
        <div :class="$style.options">
          <div
            :class="$style.optionsItem"
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
            <label :class="$style.labelAddress" :for="account">{{ account }}</label>
          </div>
          <div>
            <div :class="$style.rememberAccount">
              <input class="input" type="checkbox" id="rememberAccount" v-model="rememberAccount">
              <label :class="$style.labelRemember"  for="rememberAccount">{{ $t("app.ledger.selectAccount.shouldRemember") }}</label>
            </div>
            <button
              :class="$style.button"
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

<style lang="scss" module>
  @import "../../styles/_abstract";

  .signer {
    @extend %modal-background;

    @media (min-width: 600px) {
      & {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
    }

    .logo {
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

    .dialog {
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
    }

    .deviceStatus {

      .listening {
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

    .selectAccount {
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

        .optionsItem {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space:nowrap;

          .labelAddress {
            padding: .25em .25em .25em .5em;
            margin-bottom: .5em;
            width: 100%;
          }
        }
      }
      .rememberAccount {
        margin: .5em 0 1em;
        .labelRemember {
          padding-left: .5em;
        }
      }
    }

    .button {
      @extend %button;
      font-size: .78571429rem;
      display: inline-block;
      color: white;
      background: $color_ledger;
    }
  }
</style>
