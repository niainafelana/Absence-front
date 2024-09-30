import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Employe from '@/views/Employe.vue';
import Exemple from '@/components/Exemple.vue';
import Home from '@/views/Home.vue';
import Utilisateur from '@/components/Utilisateur.vue';
import Demande from '@/views/Demande.vue';
import Demandee from '@/views/Demandee.vue';
import Dashboard from '@/views/Dashboard.vue';
import Accueil from '@/views/Accueil.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/navbar',
      name: 'navbar',
      component: Navbar,
      meta: { requiresAuth: true }, // On protège cette page
    },
    {
      path: '/employe',
      name: 'employe',
      component: Employe,
      meta: { requiresAuth: true, role: ['ADMINISTRATEUR'] }, // Accessible par les utilisateurs et admins
    },
    {
      path: '/exemple',
      name: 'exemple',
      component: Exemple,
      meta: { requiresAuth: true }, // On protège cette page

    },
    {
      path:'/',
      name:'home',
      component:Home,

    },
    {
      path:'/utilisateur',
      name:'utilisteur',
      component:Utilisateur,
      meta: { requiresAuth: true }, // On protège cette page

    },
    {
path:'/accueil',
name:'accueil',
component:Accueil,
meta:{requiresAuth:true},
    },
    {
      path:'/fangatahana',
      name:'fangatahana',
      component:Demande
    }
    ,{
      path:'/demande',
      name: 'demande',
      component: Demandee,
      meta: { requiresAuth: true }, // On protège cette page

    },
    {
      path:'/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }, // On protège cette page


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
});
// Fonction pour obtenir le rôle à partir du token
const getRoleFromToken = (token) => {
  if (!token) return null;

  const payload = token.split('.')[1]; // Récupère la partie payload
  const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/'); // Normalise le payload
  const jsonPayload = decodeURIComponent(atob(base64Url).split('').map((c) => '%' 
  + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')); // Décodage
  const parsedPayload = JSON.parse(jsonPayload); // Parse le JSON

  return parsedPayload.role; // Récupère le rôle
};

// Guard de navigation
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token'); // Vérifie si l'utilisateur a un token

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Si la route nécessite une authentification
    if (!token) {
      localStorage.removeItem('access_token'); // Supprime le token si non valide
      next({ name: 'home', replace: true }); // Redirige vers login sans possibilité de retour
    } else {
      const userRole = getRoleFromToken(token); // Récupère le rôle à partir du token

      if (to.meta.role && !to.meta.role.includes(userRole)) {
        // Si l'utilisateur n'a pas le bon rôle
        localStorage.removeItem('access_token'); // Supprime le token si le rôle est incorrect
        next({ name: 'home', replace: true }); // Redirige vers login sans possibilité de retour
      } else {
        next(); // Permet la navigation si tout est correct
      }
    }
  } else {
    next(); // Permet la navigation pour les routes publiques
  }
});



export default router
