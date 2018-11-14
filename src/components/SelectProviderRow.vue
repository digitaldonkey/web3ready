<template>
  <div :class="$style.signer" >
    <div :class="logoClassName" />
    <p
      :class="$style.text"
      v-html="descriptionText"
    />
    <div :class="buttonClassName">
      <button
        :disabled="isDisabled"
        @click="selectProvider(id)"
      >
        {{ text.buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: Object,
      required: true,
    },
    isAvailable: {
      type: Function,
      required: true,
    },
    selectProvider: {
      type: Function,
      required: true,
    },
  },
  computed: {
    logoClassName() {
      return [this.$style.logo, this.$style[this.id]]
    },
    buttonClassName() {
      return [this.$style.buttonWrapper, this.$style[this.id]]
    },
    isDisabled() {
      return !this.isAvailable()
    },
    descriptionText() {
      const data = this.text.description
      return `${data.pre} <a href="${data.url}">${data.link}</a>${data.post}`
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" module>
  @import "../styles/_abstract";

  .signer {
    @extend %modal-background;
    position: relative;

    @media (min-width: 470px) {
      & {
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: space-between;
      }
    }
  }

  .logo {
    height: 102px;
    min-width: 180px;
    border-radius: $borderRadius; // Same as modal-background.
    max-width: 220px;
    &.metamask {
      background: transparent url('../assets/logos/metamask.svg') 0 center no-repeat;
      background-size: contain;
    }
    &.walletConnect {
      background: transparent url('../assets/logos/walletConnect.svg') 20px center no-repeat;
      max-width: 86px;
      min-width: 86px;
      background-size: 300%;
      @media (min-width: 470px) {
        background-size: calc(100% - 30px);
        min-width: 200px;
      }
      @media (min-width: 800px) {
        min-width: 250px;
      }
    }
    &.ledger {
      max-width: 86px;
      min-width: 86px;
      background: transparent url('../assets/logos/ledger.svg') 20px center no-repeat;
      background-size: 300%;
      @media (min-width: 470px) {
        background-size: calc(100% - 30px);
        min-width: 200px;
      }
      @media (min-width: 800px) {
        min-width: 250px;
      }
    }
  }

  .buttonWrapper {
    box-sizing: border-box;
    border: 0;
    position: absolute;
    bottom: 20px;
    right: 0;
    > button {
      @extend %button;
      color: #fff;
      margin: 0 20px;
    }
    @media (min-width: 470px) {
      & {
        position: relative;
        bottom: auto;
        right: auto;
      }
    }
    &.metamask > button {
      background: $color_metamsk;
    }
    &.walletConnect > button {
      background: $color_walletConnect;
    }
    &.ledger > button {
      background: $color_ledger;
    }
  }

  .text {
    display: none;
    color: $color_text_light;
    flex-grow: 2;
    padding-left: 10px;
    @media (min-width: 679px) {
      & {
        display: block;
      }
    }
    > a {
      color: $color_text_light;
    }
  }
</style>
