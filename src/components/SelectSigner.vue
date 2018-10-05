<template>
  <div
    class="signers"
  >
    <ul>
      <li
        v-for="signer in signersProcessed"
        :key="signer.id"
      >
        <SelectSignerRow
          v-bind="signer"
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
  computed: {
    signersProcessed() {
      const prepared = []
      this.signers.forEach((signer) => {
        prepared.push(Object.assign(
          signer,
          {
            isAvailable: this.web3ProviderApi[signer.id].isAvailable,
          },
        ))
      })
      return prepared
    },
  },
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
