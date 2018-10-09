<template>
  <span class="loading-image" />
</template>

<script>
export default {
  name: 'Loading',
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
  }
</style>
