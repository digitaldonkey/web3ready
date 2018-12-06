<template>
  <div :class="$style.error"><div :class="$style.emo">😰</div>There was an Error </div>
</template>

<script>
export default {
  name: 'AsyncError',
}
</script>

<style lang="scss" module>
  @import "../styles/_abstract";
  .error {
    @extend %modal-background;
    padding: 1em 1em 2em;
    color: $color_error;
    text-align: center;
  }
  .emo{
    padding: .5em 1em;
    font-size: 300%;
  }
</style>
