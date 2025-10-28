import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import Studio from './components/studio/Studio.vue'
import CreatorProfile from './components/CreatorProfile.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/studio', component: Studio, name: 'studio' },
  { path: '/creator/:id', component: CreatorProfile, name: 'creator-profile' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
