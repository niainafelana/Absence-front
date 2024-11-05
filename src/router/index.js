import { createRouter, createWebHistory } from "vue-router";
import Navbar from "../components/Navbar.vue";
import Employe from "@/views/Employe.vue";
import Exemple from "@/components/Exemple.vue";
import Home from "@/views/Home.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import Demande from "@/views/Demande.vue";
import Demandee from "@/views/Demandee.vue";
import Dashboard from "@/views/Dashboard.vue";
import Accueil from "@/views/Accueil.vue";
import Departement from "@/views/Departement.vue";
import User from "@/views/User.vue";
import Absence from "@/views/Absence.vue";
import Poste from "@/views/Poste.vue";
import Code from "@/views/Code.vue";
import Réinitialisation from "@/views/Réinitialisation.vue";
import Profil from "@/views/Profil.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/navbar",
      name: "navbar",
      component: Navbar,
      meta: { requiresAuth: true }, 
    },
    {
      path: "/employe",
      name: "employe",
      component: Employe,
      meta: { requiresAuth: true, /*role: ["ADMINISTRATEUR"]*/ }, 
    },
    {
      path:"/code",
      name:"code",
      component: Code,

    },
    {
      path:"/profil",
      name:"profile",
      component:Profil,
    },
    {
      path:"/reinitialisation",
      name:"reinitialisation",
      component:Réinitialisation,

    },
    {
      path: "/exemple",
      name: "exemple",
      component: Exemple,
      meta: { requiresAuth: true },
    },
    {
      path: "/home",
      name: "home",
      component: Home,

    },
    {
      path: "/utilisateur",
      name: "utilisteur",
      component: Utilisateur,
      meta: { requiresAuth: true }, // On protège cette page
    },
    {
      path: "/accueil",
      name: "accueil",
      component: Accueil,
      meta: { requiresAuth: true },
    },
    {
      path: "/fangatahana",
      name: "fangatahana",
      component: Demande,
    },
    {
      path: "/demande",
      name: "demande",
      component: Demandee,
      meta: { requiresAuth: true }, // On protège cette page
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
      meta: { requiresAuth: true }, // On protège cette page
    },
    {
      path: "/user",
      name: "user",
      component: User,
      meta: { requiresAuth: true }, // On protège cette page
    },
    {
      path: "/type",
      name: "type",
      component: Absence,
    },
    {
      path: "/departement",
      name: "departement",
      component: Departement,
    },
    {
      path: "/poste",
      name: "/poste",
      component: Poste,
    },
    /* {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }*/
  ],
});
// Fonction pour obtenir le rôle à partir du token
const getRoleFromToken = (token) => {
  if (!token) return null;

  const payload = token.split(".")[1]; 
  const base64Url = payload.replace(/-/g, "+").replace(/_/g, "/"); 
  const jsonPayload = decodeURIComponent(
    atob(base64Url)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  ); 
  const parsedPayload = JSON.parse(jsonPayload); 

  return parsedPayload.role; 
};

// Guard de navigation
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access_token"); 

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      localStorage.removeItem("access_token"); 
      next({ name: "home", replace: true }); 
    } else {
      const userRole = getRoleFromToken(token); 

      if (to.meta.role && !to.meta.role.includes(userRole)) {
       
        localStorage.removeItem("access_token"); 
        next({ name: "home", replace: true }); 
      } else {
        next(); 
      }
    }
  } else {
    next(); 
  }
});

export default router;
