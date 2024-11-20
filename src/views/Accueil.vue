<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import Demande from "@/views/Demande.vue";
import { ref, onMounted, computed } from "vue";
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
                <div class="container-fluid flex-grow-1 d-flex flex-column" style="
            width: calc(100% - 40px);
            margin: 20px 20px 20px 70px;
            height: 100vh;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            position: relative;   display: flex;
    justify-content: space-between;
    align-items: center; /* Permet à l'ombre de bien se propager */
          ">
                    <!-- En-tête avec liste des employés et bouton d'ajout -->
                    <div class="absence-section d-flex pb-10">
                        <div class="info pb-10">
                            <span class="conges-label">"Suivi des absences"</span>
                            <h1 class="title">
                                "Gérez les absences de vos collaborateurs en toute simplicité."
                            </h1>
                            <div class="button-container">
                                <router-link to="/demande" class="btn-discover">Gérer les absences</router-link>
                            </div>
                        </div>
                        <div class="schema">
                            <!-- Image du schéma sans card -->
                            <img src="../assets/photos/prise-rendez-vous-calendrier_23-2148553115.avif" alt="Schéma"
                                class="schema-image" />
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
    width: calc(100% - 40px);
            margin: 20px 20px 20px 20px;
            height: 100vh;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            position: relative;   display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Ajustement pour la section absence */
.absence-section {
    justify-content: space-between; /* Sépare les deux sections */
    align-items: center; /* Centre verticalement les éléments */
    width: 100%;
}

.info {
    width: 50%;
    text-align: center;

    /* Centrer le texte horizontalement */
}

.conges-label {
    font-size: 18px;
    color: #566787;
}

.title {
    font-size: 32px;
    font-weight: bold;
    color: $primary;
}

.button-container {
    width: 100%;
    /* S'assure que le conteneur du bouton prend toute la largeur disponible */
    text-align: center;
    /* Centre le bouton horizontalement */
    margin-top: 20px;
    /* Ajustez la marge pour le positionnement */
}

.btn-discover {
    background-color: $accent;
    color: $primary;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    margin-top: 10000px;
}

.schema {
    width: 50%;
}

.schema-image {
    height: auto;
    width: 100%;
    flex: auto;
}
</style>
