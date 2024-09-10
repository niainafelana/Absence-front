<script setup>
import { ref } from 'vue';

const currentDate = ref(new Date().toISOString().split('T')[0]);
const currentTime = ref(new Date().toLocaleTimeString());


</script>
<template>
  <body>
    <div class="header">
        <div class="date">
          <p>{{ currentDate }}</p>
        </div>
        <div class="time">
            <div id="head"></div>
            <p>{{ currentTime }}</p>        </div>
    </div>
    <br>
    <div class="content">
        <div class="image">
            <img src="../assets/sary/login.avif" alt="">
        </div>
        <div class="container">
            <div class="form_container">
                <h1> MIEZAKABSENCE</h1>
                <form id="loginForm">
                    <div class="username">
                        <label for="username">Administrateur</label>
                        <br>
                        <input type="text" placeholder="user" id="username" name="username">
                    </div>
                    <br>
                    <div class="password">
                        <label for="password">Mot de passe</label>
                        <br>
                        <div class="mdp-input">
                            <input type="password" id="password" name="password">
                            <i class="fas fa-eye toggle-password"></i>
                        </div>
                        <br>
                    </div>
                    <br>
                    <div class="button">
                        <button type="submit"> Entrer  </button>
                        <button id="btnNew"> Nouveau </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</body>
</template>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";
body{
    color: $primary;
    font-size: 16px;
    margin-top: 0px;
    overflow: hidden;
    height: 100vh;
}

h1 {
    color: $primary;
    font-size: 25px;
}

input{
    width: 200px;
    height: 30px;
    margin: 7.5px;
    border-radius: 10px;
    border: 1px solid $secondary;
    padding: 2px;
}

button{
    width: 100px;
    height: 35px;
    border: none;
    background-color: $accent;
    color: $primary;
    border-radius: 15px;
    align-self:center;
    letter-spacing: 2px;
    cursor: pointer;
}

/*Emplacement de la date et heure*/
.header{
    letter-spacing: 2px;
    font-size: 14px;
    color: $primary;
    font-weight: bolder;
    text-align: center;
    margin-top: 10px;
    line-height: 50px;
}

/* Emplacement d'un mini-calenrier */
.date{
    float: left;
    background-color: $accent;
    font-weight: bold;
    width: 115px;
    height: 50px;
    border: 2px solid $accent;
    margin-left: 5px;
    position: relative;
}

/* Emplacement de la montre virtuelle */
.time{
    float: right;
    display: block;
    background-color: $accent;
    /*margin-right: 5px;*/
    width: 60px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid $accent;
    position: relative;
    text-align: center;
    margin-right: 5px;
}

/* Permet de mettre en place la page entière*/
.content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80vh;
    position: inherit;
    margin-bottom: 5px;
}

/* Manipulation de l'emplacement du formulaire */
.container{
    display: block;
    align-items: center;
    justify-content: center;
    width: 50%;
}

.form_container h1{
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 50px;
    margin-top: 5px;
}

.form_container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: $text;
    max-width: 400px;
    max-height: 60vh;
    font-size: 14px;
    margin-left: -50px;
}

.image{
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 150px;
}

.image img{
    width: 600px;
}

#loginForm{
    text-align: center;
}

.button {
    margin: 7.5px;
}

/* Icone de démasquage de mot de passe */
.mdp-input i {
    position: absolute;
    margin-left: -35px;
    cursor: pointer;
    line-height: 50px;
}

</style>
