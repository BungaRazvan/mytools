import Settings from "@/components/windows/Settings.vue";
import Main from "@/components/windows/Main.vue";

export default [
  { path: "/", component: Main, name: "Main" },
  { path: "/settings", component: Settings, name: "Settings" },
];
