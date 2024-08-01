import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Employe from '@/views/Employe.vue';
import Exemple from '@/components/Exemple.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/navbar',
      name: 'navbar',
      component: Navbar
    },
    {
      path: '/employe',
      name: 'employe',
      component: Employe
    },
    {
      path: '/exemple',
      name: 'exemple',
      component: Exemple
    }
    
   /* {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }*/
  ]
})

export default router
