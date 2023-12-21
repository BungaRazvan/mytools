<template>
  <div class="settings-window">
    <Navbar :minimal="true" />

    <div class="container-center">
      <div>
        <span v-if="version !== null">Version: {{ version }}</span>

        <span
          class="refresh"
          :class="{ loading: newVersion == downloadingState.DOWNLOADING }"
          @click="checkForUpdate"
          v-if="newVersion != downloadingState.NOT_AVAIL"
        >
          <UpdateIcon />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import UpdateIcon from "@/assets/icons/UpdateIcon.vue";

import { downloadingState } from "@/lib/vue/constants";

export default {
  name: "Settings",
  components: { Navbar, UpdateIcon },

  methods: {
    fetchVersion() {
      window.ipc.receive("appVersion").then((data) => {
        this.version = data;
      });
    },

    checkForUpdate() {
      window.ipc.send("checkForUpdate");
    },
  },

  data() {
    return {
      version: null,
      newVersion: null,
      downloadingState,
    };
  },

  mounted() {
    window.ipc.on("checkForUpdate", (data) => {
      this.newVersion = data;
    });

    this.fetchVersion();
  },
};
</script>
