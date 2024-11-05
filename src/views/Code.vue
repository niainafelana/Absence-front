<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
            <p class="text-sm text-gray-600 mb-6">
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation
            </p>
          </div>
          <form @submit.prevent="envoyerOTP" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="exemple@gmail.com"
              />
              <transition name="fade">
                <p v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</p>
              </transition>
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Envoyer le lien de réinitialisation
            </button>
          </form>
          <div class="mt-4 text-center">
            <router-link to="/home" class="text-sm text-blue-600 hover:underline">Retour à la page de connexion</router-link>

          </div>
          <div v-if="message" :class="{'alert-success': success, 'alert-danger': !success}" class="alert mt-3">
      {{ message }}
    </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();
const email = ref('');
import api from "../api"; // Import de votre instance API
const message = ref('')
const success = ref('')

const envoyerOTP = async () => {
  try {
    const response = await api.post('/utile/mdpoublie', { email: email.value });
    console.log(response); // Ajoutez ceci pour voir ce que renvoie le serveur
    message.value = response.data.message;
    success.value = true;
    // Redirection après succès
    router.push({ 
      path: '/reinitialisation', 
      query: { email: email.value } 
    }); // Redirige vers la page de réinitialisation avec l'email
  } catch (error) {
    console.log(error); // Ajoutez ceci pour voir l'erreur en détail
    message.value = error.response?.data.message || 'Une erreur est survenue';
    success.value = false;
  }
};
  </script>
  
  <style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>