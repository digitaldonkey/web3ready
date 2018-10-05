<template>
  <div :class="className" >
    <div
      :style="{ backgroundImage: `url('${ background }')` }"
      class="signer--logo"
    />
    <p
      class="signer--text"
      v-html="text"
    />
    <div class="signer--button">
      <button
        :id="id"
        :disabled="isDisabled"
        :style="buttonBackground"
        class="button"
      >
        {{ buttonText }}
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
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    buttonColor: {
      type: String,
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
      return require(`../assets/logos/${this.id}.svg`)
    },
    buttonBackground() {
      return this.isAvailable() ? { backgroundColor: `${this.buttonColor}` } : {}
    },
    isDisabled() {
      return !this.isAvailable()
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.signer {
  position: relative;
  height: 102px;
  width: 100%;
  background: rgb(245, 246, 250);
  border-radius: 14px 10px 10px 14px;
  margin-bottom: 20px;
}

@media (min-width: 450px) {
  .signer {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
}

.signer--logo {
  height: 102px;
  min-width: 180px;
  border-radius: 14px 10px 10px 14px;
  background:  0 center no-repeat;
  background-size: contain;
  max-width: 220px;
}

@media (max-width: 450px) {
  .walletConnect .signer--logo {
    max-width: 86px;
    min-width: 86px;
    background-size: cover;
  }
}

.signer--text {
  display: none;
  color: rgb(102, 102, 102);
  flex-grow: 2;
  padding-left: 10px;
}
@media (min-width: 679px) {
  .signer--text {
    display: block;
  }
}

.signer--button {
  box-sizing: border-box;
  border: 0;
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.signer--button > .button {
  color: #fff;
}
@media (min-width: 450px) {
  .signer--button {
    position: relative;
    bottom: auto;
    right: auto;
  }
}
.signer--button > .button {
  margin: 0 20px;
}
</style>

<style>
/* v-html doesn't support scoped styles. */
.signer--text > a {
  color: rgb(102, 102, 102);
}
</style>
