<template>
  <div :class="$style.loading"><loading :centered="true" /></div>
</template>

<script>
import Loading from './Loading'

export default {
  name: 'AsyncLoading',
  components: {
    Loading
  }
}
</script>

<style lang="scss" module>
  @import "../styles/_abstract";
  .loading {
    @extend %modal-background;
    padding: 2em 1em;
    color: $color_error;
    text-align: center;
  }
</style>
