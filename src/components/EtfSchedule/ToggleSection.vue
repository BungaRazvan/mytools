<template>
  <div class="toggle-section">
    <div class="toggle-container" @click="onClick">
      <div class="icon-wrap">
        <ChevronDown v-if="!condition" :color="color" :size="size" />
        <ChevronUp v-else :color="color" :size="size" />
      </div>
      <h4>{{ title }}</h4>
      <div class="line"></div>
    </div>
    <transition name="expand">
      <div v-if="condition" class="table-container">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { ChevronDown, ChevronUp } from "lucide-vue-next";

export default {
  name: "ToggleSection",
  props: ["title", "condition", "color", "size", "onClick"],
  components: { ChevronDown, ChevronUp },
};
</script>
