<template>
  <div class="sync-status-notify">
   <i class="iconfont" :class="'following-mode'">&#xe6b3;</i>同步中
  </div>
</template>

<script>
export default {

}
</script>

<style  lang='scss'>
.sync-status-notify{
  position: absolute;
  top: -1%;
  left: 50%;
  margin-left: -65px;
  padding: 10px 0px;
  z-index: -1;
  opacity: 0;
  width: 130px;
  text-align: center;
  background-color: #fff;
  border-radius: 3px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  transition: opacity .3s,transform .3s, top .4s;
  i.iconfont{
    color: green;
    margin-right: 10px;
    vertical-align: bottom;
  }
  &.show{
    top: 1%;
    opacity: 1;
     z-index: 999;
  }
}

</style>
