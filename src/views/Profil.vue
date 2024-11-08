<template>

  <body>
    <div class="flex">
      <Navbar />
      <Utilisateur class="utilisateur" />

      <div class="container-lg min-h-screen flex flex-col items-center justify-start bg-white p-0 mt-10">
  <div class="w-full max-w-lg">
    <div class="flex items-center mb-6 justify-center"> <!-- Centrer l'en-tête -->
      <h2 class="text-2xl font-semibold text-center">Mon Profil</h2>
    </div>
    <form @submit.prevent="updateProfile" autocomplete="off">
      <input type="text" name="id" v-model="user.id" hidden>

      <div class="mb-4">
        <label for="name" class="block text-gray-700 font-medium mb-2">Nom</label>
        <input type="text" v-model="user.nom" id="name"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          required />
      </div>

      <div class="mb-4">
        <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
        <input type="email" v-model="user.email" id="email"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          required />
      </div>

      <div class="mb-4 relative">
        <label for="currentPassword" class="block text-gray-700 font-medium mb-2">Mot de passe actuel</label>
        <input :type="passwordFieldType" v-model="currentPassword" id="currentPassword"
          class="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />

        <i :class="['fas', iconClass, 'toggle-password']" @click="togglePasswordVisibility"
          class="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-500 cursor-pointer">
        </i>
      </div>

      <div class="mb-6 relative">
        <label for="newPassword" class="block text-gray-700 font-medium mb-2">Nouveau mot de passe</label>
        <input :type="passwordField" v-model="newPassword" id="newPassword"
          class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />

        <i :class="['fas', iconClasse, 'toggle-password']" @click="togglePasswordVisibilityy"
          class="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-500 cursor-pointer">
        </i>
      </div>

      <button type="submit"
        class="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200">
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
import Utilisateur from "@/components/Utilisateur.vue";
import { reactive, onMounted, ref, computed } from 'vue';
import api from "@/api";
import Swal from 'sweetalert2';
const isPasswordVisible = ref(false);
const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'));
const iconClass = computed(() => (isPasswordVisible.value ? 'fa-eye' : 'fa-eye-slash'));
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const visiblepassword = ref(false);
const passwordField = computed(() => (visiblepassword.value ? 'text' : 'password'));
const iconClasse = computed(() => (visiblepassword.value ? 'fa-eye' : 'fa-eye-slash'));
const togglePasswordVisibilityy = () => {
  visiblepassword.value = !visiblepassword.value;
};



// Objet réactif pour stocker les informations utilisateur
const user = reactive({
  nom: '',
  email: '',
  role: '',
  id: ''
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
    user.id = decoded.id;
  }
}

// Charger les informations utilisateur depuis le token lors du montage du composant
onMounted(fetchUserFromToken);

// Fonction pour mettre à jour le profil utilisateur
async function updateProfile() {
  const updatedData = {};
  updatedData.id = user.id;

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
    // Affichage du message d'erreur reçu depuis le backend
    Swal.fire({
      title: 'Erreur',
      text: error.response?.data?.message || 'Une erreur est survenue',
      icon: 'error',
    });
  }
}

// Fonction pour réinitialiser les champs de mot de passe
const cancel = () => {
  newPassword.value = "";
  currentPassword.value = "";
};

</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

body {
  font-family: "Times New Roman", Times, serif;
  font-size: 15px;

}

.d-flex {
  display: flex;
}

.navbar {
  height: 100vh;
  position: fixed;
  left: 0;
}

.container-lg {
  margin-left: 17%;
  width: 100%;
  padding: 1px;
  position: fixed;
  margin-top: 7%;
  margin-left: 15.5%;
  flex-direction: column;
}
</style>
