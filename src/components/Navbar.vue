<template>
  <div class="navbar">
    <nav>
      <div class="left-nav">
        <img class="logo" src="img/icon310x310.ico" />

        <span v-if="!minimal" @click="openSettings" class="nav-link no-drag"
          >{{ isDevelopment ? "MyTools Dev" : "MyTools" }}
        </span>
        <span v-if="minimal" class="nav-link"
          >{{ this.$route.name }} {{ isDevelopment ? "Dev" : "" }}
        </span>
      </div>

      <div class="rigth-nav no-drag">
        <span v-if="!minimal" @click="action('minimize')" class="nav-link"
          >&minus;</span
        >
        <span v-if="!minimal" @click="action('maximize')" class="nav-link"
          >&#128470;
        </span>
        <span @click="action('close')" class="nav-link danger no-drag"
          >&#10006;</span
        >
      </div>
    </nav>
  </div>
</template>

<style lang="scss">
.navbar {
  -webkit-app-region: drag;
  position: relative;
  margin-bottom: 20px;

  nav {
    width: 100vw;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 25px;

    .no-drag {
      -webkit-app-region: no-drag;
    }

    .nav-link {
      cursor: default;
      padding: 15px;

      &.danger {
        &:hover {
          background-color: #b31d1d !important;
        }
      }
    }

    .rigth-nav {
      &:last-child {
        margin-right: 15px;
      }

      .nav-link {
        &:hover {
          background-color: #2f2f2d;
        }
      }
    }

    .left-nav {
      display: flex;
      align-items: center;

      .nav-link {
        font-size: 30px;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
      }

      .logo {
        width: 50px;
        padding: 0;
      }
    }
  }
}
</style>

<script>
export default {
  name: "Navbar",
  props: ["minimal"],

  methods: {
    action(action) {
      window.ipc.send("windowAction", { action });
    },

    openSettings() {
      window.ipc.send("openWindow", {
        route: "settings",
        configName: "SETTINGS_WINDOW",
        centerOfMainWindow: true,
      });
    },
  },

  data() {
    return {
      isDevelopment: env.isDevelopment,
    };
  },
};
</script>
