<template>
  <div class="setting-group">
    <label>{{ title }}</label>

    <div class="password-wrapper">
      <input v-model="model" :name="name" :type="show ? 'text' : 'password'" />

      <button @click="show = !show">
        {{ showToken ? "Hide" : "Show" }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PwdInput",
  props: ["settings", "name", "title"],

  computed: {
    model: {
      get() {
        return this.settings[this.name];
      },
      set(value) {
        this.settings[this.name] = value;
      },
    },
  },

  data() {
    return {
      show: false,
    };
  },
};
</script>
