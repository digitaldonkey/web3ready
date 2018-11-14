<template>
  <div
    :class="$style.overlay"
    @click="clickHandler"
  >
    <div :class="$style.modal">

      <div :class="$style.header">
        <a
          v-if="signerId"
          :class="$style.actionBack"
          href="#back"
        >
          <span >←</span>{{ $t("app.modal.backLink") }}
        </a>
        <a
          :class="$style.actionCloseX"
          href="#"
        >&times;</a>
      </div>

      <div :class="$style.modalContent">
        <slot />
      </div>

      <a
        :class="$style.actionCloseFooter"
        href="#close"
      >{{ $t("app.modal.closeText") }}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    signerId: {
      type: String,
      default: '',
    },
    clickHandler: {
      type: Function,
      required: true
    }
  },
}
</script>

<style lang="scss" module>
  .overlay {
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

  .modal {
    width: 100%;
    max-width: 880px;
    padding: 20px;
    max-height: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap-reverse;
    line-height: 26px;
    height: 26px;
    margin-bottom: 10px;
    color: #fff;
    & > a {
      color: #fff;
      text-decoration: none;
    }
  }

  .actionBack {
    font-size: 120%;
    display: inline-block;
    font-weight: bold;
    text-transform: uppercase;
    >span {
      font-size: 20px;
      display: inline-block;
      padding-right: 5px;
    }
  }

  .actionCloseX {
    display: inline-block;
    font-size: 44px;
    text-align: right;
    flex-grow: 1;
    line-height: 18px;
  }

  .modalContent {
    text-align: left;
    margin-bottom: 1em;
  }

  .actionCloseFooter {
    color: #fff;
    text-decoration: none;
    font-size: small;
    padding-bottom: 20px;
  }
</style>
