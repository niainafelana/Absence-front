<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>

  <body class="body">
    <div class="container-fluid">
      <div class="row flex-nowrap">
        <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0 ">
          <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a href="" class="d-flex align-items-center text-white text-decoration-none"
              id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="../assets/sary/1721891607125.jpg" alt="hugenerd" width="30" height="30" class="rounded-circle">
              <span class="fs-6 d-none d-sm-inline">MiezakaAbsence</span> </a>

            <!--Navbar-->
            <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li class="nav-item">
                <RouterLink to="" class="nav-link align-middle px-0">
                  <i class="fs-4 bi-house"></i> <span class="ms-1 d-none d-sm-inline">Home</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="" class="nav-link align-middle px-0">
                  <i class="fs-4 bi-house"></i> <span class="ms-1 d-none d-sm-inline">Home</span>
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="" class="nav-link align-middle px-0">
                  <i class="fs-4 bi-house"></i> <span class="ms-1 d-none d-sm-inline">Home</span>
                </RouterLink>
              </li>

            </ul>
            <hr>
            <div class="dropdown pb-4">
              <a href="#" class="d-flex align-items-center text-white text-decoration-none"
                id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fs-4 bi-house"></i> 
                <span class="d-none d-sm-inline mx-1">loser</span>
              </a>
            </div>
          </div>
        </div>
  
      </div>
    </div>

  </body>
  
</template>
<style lang="scss" scoped>
@import "../assets/style/globaly.scss";
.body{
  background-color: $accent;
  position: fixed;
}

a{
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
  font-size: 10pxB;
}
span {
  color: $primary;
  font-weight: bold;
  display: flex;
  font-size: 12px;
}
</style>