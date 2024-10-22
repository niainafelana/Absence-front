<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, watch, onMounted, computed } from "vue";
import Swal from "sweetalert2";
import api from "../api";
// Variables pour les champs du formulaire
const code_departement = ref("");
const description = ref("");
const fonction = ref("");
const nom_departement= ref("");
const userees = ref([]);
const currentPage = ref(1); // Page actuelle
const itemsPerPage = ref(5); // Nombre d'employés par page
const ajoutUser = async () => {
    if (
        !code_departement.value ||
        !fonction.value ||
        !nom_departement.value ||
        !description.value
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
        const response = await api.post("/departement/ajoutdepart", {
            code_departement: code_departement.value,
            description: description.value,
            fonction:fonction.value,
            nom_departement:nom_departement.value
        });

        Swal.fire({
            icon: "success",
            title: "Succès",
            text: response.data.message,
            confirmButtonColor: "#212E53",
        });
        cancel();
        fetchUser();

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Une erreur s'est produite lors de l'ajout de departement!",
        });
    }
};
const cancel = () => {
    code_departement.value = "";
    fonction.value = "";
    description.value = "";
    nom_departement.value="";

};
const fetchUser = async () => {
    try {
        const response = await api.get("/departement/recuperation");
        userees.value = response.data.data;
    } catch (error) {
        Swal.fire("Erreur", "Impossible de charger les departements", "error");
    }
};
const paginatedUsers = computed(() => {
    const filteredUsers = userees.value.filter(user => {
        return user.nom_departement.toLowerCase().includes(searchTerm.value.toLowerCase());
    });

    // Calcul de la pagination
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredUsers.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => {
    return Math.ceil(userees.value.length / itemsPerPage.value);
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
    fetchUser();
});

/*Affichage de l'information de l'employe dans le champ formulaire si on veut la modifier*/
const edit = ref(false);
const edition = ref(null);
const editUser = (usere) => {
    edit.value = true;
    edition.value = usere.id;
    code_departement.value = usere.code_departement;
    fonction.value = usere.fonction;
    description.value = usere.description;
    nom_departement.value= usere.nom_departement;

 
};

const updateUser = async () => {
    try {
        await api.put(`/departement/modifiedepart/${edition.value}`, {
            code_departement: code_departement.value,
            nom_departement:nom_departement.value,
            description: description.value,
            fonction:fonction.value,

           
        });

        Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Utilisateur mis à jour avec succès",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            timer: 3000,
        });

        fetchUser();
        cancel();
    } catch (error) {
        console.error("Error updating usere:", error);
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Failed to update usere",
            confirmButtonText: "Réessayer",
            confirmButtonColor: "#d33",
        });
    }
};

const deleteUser = async (id) => {
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
            await api.delete(`/departement/deletedepart/${id}`);

            Swal.fire({
                title: "Succès",
                text: "Employé supprimé avec succès",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#3085d6",
            });

            fetchUser();
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
const searchTerm = ref('');

// Fonction pour récupérer les utilisateurs
const fetchUsers = async () => {
    try {
        console.log('Recherche d\'utilisateurs pour le terme:', searchTerm.value); // Log pour le terme de recherche
        const response = await api.get('/utile/utilisateurs', {
            params: {
                nom: searchTerm.value,
            },
        });
        paginatedUsers.value = response.data.data; // Met à jour les utilisateurs affichés
        console.log('Réponse de l\'API:', response.data); // Log de la réponse

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
};
watch(searchTerm, fetchUsers);

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
                                    <h2>A propos des Utilisateurs</h2>
                                </div>
                                <div class="col-sm-6">
                                    <button fonction="button" class="btn btn-success" data-bs-toggle="modal"
                                        data-bs-target="#exampleModal">
                                        <i class="fa-solid fa-plus-minus"></i><span>Nouvelle Utilisateur</span>
                                    </button>
                                </div>
                                <div class="d-flex gap-2">
                                    <div class="flex items-center gap-2">
                                        <label for="input2"
                                            class="text-xs text-gray-700 dark:text-gray-300 w-1/2">Recherche</label>
                                        <input fonction="text" id="input2" v-model="searchTerm" @input="fetchUsers"
                                            class="block w-4/3 p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                    </div>


                                </div>
                            </div>
                        </div>

                        <!--Liste des employes-->
                        <div class="table-scroll-container">
                            <table class="table table-striped table-hover">
                                <thead class="table-header">
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom </th>
                                        <th>Fonction</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="usere in paginatedUsers" :key="usere.id">
                                        <td>{{ usere.code_departement }}</td>
                                        <td>{{ usere.nom_departement }}</td>
                                        <td>{{ usere.fonction }}</td>
                                        <td>{{ usere.description }}</td>
                                        <td class="button">
                                            <button class="btn btn-warning btn-sm btn-xs" data-bs-toggle="modal"
                                                data-bs-target="#modalupdate" @click="editUser(usere)">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button fonction="button" class="btn btn-danger ms-2 btn-sm btn-xs"  @click="deleteUser(usere.id)">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- Pagination controls -->
                </div>
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
                                Créer Nouvelle utilisateur
                            </h5>
                            <button fonction="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="ajoutUser">
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <div class="relative w-full">
                                        <input type="text" v-model="code_departement" id="floating_outlined"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Code departement
                                        </label>
                                    </div>

                                    <div class="relative w-full">
                                        <input type="text" v-model="description" id="floating_outlined_email"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_email"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Description
                                        </label>
                                    </div>
                                </div>

                                <br />

                                <div class="flex flex-col sm:flex-row gap-4">
                                    <div class="relative w-full">
                                        <input type="text" v-model="nom_departement" id="floating_outlined_departement"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_departement"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Nom
                                        </label>
                                    </div>
                                    <div class="relative w-full">
                                        <input type="text" v-model="fonction" id="floating_outlined_fonction"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_fonction"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Fonction
                                        </label>
                                    </div>
                                </div>

                                <br />


                                <div class="modal-footer">
                                    <button fonction="submit" style="color: #212e53"
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
                                Modification de l'utilisateur
                            </h5>
                            <button fonction="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div v-if="edit" class="modal-body">
                            <form @submit.prevent="updateUser">
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <!-- Champ "Nom" -->
                                    <div class="relative w-full">
                                        <input fonction="text" v-model="code_departement" id="floating_outlined"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Code_departement
                                        </label>
                                    </div>

                                    <!-- Champ "Prénom" -->
                                    <div class="relative w-full">
                                        <input fonction="number" v-model="description" id="floating_outlined_email"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_email"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Description
                                        </label>
                                    </div>
                                </div>

                                <br />

                                <div class="flex flex-col sm:flex-row gap-4">
                                    <div class="relative w-full">
                                        <input fonction="number" v-model="nom_departement" id="floating_outlined_email"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_email"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Nom
                                        </label>
                                    </div>
                                    <div class="relative w-full">
                                        <input fonction="number" v-model="fonction" id="floating_outlined_email"
                                            class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            placeholder=" " />
                                        <label for="floating_outlined_email"
                                            class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                            Fonction
                                        </label>
                                    </div>

                                 
                                </div>

                                <br />


                                <!-- bouton ajouter employer-->
                                <div class="modal-footer">
                                    <button fonction="submit" style="color: #212e53"
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
    margin-left: 17%;
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
    /* Pour les navigateurs WebKit (Safari, Chrome) */
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    /* Couleur de fond pour le contraste avec le contenu défilant */
    z-index: 10;
    /* Assurez-vous que l'en-tête reste au-dessus du corps de la table */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    /* Optionnel : ajout d'une ombre pour améliorer la visibilité */
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
  display: flex;
  justify-content: space-around;
}

.action-buttons button {
  justify-content: space-between;
  margin-bottom: 23%;
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
td, th {
    text-align: center; /* Centre le texte dans chaque cellule horizontalement */
    vertical-align: middle; /* Centre verticalement (si nécessaire) */
    padding: 10px; /* Ajoute de l'espace autour du texte pour plus de lisibilité */
  }

</style>
