<template>
  <span :class="className" />
</template>

<script>
export default {
  name: 'Loading',
  props: {
    centered: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    className() {
      if (this.centered) {
        return 'loading-image loading-image--centered'
      }
      return 'loading-image'
    }
  }
}
</script>


<style scoped lang="scss">
  .loading-image {
    display: inline-block;
    vertical-align: bottom;
    width: 30px;
    height: 28px;
    background: transparent url('../assets/loader.svg') center no-repeat;
    background-size: contain;
    margin: 0 auto;

    &.loading-image--centered {
      display: block;
      margin: 1em auto;
    }
  }
</style>
