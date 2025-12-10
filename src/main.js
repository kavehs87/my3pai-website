import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import Home from './components/Home.vue'
import Studio from './components/studio/Studio.vue'
import Profile from './components/profile/Profile.vue'
import OAuthCallback from './components/OAuthCallback.vue'
import MapBuilder from './components/MapBuilder.vue'
import PublishedMap from './components/published-map/PublishedMap.vue'
import InfluencerProfile from './shared/influencer/InfluencerProfile.vue'
import MediaAssetsLibraryRoute from './shared/influencer/routes/MediaAssetsLibraryRoute.vue'
import MasterclassesLibraryRoute from './shared/influencer/routes/MasterclassesLibraryRoute.vue'
import CheckoutSuccess from './views/checkout/CheckoutSuccess.vue'
import CheckoutCancel from './views/checkout/CheckoutCancel.vue'
// Dark-blue theme views
import HomeView from './themes/dark-blue/views/HomeView.vue'
import PodcastsView from './themes/dark-blue/views/PodcastsView.vue'
import BlogView from './themes/dark-blue/views/BlogView.vue'
import BlogPostView from './themes/dark-blue/views/BlogPostView.vue'
import MapsView from './themes/dark-blue/views/MapsView.vue'
import ClassesView from './themes/dark-blue/views/ClassesView.vue'
import AssetsView from './themes/dark-blue/views/AssetsView.vue'
import SocialsView from './themes/dark-blue/views/SocialsView.vue'
import ConsultationView from './themes/dark-blue/views/ConsultationView.vue'
import CheckoutView from './themes/dark-blue/views/CheckoutView.vue'
import ContactView from './themes/dark-blue/views/ContactView.vue'
import TermsView from './themes/dark-blue/views/TermsView.vue'
import PrivacyView from './themes/dark-blue/views/PrivacyView.vue'
import './style.css'

const routes = [
  { path: '/', component: Home },
  { path: '/studio', component: Studio, name: 'studio' },
  { path: '/profile', component: Profile, name: 'profile' },
  { path: '/map-builder', component: MapBuilder, name: 'map-builder' },
  {
    path: '/influencer/:username',
    component: InfluencerProfile,
    name: 'influencer-profile',
    props: true,
    children: [
      {
        path: '',
        name: 'influencer-home',
        component: HomeView,
        props: true,
      },
      {
        path: 'podcasts',
        name: 'influencer-podcasts',
        component: PodcastsView,
        props: true,
      },
      {
        path: 'blog',
        name: 'influencer-blog',
        component: BlogView,
        props: true,
      },
      {
        path: 'blog/:slug',
        name: 'influencer-blog-post',
        component: BlogPostView,
        props: true,
      },
      {
        path: 'maps',
        name: 'influencer-maps',
        component: MapsView,
        props: true,
      },
      {
        path: 'classes',
        name: 'influencer-classes',
        component: ClassesView,
        props: true,
      },
      {
        path: 'assets',
        name: 'influencer-assets',
        component: AssetsView,
        props: true,
      },
      {
        path: 'socials',
        name: 'influencer-socials',
        component: SocialsView,
        props: true,
      },
      {
        path: 'consultation',
        name: 'influencer-consultation',
        component: ConsultationView,
        props: true,
      },
      {
        path: 'checkout',
        name: 'influencer-checkout',
        component: CheckoutView,
        props: true,
      },
      {
        path: 'contact',
        name: 'influencer-contact',
        component: ContactView,
        props: true,
      },
      {
        path: 'terms',
        name: 'influencer-terms',
        component: TermsView,
        props: true,
      },
      {
        path: 'privacy',
        name: 'influencer-privacy',
        component: PrivacyView,
        props: true,
      },
    ],
  },
  {
    path: '/influencer/:username/media-assets',
    component: MediaAssetsLibraryRoute,
    name: 'media-assets-library',
    props: true,
  },
  {
    path: '/influencer/:username/masterclasses',
    component: MasterclassesLibraryRoute,
    name: 'masterclasses-library',
    props: true,
  },
  { 
    path: '/auth/callback', 
    component: OAuthCallback, 
    name: 'oauth-callback',
    props: true
  },
  {
    path: '/u/:username/:slug',
    component: PublishedMap,
    name: 'published-map',
    props: true
  },
  {
    path: '/checkout/success',
    component: CheckoutSuccess,
    name: 'checkout-success'
  },
  {
    path: '/checkout/cancel',
    component: CheckoutCancel,
    name: 'checkout-cancel'
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top on route change
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
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
