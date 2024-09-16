<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, watch, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

//conversion date 
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${jour}-${mois}-${year}`;
};

//variable 
const formData = ref({
    id_employe: '',
    id_absence: '',
    datedeb: '',
    jours_absence: '',
    duredebut: '',
    motif: '',
});

const cancel = () => {
    formData.value.id_employe = '';
    formData.value.id_absence = '';
    formData.value.datedeb = '';
    formData.value.jours_absence = '';
    formData.value.duredebut = '';
    formData.value.motif = '';
};
const employes = ref([]);
const absences = ref([]);
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);
const isSpecialAbsence = ref(false);

onMounted(async () => {
    try {
        const employeResponse = await axios.get('http://localhost:3000/employes/dataliste');
        employes.value = employeResponse.data;

        const absenceResponse = await axios.get('http://localhost:3000/absences/dataliste');
        absences.value = absenceResponse.data;
    } catch (err) {
        console.error('Erreur lors de la récupération des données:', err.response ? err.response.data : err.message);
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
    const selectedEmploye = employes.value.find(employe => employe.id_employe === formData.value.id_employe);
    return selectedEmploye ? `${selectedEmploye.nom_employe} ${selectedEmploye.pre_employe}` : '';
});

//maj id employe
function handleEmployeInput(event) {
    const value = event.target.value;
    const selectedEmploye = employes.value.find(employe => `${employe.nom_employe} ${employe.pre_employe}` === value);
    if (selectedEmploye) {
        formData.value.id_employe = selectedEmploye.id_employe;
    }
}


const handleAbsenceChange = (e) => {
  const id_absence = parseInt(e.target.value);

  const selectionner = absences.value.find(absence => absence.id_absence === id_absence);

  if (selectionner) {
    if (selectionner.pour == 0) {
      formData.value.motif = selectionner.nom_absence;
      formData.value.jours_absence = selectionner.duree;
    } else {
      formData.value.motif = '';
      formData.value.jours_absence = 0;
      console.warn("L'absence sélectionnée ne correspond pas à 'pour = 0'");
    }
  } else {
    console.error("Absence non trouvée");
  }
};





const submitForm = async () => {
    try {
        const response = await axios.put('http://localhost:3000/demandes/ajout', formData.value);
        
        Swal.fire({
            icon: "success",
            title: "Succès",
            text: response.data.message || "Votre demande a été traitée avec succès.",
            confirmButtonColor: "#3085d6"
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: error.response?.data?.error || "Une erreur est survenue.",
            confirmButtonColor: "#d33"
        });
    }
};




/*Affichage de la liste des demandes dans un tableau*/
const demandees = ref([]);
const listeDemande = async () => {
    try {
        const response = await axios.get("http://localhost:3000/demandes/tabledemande");
        demandees.value = response.data;
        console.log(response.data);
    } catch (error) {
        console.error("Error loading demandes", error);
    }
};
onMounted(() => {
    listeDemande();
});





function imprimerDemande(demande) {
    const css = `
    <style>
      .print-container {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .page {
        margin: 20px;
        page-break-inside: avoid;
      }
      .header, .content, .footer {
        margin-bottom: 20px;
      }
      .flex {
        display: flex;
      }
      .justify-between {
        justify-content: space-between;
      }
      .items-start {
        align-items: flex-start;
      }
      .border-b {
        border-bottom: 1px solid #000;
      }
      .pb-4 {
        padding-bottom: 16px;
      }
      .text-lg {
        font-size: 18px;
      }
      .font-bold {
        font-weight: bold;
      }
      .uppercase {
        text-transform: uppercase;
      }
      .text-center {
        text-align: center;
      }
      .my-6 {
        margin-top: 24px;
        margin-bottom: 24px;
      }
      .space-y-2 > * + * {
        margin-top: 8px;
      }
      .border-t-2 {
        border-top: 2px solid #000;
      }
      .border-gray-400 {
        border-color: #d1d5db;
      }
      .text-sm {
        font-size: 14px;
      }
      .w-20 {
        width: 80px;
      }
      .text-right {
        text-align: right;
      }

      @media print {
        @page {
          size: A4; /* Format de la page A4 */
          margin: 10mm; /* Marges réduites */
        }

        .print-container {
          font-family: Arial, sans-serif;
          padding: 10px;
          font-size: 12px;
        }

        /* Assurer que tout reste sur une page */
        .page {
          page-break-inside: avoid;
        }

        /* Réduire l'espacement pour faire tenir les deux parties sur une seule page */
        .my-6 {
          margin: 10px 0;
        }

        .space-y-2 > * + * {
          margin-top: 5px;
        }

        /* Ajuster les images */
        .header img {
          width: 50px;
          height: auto;
        }

        .border-b {
          border-bottom: 1px solid #000;
        }

        .pb-4 {
          padding-bottom: 8px;
        }

        /* Masquer les éléments non nécessaires à l'impression */
        .no-print {
          display: none;
        }
      }
    </style>
    `;

    const contenu = `
    ${css}
    <div class="print-container">
      <!-- Contenu à imprimer -->
      <div class="page">
        <!-- Première partie (Originale) -->
        <div class="content">
          <header class="flex justify-between items-start border-b pb-4">
            <div class="flex items-center space-x-4">
              <div class="w-20">
                <img src="../assets/sary/1721891607125.jpg" alt="Société Miezaka Logo" />
              </div>
              <div>
                <h2 class="text-lg font-bold uppercase">Société Miezaka EURL</h2>
                <p>Téléphone : 75 516 55</p>
                <p>Fax : 75 52125</p>
                <p>Fianarantsoa - 301</p>
              </div>
            </div>
            <div class="text-right">
              <p>Fianarantsoa, 02/09/2024</p>
            </div>
          </header>

          <section class="my-6">
            <h2 class="text-lg font-bold uppercase text-center mb-4">Demande d'Autorisation d'Absence</h2>
            <div class="space-y-2 text-sm">
              <p><strong>Nom(s) et prénom(s) :</strong> ${demande.employe.nom_employe} ${demande.employe.pre_employe}</p>
              <p><strong>N° Matricule :</strong> E006</p>
              <p><strong>Fonction :</strong> ${demande.employe.motif_employe}</p>
              <p><strong>Nombre de jours :</strong> ${demande.jours_absence}</p>
              <p><strong>Congé restant :</strong> ${demande.employe.solde_employe}</p>
              <p><strong>Date de départ :</strong> ${formatDate(demande.date_debut)}</p>
              <p><strong>Date de retour :</strong> ${formatDate(demande.date_retour)}</p>
              <p><strong>Motif :</strong> ${demande.motif}</p>
            </div>
          </section>

          <footer class="flex justify-between mt-10">
            <div class="text-center text-sm">
              <p>L'intéressé</p>
            </div>
            <div class="text-center text-sm">
              <p>Collègue (Sign+Prénom)</p>
            </div>
            <div class="text-center text-sm">
              <p>La Direction</p>
            </div>
          </footer>
        </div>

        <!-- Séparateur -->
        <div class="border-t-2 border-gray-400 my-6"></div>

        <!-- Deuxième partie (Copie) -->
        <div class="content">
          <header class="flex justify-between items-start border-b pb-4">
            <div class="flex items-center space-x-4">
              <div class="w-20">
                <img src="../assets/sary/1721891607125.jpg" alt="Société Miezaka Logo" />
              </div>
              <div>
                <h2 class="text-lg font-bold uppercase">Société Miezaka EURL</h2>
                <p>Téléphone : 75 516 55</p>
                <p>Fax : 75 52125</p>
                <p>Fianarantsoa - 301</p>
              </div>
            </div>
            <div class="text-right">
              <p>Fianarantsoa, 02/09/2024</p>
            </div>
          </header>

          <section class="my-6">
            <h2 class="text-lg font-bold uppercase text-center mb-4">Demande d'Autorisation d'Absence</h2>
            <div class="space-y-2 text-sm">
              <p><strong>Nom(s) et prénom(s) :</strong> ${demande.employe.nom_employe} ${demande.employe.pre_employe}</p>
              <p><strong>N° Matricule :</strong> E006</p>
              <p><strong>Fonction :</strong> ${demande.employe.motif_employe}</p>
              <p><strong>Nombre de jours :</strong> ${demande.jours_absence}</p>
              <p><strong>Congé restant :</strong> ${demande.employe.solde_employe}</p>
              <p><strong>Date de départ :</strong> ${formatDate(demande.date_debut)}</p>
              <p><strong>Date de retour :</strong> ${formatDate(demande.date_retour)}</p>
              <p><strong>Motif :</strong> ${demande.motif}</p>
            </div>
          </section>

          <footer class="flex justify-between mt-10">
            <div class="text-center text-sm">
              <p>L'intéressé</p>
            </div>
            <div class="text-center text-sm">
              <p>Collègue (Sign+Prénom)</p>
            </div>
            <div class="text-center text-sm">
              <p>La Direction</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
    `;

    // Code pour ouvrir une fenêtre d'impression
    const fenetreImpression = window.open('', '', 'width=800,height=600');
    fenetreImpression.document.open();
    fenetreImpression.document.write(contenu);
    fenetreImpression.document.close();
    fenetreImpression.focus();
    fenetreImpression.print();
}





</script>
<template>

    <body>
        <div class="d-flex">
            <Navbar class="navbar" />
            <Utilisateur class="utilisateur" />

            <div class="container-lg">
                <div class="table-responsive">
                    <div class="table-wrapper">
                        <div class="table-title">
                            <div class="row">
                                <div class="col-sm-6">
                                    <h2>Demande Absence</h2>
                                </div>
                                <div class="col-sm-6">
                                    <button type="button" class="btn btn-success" data-bs-toggle="modal"
                                        data-bs-target="#exampleModal">
                                        <i class="fa-solid fa-plus-minus"></i><span>Nouvelle Demande</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!--Liste des employes-->
                        <div class="table-scroll-container">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Nom et Prenom</th>
                                        <th>N°Matricule</th>
                                        <th>Fonction</th>
                                        <th>Nombre de jours</th>
                                        <th>Congé restant</th>
                                        <th>Date de départ</th>
                                        <th>Date retour</th>
                                        <th>Motif</th>
                                        <th>Date Fin</th>
                                        <th>Action</th>

                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="demandee in demandees" :key="demandee.id">
                                        <td>{{ demandee.employe.nom_employe }}<br>{{ demandee.employe.pre_employe }}
                                        </td>
                                        <td>E006</td>
                                        <td>{{ demandee.employe.motif_employe }}</td>
                                        <td>{{ demandee.jours_absence }}</td>
                                        <td>{{ demandee.employe.solde_employe }}</td>
                                        <td>{{ formatDate(demandee.date_debut) }}</td>
                                        <td>{{ formatDate(demandee.date_retour) }}</td>
                                        <td>{{ demandee.motif }}</td>
                                        <td>{{ formatDate(demandee.date_fin) }}</td>
                                        <td class="button">
                                            <button class="btn btn-warning" data-bs-toggle="modal"
                                                data-bs-target="#modalupdate">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button type="button" class="btn btn-info ms-2"
                                                @click.stop="imprimerDemande(demandee)">
                                                <i class="fa-solid fa-print"></i> </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
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
                                Créer Nouveau Employe
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="submitForm">
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- Champ "NomEmploye" -->
                                    <div class="relative w-full">
                                        <input type="text" id="id_employe" :value="displayedEmployeName"
                                            @input="handleEmployeInput"
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
                                            <option v-for="absence in absences" :key="absence.id_absence"
                                                :value="absence.id_absence">
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

                                    <!-- Champ aprem ou matin -->
                                    <div class="col-span-2 sm:col-span-1 w-full">
                                        <select id="category" v-model="formData.duredebut"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
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
                            <form>
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- champ nom employe -->
                                    <div class="relative w-full">
                                        <input type="text" id="floating_outlined"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">NomEmploye</label>
                                    </div>

                                    <!-- Champ "Prénom" -->
                                    <div class="relative w-full">
                                        <input type="text" id="floating_outlined_prenom"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_prenom"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            PrenomEmploye
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <div class="flex flex-col sm:flex-row gap-4">

                                    <!-- champ motif employe-->
                                    <div class="relative  w-full">
                                        <input type="text" id="floating_outlined_motif"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_motif"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">MotifEmploye</label>
                                    </div>
                                    <!-- champ sexe employe-->
                                    <div class="col-span-2 sm:col-span-1  w-full">
                                        <select id="category"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>
                                </div>

                                <br />
                                <div class="flex gap-4">
                                    <!-- Champ Plafonnement -->
                                    <div class="relative flex-1">
                                        <input type="number" id="floating_outlined_plafonnement"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_plafonnement"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4">Plafonnement</label>
                                    </div>

                                    <!-- Champ Plafonnement Boolean -->
                                    <div class="relative flex items-center flex-1">
                                        <input type="checkbox" id="plafonnementbolean"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                        <label for="plafonnementbolean"
                                            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Plafonnement Boolean
                                        </label>
                                    </div>
                                </div>

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
    margin-left: 16%;
    width: 10000%;
    padding: 1px;
    position: fixed;
    margin-top: 5%;
}

.table-responsive {
    overflow-x: hidden;
    width: 100%;
    margin: 0 auto;
    margin-top: -0.6%;
}

.table-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background-color: $text;
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
    width: 100px;
    text-align: center;
}

table.table th i {
    margin: 0 5px;
    cursor: pointer;
}

table.table td:last-child i {
    opacity: 0.9;
    font-size: 15px;
    margin: 0 1px;
}

.table-scroll-container {
    height: 77vh;
    overflow: auto;
}

.button {
    align-items: center;
    display: flex;
    border-radius: 2px;
    width: 20%;
    font-size: 15px;
    margin-left: 2%;
    color: $primary;
}
</style>
