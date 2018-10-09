<template>
  <div :class="className" >
    <div class="signer--logo" />
    <p
      class="signer--text"
      v-html="descriptionText"
    />
    <div class="signer--button">
      <button
        :id="id"
        :disabled="isDisabled"
        :style="buttonBackground"
        class="button"
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
  },
  computed: {
    className() {
      return `signer ${this.id}`
    },
    background() {
      // eslint-disable-next-line
      return `../assets/logos/${this.id}.svg`
    },
    buttonBackground() {
      return this.isAvailable() ? { backgroundColor: `${this.text.buttonColor}` } : {}
    },
    isDisabled() {
      return !this.isAvailable()
    },
    descriptionText() {
      const data = this.text.description
      return `${data.pre} <a href="${data.url}">${data.link}</a> ${data.post}`
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.signer {
  position: relative;
  height: 102px;
  width: 100%;
  background: rgb(245, 246, 250);
  border-radius: 14px 10px 10px 14px;
  margin-bottom: 20px;
  @media (min-width: 450px) {
    & {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: space-between;
    }
  }
  &--logo {
    height: 102px;
    min-width: 180px;
    border-radius: 14px 10px 10px 14px;

    max-width: 220px;


    .metamask & {
      background: transparent url('../assets/logos/metamask.svg') 0 center no-repeat;
      background-size: contain;
    }

    .walletConnect & {
      background: transparent url('../assets/logos/walletConnect.svg') 0 center no-repeat;
      max-width: 86px;
      min-width: 86px;
      background-size: cover;
    }

  }

  &--text {
    display: none;
    color: rgb(102, 102, 102);
    flex-grow: 2;
    padding-left: 10px;
    @media (min-width: 679px) {
      & {
        display: block;
      }
    }
    > a {
      color: rgb(102, 102, 102);
    }
  }

  &--button {
    box-sizing: border-box;
    border: 0;
    position: absolute;
    bottom: 10px;
    right: 10px;
    > .button {
      color: #fff;
      margin: 0 20px;
    }
    @media (min-width: 450px) {
      & {
        position: relative;
        bottom: auto;
        right: auto;
      }
    }
  }
}
</style>

<style>
/* v-html doesn't support scoped styles. */
.signer--text > a {
  color: rgb(102, 102, 102);
}
</style>
