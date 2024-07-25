<script setup>
import Navbar from "@/components/Navbar.vue";
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

/*Ajouter Employe dans bd*/
//variables
const nom = ref('');
const prenom = ref('');
const sexe = ref('');
const motif = ref('');
const creationEmploye = async () => {
    if (!nom.value || !prenom.value || !sexe.value || !motif.value) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Tous les champs doivent être remplis',
            confirmButtonColor: '#212E53',

        });
        return;
    }

    try {
        const response = await axios.put('http://localhost:4000/employes', {
            nom: nom.value,
            prenom: prenom.value,
            sexe: sexe.value,
            motif: motif.value,
        });

        Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: response.data.message,
            confirmButtonColor: '#212E53',
        });
        cancel();
        await listeEmploye();

    } catch (error) {
        console.error('Error creating employee:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur de creation',
        });
    }
};


/*Affichage de la liste des employes dans un tableau*/
const employees = ref([]);
const listeEmploye = async () => {
    try {
        const response = await axios.get('http://localhost:4000/employes');
        employees.value = response.data.data;
    } catch (error) {
        console.error('Error loading employees:', error);
    }
};
onMounted(() => {
    listeEmploye();
});


/*Affichage de l'information de l'employe dans le champ formulaire si on veut la modifier*/
const edit = ref(false);
const edition = ref(null);
const editEmploye = (employee) => {
    edit.value = true;
    edition.value = employee.id_employe;
    nom.value = employee.nom_employe;
    prenom.value = employee.pre_employe;
    sexe.value = employee.sexe;
    motif.value = employee.motif_employe;
};


/*Modification de l'employe*/
const updateEmploye = async () => {
    try {
        await axios.patch(`http://localhost:4000/employes/${edition.value}`, {
            nom: nom.value,
            prenom: prenom.value,
            sexe: sexe.value,
            motif: motif.value,
        });

        Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Employé mis à jour avec succès',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            timer: 3000,
        });

        listeEmploye();
        cancel();
    } catch (error) {
        console.error('Error updating employee:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Failed to update employee',
            confirmButtonText: 'Réessayer',
            confirmButtonColor: '#d33',
        });
    }
};


/*Suppression d'un employe selon l'id*/
const deleteEmploye= async (id) => {
    try {
        const result = await Swal.fire({
            title: "Vous êtes sûr?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer!",
            cancelButtonText: "Annuler"
        });

        if (result.isConfirmed) {
            await axios.delete(`http://localhost:4000/employes/${id}`);
            
            Swal.fire({
                title: 'Succès',
                text: 'Employé supprimé avec succès',
                icon: "success",
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });

            listeEmploye();
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Échec de la suppression de l\'employé',
            confirmButtonText: 'Réessayer',
            confirmButtonColor: '#d33',
        });
    }
};

/**Fonction pour vider le champ formulaire */
const cancel = () => {
    nom.value = '';
    prenom.value = '';
    sexe.value = '';
    motif.value = '';
};

onMounted(() => {
    listeEmploye();
});


</script>
<template>

    <body>
        <div class="d-flex">
        <!-- Navbar importé dans le template global -->
        <Navbar class="navbar" />

        <div class="container-lg">
            <div class="table-responsive">
                
                <div class="table-wrapper">
                    <div class="table-title">
                        <div class="row">
                            <div class="col-sm-6">
                                <h2>Manage <b>Employees</b></h2>
                            </div>
                            <div class="col-sm-6">
                                <button type="button" class="btn btn-success" data-bs-toggle="modal"
                                    data-bs-target="#exampleModal">
                                    <i class="fa-solid fa-plus-minus"></i><span>Add New Employee</span>
                                </button>
                            </div>
                        </div>
                    </div>


                    <!--Liste des employes-->
                    <div class="table-scroll-container">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Nom</th>
                                    <th>Prenom</th>
                                    <th>Sexe</th>
                                    <th>Motif</th>
                                    <th>Solde d'absence</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="employee in employees" :key="employee.id">
                                    <td>{{ employee.id_employe }}</td>
                                    <td>{{ employee.nom_employe }}</td>
                                    <td>{{ employee.pre_employe }}</td>
                                    <td>{{ employee.sexe }}</td>
                                    <td>{{ employee.motif_employe }}</td>
                                    <td>{{ employee.solde_employe }}</td>
                                    <td class="button">
                                        <button class="btn btn-warning" data-bs-toggle="modal"
                                            data-bs-target="#modalupdate" @click="editEmploye(employee)">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button type="button" class="btn btn-danger ms-2"
                                            @click="deleteEmploye(employee.id_employe)">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


        <!--Modal creation employe-->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-sm">
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
                        <form @submit.prevent="creationEmploye"> <!-- champ nom employe -->
                            <div class="relative">
                                <input type="text" v-model="nom" id="floating_outlined"
                                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" " />
                                <label for="floating_outlined"
                                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">NomEmploye</label>
                            </div>
                            <br />

                            <!-- Champ "Prénom" -->
                            <div class="relative">
                                <input type="text" v-model="prenom" id="floating_outlined_prenom"
                                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" " />
                                <label for="floating_outlined_prenom"
                                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    PrenomEmploye
                                </label>
                            </div>
                            <br />

                            <!-- champ sexe employe-->
                            <div class="col-span-2 sm:col-span-1">
                                <select id="category" v-model="sexe"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                    <option value="M">M</option>
                                    <option value="F">F</option>
                                </select>
                            </div>
                            <br />

                            <!-- champ motif employe-->
                            <div class="relative">
                                <input type="text" v-model="motif" id="floating_outlined_motif"
                                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" " />
                                <label for="floating_outlined_motif"
                                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">MotifEmploye</label>
                            </div>

                            <!-- bouton ajouter employer-->
                            <div class="modal-footer">
                                <button type="submit" style="color: #212e53;"
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
        <div class="modal fade" id="modalupdate" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-sm">
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
                        <form @submit.prevent="updateEmploye"> <!-- champ nom employe -->
                            <div class="relative">
                                <input type="text" v-model="nom" id="floating_outlined"
                                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" " />
                                <label for="floating_outlined"
                                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">NomEmploye</label>
                            </div>
                            <br />

                            <!-- Champ "Prénom" -->
                            <div class="relative">
                                <input type="text" v-model="prenom" id="floating_outlined_prenom"
                                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" " />
                                <label for="floating_outlined_prenom"
                                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    PrenomEmploye
                                </label>
                            </div>
                            <br />

                            <!-- champ sexe employe-->
                            <div class="col-span-2 sm:col-span-1">
                                <select id="category" v-model="sexe"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                                    <option value="M">M</option>
                                    <option value="F">F</option>
                                </select>
                            </div>
                            <br />

                            <!-- champ motif employe-->
                            <div class="relative">
                                <input type="text" v-model="motif" id="floating_outlined_motif"
                                    class="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder=" " />
                                <label for="floating_outlined_motif"
                                    class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">MotifEmploye</label>
                            </div>

                            <!-- bouton ajouter employer-->
                            <div class="modal-footer">
                                <button type="submit" style="color: #212e53;"
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

<style lang="scss">
@import "../assets/style/globaly.scss";

body {
    color: #566787;
background-color: $accent;    font-family: "Varela Round", sans-serif;
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
  margin-left: 16%; /* Pour faire de la place à la navbar */
  width: 150%;
  padding: 8px; /* Pour ajouter un peu de marge autour du contenu */
}

.table-responsive {
    overflow-x: hidden; /* Désactive le défilement horizontal */
    width: 100%; /* Assure que le conteneur du tableau utilise toute la largeur disponible */
    margin: 0 auto; /* Centre le tableau horizontalement si nécessaire */
    padding: 0; 
}

/* Assurer que le tableau occupe toute la largeur disponible */
.table-wrapper {
  width: 100%;
  margin: 0;
    padding: 0;
    background-color: $text;
  
  border-radius: 3px;
  overflow-x: hidden; 
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);

}


.table-title {
    padding-bottom: 15px;
    background-color: $secondary;
    color: $text;
    padding: 16px 30px;
    min-width: 100%;
    margin: -20px -25px 10px;
    border-radius: 3px 3px 0 0;
}

.table-title h2 {
    margin: 5px 0 0;
    font-size: 24px;
}

.table-title .btn-group {
    float: right;
}

.table-title .btn {
    color: #fff;
    float: right;
    font-size: 13px;
    border: none;
    min-width: 50px;
    border-radius: 2px;
    border: none;
    outline: none !important;
    margin-left: 10px;
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
    height: 88vh;
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

