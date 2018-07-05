<template>
  <el-menu
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
    background-color="#fff"
    text-color="#333"
    active-text-color="#ffd04b"
    :default-active="defaultActive"
    :router="true">
    <el-submenu index="#">
      <template slot="title">File</template>
      <el-menu-item index="#">Test</el-menu-item>
      <el-menu-item index="#">Test</el-menu-item>
      <el-menu-item index="#">Test</el-menu-item>
    </el-submenu>
     <el-submenu index="#">
      <template slot="title">Edit</template>
      <el-menu-item index="#">Test</el-menu-item>
      <el-menu-item index="#">Test</el-menu-item>
      <el-menu-item index="#">Test</el-menu-item>
    </el-submenu>
    <!-- <el-submenu index="#"  class="align-right">
      <template slot="title"><img  class="avaror" src="../assets/default-avator.jpeg"/>{{this.user.name}}</template>
      <el-menu-item index="#" :disabled="true">{{this.user.name}}</el-menu-item>
      <el-menu-item index="#">设置</el-menu-item>
      <el-menu-item index="#" @click="logout">退出</el-menu-item>
    </el-submenu> -->
    <el-menu-item index="#" :route="null"  class="align-right" ><i class="el-icon-bell"></i></el-menu-item>
  </el-menu>
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
