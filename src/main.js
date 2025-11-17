import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import Home from './components/Home.vue'
import Studio from './components/studio/Studio.vue'
import CreatorProfile from './components/CreatorProfile.vue'
import Profile from './components/profile/Profile.vue'
import TripEditor from './components/trips/TripEditor.vue'
import OAuthCallback from './components/OAuthCallback.vue'
import ItineraryMap from './components/ItineraryMap.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/studio', component: Studio, name: 'studio' },
  { path: '/creator/:id', component: CreatorProfile, name: 'creator-profile' },
  { path: '/profile', component: Profile, name: 'profile' },
  { path: '/trips/new', component: TripEditor, name: 'trip-new' },
  { path: '/trips/:id/edit', component: TripEditor, name: 'trip-edit', props: true },
  { path: '/itinerary-map', component: ItineraryMap, name: 'itinerary-map' },
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

const app = createApp(App)

app.use(router)

// Configure Toast plugin
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

app.mount('#app')
