<template>
  <nav class="vertical-navbar">
    <div class="logo">
      <h2>MiezakaAbsence</h2>
    </div>
    <ul class="nav-menu">
      <li
        v-for="item in navItems"
        :key="item.path"
        :class="{ active: isActive(item.path) }"
      >
        <RouterLink :to="item.path">
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => {
  return route.path === path;
};

const navItems = [
  { name: "Accueil", path: "/accueil", icon: "bi bi-house-fill" },
  { name: "Employé", path: "/employe", icon: "bi bi-person-fill" },
  { name: "Demande", path: "/demande", icon: "bi bi-calendar-fill" },
  { name: "Utilisateur", path: "/user", icon: "bi bi-people-fill" },
  { name: "TypeAbsence", path: "/type", icon: "bi bi-tag-fill" },
  { name: "Departement", path: "/departement", icon: "bi bi-diagram-3-fill" },
  { name: "Poste", path: "/poste", icon: "bi bi-briefcase-fill" },
  { name: "Dashboard", path: "/dashboard", icon: "bi bi-diagram-3-fill" },
  { name: "Profil", path: "/profil", icon: "bi bi-person-circle" },
];

const getRoleFromToken = (token) => {
  if (!token) return null;
  const payload = token.split(".")[1];
  const base64Url = payload.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64Url)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  const parsedPayload = JSON.parse(jsonPayload);
  return parsedPayload.role;
};

const userRole = computed(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    return getRoleFromToken(token);
  }
  return null;
});
</script>

<style lang="scss" scoped>
@import "../assets/style/globaly.scss";

.vertical-navbar {
  width: 200px;
  height: 100vh;
  background-color: $accent;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  text-align: center;
  padding: 0 20px;
  h2 {
    color: $primary;
    font-size: 18px;
    font-weight: bold;
  }
}

.nav-menu {
  list-style-type: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0 16px;
    margin-bottom: 8px;

    a {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      color: $primary;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;

      i {
        font-size: 18px;
        margin-right: 10px;
      }

      span {
        font-size: 14px;
      }
    }

    &:hover,
    &.active {
      a {
        background-color: rgba($primary, 0.2);
        color: lighten($primary, 20%);
        border-radius: 20px;
      }
    }

    &.active {
      a {
        background-color: rgba($primary, 0.2);
        font-weight: bold;
        border-radius: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .vertical-navbar {
    width: 60px;
  }

  .logo h2 {
    display: none;
  }

  .nav-menu li {
    a {
      justify-content: center;
      padding: 10px;

      span {
        display: none;
      }

      i {
        margin-right: 0;
      }
    }
  }
}
</style>