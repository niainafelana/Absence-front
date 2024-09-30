<script setup>
import { RouterLink } from 'vue-router';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { computed } from 'vue';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('access_token');
  router.replace({ name: 'home' }); 
  
  window.location.reload();
};

onMounted(() => {
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }

  // Bloquer le bouton "Retour"
  window.history.pushState(null, '', window.location.href);
  window.onpopstate = function () {
    window.history.pushState(null, '', window.location.href);
  };
});


const getRoleFromToken = (token) => {
  if (!token) return null;

  const payload = token.split('.')[1]; // Récupère la partie payload
  const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/'); // Normalise le payload
  const jsonPayload = decodeURIComponent(atob(base64Url).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')); // Décodage
  const parsedPayload = JSON.parse(jsonPayload); // Parse le JSON

  return parsedPayload.role; // Récupère le rôle
};


// Récupère le rôle de l'utilisateur à partir du token, s'il est authentifié
const userRole = computed(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    return getRoleFromToken(token); // Extrait et retourne le rôle
  }
  return null;
});
</script>

<template>

  <body class="body">
    <div class="container-fluid">
      <div class="row flex-nowrap">
        <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0 ">
          <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a href="" class="d-flex align-items-center text-white text-decoration-none" id="dropdownUser1"
              data-bs-toggle="dropdown" aria-expanded="false">
              <img src="../assets/sary/1721891607125.jpg" alt="hugenerd" width="30" height="30" class="rounded-circle">
              <span class="fs-6 d-none d-sm-inline">GestionAbsences</span> </a>

            <!--Navbar-->
            <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li class="nav-item">
                <RouterLink to="/accueil" class="nav-link align-middle px-0">
                  <i class="fs-5 bi bi-house-fill"></i>
                  <span class="ms-1 d-none d-sm-inline">Accueil</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/dashboard" class="nav-link align-middle px-0">
                  <i class="fs-5 bi bi-bar-chart-line-fill"></i>
                  <span class="ms-1 d-none d-sm-inline">Dashboard</span>
                </RouterLink>
              </li>
              <li class="nav-item" v-if="userRole === 'ADMINISTRATEUR'">
                <RouterLink to="/employe" class="nav-link align-middle px-0">
                  <i class="fs-5 bi bi-file-earmark-person"></i> <span class="ms-1 d-none d-sm-inline">Employe</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/demande" class="nav-link align-middle px-0">
                  <i class="fs-6 bi bi-calendar3"></i> <span class="ms-1 d-none d-sm-inline">Demande</span>
                </RouterLink>
              </li>

            </ul>
            <hr>
            <div class="dropdown pb-4">
              <li class="nav-item" style="list-style: none;">
                <RouterLink to="" class="nav-link align-middle px-0">
                  <i class=" fs-5 bi bi-box-arrow-left"></i>
                  <span class="ms-1 d-none d-sm-inline" @click="logout">Deconnexion</span>
                </RouterLink>
              </li>
            </div>
          </div>
        </div>

      </div>
    </div>

  </body>

</template>
<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

.body {
  background-color: $accent;
  position: fixed;
}

a {
  background-color: $accent;
  margin-bottom: 12%;
}

.nav-link {
  display: flex;
  align-items: center;
}

li i {
  color: $primary;
  font-weight: bold;
  font-size: 10px;
}

span {
  color: $primary;
  font-weight: bold;
  display: flex;
  font-size: 15px;
}

.nav-item:first-child {
  margin-top: 20px;
  /* Ajuste la valeur selon tes besoins */
}
</style>