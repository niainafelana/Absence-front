<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import api from "../api";
import { registerables } from "chart.js";
const barChart = ref(null);
const startDate = ref("");
const endDate = ref("");
const filterType = ref("mois");
const absenceStats = ref({
  totalAbsences: 0,
  absencesByFilter: [],
  totalAbsencesParType: [],
});

// Enregistrer les composants nécessaires de Chart.js
Chart.register(...registerables);

const fetchAbsences = async (employee) => {
  try {
    const response = await api.get("/dashboard/tableaudeboard", {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        filtre: filterType.value,
      },
    });

    if (response.data) {
      console.log("Données reçues de l'API:", response.data); // Log pour vérifier les données
      absenceStats.value = response.data;
      renderCharts();
    } else {
      console.error(
        "Erreur : données non définies dans la réponse",
        response.data
      );
      absenceStats.value = { totalAbsences: 0 };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des absences:", error);
  }
};

const filterAbsences = async () => {
  try {
    const response = await api.get("/dashboard/tableaudeboard", {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        filtre: filterType.value,
      },
    });

    if (response.data) {
      console.log(response.data);
      absenceStats.value = response.data;
      renderCharts();
    } else {
      console.error(
        "Erreur : données non définies dans la réponse",
        response.data
      );
      absenceStats.value = { totalAbsences: 0 };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des absences :", error);
  }
};

// Fonction pour formater la date au format JJ-MM-AAAA
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return date.toLocaleDateString("fr-FR", options);
};

// Fonction pour obtenir le nom du mois
const getMonthName = (monthNumber) => {
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return monthNames[monthNumber];
};

const renderCharts = () => {
  let labelsBar = [];
  let dataBar = [];
  let totalDureeData = [];

  // Initialisation des datasets pour les types d'absences
  let lineChartData = {};
  let absenceTypes = [];

  // Gestion des différents filtres
  switch (filterType.value) {
    case "jour":
      labelsBar = absenceStats.value.absencesByFilter.map((item) =>
        formatDate(item.date)
      );
      dataBar = absenceStats.value.absencesByFilter.map(
        (item) => item.total_absences
      );
      totalDureeData = absenceStats.value.absencesByFilter.map(
        (item) => item.total_duree || 0
      );
      break;
    case "semaine":
      labelsBar = absenceStats.value.absencesByFilter.map(
        (item) => `Semaine ${item.week}`
      );
      dataBar = absenceStats.value.absencesByFilter.map(
        (item) => item.total_absences
      );
      totalDureeData = absenceStats.value.absencesByFilter.map(
        (item) => item.total_duree || 0
      );
      break;
    case "mois":
      labelsBar = absenceStats.value.absencesByFilter.map((item) =>
        getMonthName(item.month - 1)
      );
      dataBar = absenceStats.value.absencesByFilter.map(
        (item) => item.total_absences
      );
      totalDureeData = absenceStats.value.absencesByFilter.map(
        (item) => item.total_duree || 0
      );
      break;
    case "annee":
      labelsBar = absenceStats.value.absencesByFilter.map((item) => item.year);
      dataBar = absenceStats.value.absencesByFilter.map(
        (item) => item.total_absences
      );
      totalDureeData = absenceStats.value.absencesByFilter.map(
        (item) => item.total_duree || 0
      );
      break;
    default:
      console.error("Filtre inconnu :", filterType.value);
      return;
  }

  absenceStats.value.totalAbsencesParType.forEach((item) => {
    if (!lineChartData[item.type_absence]) {
      lineChartData[item.type_absence] = new Array(labelsBar.length).fill(0); // Initialiser avec des zéros
      absenceTypes.push(item.type_absence);
    }
    console.log(absenceStats.value.absencesByFilter);

    // Appliquer le filtre sur les données de type d'absence
    let index;
    switch (filterType.value) {
      case "jour":
        // Utiliser le format DD/MM/YYYY pour la comparaison
        index = labelsBar.findIndex(
          (label) =>
            formatDateToDDMMYYYY(label) === formatDateToDDMMYYYY(item.date)
        );
        if (index === -1) {
          console.warn(
            `Date non trouvée pour l'item avec la date : ${formatDateToDDMMYYYY(
              item.date
            )}`
          );
        }
        break;
      case "semaine":
        index = labelsBar.findIndex(
          (label) => label === `Semaine ${item.week}`
        );
        break;
      case "mois":
        index = labelsBar.findIndex(
          (label) => label === getMonthName(item.month - 1)
        );
        break;
      case "annee":
        index = labelsBar.findIndex(
          (label) => label.toString() === item.year.toString()
        );
        break;
      default:
        index = -1;
        break;
    }

    if (index !== -1) {
      lineChartData[item.type_absence][index] += item.total_absences;
    }
  });
  function formatDateToDDMMYYYY(date) {
    const d = new Date(date);
    const day = `0${d.getDate()}`.slice(-2);
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Graphique à barres
  if (barChart.value) {
    barChart.value.destroy();
  }
  barChart.value = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: labelsBar,
      datasets: [
        {
          label: "Total des absences",
          data: dataBar,
          backgroundColor: "#4A919E",
          borderColor: "#DBF9E7",
          borderWidth: 1,
          yAxisID: "absences", // Axe pour le total des absences
        },

      ],
    },
    options: {
      responsive: true,
      scales: {
        absences: {
          type: "linear",
          position: "left",
          beginAtZero: true,
          title: {
            display: true,
            text: "Total des absences",
          },
        },

      },

    },
  });
};

// Variable pour stocker les données récupérées
const absencesByYear = ref([]);

// Fonction pour récupérer les données de l'API
const fetchData = async () => {
  try {
    const response = await api.get('/dashboard/tableauannee'); // Assurez-vous que l'URL est correcte
    console.log("Données reçues de l'API:", response.data);

    // Stockez les données dans la variable absencesByYear
    absencesByYear.value = response.data.absencesByYear;

    // Créez le graphique après avoir récupéré les données
    createLineChart();
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
  }
};


const createLineChart = () => {
  const ctx = document.getElementById('lineChart').getContext('2d');

  // Extraction des années (labels) et des absences (total_absences)
  const labels = absencesByYear.value.map(entry => entry.year);  // Années
  const totalAbsences = absencesByYear.value.map(entry => entry.total_absences);  // Total des absences

  console.log("Labels (Années):", labels);  // Affiche les années
  console.log("Total Absences:", totalAbsences);  // Affiche le total des absences

  // Création du graphique
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,  // Années sur l'axe des abscisses
      datasets: [{
        label: 'Total Absences par Année',
        data: totalAbsences,  // Total des absences sur l'axe des ordonnées
        fill: false,
        borderColor: '#42A5F5',  // Couleur de la ligne
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true  // L'axe des ordonnées commence à zéro
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `Absences: ${tooltipItem.raw}`;  // Affiche le nombre d'absences lors du survol
            }
          }
        }
      }
    }
  });
};

// Appeler la fonction pour récupérer les données lors du montage du composant
onMounted(() => {
  fetchData();
});
onMounted(fetchAbsences);
</script>

<template>

  <body>
    <div class="d-flex flex-column flex-md-row" style="height: 100vh; overflow: hidden">
      <!-- Navbar à gauche, largeur fixe -->
      <div class="navbar-left" style="width: 200px">
        <Navbar />
      </div>

      <!-- Section principale sans scroll -->
      <div class="d-flex flex-column flex-grow-1 p-0">
        <!-- Utilisateur en haut avec hauteur automatique -->
        <div class="utilisateur-top m-0" style="flex-shrink: 0">
          <Utilisateur class="utilisateur" />
        </div>

        <!-- Conteneur principal sans overflow -->
        <div class="container-fluid flex-grow-1 d-flex flex-column"
          style="width: calc(100% - 40px);margin: 20px 20px 20px 20px;height: 100vh;overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);        position: relative;  /* Permet à l'ombre de bien se propager */ ">
          <!-- En-tête avec liste des employés et bouton d'ajout -->
          <div class="" style="flex-shrink: 0">
            <div class="col">
              <h4>Tableau de board :</h4>
            </div>
            <div class="col-auto">
              <div class="d-flex mb-3">
                <select v-model="filterType" class="form-select me-2" @change="filterAbsences">
                  <option value="jour">Jour</option>
                  <option value="semaine">Semaine</option>
                  <option value="mois">Mois</option>
                  <option value="annee">Année</option>
                </select>

                <input type="date" v-model="startDate" class="form-control me-2" placeholder="Date de début" />
                <input type="date" v-model="endDate" class="form-control me-2" placeholder="Date de fin" />
                <button class="btn btn-primary" @click="filterAbsences">
                  Rechercher
                </button>
              </div>
              <div class="d-flex justify-content-between">
                <div class="chart-container me-3" style="flex: 1">
                  <canvas id="barChart"></canvas>
                </div>
                <div class="chart-container ms-3" style="flex: 1">
                  <canvas id="lineChart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Pagination controls -->
  </body>
</template>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

body {
  color: #566787;
  background-color: $text;
}

select {
  display: block;
  width: 100%;
  height: auto;
}

.container-fluid {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.button {
  align-items: center;
  display: flex;
  padding-bottom: 13%;
}


.chart-container {
  width: 700px;
  /* Appliquez la largeur souhaitée */
  height: 400px;
  /* Ajustez la hauteur en conséquence */
}

canvas {
  width: 100%;
  /* Force le canvas à prendre toute la largeur de son conteneur */
  height: 90% !important;
  /* Force le canvas à prendre toute la hauteur de son conteneur */
}






.chart-container {
  width: 100%;
}

#lineChart {
  height: 100%;
}
</style>
