<template>
  <div>
    <container>
      <router-view></router-view>
    </container>
  </div>
</template>

<script>
import Container from '../../components/Container'
export default {
  name: 'site',
  components: {
    Container
  }
}
</script>

<style scope>

</style>
