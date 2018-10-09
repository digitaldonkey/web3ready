<template>
  <div
    class="connect-web3--modal modal"
    @click="clickHandler"
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
        <slot />
      </div>

      <a
        class="modal-actions--close-text"
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

<style scoped lang="scss">
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

      & > a {
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
    }

    .modal-actions--close-text {
      color: #fff;
      text-decoration: none;
      font-size: small;
      padding-bottom: 20px;
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
  }
</style>
