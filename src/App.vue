<template>
  <div id="app">
    <span>{{ name }}</span>
    <span>{{ count }}</span>
    <button @click="addFn">添加</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '你好吗？123',
      count: 4
    };
  },
  created() {},
  methods: {
    addFn() {
      this.count++;
    }
  }
};
</script>
