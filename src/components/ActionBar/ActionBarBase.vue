<script setup lang="ts">
</script>

<template>
  <div class="w-full h-11 flex justify-between items-center px-2 bg-blue-500 rounded-3xl">
    <!--Left hand side of the action bar-->
    <div>
      <slot name="left"/>
    </div>

    <!--Right hand side of the action bar-->
    <div>
      <slot name="right"/>
    </div>
  </div>
</template>
