<template>
  <div>

    <vue-qr :text="qrContent"
            :size="200">
    </vue-qr>

  </div>
</template>
<script>
import vueQr from 'vue-qr'

export default {
  components: {
    vueQr
  },
  data () {
    return {
      // qrContent: "https://www.xxx.html"
      qrContent: 'xmrbi'
    }
  },
  created () {
  },
  methods: {}
}

</script>
