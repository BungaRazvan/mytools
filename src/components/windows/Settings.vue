<template>
  <div class="settings-window">
    <Navbar :minimal="true" />

    <div>
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

      <div class="setting-group">
        <label>API URL</label>
        <input
          v-model="settings.API_URL"
          type="text"
          placeholder="http://127.0.0.1:8000"
        />
        <small>The base address of your Django server.</small>
      </div>

      <div class="setting-group">
        <label>API APP Token </label>
        <div class="password-wrapper">
          <input
            v-model="settings.API_APP_TOKEN"
            :type="showToken ? 'text' : 'password'"
            placeholder="Paste your secure token here"
          />
          <button @click="showToken = !showToken">
            {{ showToken ? "Hide" : "Show" }}
          </button>
        </div>
      </div>

      <button class="save-btn" @click="saveAllSettings">
        Save Configuration
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.settings-container {
  flex-direction: column;
}
</style>

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
      settings: {
        API_URL: "",
        API_APP_TOKEN: "",
      },
      showToken: false,
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
