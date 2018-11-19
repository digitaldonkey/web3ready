<template>
  <ul :class="$style.list">
    <li
      :class="$style.listItem"
      v-for="provider in providers"
      :key="provider.id"
    >
      <SelectProviderRow
        :id="provider.id"
        :text="getTextData(provider.id)"
        :isAvailable="getAvailableMethod(provider.id)"
        :selectProvider="selectProvider"
      />
    </li>
  </ul>
</template>

<script>
import SelectProviderRow from './SelectProviderRow'


export default {
  name: 'SelectProvider',
  components: { SelectProviderRow },
  props: {
    providers: {
      type: Array,
      required: true,
    },
    selectProvider: {
      type: Function,
      required: true,
    },
  },
  methods: {
    getTextData(id) {
      return this.$t(`globals.providers.${id}`)
    },
    getAvailableMethod(id) {
      return this.web3ProviderApi[id].isAvailable
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" module>
.list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.listItem {
  display: block;
  margin-bottom: 1em;
}
</style>
