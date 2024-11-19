<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import Demande from "@/views/Demande.vue";
import { ref, onMounted, computed } from "vue";
</script>

<template>
<body>
    
    <div class="d-flex flex-column flex-md-row" style="height: 100vh; overflow: hidden;background:white">
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
                >
                <!-- En-tête avec liste des employés et bouton d'ajout -->
                <div class="absence-section">
                <div class="info pb-10">
                    <span class="conges-label">"Suivi des absences"</span>
                    <h1 class="title">"Gérez les absences de vos collaborateurs en toute simplicité."</h1>
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





/* Ajustement pour la section absence */
.absence-section {
    display: flex;
    margin-top: 50px;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    /* Centre verticalement les deux éléments */
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
    /* Augmenter la marge pour déplacer le bouton plus bas */
}

/* Suppression de la card pour le schéma */
.schema {
    width: 48%;
}

.schema-image {
    width: 100%;
    /* L'image remplit l'espace sans cadre */
    height: auto;
    /* Garder les proportions de l'image */
}
</style>
