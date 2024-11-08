<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, onMounted, computed, watch } from "vue";
import Chart from "chart.js/auto";
import Swal from "sweetalert2";
import api from "../api";
const nom = ref("");
const prenom = ref("");
const solde_employe = ref("");
const sexe = ref("");
const motif = ref("");
const plafonnement = ref(null);
const plafonnementbolean = ref(false);
const departement = ref("");
const matricule = ref("");
const selectedEmployee = ref(null);
const showModal = ref(false);
const barChart = ref(null);
const lineChart = ref(null);
const startDate = ref("");
const endDate = ref("");
const filterType = ref("mois");
const absenceStats = ref({
    totalAbsences: 0,
    absencesByFilter: [],
    totalAbsencesParType: [],
});
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

// Récupère le rôle de l'utilisateur à partir du token
const userRole = computed(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        return getRoleFromToken(token);
    }
    return null;
});
const creationEmploye = async () => {
    if (
        !nom.value ||
        !prenom.value ||
        !sexe.value ||
        !motif.value ||
        !departement.value ||
        !matricule.value ||
        !plafonnement.value
    ) {
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Tous les champs doivent être remplis",
            confirmButtonColor: "#212E53",
        });
        return;
    }

    try {
        const response = await api.put("/employes", {
            nom: nom.value,
            prenom: prenom.value,
            sexe: sexe.value,
            motif: motif.value,
            matricule: matricule.value,
            departement: departement.value,
            plafonnement: plafonnement.value,
            plafonnementbolean: plafonnementbolean.value,
        });
        Swal.fire({
            icon: "success",
            title: "Succès",
            title: response.data.message,
            position: "center",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
        });


        cancel();
        await listeEmploye();
    } catch (error) {
        console.error("Error creating employee:", error);
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Erreur de creation",
        });
    }
};

/*Affichage de la liste des employes dans un tableau*/
const employees = ref([]);
const currentPage = ref(1); // Page actuelle
const itemsPerPage = ref(5); // Nombre d'éléments par page

// Méthode pour charger les employés depuis le backend
const listeEmploye = async () => {
    try {
        const response = await api.get("/employes/listetable");
        employees.value = response.data.data;
    } catch (error) {
        console.error("Error loading employees:", error);
    }
};
const paginatedEmployes = computed(() => {
    // Si aucun terme de recherche n'est fourni, retourner les employés récupérés
    if (!searchTerm.value) {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        return employees.value.slice(start, start + itemsPerPage.value);
    }

    // Filtrer les utilisateurs en fonction du terme de recherche
    const filteredUsers = employees.value.filter((employe) => {
        return (
            employe.matricule.toString().includes(searchTerm.value) || // Vérifie le matricule
            employe.nom_employe.toLowerCase().includes(searchTerm.value.toLowerCase()) || // Vérifie le nom
            employe.pre_employe.toLowerCase().includes(searchTerm.value.toLowerCase())
        ); // Vérifie le prénom
    });

    // Calcul de la pagination
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredUsers.slice(start, start + itemsPerPage.value);
});

const searchTerm = ref("");

// Fonction pour récupérer les utilisateurs
const fetchUsers = async () => {
    try {
        console.log("Recherche d'utilisateurs pour le terme:", searchTerm.value); // Log pour le terme de recherche
        const response = await api.get("/employes/mitady", {
            params: {
                matricule: searchTerm.value,
                nom_employe: searchTerm.value,
                pre_employe: searchTerm.value,
            },
        });
        paginatedEmployes.value = response.data.data; // Met à jour les utilisateurs affichés
        console.log("Réponse de l'API:", response.data); // Log de la réponse
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
};
watch(searchTerm, fetchUsers);

const totalPages = computed(() => {
    return Math.ceil(employees.value.length / itemsPerPage.value);
});

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

onMounted(() => {
    listeEmploye();
});

/*Affichage de l'information de l'employe dans le champ formulaire si on veut la modifier*/
const edit = ref(false);
const edition = ref(null);
const editEmploye = (employee, event) => {
    event.stopPropagation();
    edit.value = true;
    edition.value = employee.id_employe;
    nom.value = employee.nom_employe;
    prenom.value = employee.pre_employe;
    sexe.value = employee.sexe;
    motif.value = employee.poste;
    matricule.value = employee.matricule;
    departement.value = employee.departement;
    plafonnement.value = employee.plafonnement;
    plafonnementbolean.value = employee.plafonnementbolean;
    solde_employe.value = employee.solde_employe;
};

/*Modification de l'employe*/
const updateEmploye = async () => {
    try {
        await api.patch(`/employes/modife/${edition.value}`, {
            nom: nom.value,
            prenom: prenom.value,
            sexe: sexe.value,
            motif: motif.value,
            plafonnement: plafonnement.value === "" ? null : plafonnement.value,
            plafonnementbolean: plafonnementbolean.value,
            matricule: matricule.value,
            departement: departement.value,
            solde_employe: solde_employe.value,
        });

        Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Employé mis à jour avec succès",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            timer: 3000,
        });

        listeEmploye();
        cancel();
    } catch (error) {
        console.error("Error updating employee:", error);
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Failed to update employee",
            confirmButtonText: "Réessayer",
            confirmButtonColor: "#d33",
        });
    }
};

/*Suppression d'un employe selon l'id*/
const deleteEmploye = async (id, event) => {
    // Arrête la propagation pour éviter l'ouverture du tableau de bord
    event.stopPropagation();
    try {
        const result = await Swal.fire({
            title: "Vous êtes sûr?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer!",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            await api.delete(`/employes/delete/${id}`);

            Swal.fire({
                title: "Succès",
                text: "Employé supprimé avec succès",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#3085d6",
            });

            listeEmploye();
        }
    } catch (error) {
        console.error("Error deleting employee:", error);
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Échec de la suppression de l'employé",
            confirmButtonText: "Réessayer",
            confirmButtonColor: "#d33",
        });
    }
};

/**Fonction pour vider le champ formulaire */
const cancel = () => {
    nom.value = "";
    prenom.value = "";
    sexe.value = "";
    motif.value = "";
    plafonnement.value = "";
    plafonnementbolean.value = "";
    matricule.value = "";
    departement.value = "";
};

onMounted(() => {
    listeEmploye();
});

const departements = ref([]);
const postes = ref([]);

const fetchDepartements = async () => {
    try {
        const response = await api.get("/departement/nomdepartement");
        departements.value = response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des départements:", error);
    }
};

const fetchPostes = async () => {
    if (departement.value) {
        try {
            const response = await api.get(`/poste/pote/${departement.value}`);
            postes.value = response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des postes:", error);
        }
    }
};

const fetchAbsences = async (employee) => {
    try {
        const response = await api.get("/dashboard/state", {
            params: {
                nom_employe: employee.nom_employe,
                pre_employe: employee.pre_employe,
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
            console.error("Erreur : données non définies dans la réponse", response.data);
            absenceStats.value = { totalAbsences: 0 };
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des absences:", error);
    }
};

const filterAbsences = async () => {
    if (!selectedEmployee.value) return;

    try {
        const response = await api.get("/dashboard/state", {
            params: {
                nom_employe: selectedEmployee.value.nom_employe,
                pre_employe: selectedEmployee.value.pre_employe,
                startDate: startDate.value,
                endDate: endDate.value,
                filtre: filterType.value,
            },
        });

        if (response.data) {
            absenceStats.value = response.data;
            renderCharts();
        } else {
            console.error("Erreur : données non définies dans la réponse", response.data);
            absenceStats.value = { totalAbsences: 0 };
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des absences :", error);
    }
};

const showDashboard = (employee) => {
    selectedEmployee.value = employee;
    showModal.value = true;
    fetchAbsences(employee);
};

const onModalClose = () => {
    window.location.reload();
};
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
            dataBar = absenceStats.value.absencesByFilter.map((item) => item.total_absences);
            totalDureeData = absenceStats.value.absencesByFilter.map(
                (item) => item.total_duree || 0
            );
            break;
        case "semaine":
            labelsBar = absenceStats.value.absencesByFilter.map(
                (item) => `Semaine ${item.week}`
            );
            dataBar = absenceStats.value.absencesByFilter.map((item) => item.total_absences);
            totalDureeData = absenceStats.value.absencesByFilter.map(
                (item) => item.total_duree || 0
            );
            break;
        case "mois":
            labelsBar = absenceStats.value.absencesByFilter.map((item) =>
                getMonthName(item.month - 1)
            );
            dataBar = absenceStats.value.absencesByFilter.map((item) => item.total_absences);
            totalDureeData = absenceStats.value.absencesByFilter.map(
                (item) => item.total_duree || 0
            );
            break;
        case "annee":
            labelsBar = absenceStats.value.absencesByFilter.map((item) => item.year);
            dataBar = absenceStats.value.absencesByFilter.map((item) => item.total_absences);
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

        // Appliquer le filtre sur les données de type d'absence
        let index;
        switch (filterType.value) {
            case "jour":
                // Utiliser le format DD/MM/YYYY pour la comparaison
                index = labelsBar.findIndex(
                    (label) => formatDateToDDMMYYYY(label) === formatDateToDDMMYYYY(item.date)
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
                index = labelsBar.findIndex((label) => label === `Semaine ${item.week}`);
                break;
            case "mois":
                index = labelsBar.findIndex((label) => label === getMonthName(item.month - 1));
                break;
            case "annee":
                index = labelsBar.findIndex((label) => label.toString() === item.year.toString());
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
                {
                    label: "Durée Totale (jours)",
                    data: totalDureeData,
                    backgroundColor: "#DBF9E7", // Couleur pour la durée totale
                    borderColor: "#FBFBFB", // Couleur de bordure pour la durée totale
                    borderWidth: 1,
                    yAxisID: "duree", // Indiquer que ce dataset utilise le deuxième axe Y
                    type: "bar", // Assurez-vous que c'est une barre
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
                duree: {
                    type: "linear",
                    position: "right",
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Durée Totale (jours)",
                    },
                    grid: {
                        drawOnChartArea: false, // Empêche le dessin de la grille pour cet axe
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || "";
                            label +=
                                ": " +
                                context.parsed.y +
                                (context.dataset.label === "Durée Totale (jours)" ? " jours" : "");
                            return label;
                        },
                    },
                },
            },
        },
    });

    // Création du graphique linéaire (avec plusieurs lignes pour chaque type d'absence)
    let lineLabels = labelsBar;
    const lineDatasets = [];

    absenceTypes.forEach((type) => {
        lineDatasets.push({
            label: type,
            data: lineChartData[type],
            fill: false,
            borderColor: getRandomColor(), // Fonction pour générer des couleurs aléatoires
            tension: 0.1,
        });
    });

    if (lineChart.value) {
        lineChart.value.destroy();
    }
    lineChart.value = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: lineLabels,
            datasets: lineDatasets,
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Nombre d'absences",
                    },
                },
            },
        },
    });
};
// Fonction pour obtenir une couleur aléatoire
const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
// Charger les départements lors du montage du composant
onMounted(() => {
    fetchDepartements();
});
// Création d'une référence réactive pour l'entrée
const inputValue = ref("");

// Fonction pour enlever les caractères spéciaux
const removeSpecialCharacters = (event) => {
    inputValue.value = event.target.value.replace(/[.,;!]/g, "");
};
</script>
<template>

    <body>
        <div class="d-flex">
            <Navbar />
            <Utilisateur class="utilisateur" />
            <div class="container-lg">
                <div class="row p-3">
                    <div class="col">
                        Liste des employes
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-success" data-bs-toggle="modal"
                            data-bs-target="#exampleModal">
                            <i class="fa-solid fa-plus-minus"></i><span>Nouvelle Employe</span>
                        </button>
                    </div>
                </div>
                <div>
                    <div class="form-floating d-inline-block">
                        <input type="text" id="input2" v-model="searchTerm" @input="fetchUsers" class="form-control"
                            placeholder="Recherche" />
                        <label for="input2">Recherche</label>
                    </div>
                </div>
                <div class="table-wrapper">

                    <!--Liste des employes-->
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Matricule</th>
                                    <th>Nom</th>
                                    <th>Prenom</th>
                                    <th>Sexe</th>
                                    <th>Motif</th>
                                    <th>Département</th>
                                    <th>Solde d'absence</th>
                                    <th>Plafonnement</th>
                                    <th v-if="userRole === 'ADMINISTRATEUR'">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr role="button" v-for="employee in paginatedEmployes" :key="employee.id"
                                    @click="showDashboard(employee)">
                                    <td>{{ employee.matricule }}</td>
                                    <td>{{ employee.nom_employe }}</td>
                                    <td>{{ employee.pre_employe }}</td>
                                    <td>{{ employee.sexe === "F" ? "Femme" : "Homme" }}</td>
                                    <td>{{ employee.poste }}</td>
                                    <td>{{ employee.departement }}</td>
                                    <td>
                                        {{ employee.solde_employe === 0 ? "Epuisé" : employee.solde_employe === 1 ?
                                            "1 jour" : employee.solde_employe + " jours" }}
                                    </td>
                                    <td>{{ employee.plafonnement + " jours" }}</td>
                                    <td v-if="userRole === 'ADMINISTRATEUR'">
                                        <button class="btn btn-warning btn-sm" data-bs-toggle="modal"
                                            data-bs-target="#modalupdate" @click="editEmploye(employee, $event)">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button type="button" class="btn btn-danger btn-sm ms-2"
                                            @click="deleteEmploye(employee.id_employe, $event)">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block">
                        <div class="modal-dialog modal-xl modal-dialog-centered modal-custom">
                            <!-- Utilisation de modal-xl pour un modal plus large -->
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">
                                        Statistiques d'absence pour {{ selectedEmployee.nom_employe }}
                                        {{ selectedEmployee.pre_employe }}
                                    </h5>
                                    <button type="button" class="btn-close" @click="onModalClose"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <p>
                                            <strong>Total des absences :</strong>
                                            <strong>{{ absenceStats.totalAbsences }}</strong>
                                        </p>
                                    </div>
                                    <div class="d-flex mb-3">
                                        <select v-model="filterType" class="form-select me-2" @change="filterAbsences">
                                            <option value="jour">Jour</option>
                                            <option value="semaine">Semaine</option>
                                            <option value="mois">Mois</option>
                                            <option value="annee">Année</option>
                                        </select>

                                        <input type="date" v-model="startDate" class="form-control me-2"
                                            placeholder="Date de début" />
                                        <input type="date" v-model="endDate" class="form-control me-2"
                                            placeholder="Date de fin" />
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
                <div v-if="showModal" class="modal-backdrop fade show"></div>
                <nav aria-label="Page navigation example" class="navigation">
                    <ul class="flex items-center -space-x-px h-20 text-sm">
                        <li>
                            <a href="#" @click.prevent="prevPage"
                                class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                <span class="sr-only">Previous</span>
                                <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="M5 1 1 5l4 4" />
                                </svg>
                            </a>
                        </li>
                        <li v-for="page in totalPages" :key="page">
                            <a href="#" @click.prevent="goToPage(page)" :class="[
                                'flex items-center justify-center px-3 h-8 leading-tight',
                                page === currentPage
                                    ? 'z-10 text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
                            ]">
                                {{ page }}
                            </a>
                        </li>
                        <li>
                            <a href="#" @click.prevent="nextPage"
                                class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                <span class="sr-only">Next</span>
                                <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="m1 9 4-4-4-4" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            <!--Modal creation employe-->
            <div class="modal fade" id="exampleModal" tabindex="-2" aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-s">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel" style="
                  color: #212e53;
                  font-size: 1.25rem;
                  font-weight: bold;
                  text-align: center;
                ">
                                Ajouter Employé
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="creationEmploye">
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- Champ "Nom" -->
                                    <div class="relative w-full">
                                        <input type="text" v-model="nom" id="floating_outlined"
                                            @input="removeSpecialCharacters"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Nom
                                        </label>
                                    </div>

                                    <!-- Champ "Prénom" -->
                                    <div class="relative w-full">
                                        <input type="text" v-model="prenom" id="floating_outlined_prenom"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_prenom"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Prenom
                                        </label>
                                    </div>
                                </div>

                                <br />

                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- Champ "Motif" -->
                                    <div class="relative w-full">
                                        <input type="text" v-model="matricule" id="floating_outlined_matricule"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_matricule"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Matricule
                                        </label>
                                    </div>

                                    <!-- Champ "Sexe" -->
                                    <div class="relative w-full">
                                        <label for="category"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">
                                            Sexe
                                        </label>
                                        <select id="category" v-model="sexe"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                    </div>
                                </div>
                                <br />
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <div class="relative w-full">
                                        <label for="departement"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Département
                                        </label>
                                        <select v-model="departement" id="departement" @change="fetchPostes"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer scrollable-select">
                                            <option disabled value="">Sélectionnez un département</option>
                                            <option v-for="departement in departements"
                                                :key="departement.nom_departement" :value="departement.nom_departement">
                                                {{ departement.nom_departement }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="relative w-full">
                                        <label for="fonction"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Fonction
                                        </label>
                                        <select v-model="motif" id="fonction"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer scrollable-select">
                                            <option disabled value="">Sélectionnez une fonction</option>
                                            <option v-for="poste in postes" :key="poste.id" :value="poste.fonction">
                                                {{ poste.fonction }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <br />
                                <div class="flex gap-4">
                                    <!-- Champ Plafonnement -->
                                    <div class="relative flex-1">
                                        <input type="number" v-model="plafonnement" id="floating_outlined_plafonnement"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_plafonnement"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">Plafonnement</label>
                                    </div>

                                    <!-- Champ Plafonnement Boolean -->
                                    <div class="relative flex items-center flex-1">
                                        <input type="checkbox" v-model="plafonnementbolean" id="plafonnementbolean"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label for="plafonnementbolean"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Dépasser plafonnement
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <!-- bouton ajouter employer-->
                                <div class="modal-footer">
                                    <button type="submit" style="color: #212e53"
                                        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Ajouter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <!--Modal modification employe-->
            <div class="modal fade" id="modalupdate" tabindex="-1" aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-s">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel" style="
                  color: #212e53;
                  font-size: 1.25rem;
                  font-weight: bold;
                  text-align: center;
                ">
                                Modification de l'employe
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div v-if="edit" class="modal-body">
                            <form @submit.prevent="updateEmploye">
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- champ nom employe -->
                                    <div class="relative w-full">
                                        <input type="text" v-model="nom" id="floating_outlined"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Nom</label>
                                    </div>

                                    <!-- Champ "Prénom" -->
                                    <div class="relative w-full">
                                        <input type="text" v-model="prenom" id="floating_outlined_prenom"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_prenom"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Prenom
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- champ motif employe-->
                                    <div class="relative w-full">
                                        <input type="text" v-model="matricule" id="floating_outlined_matricule"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_matricule"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Matricule</label>
                                    </div>
                                    <!-- champ sexe employe-->
                                    <div class="relative w-full">
                                        <label for="category"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">
                                            Sexe
                                        </label>
                                        <select id="category" v-model="sexe"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                    </div>
                                </div>

                                <br />
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- champ motif employe-->
                                    <div class="relative w-full">
                                        <input type="text" v-model="departement" id="floating_outlined_departement"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_deprtement"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Departement</label>
                                    </div>
                                    <!-- champ sexe employe-->
                                    <div class="relative w-full">
                                        <input type="text" v-model="motif" id="floating_outlined_motif"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_motif"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Fonction</label>
                                    </div>
                                </div>

                                <br />
                                <div class="flex gap-4">
                                    <!-- Champ Plafonnement -->
                                    <div class="relative flex-1">
                                        <input type="number" v-model="plafonnement" id="floating_outlined_plafonnement"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_plafonnement"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">Plafonnement</label>
                                    </div>

                                    <!-- Champ Plafonnement Boolean -->
                                    <!-- Champ Plafonnement -->
                                    <div class="relative flex-1">
                                        <input type="number" v-model="solde_employe"
                                            id="floating_outlined_solde_employe"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_solde_employe"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">Solde</label>
                                    </div>
                                </div>
                                <br />
                                <div class="flex gap-4">
                                    <!-- Champ Plafonnement Boolean -->
                                    <div class="relative flex items-center flex-1">
                                        <input type="checkbox" v-model="plafonnementbolean" id="plafonnementbolean"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label for="plafonnementbolean"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Dépasser plafonnement
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <!-- bouton ajouter employer-->
                                <div class="modal-footer">
                                    <button type="submit" style="color: #212e53"
                                        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Mettre à jour
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</template>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

body {
    color: #566787;
    background-color: $text;
    font-size: 15px;
}

.d-flex {
    display: flex;
}

.select-container {
    position: relative;
    max-height: 50px;
    overflow-y: auto;
}

select {
    display: block;
    width: 100%;
    height: auto;
}

.container-lg {
    margin-left: 17%;
    width: 100%;
    position: fixed;
    margin-top: 7%;
    margin-left: 15.5%;
    box-shadow: 10px 10px 10px 10px#F0F0F0;
    flex-direction: column;
}

.table-scroll-container {
    height: 70vh;
    overflow: auto;
}

.navigation {
    position: absolute;
    bottom: 10px;
    width: 100%;
    left: 15.5%;
    position: fixed;
}

.export-label {
    font-weight: bold;
    margin-top: 5px;
    /* Aligne le texte légèrement au-dessus des boutons */
    white-space: nowrap;
    /* Empêche le texte de se casser */
}

.export-button {
    flex: 1;
    min-width: 100px;
    height: 32px;
    font-size: 0.75rem;
    border-radius: 0.375rem;
    background-color: $secondary;
    /* Couleur du fond bleu */
    color: white;
    /* Couleur du texte blanc */
    border: 1px solid #007bff;
    /* Bordure bleu */
    margin-top: -3px;
    /* Légèrement plus haut */
    padding: 0 10px;
    /* Ajoute un peu d'espace intérieur horizontal */
}

.export-button:hover {
    background-color: $primary;
    /* Couleur de fond bleu foncé lors du survol */
    transform: scale(1.05);
    /* Légère augmentation de la taille lors du survol */
}

.btn-xs {
    font-size: 0.6rem;
    padding: 0.1rem 0.2rem;
    /* Réduit le padding */
}

/* Boutons d'action */
.action-buttons {
    display: flex;
    justify-content: space-around;
}

.action-buttons button {
    justify-content: space-between;
    border: 0;
}

/* Bouton d'édition */
.btn-warning {
    background-color: #ffc107;
    /* Couleur de fond par défaut */
    color: white;
    /* Couleur du texte */

    &:hover {
        background-color: #e0a800;
        /* Couleur de fond au survol */
    }
}

/* Bouton d'impression */
.btn-info {
    background-color: #17a2b8;
    /* Couleur de fond par défaut */
    color: white;
    /* Couleur du texte */

    &:hover {
        background-color: #138496;
        /* Couleur de fond au survol */
    }
}

/* Bouton de suppression */
.btn-danger {
    background-color: #dc3545;
    /* Couleur de fond par défaut */
    color: white;
    /* Couleur du texte */

    &:hover {
        background-color: #c82333;
        /* Couleur de fond au survol */
        color: black;
        /* Couleur du texte */
    }
}

/* Si vous souhaitez appliquer une hauteur globale à toutes les cellules de la table */
td {
    height: 40px;
    /* Ajustez cette valeur pour toutes les cellules */
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    /* Couleur noire avec opacité 50% */
    z-index: 1040;
    /* Assurez-vous que ce z-index est supérieur à celui de votre modal */
}
</style>
