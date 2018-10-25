<template>
  <div ref="container" style="height: calc(100% - 4px);" />
</template>

<script>
import PDFObject from 'pdfobject'
import userPdf from '~/assets/other/user.pdf'

export default {
  mounted() {
    this.$store.commit('setTitle', 'Допомога')

    PDFObject.embed(userPdf, this.$refs.container)
  },
}
</script>
