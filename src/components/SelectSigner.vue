<template>
  <div
    class="signers"
  >
    <ul>
      <li
        v-for="signer in signers"
        :key="signer.id"
      >
        <SelectSignerRow
          :id="signer.id"
          :text="getTextData(signer.id)"
          :isAvailable="getAvailableMethod(signer.id)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import SelectSignerRow from './SelectSignerRow'


export default {
  name: 'SelectSigner',
  components: { SelectSignerRow },
  props: {
    signers: {
      type: Array,
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
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
li {
  display: block;
}
</style>
