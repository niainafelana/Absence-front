<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, onMounted } from "vue";
import { Chart, registerables } from 'chart.js';
import api from '../api'; // Assurez-vous que le chemin est correct

// Enregistrer les composants nécessaires de Chart.js
Chart.register(...registerables);

const absenceChart = ref(null);
const search = ref({
  nom_employe: '',
  pre_employe: '',
  startDate: '',
  endDate: ''
});
const data = ref({
  totalAbsences: 0,
  absencesByMonth: []
});
const error = ref(null);

// Fonction pour récupérer les données d'absences depuis l'API
async function fetchAbsences() {
  error.value = null; // Réinitialiser l'erreur
  try {
    const response = await api.get('/dashboard/state', { params: search.value });

    if (!response.data) {
      throw new Error("Aucune donnée retournée par l'API.");
    }

    data.value = response.data;

    // Une fois les données récupérées, initialiser le graphique
    initChart();
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
    error.value = 'Erreur lors de la récupération des données. Vérifiez vos critères de recherche.';
  }
}

// Fonction pour initialiser le graphique
let chartInstance = null;

function initChart() {
  // Tableau des noms de mois
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Convertir les numéros de mois en noms
  const months = data.value.absencesByMonth.map(entry => monthNames[entry.month - 1]);
  const totalAbsences = data.value.absencesByMonth.map(entry => entry.total_absences);

  const ctx = absenceChart.value.getContext('2d');

  // Détruire le graphique précédent s'il existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Créer un nouveau graphique et le stocker dans chartInstance
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months, // Utilisation des noms des mois
      datasets: [{
        label: 'Total des Absences',
        data: totalAbsences,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Récupérer les données lorsque le composant est monté
onMounted(fetchAbsences);
</script>

<template>
    <body>
        <div class="d-flex">
            <Navbar class="navbar" />
            <Utilisateur class="utilisateur" />
            <div class="container-lg">

                <!-- Formulaire de recherche -->
               <!-- Formulaire de recherche -->
               <form @submit.prevent="fetchAbsences" class="space-y-4 mx-4 md:mx-8 lg:mx-16">
  <div class="flex flex-wrap items-end space-x-4">
    <div class="flex-1">
      <label for="nom" class="block text-sm font-medium text-gray-700">Nom de l'employé</label>
      <input 
        type="text" 
        v-model="search.nom_employe" 
        id="nom" 
        placeholder="Entrez le nom"
        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
      />
    </div>

    <div class="flex-1">
      <label for="prenom" class="block text-sm font-medium text-gray-700">Prénom de l'employé</label>
      <input 
        type="text" 
        v-model="search.pre_employe" 
        id="prenom" 
        placeholder="Entrez le prénom"
        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
      />
    </div>

    <div class="flex-1">
      <label for="startDate" class="block text-sm font-medium text-gray-700">Date de début</label>
      <input 
        type="date" 
        v-model="search.startDate" 
        id="startDate"
        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
      />
    </div>

    <div class="flex-1">
      <label for="endDate" class="block text-sm font-medium text-gray-700">Date de fin</label>
      <input 
        type="date" 
        v-model="search.endDate" 
        id="endDate"
        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
      />
    </div>

    <div>
      <button type="submit" class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Rechercher
      </button>
    </div>
  </div>
</form>



                <!-- Nouvelle carte pour le total des absences -->
                <div class="flex space-x-6 mt-6">
  <!-- Nouvelle carte pour le total des absences -->
  <div class="absence-card bg-white p-4 rounded-lg shadow-md w-1/3">
    <h2 class="text-lg font-semibold mb-2">Total des Absences</h2>
    <p class="text-3xl font-bold text-indigo-600">{{ data.totalAbsences }}</p>
  </div>

  <!-- Graphique -->
  <div class="w-2/3">
    <canvas ref="absenceChart" width="400" height="200"></canvas>
  </div>
</div>

<!-- Affichage des erreurs -->
<div v-if="error" class="error text-red-500 mt-4">{{ error }}</div>

            </div>
        </div>
    </body>
</template>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

body {
  color: #566787;
  background-color: $text;
  font-family: 'Times New Roman', Times, serif;
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
  box-shadow: 10px 10px 10px 10px #F0F0F0;
  flex-direction: column;
}

.search-form {
  display: flex;
  flex-direction: column;
}

.search-fields {
  display: flex;
  gap: 10px; /* Espacement entre les champs */
  flex-wrap: wrap; /* Pour gérer le débordement si l'écran est trop petit */
}

.search-fields div {
  display: flex;
  flex-direction: column; /* Étiquette au-dessus de l'input */
}

.absence-card {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
