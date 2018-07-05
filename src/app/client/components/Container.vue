<template>
  <div>
    <app-header></app-header>
    <div class="main">
      <div class="app-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from './Header'
export default {
  name: 'app-container',
  components: {
    AppHeader
  }
}
</script>

<style>

</style>
