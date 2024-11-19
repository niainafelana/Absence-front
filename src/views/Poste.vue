<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import { ref, watch, onMounted, computed } from "vue";
import Swal from "sweetalert2";
import api from "../api";
const code_departement = ref("");
const description = ref("");
const fonction = ref("");
const userees = ref([]);
const currentPage = ref(1); // Page actuelle
const itemsPerPage = ref(5); // Nombre d'employés par page
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

const ajoutUser = async () => {
    if (
        !code_departement.value ||
        !fonction.value ||
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
        const response = await api.put("/poste/ajoutposte", {
            code_departement: code_departement.value,
            description: description.value,
            fonction: fonction.value,
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

};
const fetchUser = async () => {
    try {
        const response = await api.get("/poste/recuposte");
        userees.value = response.data;
    } catch (error) {
        Swal.fire("Erreur", "Impossible de charger les departements", "error");
    }
};
const paginatedUsers = computed(() => {
    const filteredUsers = userees.value.filter(user => {
        return user.description.toLowerCase().includes(searchTerm.value.toLowerCase());
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


};

const updateUser = async () => {
    try {
        await api.put(`/poste/modifposte/${edition.value}`, {
            code_departement: code_departement.value,
            description: description.value,
            fonction: fonction.value,


        });

        Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Poste mis à jour avec succès",
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
            await api.delete(`/poste/deleteposte/${id}`);

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
        const response = await api.get('/poste/description', {
            params: {
                nom: searchTerm.value,
            },
        });
        paginatedUsers.value = response.data.data; // Met à jour les utilisateurs affichés

    } catch (error) {
    }
};
watch(searchTerm, fetchUsers);


</script>
<template>

    <body>
        <div class="d-flex flex-column flex-md-row" style="height: 100vh; overflow: hidden">
            <div class="navbar-left" style="width: 200px">
                <Navbar />
            </div>
            <div class="d-flex flex-column flex-grow-1 p-0">
                <div class="utilisateur-top m-0" style="flex-shrink: 0">
                    <Utilisateur class="utilisateur" />
                </div>
                <div class="container-fluid flex-grow-1 d-flex flex-column"
                    style="width: calc(100% - 40px);margin: 20px 20px 0 20px;height: 100vh;overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);        position: relative;  /* Permet à l'ombre de bien se propager */ ">
                    <!-- En-tête avec liste des employés et bouton d'ajout -->
                    <div class="row p-3" style="flex-shrink: 0">
                        <div class="col">
                            <h4>Liste des Fonctions</h4>
                        </div>
                        <div class="col-auto">
                            <button fonction="button" class="btn btn-success" data-bs-toggle="modal"
                                data-bs-target="#exampleModal">
                                <i class="fa-solid fa-plus-minus"></i><span>Nouvelle Fonction</span>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 mb-2">
                        <input fonction="text" id="input2" v-model="searchTerm" @input="fetchUsers"
                            class="block w-4/3 p-2 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    </div>

                    <div class="table-wrapper flex-grow-1" style="overflow-y: auto; height: 100%; position: relative;">
                        <div class="table-responsive" style="height: 100%; overflow-y: auto;">
                            <table class="table table-striped table-hover w-100">
                                <!-- En-tête du tableau (fixe en haut) -->
                                <thead style="position: sticky; top: 0; background-color: white; z-index: 2;">

                                    <tr>
                                        <th scope="col">Code</th>
                                        <th>Fonction</th>
                                        <th>Description</th>
                                        <th v-if="userRole === 'ADMINISTRATEUR'">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="usere in paginatedUsers" :key="usere.id">
                                        <td>{{ usere.code_departement }}</td>
                                        <td>{{ usere.fonction }}</td>
                                        <td>{{ usere.description }}</td>
                                        <td class="button" v-if="userRole === 'ADMINISTRATEUR'">
                                            <button class="btn btn-warning btn-sm btn-xs" data-bs-toggle="modal"
                                                data-bs-target="#modalupdate" @click="editUser(usere)">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button fonction="button" class="btn btn-danger ms-2 btn-sm btn-xs"
                                                @click="deleteUser(usere.id)">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
                                Créer Nouvelle Fonction
                            </h5>
                            <button fonction="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
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
                                Modification du fonnction
                            </h5>
                            <button fonction="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
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
}

select {
    display: block;
    width: 100%;
    height: auto;
}

.container-fluid {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
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
