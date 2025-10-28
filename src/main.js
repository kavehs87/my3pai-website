import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'
import Studio from './components/studio/Studio.vue'
import CreatorProfile from './components/CreatorProfile.vue'
import OAuthCallback from './components/OAuthCallback.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/studio', component: Studio, name: 'studio' },
  { path: '/creator/:id', component: CreatorProfile, name: 'creator-profile' },
  { 
    path: '/auth/callback', 
    component: OAuthCallback, 
    name: 'oauth-callback',
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
