<template>
  <body>
    <div class="flex">
      <Navbar class="navbar" />
      
      <div class="flex flex-col items-center justify-center h-screen bg-gray-100 flex-1">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div class="flex items-center mb-6"> <!-- Flex container for image and title -->
            <h2 class="text-2xl font-semibold mr-4">Profil Utilisateur</h2>
            <img 
              src="https://via.placeholder.com/100"
              alt="Photo utilisateur"
              class="rounded-full w-24 h-24" 
            />
          </div>
          <form @submit.prevent="updateProfile">
            <div class="mb-4">
              <label for="name" class="block text-gray-700 font-medium mb-2">Nom</label>
              <input
                type="text"
                v-model="user.nom"
                id="name"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div class="mb-4">
              <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                v-model="user.email"
                id="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            </div>
    
            <div class="mb-4">
              <label for="currentPassword" class="block text-gray-700 font-medium mb-2">Mot de passe actuel</label>
              <input
                type="password"
                v-model="currentPassword"
                id="currentPassword"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
    
            <div class="mb-6">
              <label for="newPassword" class="block text-gray-700 font-medium mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                v-model="newPassword"
                id="newPassword"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
    
            <button
              type="submit"
              class="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  </body>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import { reactive, onMounted, ref } from 'vue';
import api from "@/api";
import Swal from 'sweetalert2';

// Objet réactif pour stocker les informations utilisateur
const user = reactive({
  nom: '',
  email: '',
  role: ''
});

const currentPassword = ref(''); // Pour le mot de passe actuel
const newPassword = ref(''); // Pour le nouveau mot de passe

// Fonction de décodage de JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error);
    return null;
  }
}

// Fonction pour extraire les informations utilisateur depuis le token
function fetchUserFromToken() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.error('Token non trouvé');
    return;
  }

  // Utilisation de la fonction de décodage manuelle
  const decoded = parseJwt(token);
  if (decoded) {
    user.nom = decoded.nom;
    user.email = decoded.email;
    user.role = decoded.role;
  }
}

// Charger les informations utilisateur depuis le token lors du montage du composant
onMounted(fetchUserFromToken);

// Fonction pour mettre à jour le profil utilisateur
async function updateProfile() {
  const updatedData = {};

  // Ajoutez uniquement les champs modifiés
  if (user.nom) {
    updatedData.nom = user.nom;
  }
  if (user.email) {
    updatedData.email = user.email;
  }
  if (currentPassword.value) {
    updatedData.currentPassword = currentPassword.value;
  }
  if (newPassword.value) {
    updatedData.newPassword = newPassword.value;
  }

  try {
    const response = await api.put('/utile/api/update', updatedData);

    if (response.data.success) {
      // Mettez à jour le local storage avec le nouveau token si fourni par le backend
      if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
      }
 // Utilisation de SweetAlert pour afficher le message de succès
 cancel();
 Swal.fire({
      title: 'Succès',
      text: response.data.message,
      icon: 'success',
    });     
    }
  } catch (error) {
    Swal.fire({
      title: 'Erreur',
      text: error.response.data.message || 'Une erreur est survenue',
      icon: 'error',
    });  }
}
const cancel = () => {
   newPassword.value="";
   currentPassword.value="";
};
</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

body {
    color: #566787;
    background-color:$accent;
    font-family: "Times New Roman", Times, serif;
    font-size: 15px;
}
</style>
