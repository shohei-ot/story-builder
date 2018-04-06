<template>
  <div class="test">test</div>
</template>

<script>
export default {
  props: {
    isTesting: Boolean
  },
  data() {
    return { debug: true }
  }
}
</script>

<style scoped>
.test {
  border: 1px solid #000;
}
</style>