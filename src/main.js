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
// Theme-aware view components
import ThemeAwareView from './shared/influencer/routes/ThemeAwareView.vue'
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
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'HomeView', ...route.params }),
      },
      {
        path: 'podcasts',
        name: 'influencer-podcasts',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'PodcastsView', ...route.params }),
      },
      {
        path: 'blog',
        name: 'influencer-blog',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'BlogView', ...route.params }),
      },
      {
        path: 'blog/:slug',
        name: 'influencer-blog-post',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'BlogPostView', ...route.params }),
      },
      {
        path: 'maps',
        name: 'influencer-maps',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'MapsView', ...route.params }),
      },
      {
        path: 'classes',
        name: 'influencer-classes',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'ClassesView', ...route.params }),
      },
      {
        path: 'assets',
        name: 'influencer-assets',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'AssetsView', ...route.params }),
      },
      {
        path: 'socials',
        name: 'influencer-socials',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'SocialsView', ...route.params }),
      },
      {
        path: 'consultation',
        name: 'influencer-consultation',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'ConsultationView', ...route.params }),
      },
      {
        path: 'checkout',
        name: 'influencer-checkout',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'CheckoutView', ...route.params }),
      },
      {
        path: 'contact',
        name: 'influencer-contact',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'ContactView', ...route.params }),
      },
      {
        path: 'terms',
        name: 'influencer-terms',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'TermsView', ...route.params }),
      },
      {
        path: 'privacy',
        name: 'influencer-privacy',
        component: ThemeAwareView,
        props: (route) => ({ viewName: 'PrivacyView', ...route.params }),
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
