<template>
  <div class="d-flex">
    <Navbar />
    <div class="container-fluid p-20">
      <div class="row">
        <div class="col-md-4 offset-md-1"> 
          <div class="balance-card mb-4 p-10 text-white d-flex flex-column justify-content-between">
            <div>
              <p>Vous disposez de</p>
              <h1>8,01€</h1>
              <p>sur votre compte prépayé</p>
            </div>
            <div class="piggy-icon">
              <img src="../assets/sary/money-box_9256130.png" alt="Piggy Bank" class="img-fluid">
            </div>
          </div>
          <div class="history-card mb-4 p-4 text-white">
            <h2>HISTORIQUE</h2>
            <div class="history-item d-flex justify-content-between">
              <span>17/02/2021</span>
              <span>Commande</span>
              <span class="text-danger">-11,99€</span>
            </div>
            <div class="history-item d-flex justify-content-between">
              <span>28/11/2018</span>
              <span>Crédit</span>
              <span class="text-danger">-20,00€</span>
            </div>
            <p class="mt-3">OPÉRATIONS PRÉCÉDENTES</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="">
            <img src="../assets/sary/filles-travaillant-dans-espace-bureau-ouvert-illustration-vectorielle_116137-2124.jpg" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<style scoped>
.d-flex {
  display: flex;
}

.container-fluid {
  margin-left: 10rem; 
}

.balance-card, .history-card {
  background-color: #ff6600;
  color: white;
  border-radius: 8px;
  position: relative;
}

.piggy-icon {
  position: absolute;
  bottom: 10px;
  right: 13px;
}

.history-item {
  display: flex;
  justify-content: space-between;
}

.actions-card {
  border-radius: 8px;
}

.actions-card h2 {
  font-size: 1.2rem;
}

.actions-card p {
  font-size: 0.9rem;
}

.btn-outline-dark {
  width: 100%;
}
</style>
