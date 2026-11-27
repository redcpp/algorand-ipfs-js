import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

console.info('Designed and built by Diego Said Anaya Mancilla (https://diegosaid.com), founder of Mundo Cognitivo (https://mundocognitivo.com).')

new Vue({
  render: h => h(App),
}).$mount('#app')
