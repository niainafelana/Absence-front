<template>
  <div class="top-navbar">
    <div class="left-section">
      <span class="user-id">Email:{{ email }}</span>
    </div>
    <div class="right-section">
      <a href="#" class="visit-website">{{ nom }}</a>
      <div class="user-profile">
        <i class="bi bi-person"></i>
        <span class="user-name">{{ role }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>

import { ref, onMounted } from 'vue';

const nom = ref('');
const role = ref('');
const email= ref('')

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
    email.value=decoded.email;
  }
};

onMounted(() => {
  getUtilisateur();
});</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";



.top-navbar {
  display: flex;
  justify-content: space-between; /* Assure que les sections gauche et droite sont bien placées */
  align-items: center; /* Aligne verticalement les éléments au centre */
  padding: 15px 40px;
  background-color:$text;
  border-bottom: 2px solid #ddd;
  width: 100%;
  box-shadow: 10px 10px 5px #F0F0F0;
}

.left-section {
  margin-left: 250px; /* Ajoute un espace à gauche pour éloigner l'ID du bord */
}

.left-section .user-id {
  color: #999;
  font-size: 14px;
  vertical-align: middle; /* Assure que le texte est centré verticalement */
}

.right-section {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.visit-website {
  color: #999;
  margin-right: 20px;
  font-size: 14px;
  text-decoration: none;
}

.user-profile {
  display: flex;
  align-items: center;
  color: #999;
}

.user-profile i {
  margin-right: 5px;
  font-size: 18px;
}

.user-profile .user-name {
  font-size: 14px;
}
</style>
