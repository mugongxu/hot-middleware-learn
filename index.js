import { createApp, h } from 'vue';
// import App from './App.vue';

createApp({
  data() {
    return {
      name: 'xuguoqian',
      count: 4
    };
  },
  created() {},
  methods: {
    addFn() {
      this.count++;
    }
  },
//   render() {
//     return h('div', {}, this.count)
//   },
  template: '<div><span>{{ name }}</span><span>{{ count }}</span><button @click="addFn">add</button></div>'
}).mount('#app');
