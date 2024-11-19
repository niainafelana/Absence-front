<template>
  <div class="top-navbar">
    <div class="left-section">
      <span class="user-id">{{ email }}</span>
    </div>
    <div class="right-section">
      <div class="user-profile">
        <i class="bi bi-person"></i>
        <span class="user-name">{{ role }}</span>
      </div>
      <button class="logout-section" @click="confirmLogout" type="button" aria-label="Logout">
        <i class="fs-5 bi bi-power logout-icon"></i>
      </button>

    </div>
  </div>
</template>
<script setup>
const router = useRouter();
import Swal from "sweetalert2";


import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';


const nom = ref('');
const role = ref('');
const email = ref('')

const logout = () => {
  localStorage.removeItem('access_token');
  router.replace({ name: 'home' });
  window.location.reload();
};

const confirmLogout = () => {
  Swal.fire({
    title: 'Voulez-vous vraiment vous déconnecter ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, se déconnecter',
    cancelButtonText: 'Annuler',
  }).then((result) => {
    if (result.isConfirmed) {
      logout();
    }
  });
};

onMounted(() => {
  // Suppression du cache
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
const decode = (str) => {
  const base = str.replace(/-/g, '+').replace(/_/g, '/');
  const jsonpayload = decodeURIComponent(
    atob(base)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonpayload);
};

const getUtilisateur = () => {
  const token = localStorage.getItem('access_token'); // Assurez-vous que le nom est correct
  if (token) {
    const payload = token.split('.')[1]; // Récupère la partie du payload
    const decoded = decode(payload); // Décodage manuel
    nom.value = decoded.nom_user; // Extraire le nom
    role.value = decoded.role; // Extraire le rôle
    email.value = decoded.email;
  }
};

onMounted(() => {
  getUtilisateur();
});</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";



.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background-color: $text;
  border-bottom: 2px solid #ddd;
  width: 100%;
}



.left-section .user-id {
  color: $primary;
  font-size: 14px;
  vertical-align: middle;
  font-weight: bold;
  /* Assure que le texte est centré verticalement */
}

.right-section {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 40px;
  /* Ajoute un espace de 20px entre les éléments de la section */

}


.visit-website {
  color: $primary;
  margin-right: 20px;
  font-size: 14px;
  text-decoration: none;
  font-weight: bold;
}

.user-profile {
  display: flex;
  align-items: center;
  color: $primary;
  font-weight: bold;
}

.user-profile i {
  margin-right: 5px;
  font-size: 18px;
}

.user-profile .user-name {
  font-size: 14px;
}

.logout-icon {
  color: $accent;
  transform: scale(1.1);
  background-color: $primary;
  border-radius: 50%;
  padding-left: 4px;
  padding-right: 4px;
  padding-bottom: 3px;
}
</style>
