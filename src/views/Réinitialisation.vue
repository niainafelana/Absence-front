<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Réinitialiser votre mot de passe</h2>
            <p class="text-sm text-gray-600 mb-6">
              Entrez votre email, le code reçu et votre nouveau mot de passe
            </p>
          </div>
          <form @submit.prevent="reinitialiserMotDePasse" class="space-y-4">
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
           
            </div>
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
                Code de réinitialisation
              </label>
              <input
                id="code"
                v-model="code"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez le code reçu par email"
              />
             
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                v-model="nouveauMotDePasse"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez votre nouveau mot de passe"
              />
            
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Réinitialiser le mot de passe
            </button>
          </form>
  
          <!-- Div pour le message de succès ou d'erreur -->
          <div v-if="message" :class="messageClass" class="mt-4 text-center">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import api from "../api"; // Import de votre instance API

  
  const route = useRoute();
  const email = ref(route.query.email || '');
  const code = ref('');
  const nouveauMotDePasse = ref('');
  const message = ref('');
  const messageClass = ref('');
  const emailError = ref(''); // Ajoutez une gestion des erreurs pour l'email
  const codeError = ref('');   // Ajoutez une gestion des erreurs pour le code
  const passwordError = ref(''); // Ajoutez une gestion des erreurs pour le mot de passe
  
  const reinitialiserMotDePasse = async () => {
    message.value = ''; // Réinitialiser le message à chaque tentative
    try {
      const response = await api.post('/utile/verifiercode', {
        email: email.value,
        code: code.value,
        nouveauMotDePasse: nouveauMotDePasse.value,
      });
  
      // En cas de succès, afficher le message de confirmation
      message.value = response.data.message;
      messageClass.value = 'text-green-600'; // Classe pour le succès
  
      setTimeout(() => {
        window.location.href = '/home';
      }, 2000);
    } catch (error) {
      // En cas d'erreur, afficher le message d'erreur
      message.value = error.response?.data?.message || 'Une erreur est survenue';
      messageClass.value = 'text-red-600'; // Classe pour les erreurs
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
  