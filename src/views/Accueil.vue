<script setup>
import Navbar from "@/components/Navbar.vue";
import Utilisateur from "@/components/Utilisateur.vue";
import Demande from "@/views/Demande.vue";
import { ref, onMounted, computed } from "vue";
</script>

<template>

    <body>
        <div class="d-flex">
            <Navbar class="navbar" />
            <Utilisateur class="utilisateur" />
            <div class="container-lg">
                <!-- Contenu principal ici -->
                <!-- Ajout du schéma et du texte en bas -->
                <div class="absence-section">
                    <div class="info">
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
    margin-left: 17%;
    width: 100%;
    padding: 1px;
    position: fixed;
    margin-top: 5%;
    margin-left: 15.5%;
    flex-direction: column;
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
    width: 48%;
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
  width: 100%; /* S'assure que le conteneur du bouton prend toute la largeur disponible */
  text-align: center; /* Centre le bouton horizontalement */
  margin-top: 20px; /* Ajustez la marge pour le positionnement */
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
