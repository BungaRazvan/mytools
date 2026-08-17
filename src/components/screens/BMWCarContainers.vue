<template>
  <div class="bmw-auth-container">
    <h2>BMW CarData Dashboard</h2>

    <!-- Alert Messages -->
    <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

    <!-- Step 1: Connect Account -->
    <div v-if="step === 'init'" class="step-card">
      <p>
        Authenticate with your BMW account to access vehicle telematics,
        technical details, and data containers.
      </p>
      <button
        class="btn primary"
        :disabled="isLoading"
        @click="requestDeviceCode"
      >
        {{ isLoading ? "Initiating..." : "Connect BMW Account" }}
      </button>
    </div>

    <!-- Step 2: Authorize -->
    <div v-else-if="step === 'authorize'" class="step-card highlight">
      <h3>Complete Login on BMW</h3>
      <p>1. Open the verification URL:</p>
      <a
        @click="openLink(authDetails.verification_uri)"
        href="#"
        class="auth-link"
      >
        {{ authDetails.verification_uri }}
      </a>

      <p class="code-instruction">2. Enter this code when prompted:</p>
      <div class="user-code-box">{{ authDetails.user_code }}</div>

      <div class="action-buttons">
        <button class="btn primary" :disabled="isLoading" @click="getApiToken">
          {{ isLoading ? "Authenticating..." : "Get Token & Connect" }}
        </button>
        <button class="btn secondary" @click="step = 'init'">Cancel</button>
      </div>
    </div>

    <!-- Step 3: Connected State / CRUD Dashboard -->
    <div v-else-if="step === 'connected'">
      <div class="header-actions">
        <span class="status-badge">Connected</span>
        <button class="btn danger-outline" @click="resetAuth">
          Disconnect
        </button>
      </div>

      <!-- VIN Filter & Container Actions -->
      <div class="card action-panel">
        <div class="button-group">
          <button
            class="btn primary"
            :disabled="isLoading"
            @click="fetchContainers"
          >
            List Containers
          </button>
          <button
            class="btn success"
            :disabled="isLoading"
            @click="showCreateModal = true"
          >
            + Create Container
          </button>
        </div>
      </div>

      <!-- Create Container Form -->
      <div v-if="showCreateModal" class="card modal-form">
        <h3>Create New Container</h3>
        <div class="form-group">
          <label>Container Name:</label>
          <input
            v-model="newContainer.name"
            type="text"
            placeholder="My Container"
          />
        </div>
        <div class="form-group">
          <label>Purpose / Description:</label>
          <input
            v-model="newContainer.purpose"
            type="text"
            placeholder="Telemetry tracking"
          />
        </div>

        <div class="form-group">
          <label>Technical Descriptors (comma separated):</label>
          <input
            v-model="rawTechnicalDescriptors"
            type="text"
            placeholder="vehicle.vehicle.travelledDistance, vehicle.drivetrain.lastRemainingRange"
          />
        </div>
        <div class="modal-actions">
          <button
            class="btn success"
            :disabled="isLoading"
            @click="createContainer"
          >
            Submit
          </button>
          <button class="btn secondary" @click="showCreateModal = false">
            Cancel
          </button>
        </div>
      </div>

      <!-- Containers List -->
      <div v-if="containersList.length" class="card table-card">
        <h3>Active Containers</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in containersList" :key="c.containerId || c.id">
              <td>
                <code>{{ c.containerId || c.id }}</code>
              </td>
              <td>{{ c.name || "N/A" }}</td>
              <td>
                <span class="tag">{{ c.status || "Active" }}</span>
              </td>
              <td class="actions-cell">
                <button
                  class="btn small primary"
                  @click="getContainerDetail(c.containerId || c.id)"
                >
                  Details
                </button>
                <button
                  class="btn small danger"
                  @click="deleteContainer(c.containerId || c.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="technicalDescriptors?.length" class="keys-section">
        <h4>Technical Descriptors ({{ technicalDescriptors.length }})</h4>
        <ul class="key-list">
          <li v-for="(descriptor, index) in technicalDescriptors" :key="index">
            <code>{{ descriptor }}</code>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BmwAuthFlow",

  data() {
    return {
      step: "init", // 'init' | 'authorize' | 'connected'
      isLoading: false,
      errorMessage: "",
      successMessage: "",

      authDetails: {
        device_code: "",
        user_code: "",
        verification_uri: "",
      },
      showCreateModal: false,
      rawTechnicalDescriptors: null,
      newContainer: {
        name: null,
        purpose: null,
        technicalDescriptors: [],
      },
      containersList: [],
      technicalDescriptors: [],
      selectedData: null,
    };
  },

  mounted() {
    // this.checkExistingSession();
  },

  methods: {
    openLink: (url) => {
      window.ipc.send("openBrowser", { url });
    },

    // -------------------------------------------------------------
    // AUTHENTICATION FLOW
    // -------------------------------------------------------------
    async checkExistingSession() {
      this.isLoading = true;

      try {
        const response = await window.ipc.receive("api", {
          endpoint: "bmw/cardata/containers",
          method: "GET",

          options: {
            useAPIKey: true,
            headers: { "Content-Type": "application/json" },
          },
        });

        if (
          response &&
          !response.error &&
          response.status !== 401 &&
          response.status !== 403
        ) {
          this.step = "connected";
          if (response.data) this.handleContainersResponse(response.data);
        } else {
          this.step = "init";
        }
      } catch (err) {
        this.step = "init";
      } finally {
        this.isLoading = false;
      }
    },

    async requestDeviceCode() {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const response = await window.ipc.receive("api", {
        method: "POST",
        endpoint: "bmw/cardata/auth/device",
        options: { useAPIKey: true },
      });

      if (response && response.data) {
        const data = response.data;
        this.authDetails = {
          device_code: data.device_code,
          user_code: data.user_code || data.user_code_complete,
          verification_uri: data.verification_uri || data.verification_url,
        };
        this.step = "authorize";
      } else {
        this.errorMessage = "Failed to initiate device authentication.";
      }
      this.isLoading = false;
    },

    async getApiToken() {
      this.isLoading = true;
      const response = await window.ipc.receive("api", {
        endpoint: "bmw/cardata/auth-token",
        method: "POST",
        options: {
          useAPIKey: true,
          headers: { "Content-Type": "application/json" },
        },
        body: { device_code: this.authDetails.device_code },
      });

      if (response && response.ok) {
        this.step = "connected";
        this.successMessage = "BMW Account connected successfully!";
      } else {
        this.errorMessage = response?.data?.detail || "Authentication failed.";
      }
      this.isLoading = false;
    },

    resetAuth() {
      this.containersList = [];
      this.technicalDetails = null;
      this.selectedData = null;
      this.step = "init";
    },

    // -------------------------------------------------------------
    // CONTAINER CRUD OPERATIONS
    // -------------------------------------------------------------
    async fetchContainers() {
      this.isLoading = true;
      this.errorMessage = "";

      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: "bmw/cardata/containers",

        options: {
          useAPIKey: true,
        },
      });

      this.isLoading = false;

      if (response.ok) {
        this.handleContainersResponse(response.data);
        this.selectedData = response.data;
      } else {
        this.errorMessage =
          response.data?.detail || "Failed to fetch containers.";
      }
    },

    async createContainer() {
      if (!this.newContainer.name) return;
      this.isLoading = true;

      const cleanDescriptors = this.rawTechnicalDescriptors
        .split(",")
        .map((item) => item.replace(/[\u200B-\u200D\uFEFF]/g, "").trim())
        .filter((item) => item.length > 0);

      // 2. Build the final payload with sanitized descriptors
      const payload = {
        ...this.newContainer,
        technicalDescriptors: cleanDescriptors,
      };

      const response = await window.ipc.receive("api", {
        method: "POST",
        endpoint: "bmw/cardata/containers",

        options: {
          useAPIKey: true,
          headers: { "Content-Type": "application/json" },
        },
        body: payload,
      });

      this.isLoading = false;

      if (response.ok) {
        this.successMessage = "Container created successfully!";
        this.showCreateModal = false;
        this.newContainer = { name: "", purpose: "" };
        this.fetchContainers();
      } else {
        this.errorMessage =
          response.data?.error || "Failed to create container.";
      }
    },

    async getContainerDetail(containerId) {
      this.isLoading = true;
      const response = await window.ipc.receive("api", {
        method: "GET",
        endpoint: `bmw/cardata/containers`,
        headers: { "Content-Type": "application/json" },
        options: { useAPIKey: true },
        body: { containerId },
      });

      console.log(response);

      this.isLoading = false;
      if (response.ok) {
        this.technicalDescriptors = response.data.technicalDescriptors;
      } else {
        this.errorMessage = "Failed to load container details.";
      }
    },

    async deleteContainer(containerId) {
      if (!confirm(`Are you sure you want to delete container ${containerId}?`))
        return;
      this.isLoading = true;

      const response = await window.ipc.receive("api", {
        method: "DELETE",
        endpoint: `bmw/cardata/containers`,
        options: {
          useAPIKey: true,
          headers: { "Content-Type": "application/json" },
        },
        body: { containerId },
      });

      this.isLoading = false;
      if (response.ok) {
        this.successMessage = "Container deleted successfully.";
        this.fetchContainers();
      } else {
        this.errorMessage =
          response.data?.error || "Failed to delete container.";
      }
    },

    handleContainersResponse(data) {
      if (Array.isArray(data)) {
        this.containersList = data;
      } else if (data.containers && Array.isArray(data.containers)) {
        this.containersList = data.containers;
      } else {
        this.containersList = [];
      }
    },
  },
};
</script>

<style lang="scss">
$bg-card: #25282c;
$bg-dark: #1a1c1e;
$bmw-blue: #1c69d4;
$bmw-blue-hover: #1551a5;
$text-main: #f5f5f7;
$text-sub: #9ea3a9;
$text-sub: #9ea3a9;
$success-green: #27ae60;
$error-red: #e74c3c;

.bmw-auth-container {
  max-width: 750px;
  margin: 0 auto;
  padding: 24px;
  background: $bg-dark;
  color: $text-main;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  h2 {
    margin-top: 0;
    font-size: 1.4rem;
    border-bottom: 1px solid #32363c;
    padding-bottom: 12px;
  }

  .card,
  .step-card {
    background: $bg-card;
    padding: 20px;
    border-radius: 8px;
    margin-top: 16px;

    &.highlight {
      border: 1px solid $bmw-blue;
    }
  }

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;

    label {
      font-size: 0.85rem;
      color: $text-sub;
    }

    input {
      background: #141619;
      border: 1px solid #383d44;
      padding: 10px;
      border-radius: 6px;
      color: #fff;
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: $bmw-blue;
      }
    }
  }

  .button-group,
  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  /* Table styling */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;

    th,
    td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #32363c;
      font-size: 0.85rem;
    }

    th {
      color: $text-sub;
    }

    code {
      background: #141619;
      padding: 2px 6px;
      border-radius: 4px;
      color: #e5c07b;
    }

    .tag {
      background: rgba(39, 174, 96, 0.2);
      color: $success-green;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
    }

    .actions-cell {
      display: flex;
      gap: 6px;
    }
  }

  /* Technical Details Key-Value Display */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;

    .tech-item {
      background: #1e2124;
      padding: 10px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;

      .tech-key {
        font-size: 0.75rem;
        color: $text-sub;
      }
      .tech-val {
        font-size: 0.9rem;
        font-weight: bold;
        word-break: break-all;
      }
    }
  }

  /* Buttons */
  .btn {
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;

    &.primary {
      background: $bmw-blue;
      color: #fff;
      &:hover {
        background: $bmw-blue-hover;
      }
    }
    &.secondary {
      background: #3a3f47;
      color: #fff;
    }
    &.success {
      background: $success-green;
      color: #fff;
    }
    &.info {
      background: #2980b9;
      color: #fff;
    }
    &.danger {
      background: $error-red;
      color: #fff;
    }
    &.danger-outline {
      background: transparent;
      border: 1px solid $error-red;
      color: $error-red;
    }
    &.small {
      padding: 4px 8px;
      font-size: 0.75rem;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .status-badge {
    background: $success-green;
    color: #fff;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
  }

  .auth-link {
    color: #61afef;
    word-break: break-all;
  }
  .user-code-box {
    font-size: 1.8rem;
    font-weight: bold;
    letter-spacing: 4px;
    background: #141619;
    color: #e5c07b;
    padding: 12px;
    text-align: center;
    border-radius: 6px;
  }

  .alert {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    margin-top: 12px;
    &.error {
      background: #5a1e1e;
      color: #ff8888;
    }
    &.success {
      background: #1e4d2b;
      color: #88ffaa;
    }
  }

  .data-preview pre {
    background: #141619;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #abb2bf;
    overflow-x: auto;
  }
}
</style>
