<script setup></script>
<template>
  <body>
    <div class="navbar">
      <div class="nav">
        <div class="nav_content">
          <ul>
            <li>
              <i class="fas fa-chart-line"></i>
              <a href="" id="dashboard">Dashboard</a>
            </li>
            <li>
              <i class="fas fa-chart-line"></i>
              <a href="" id="dashboard">Poste</a>
            </li>
            <li>
              <i class="fas fa-clipboard"></i>
              <a href="" id="service">Service</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="disconect">
        <button id="logoutButton"><i class="fas fa-power-off"></i></button>
      </div>
    </div>
  </body>
</template>
<style lang="scss">
@import "../assets/style/globaly.scss";

.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 200px;
  position: fixed;
  font-family: roboto;
}

.nav {
  background-color: $secondary;
  height: 90vh;
  width: 175px;
  border-radius: 10px;
}

ul {
  position: relative;
  display: block;
  align-items: center;
  justify-content: center;
  letter-spacing: 2px;
  justify-content: center;
  list-style-type: none;
  padding-top: 5px;
  font-size: 16px;
  margin-left: -20px;
}

li {
  margin: 30px;
}

li i {
  font-size: 13px;
  color: $primary;
  width: 15px;
  font-weight: 10px;
}

li a {
  margin-left: 5px;
  initial-letter-align: 2px;
  color: $primary;
  text-decoration: none;
  letter-spacing: 2px;
  font-weight: bold;
}

/* Bouton de déconnexion */
.disconect {
  margin-top: 82vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
}

.disconect i {
  justify-content: center;
  align-items: center;
  display: flex;
  width: 35px;
  font-size: 18px;
  margin-left: -2px;
}

.disconect button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-left: -15px;
  border: none;
  background-color: $primary;
}
</style>