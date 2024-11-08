<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, watch, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import api from "../api"; // Import de votre instance API

//conversion date
const formatDate = (date) => {
  // S'assurer que la date est un objet Date
  const d = new Date(date);

  // Vérifier si la date est valide
  if (isNaN(d)) {
    return "Date invalide"; // Gérer les dates invalides
  }

  // Récupérer le jour, le mois et l'année
  const day = ("0" + d.getDate()).slice(-2); // Ajouter un zéro devant si nécessaire
  const month = ("0" + (d.getMonth() + 1)).slice(-2); // Les mois sont 0-indexés
  const year = d.getFullYear();

  // Retourner la date formatée au format "DD-MM-YYYY"
  return `${day}/${month}/${year}`;
};

//variable
const formData = ref({
  id_employe: "",
  id_absence: "",
  datedeb: "",
  jours_absence: "",
  duredebut: "",
  motif: "",
});

const cancel = () => {
  formData.value.id_employe = "";
  formData.value.id_absence = "";
  formData.value.datedeb = "";
  formData.value.jours_absence = "";
  formData.value.duredebut = "";
  formData.value.motif = "";
};
const employes = ref([]);
const absences = ref([]);
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);
const isSpecialAbsence = ref(false);

onMounted(async () => {
  try {
    const employeResponse = await api.get("/employes/dataliste");
    employes.value = employeResponse.data;

    const absenceResponse = await api.get("/absences/dataliste");
    absences.value = absenceResponse.data;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données:",
      err.response ? err.response.data : err.message
    );
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Erreur lors du chargement des données",
      confirmButtonColor: "#212E53",
    });
  }
});

//affiche le nom complet de l'employé
const displayedEmployeName = computed(() => {
  const selectedEmploye = employes.value.find(
    (employe) => employe.id_employe === formData.value.id_employe
  );
  return selectedEmploye
    ? `${selectedEmploye.nom_employe} ${selectedEmploye.pre_employe}`
    : "";
});

//maj id employe
function handleEmployeInput(event) {
  const value = event.target.value;
  const selectedEmploye = employes.value.find(
    (employe) => `${employe.nom_employe} ${employe.pre_employe}` === value
  );
  if (selectedEmploye) {
    formData.value.id_employe = selectedEmploye.id_employe;
  }
}

const handleAbsenceChange = (e) => {
  const id_absence = parseInt(e.target.value);

  const selectionner = absences.value.find(
    (absence) => absence.id_absence === id_absence
  );

  if (selectionner) {
    if (selectionner.pour == 0) {
      formData.value.motif = selectionner.nom_absence;
      formData.value.jours_absence = selectionner.duree;
    } else {
      formData.value.motif = "";
      formData.value.jours_absence = 0;
      console.warn("L'absence sélectionnée ne correspond pas à 'pour = 0'");
    }
  } else {
    console.error("Absence non trouvée");
  }
};

const submitForm = async () => {
  try {
    const response = await api.put("/demandes/ajout", formData.value);

    Swal.fire({
      icon: "success",
      title: "Succès",
      text: response.data.message || "Votre demande a été traitée avec succès.",
      confirmButtonColor: "#3085d6",
    });
    listeDemande();
    cancel();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: error.response?.data?.error || "Une erreur est survenue.",
      confirmButtonColor: "#d33",
    });
  }
};

/*Affichage de la liste des demandes dans un tableau*/
const demandees = ref([]);
const listeDemande = async () => {
  try {
    const response = await api.get("/demandes/tabledemande");
    demandees.value = response.data;
    console.log(response.data);
  } catch (error) {
    console.error("Error loading demandes", error);
  }
};

const deleteDemande = async (id) => {
  try {
    console.log("Deleting demande with ID:", id);

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
      const response = await api.delete(`/demandes/deletedemande/${id}`);

      Swal.fire({
        title: "Succès",
        text: response.data.message,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });

      listeDemande();
    }
  } catch (error) {
    console.error("Error deleting demandee:", error);
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Échec de la suppression du Demande",
      confirmButtonText: "Réessayer",
      confirmButtonColor: "#d33",
    });
  }
};

onMounted(() => {
  listeDemande();
});
// Variables réactives pour stocker les données de la demande
const date_debut = ref("");
const date_fin = ref("");
const motif = ref("");
const fichier = ref(null);

const formeDate = (dateString) => {
  return dateString.split("T")[0]; // Cela renvoie seulement la partie date
};

const edit = ref(false);
const edition = ref(null);
const editEmploye = (demandee) => {
  console.log(demandee); // Vérifiez que ces valeurs sont bien définies
  edit.value = true;
  edition.value = demandee.id_demande;
  date_debut.value = formeDate(demandee.date_debut);
  motif.value = demandee.motif;
  date_fin.value = formeDate(demandee.date_fin);
};

// Fonction pour gérer le téléchargement du fichier
const handleFileUpload = (event) => {
  fichier.value = event.target.files[0]; // Récupérer le fichier sélectionné
};
const updateDemande = async () => {
  const updatedDemande = new FormData();
  updatedDemande.append("date_debut", date_debut.value);
  updatedDemande.append("date_fin", date_fin.value);
  updatedDemande.append("motif", motif.value);

  if (fichier.value) {
    updatedDemande.append("fichier", fichier.value);
  }
  console.log(edition.value);
  try {
    const response = await api.put(`/demandes/fichier/${edition.value}`, updatedDemande, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    Swal.fire({
      title: response.data.message,
      position: "center",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    alert("Erreur lors de la mise à jour de la demande");
  }
};

//filtrage des demandes
const recherche = ref("");
const mois = ref("");
const dateDebut = ref("");
const dateFin = ref("");

const filtrerDemandes = async () => {
  try {
    const response = await api.get("/demandes/filtrage", {
      params: {
        recherche: recherche.value,
        mois: mois.value ? mois.value.split("-")[1] : null,
        annee: mois.value ? mois.value.split("-")[0] : null,
        date_debut: dateDebut.value || null, // Ajout de la date de début
        date_fin: dateFin.value || null, // Ajout de la date de fin
      },
    });
    demandees.value = response.data; // Met à jour la liste des demandes filtrées
    if (Object.keys(response.data).length == 0){
      document.getElementById("button-addon-excel").disabled = true;
      console.log('zero')
    }
    else{
      document.getElementById("button-addon-excel").disabled = false;
    }
  } catch (error) {
    console.error("Error filtering demandes", error);
  }
};

watch([recherche, mois], () => {
  filtrerDemandes();
});

const currentPage = ref(1); // Page actuelle
const itemsPerPage = ref(5); // Nombre d'éléments par page

const paginatedAbsences = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return demandees.value.slice(start, end);
});
console.log("Demandées:", demandees.value);

const totalPages = computed(() => {
  return Math.ceil(demandees.value.length / itemsPerPage.value);
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

//importation excel
const dataTable = ref(null);
const selectedFormat = ref("csv");
const exportData = () => {
  if (selectedFormat.value === "csv") {
    exportToCSV();
  } else if (selectedFormat.value === "excel") {
    exportToExcel();
  }
};


const exportToExcel = () => {
  if (demandees.value.length === 0) {
    console.error("Pas de données à exporter.");
    return;
  }

  const ws_data = demandees.value.map((item) => [
    `${item.personnel.nom_employe} ${item.personnel.pre_employe}`, // Nom et Prénom
    item.personnel.matricule, // Matricule
    item.personnel.poste, // Poste
    item.jours_absence, // Jours d'absence
    item.employe ? item.employe.solde_employe : 'N/A', // Solde Employé, avec une valeur par défaut
    formatDate(item.date_debut), // Date de départ
    formatDate(item.date_retour), // Date de retour
    item.motif, // Motif
    formatDate(item.date_fin), // Date Fin
  ]);


  // Ajouter les en-têtes de colonne
  ws_data.unshift([
    "Nom et Prénom",
    "Matricule",
    "Motif Employé",
    "Jours d'absence",
    "Solde Employé",
    "Date de départ",
    "Date de retour",
    "Motif",
    "Date Fin",
  ]);

  // Créer une feuille avec les données
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Créer un nouveau classeur et ajouter la feuille
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Feuille1");

  // Exporter le fichier Excel
  XLSX.writeFile(wb, "Liste demande absence.xlsx");
};
function formatNumber(num){
  return parseFloat(num).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function imprimerDemande(demande) {
  const css = `
    <style>
      @page {
        size: A4;
        margin: 1cm;
      }
      
      body {
        margin: 0;
        font-family: Arial, sans-serif;
      }
      
      .print-container {
        padding: 20px;
        max-width: 21cm;
        margin: 0 auto;
        box-sizing: border-box;
      }
      
      .page {
        position: relative;
        margin-bottom: 30px;
      }
      
      .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .logo-section {
        display: flex;
      }
      
      .logo {
        width: 80px;
        height: 80px;
        margin-right: 20px;
      }
      
      .watermark {
        font-size: 54px;
        font-weight: bold;
        color: #e5e5e5;
        opacity: 0.2;
        width: 700px;
        text-align:center;
        margin-top:auto;
        margin-bottom:auto;


      }
      
      .company-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        margin-top: 10px;
      }
      
      .date {
        text-align: right;
        font-size: 14px;
      }
      
      .title {
        font-size: 18px;
        font-weight: bold;
        text-transform: uppercase;
        text-align: center;
        margin: 24px 0;
        text-decoration: underline;
      }
      
      .form-content {
        font-size: 14px;
        display: grid;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 180px 1fr;
      }
      
      .separator {
        border: none;
        border-top: 2px dashed #666;
        margin: 150px 50px 20px 50px;
      }
      
      .signatures {
        display: flex;
        justify-content: space-between;
        margin-top: 28px;
        font-size: 14px;
        text-align: center;
        font-weight:bold;
      }
      
      .signature-box {
        flex: 1;
      }
      
      .document-number {
        margin-top: 24px;
      }

      .copy-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .copy-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-top: 10px;
      }

      @media print {
        .print-container {
          padding: 0;
        }
      }
    </style>
  `;

  const contenu = `
    ${css}
    <div class="print-container">
      <!-- Original -->
      <div class="page">
        <div class="header-section">
          <div class="logo-section">
            <img src="logo.jpg" alt="SOCIETE MIEZAKA" class="logo">
            <div class="watermark">ORIGINAL</div>
          </div>
        </div>
        <div class="company-info">
          <div>
            <div>Sahalava</div>
            <div>Téléphone : 75 516 55</div>
            <div>Fax : 75 52125</div>
            <div>Fianarantsoa - 301</div>
          </div>
          <div class="date">
            <div>Fianarantsoa, le ${formatDate(new Date())}</div>
          </div>
        </div>

        <h1 class="title">Demande d'Autorisation d'Absence</h1>

        <div class="form-content">
          <div class="form-row">
            <span>Nom(s) et prénom(s) :</span>
            <span>${demande.personnel.nom_employe} ${demande.personnel.pre_employe}</span>
          </div>
          <div class="form-row">
            <span>N° Matricule :</span>
            <span>${demande.personnel.matricule}</span>
          </div>
          <div class="form-row">
            <span>Fonction :</span>
            <span>${demande.personnel.poste}</span>
          </div>
          <div class="form-row">
            <span>Nombre de jours :</span>
            <span><b>${formatNumber(demande.jours_absence)}</b></span>
          </div>
          <div class="form-row">
            <span>Congé restant :</span>
            <span><b>${formatNumber(demande.solde_employe)}</b></span>
          </div>
          <div class="form-row">
            <span>Date de départ :</span>
            <span>${formatDate(demande.date_debut)}</span>
          </div>
          <div class="form-row">
            <span>Date de retour :</span>
            <span>${formatDate(demande.date_retour)}</span>
          </div>
          <div class="form-row">
            <span>Motif :</span>
            <span>${demande.motif}</span>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div>L'intéressé</div>
          </div>
          <div class="signature-box">
            <div>Collègue(Sign+Prénom)</div>
          </div>
          <div class="signature-box">
            <div>La Direction</div>
          </div>
        </div>
      </div>

      <hr class="separator">

      <!-- Copie -->
      <div class="page">
        <div class="header-section">
          <div class="logo-section">
            <img src="logo.jpg" alt="SOCIETE MIEZAKA" class="logo">
            <div class="watermark">COPIE</div>
          </div>
        </div>
        <div class="company-info">
          <div>
            <div>Sahalava</div>
            <div>Téléphone : 75 516 55</div>
            <div>Fax : 75 52125</div>
            <div>Fianarantsoa - 301</div>
          </div>
          <div class="date">
            <div>Fianarantsoa, le ${formatDate(new Date())}</div>
          </div>
        </div>

        <h1 class="title">Demande d'Autorisation d'Absence</h1>

        <div class="form-content">
          <div class="form-row">
            <span>Nom(s) et prénom(s) :</span>
            <span>${demande.personnel.nom_employe} ${demande.personnel.pre_employe}</span>
          </div>
          <div class="form-row">
            <span>N° Matricule :</span>
            <span>${demande.personnel.matricule}</span>
          </div>
          <div class="form-row">
            <span>Fonction :</span>
            <span>${demande.personnel.poste}</span>
          </div>
         <div class="form-row">
            <span>Nombre de jours :</span>
            <span><b>${formatNumber(demande.jours_absence)}</b></span>
          </div>
          <div class="form-row">
            <span>Congé restant :</span>
            <span><b>${formatNumber(demande.solde_employe)}</b></span>
          </div>
          <div class="form-row">
            <span>Date de départ :</span>
            <span>${formatDate(demande.date_debut)}</span>
          </div>
          <div class="form-row">
            <span>Date de retour :</span>
            <span>${formatDate(demande.date_retour)}</span>
          </div>
          <div class="form-row">
            <span>Motif :</span>
            <span>${demande.motif}</span>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div>L'intéressé</div>
          </div>
          <div class="signature-box">
            <div>Collègue(Sign+Prénom)</div>
          </div>
          <div class="signature-box">
            <div>La Direction</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const fenetreImpression = window.open("", "", "width=800,height=600");
  fenetreImpression.document.open();
  fenetreImpression.document.write(contenu);
  fenetreImpression.document.close();
  fenetreImpression.focus();
  fenetreImpression.print();
}
setTimeout(() => {
  fenetreImpression.focus();
  fenetreImpression.print();
}, 1000);

function getAbsoluteImagePath() {
  return `${window.location.origin}/assets/sary/1721891607125.jpg`; // URL publique
}

// Fonction pour télécharger un fichier associé à une demande d'absence
const downloadFile = async (demandeId) => {
  try {
    // Envoyer une requête pour obtenir le fichier en Base64
    const response = await api.get(`/demandes/download/${demandeId}`);
    const { base64File, fileExtension, filename } = response.data;

    // Créer un élément <a> pour déclencher le téléchargement
    const link = document.createElement("a");
    link.href = `data:application/${fileExtension};base64,${base64File}`;
    link.download = filename;

    // Ajouter l'élément au DOM, cliquer sur le lien et le retirer après
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error);
  }
};
</script>
<template>

  <body>
    <div class="d-flex">
      <Navbar />
      <Utilisateur class="utilisateur" />
      <div class="container-lg">
        <div class="table-responsive">
          <div class="table-wrapper">
            <div class="table-title">
              <div class="row">
                <div class="col-sm-6">
                  <h2>Listes Demandes Absences</h2>
                </div>
                <div class="col-sm-6">
                  <button type="button" class="btn btn-success mb-3" data-bs-toggle="modal"
                    data-bs-target="#exampleModal">
                    <i class="fa-solid fa-plus-minus"></i><span>Nouvelle Demande</span>
                  </button>
                </div>
                <div class="d-flex gap-2">
                  <div class="flex items-center gap-2">
                    <label for="input2" class="text-xs text-gray-700 dark:text-gray-300 w-1/2">Recherche</label>
                    <input type="text" id="input2" v-model="recherche" @input="filtrerDemandes"
                      class="block w-4/3 p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </div>

                  <div class="flex items-center gap-2">
                    <label for="dateDebut" class="text-xs text-gray-700 dark:text-gray-300 w-1/2">Mois</label>
                    <input type="month" id="dateDebut" v-model="mois" @input="filtrerDemandes"
                      class="block w-3/4 p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </div>

                  <div class="flex items-center gap-2">
                    <label for="dateDebut" class="text-xs text-gray-700 dark:text-gray-300 w-1/2">Date de début</label>
                    <input type="date" id="dateDebut" v-model="dateDebut" @input="filtrerDemandes"
                      class="block w-3/4 p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </div>

                  <div class="flex items-center gap-2">
                    <label for="dateFin" class="text-xs text-gray-700 dark:text-gray-300 w-1/2">Date de fin</label>
                    <input type="date" id="dateFin" v-model="dateFin" @input="filtrerDemandes"
                      class="block w-3/4 p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                  </div>
                  <div class="flex items-center gap-3" style="max-width: 300px">
                    <button class="export-button" type="button" id="button-addon-excel" @click="exportToExcel">
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!--Liste des employes-->
            <div class="table-scroll-container">
              <table class="table table-striped table-hover" ref="dataTable">
                <thead class="table-header">
                  <tr>
                    <th>N°Matricule</th>
                    <th>Nom et Prénom</th>
                    <th>Fonction</th>
                    <th>Nombre de jours</th>
                    <th>Solde restant</th>
                    <th>Date de départ</th>
                    <th>Date retour</th>
                    <th>Motif</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="demandee in paginatedAbsences" :key="demandee.id">
                    <td>{{ demandee.personnel.matricule }}</td>
                    <td> {{ demandee.personnel.nom_employe }} <br>
                      {{ demandee.personnel.pre_employe }}</td>
                    <td>{{ demandee.personnel.poste }}</td>
                    <td>
                      {{ demandee.jours_absence === 0 ? "Epuisé" : demandee.jours_absence === 1 ? "1 jour" :
                        demandee.jours_absence + " jours" }}
                    </td>
                    <td>
                      {{ demandee.solde_employe === 0 ? "Epuisé" : demandee.solde_employe === 1 ? "1 jour" :
                        demandee.solde_employe + " jours" }}
                    </td>
                    <td>{{ formatDate(demandee.date_debut) }}</td>
                    <td>{{ formatDate(demandee.date_fin) }}</td>
                    <td>{{ demandee.motif }}</td>

                    <td class="action-buttons ps-4">
                      <div class="d-flex gap-1">
                        <button class="btn btn-warning btn-sm btn-xs" data-bs-toggle="modal"
                          data-bs-target="#modalupdate" @click="editEmploye(demandee)">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn btn-info btn-sm btn-xs"
                          @click.stop="imprimerDemande(demandee)">
                          <i class="fa-solid fa-print"></i>
                        </button>
                      </div>
                      <div class="my-1"></div>
                      <div class="d-flex gap-1">
                        <button type="button" class="btn btn-danger btn-sm btn-xs"
                          @click="deleteDemande(demandee.id_demande)">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm btn-xs" @click="downloadFile(demandee.id_demande)">
                          <i class="fs-6 fa-solid fa-circle-down"></i>
                        </button>
                      </div>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation à insérer ici -->
      <nav aria-label="Page navigation example" class="navigation">
        <ul class="flex items-center -space-x-px h-100 text-sm">
          <li>
            <a href="#" @click.prevent="prevPage"
              class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              <span class="sr-only">Previous</span>
              <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 1 1 5l4 4" />
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
              <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m1 9 4-4-4-4" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>

      <!--Modal creation employe-->
      <div class="modal fade" id="exampleModal" tabindex="-2" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-s">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel" style="
                  color: #212e53;
                  font-size: 1.25rem;
                  font-weight: bold;
                  text-align: center;
                ">
                Créer Nouvelle Demande
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitForm" autocomplete="false">
                <div class="flex flex-col sm:flex-row gap-4">
                  <!-- Champ "NomEmploye" -->
                  <div class="relative w-full">
                    <input type="text" id="id_employe" :value="displayedEmployeName" @input="handleEmployeInput"
                      class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" " list="employes" required />
                    <label for="id_employe"
                      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">
                      Employé
                    </label>
                    <datalist id="employes">
                      <option v-for="employe in employes" :key="employe.id_employe"
                        :value="`${employe.nom_employe} ${employe.pre_employe}`">
                        {{ employe.nom_employe }} {{ employe.pre_employe }}
                      </option>
                    </datalist>
                  </div>
                  <div class="relative w-full">
                    <select id="id_absence" v-model="formData.id_absence" @change="handleAbsenceChange"
                      class="block px-2.5 py-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      required>
                      <option disabled value="">Sélectionnez un type d'absence</option>
                      <option v-for="absence in absences" :key="absence.id_absence" :value="absence.id_absence">
                        {{ absence.nom_absence }}
                      </option>
                    </select>
                    <label for="id_absence"
                      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">
                      Type d'absence
                    </label>
                  </div>
                </div>

                <br />

                <div class="flex flex-col sm:flex-row gap-4">
                  <!-- Champ "Motif" -->
                  <div class="relative w-full">
                    <input type="date" id="datedeb" v-model="formData.datedeb" required
                      class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" " />
                    <label for="datedeb"
                      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                      Date de début
                    </label>
                  </div>


                  <div class="relative w-full">
                    <label for="category"
                      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">
                      Demi_journée
                    </label>
                    <select id="category" v-model="formData.duredebut"
                      class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                      <option value="matin">Matin</option>
                      <option value="apresmidi">Après-midi</option>
                    </select>
                  </div>

                </div>

                <br />
                <div class="flex gap-4">
                  <!-- Champ motif -->
                  <div class="relative flex-1">
                    <input type="text" id="floating_outlined_motif" v-model="formData.motif"
                      class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" " />
                    <label for="floating_outlined_motif"
                      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">Motif</label>
                  </div>

                  <!-- Champ jour absence -->
                  <div class="relative flex-1">
                    <input type="number" step="0.5" min="0" id="floating_outlined_joursabsence"
                      v-model="formData.jours_absence"
                      class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder=" " />
                    <label for="floating_outlined_joursabsence"
                      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">Jours
                      d'absence</label>
                  </div>
                </div>
                <br>
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
    </div>

    <!--Modal modification employe-->
    <div class="modal fade" id="modalupdate" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-s">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel" style="
                color: #212e53;
                font-size: 1.25rem;
                font-weight: bold;
                text-align: center;
              ">
              Modification du demande
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div v-if="edit" class="modal-body">
            <form @submit.prevent="updateDemande" enctype="multipart/form-data">
              <div class="flex flex-col sm:flex-row gap-4">
                <!-- champ nom employe -->
                <div class="relative w-full">
                  <input type="date" v-model="date_debut" id="floating_outlined" readonly
                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" " />
                  <label for="floating_outlined"
                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                    Date début</label>
                </div>

                <!-- Champ "Prénom" -->
                <div class="relative w-full">
                  <input type="date" v-model="date_fin" id="floating_outlined_prenom" readonly
                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" " />
                  <label for="floating_outlined_prenom"
                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                    Date fin
                  </label>
                </div>
              </div>
              <br />
              <div class="flex flex-col sm:flex-row gap-4">
                <!-- champ motif employe-->
                <div class="relative w-full">
                  <input type="text" v-model="motif" id="floating_outlined_departement" readonly
                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" " />
                  <label for="floating_outlined_deprtement"
                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Motif</label>
                </div>
                <!-- champ sexe employe-->
                <div class="relative w-full">
                  <input type="file" @change="handleFileUpload" id="floating_outlined_motif"
                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" " />
                  <label for="floating_outlined_motif"
                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">Fichier</label>
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
  </body>
</template>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

body {
  color: #566787;
  background-color: $text;
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
  width: 100%;
  padding: 1px;
  position: fixed;
  margin-top: 7%;
  margin-left: 15.5%;
  box-shadow: 10px 10px 10px 10px#F0F0F0;
  flex-direction: column;
}

.table-responsive {
  overflow-x: hidden;
  width: 100%;
  margin: 0 auto;
  margin-top: -0.6%;
}

.table-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: #f8f9fa;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  overflow-x: hidden;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.table-title {
  padding-bottom: 15px;
  background-color: $text;
  color: $primary;
  padding: 16px 30px;
  min-width: 100%;
  margin: -20px -25px 10px;
  border-radius: 3px 3px 0 0;
  font-weight: bold;
}

.table-title h2 {
  margin: 5px 0 0;
  font-size: 20px;
  margin-top: 3%;
}

.table-title .btn-group {
  float: right;
}

.table-title .btn {
  float: right;
  font-size: 13px;
  border: none;
  min-width: 50px;
  border-radius: 5px;
  border: none;
  outline: none !important;
  margin-left: 10px;
  margin-top: 3%;
}

.table-title .btn i {
  float: left;
  font-size: 21px;
  margin-right: 5px;
}

.table-title .btn span {
  float: left;
  margin-top: 2px;
}

table.table tr th:first-child {
  width: 150px;
}

table.table tr th:last-child {
  width: 120px;
  text-align: center;
}

table.table th i {
  margin: 0 5px;
  cursor: pointer;
}

/* Ajustez la hauteur des cellules spécifiques */


/* Si vous souhaitez appliquer une hauteur globale à toutes les cellules de la table */
td {
  height: 40px;
  /* Ajustez cette valeur pour toutes les cellules */
}


table.table td:last-child i {
  opacity: 0.9;
  font-size: 15px;
}

.table-scroll-container {
  height: 55vh;
  overflow: auto;
}

.button {
  align-items: center;
  display: flex;
  padding-bottom: 13%;
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
  justify-content: space-between;
  position: relative;
}

.action-buttons button {
  justify-content: space-between;
  border: 0;
  margin-right: 8px;
  /* Ajustez cette valeur selon vos besoins */
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

td,
th {
  text-align: center;
  /* Centre le texte dans chaque cellule horizontalement */
  vertical-align: middle;
  /* Centre verticalement (si nécessaire) */
  padding: 10px;
  /* Ajoute de l'espace autour du texte pour plus de lisibilité */
}
</style>
