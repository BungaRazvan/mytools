<template>
  <div class="settings-window">
    <Navbar :minimal="true" />

    <div class="settings-content">
      <div class="setting-inline">
        <label v-if="version" class="version">Version: {{ version }}</label>

        <button
          class="refresh"
          :class="{ loading: newVersion === downloadingState.DOWNLOADING }"
          @click="checkForUpdate"
          v-if="newVersion !== downloadingState.NOT_AVAIL"
        >
          <UpdateIcon />
        </button>
      </div>

      <div class="setting-group">
        <label>API Url</label>
        <input
          v-model="settings.APP_API_URL"
          type="text"
          placeholder="Server base URL"
        />
      </div>

      <div class="setting-group">
        <label>API App Token</label>
        <div class="password-wrapper">
          <input
            v-model="settings.APP_API_TOKEN"
            :type="showToken ? 'text' : 'password'"
            placeholder="Secure token"
          />
          <button @click="showToken = !showToken">
            {{ showToken ? "Hide" : "Show" }}
          </button>
        </div>
      </div>

      <div class="footer">
        <button class="save-btn" @click="saveAllSettings">Save</button>
        <p v-if="statusMsg" class="status-msg">{{ statusMsg }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.settings-window {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 20px;
}

.settings-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-content: center;
  gap: 14px;

  .refresh {
    background: none;
    border: none;
    cursor: pointer;

    padding: 8px;
    border: 0;
    width: 40px;
    height: 40px;

    .icon {
      fill: #f0eeee;
    }

    &:hover {
      cursor: pointer;
    }

    &:active {
      .icon {
        fill: #5ac938;
      }
    }
    &.loading {
      cursor: wait;

      .icon {
        fill: #5ac938;
        -webkit-animation: rotating 1.2s linear infinite;
        -moz-animation: rotating 1.2s linear infinite;
        -ms-animation: rotating 1.2s linear infinite;
        -o-animation: rotating 1.2s linear infinite;
        animation: rotating 1.2s linear infinite;
      }
    }
  }

  .setting-inline {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    align-content: center;
    gap: 4px;

    label {
      font-weight: 500;
    }

    input {
      height: 34px;
      padding: 0 8px;
      font-size: 13px;
      border-radius: 6px;
      border: 1px solid #d1d5db;

      &:focus {
        outline: none;
        border-color: #4f46e5;
      }
    }
  }

  .password-wrapper {
    display: flex;
    gap: 6px;

    input {
      flex: 1;
    }

    button {
      font-size: 11px;
      padding: 0 10px;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      cursor: pointer;

      &:hover {
        background: #e5e7eb;
      }
    }
  }

  .footer {
    margin-top: auto;
  }

  .save-btn {
    width: 100%;
    height: 36px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    color: #fff;
    background: #4f46e5;

    &:hover {
      background: #4338ca;
    }
  }
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

    saveAllSettings() {
      window.ipc.send("setSetting", {
        setting: "APP_API_URL",
        data: this.settings.APP_API_URL,
        isSecure: false,
      });

      window.ipc.send("setSetting", {
        setting: "APP_API_TOKEN",
        data: this.settings.APP_API_TOKEN,
        isSecure: true,
      });

      this.statusMsg = "Settings saved successfully!";
      setTimeout(() => (this.statusMsg = ""), 3000);
    },
  },

  data() {
    return {
      version: null,
      newVersion: null,
      downloadingState,
      settings: {
        APP_API_URL: null,
        APP_API_TOKEN: null,
      },
      showToken: false,
      statusMsg: "",
    };
  },

  mounted() {
    window.ipc.on("checkForUpdate", (data) => {
      this.newVersion = data;
    });

    this.fetchVersion();

    window.ipc
      .receive("getSetting", [
        "APP_API_URL",
        { name: "APP_API_TOKEN", isSecure: true },
      ])
      .then((data) => {
        console.log(data);
        this.settings.APP_API_TOKEN = data.APP_API_TOKEN;
        this.settings.APP_API_URL = data.APP_API_URL;
      });
  },
};
</script>
