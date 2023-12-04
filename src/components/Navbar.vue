<template>
  <div class="navbar">
    <nav>
      <div class="left-nav">
        <img class="logo" src="img/icon310x310.ico" />

        <span @click="openSettings" class="nav-link"
          >{{ isDevelopment ? "MyToolsDev" : "MyTools" }}
        </span>
      </div>

      <div class="rigth-nav">
        <span @click="action('minimize')" class="nav-link">&minus;</span>
        <span @click="action('maximize')" class="nav-link">&#128470; </span>
        <span @click="action('close')" class="nav-link danger">&#10006;</span>
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

    .nav-link {
      -webkit-app-region: no-drag;

      cursor: default;
      padding: 15px;

      &.danger {
        &:hover {
          background-color: #b31d1d;
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
  methods: {
    action(action) {
      window.ipc.send("electronAction", { action });
    },

    openSettings() {
      const childWindow = window.open(
        "about:blank",
        "_blank",
        "top=500,left=200,frame=false,nodeIntegration=no"
      );

      console.log(childWindow);
      childWindow.document.write("<h1>Hello</h1>");
    },
  },

  data() {
    return {
      isDevelopment: env.isDevelopment,
    };
  },
};
</script>
