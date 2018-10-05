export default {
  methods: {
    createTooltip(msg) {
      return {
        content: msg,
        placement: 'auto',
        classes: ['info'],
        targetClasses: ['has-tooltip'],
        trigger: 'hover focus click',
        delay: {
          show: 300,
          hide: 500,
        },
      }
    }
  }
}
