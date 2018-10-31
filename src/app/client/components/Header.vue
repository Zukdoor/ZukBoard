<template>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    defaultActive() {
      const paths = window.location.pathname.split('/')
      paths.shift()
      return `/${paths.shift()}/${paths.shift()}`
    }
  },
  mounted() {

  },
  methods: {
    handleSelect() {
    },
    logout() {
      window.localStorage && window.localStorage.clear()
      const url = `${location.origin}/login`
      window.location.href = `/login/logout?cb=${encodeURIComponent(url)}`
    }
  }
}
</script>
<style>
.el-menu-header{
  position: relative;
  z-index: 88;
}
.align-right.el-submenu,
.align-right.el-menu-item{
  float: right !important;
}
.el-menu--horizontal > .el-menu-item ,
.el-menu--horizontal > .el-submenu .el-submenu__title{
  height: 40px;
  line-height: 40px;
}
.el-menu--horizontal .el-menu .el-menu-item, .el-menu--horizontal .el-menu .el-submenu__title {
  height: 28px;
  line-height: 28px;
}
.el-menu--horizontal .el-menu .el-menu-item{
  border-bottom: 1px solid #eee;
}
.avaror {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: 10px;
}
.el-menu--horizontal {
  border: 0 !important;
}
</style>
