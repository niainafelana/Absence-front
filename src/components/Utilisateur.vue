<template>
  <div class="top-navbar">
    <div class="left-section">
      <span class="user-id">USER ID : 06PPD125</span>
    </div>
    <div class="right-section">
      <a href="#" class="visit-website">Visit Website</a>
      <div class="user-profile">
        <i class="bi bi-person"></i>
        <span class="user-name">Joe Melton</span>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
@import "../assets/style/globaly.scss";



.top-navbar {
  display: flex;
  justify-content: space-between; /* Assure que les sections gauche et droite sont bien placées */
  align-items: center; /* Aligne verticalement les éléments au centre */
  padding: 15px 40px;
  background-color:$text;
  border-bottom: 2px solid #ddd;
  width: 100%;
  box-shadow: 10px 10px 5px #F0F0F0;
}

.left-section {
  margin-left: 250px; /* Ajoute un espace à gauche pour éloigner l'ID du bord */
}

.left-section .user-id {
  color: #999;
  font-size: 14px;
  vertical-align: middle; /* Assure que le texte est centré verticalement */
}

.right-section {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.visit-website {
  color: #999;
  margin-right: 20px;
  font-size: 14px;
  text-decoration: none;
}

.user-profile {
  display: flex;
  align-items: center;
  color: #999;
}

.user-profile i {
  margin-right: 5px;
  font-size: 18px;
}

.user-profile .user-name {
  font-size: 14px;
}
</style>
