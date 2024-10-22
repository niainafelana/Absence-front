<template>

  <body class="body">
    <div class="container-fluid">
      <div class="row flex-nowrap">
        <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0 ">
          <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a href="" class="d-flex align-items-center text-white text-decoration-none" id="dropdownUser1"
              data-bs-toggle="dropdown" aria-expanded="false">
              <span class="fs-6 d-none d-sm-inline">MiezakaAbsence</span> </a>

            <!--Navbar-->
            <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li class="nav-item">
                <RouterLink to="/accueil" class="nav-link align-middle px-0"> <i class="fs-5 bi bi-house-fill"></i>
                  <span class="ms-1 d-none d-sm-inline">Accueil</span>
                </RouterLink>
              </li>
              <li class="nav-item" >
                <RouterLink to="/employe" class="nav-link align-middle px-0">
                  <i class="fs-5 bi bi-file-earmark-person"></i> <span class="ms-1 d-none d-sm-inline">Employe</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/demande" class="nav-link align-middle px-0">
                  <i class="fs-6 bi bi-calendar3"></i> <span class="ms-1 d-none d-sm-inline">Demande</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/user" class="nav-link align-middle px-0">
                  <i class="fs-6 bi bi-people-fill"></i> <span class="ms-1 d-none d-sm-inline">Utilisateur</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/type" class="nav-link align-middle px-0">
                  <i class="fs-6 bi bi-calendar3"></i> <span class="ms-1 d-none d-sm-inline">TypeAbsence</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/poste" class="nav-link align-middle px-0">
                  <i class="fs-6 bi bi-calendar3"></i> <span class="ms-1 d-none d-sm-inline">Poste</span>
                </RouterLink>
              </li>

              <li class="nav-item">
                <RouterLink to="/departement" class="nav-link align-middle px-0">
                  <i class="fs-6 bi bi-calendar3"></i> <span class="ms-1 d-none d-sm-inline">Departement</span>
                </RouterLink>
              </li>
            </ul>
            <hr>

          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute();

// Fonction pour vérifier si le lien est actif
const isActive = (path) => {
  return route.path === path;
};

const getRoleFromToken = (token) => {
  if (!token) return null;
  const payload = token.split('.')[1];
  const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64Url).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  const parsedPayload = JSON.parse(jsonPayload);
  return parsedPayload.role;
};

// Récupère le rôle de l'utilisateur à partir du token
const userRole = computed(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    return getRoleFromToken(token);
  }
  return null;
});
</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

.body {
  background-color: $accent;
  position: fixed;
}

li.dropdown {
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: $accent;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

a {
  background-color: $accent;
  margin-bottom: 12%;
}

.nav-link {
  display: flex;
  align-items: center;
}

li i {
  color: $primary;
  font-weight: bold;
  font-size: 10px;
}

span {
  color: $primary;
  font-weight: bold;
  display: flex;
  font-size: 15px;
}

.nav-item:first-child {
  margin-top: 20px;
}

.nav-link:hover,
.nav-link.active {
  text-decoration: underline !important;
}
</style>
