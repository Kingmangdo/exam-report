<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
#app {
  min-height: 100vh;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #1e3a8a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1e40af;
}
</style>
