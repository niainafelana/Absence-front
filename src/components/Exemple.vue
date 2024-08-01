<template>
  <div class="d-flex">
    <Navbar />
    <div class="container-fluid p-4 custom-margin-top">
      <div  class="row">
        <div v-if="employee" class="col-md-6">
          <div class="balance-card mb-4 p-4 text-white d-flex flex-column justify-content-between">
            <div>
              <p>Votre solde employé</p>
              <p>est de</p>
              <h1>{{ employee.solde_employe }}</h1>
            </div>
            <div class="piggy-icon">
              <img src="../assets/sary/money-box_9256130.png" alt="Piggy Bank" class="img-fluid">
            </div>
          </div>
          <div class="history-card mb-4 p-4 text-white">
            <h2>APPARTENANT A</h2>
            <div class="history-item d-flex justify-content-between">
              <span>{{ employee.id_employe }}</span>
              <span>{{ employee.nom_employe }}</span>
              <span>{{ employee.pre_employe }}</span>
              <span>{{ employee.motif_employe }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="actions-card p-4">
            <h2>APPROVISIONNER MON COMPTE</h2>
            <p>En alimentant votre compte prépayé, vous pourrez ensuite régler vos commandes en un seul clic.</p>
           <form @submit.prevent="fetchEmployee">
            <div class="relative">
              <input type="text" v-model="employeeId" id="floating"
                class="block px-2.5 pb-2.5 pt-3 custom-height w-full text-sm text-gray-900  rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" " />
              <label for="floating"
                class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">MotifEmploye</label>
            </div> <br>
            <button type="submit" class="btn btn-outline-dark">J'AI UNE CARTE CADEAU ARTE</button>
           </form>
           
          </div>
          <div class="avatar-card p-4">
            <div class="avatar-container">
              <img src="../assets/sary/giphy.webp" alt="Avatar" class="avatar">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const employeeId = ref('');
const employee = ref({
  id_employe: 'N/A',
  nom_employe: 'N/A',
  pre_employe: 'N/A',
  motif_employe: 'N/A',
  solde_employe: 0,
});
const fetchEmployee = async () => {
  if (!employeeId.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Erreur',
      text: 'Veuillez entrer un ID d\'employé valide.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    const response = await axios.get(`http://localhost:4000/employes/${employeeId.value}`);
    
    if (response.data.message === 'Employé non trouvé') {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: `Aucun employé trouvé avec l'ID ${employeeId.value}.`,
        confirmButtonText: 'Réessayer',
        confirmButtonColor: '#d33',
      });
      employee.value = null;
      return;
    }
    
    employee.value = response.data.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: `Impossible de récupérer les informations de l'employé avec ID ${employeeId.value}`,
      confirmButtonText: 'Réessayer',
      confirmButtonColor: '#d33',
    });
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

.d-flex {
  display: flex;
}

h1 {
  font-size: 2.5rem;
  color: $primary;

}

.container-fluid {
  margin-left: 15rem;

}

.balance-card,
.history-card,
.actions-card {
  background-color: $accent;
  border-radius: 8px;
  position: relative;
  width: 100%;
}


.history-card h2,
span {
  color: $primary;

}

.balance-card p {
  color: $primary;
}

.custom-margin-top {
  margin-top: 90px;
}


.piggy-icon {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 100px;
  height: auto;

}

.history-item {
  display: flex;
  justify-content: space-between;
}

.actions-card {
  background-color: $accent;
  color: $primary;
  border-radius: 8px;
  width: 100%;
}

.actions-card h2 {
  font-size: 1.2rem;

}
.custom-height {
    height: 40px; /* Ajuste la hauteur selon tes besoins */
}


.btn-outline-dark {
  width: 100%;
}

.avatar-container {
  margin-top: 10px;
  width: 300px;
  height: auto;
  margin-left: 2cm;
  position: fixed;
}
</style>
