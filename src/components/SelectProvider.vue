<template>
  <ul :class="$style.list">
    <li
      :class="$style.listItem"
      v-for="signer in signers"
      :key="signer.id"
    >
      <SelectProviderRow
        :id="signer.id"
        :text="getTextData(signer.id)"
        :isAvailable="getAvailableMethod(signer.id)"
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
    signers: {
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
      return this.$t(`globals.signers.${id}`)
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
