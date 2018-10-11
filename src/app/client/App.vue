<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'app',
  mounted() {
    // const { user } = window.__dataset
    // this.setUser(user)
  },
  methods: {
    ...mapMutations({
      setUser: 'setUser'
    })
  }
}
</script>

<style>
html,body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #fff;
}
.echarts {
  height: 400px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e51;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
</style>
