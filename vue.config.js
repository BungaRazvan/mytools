const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  // electronBuilder: {
  //   preload: "src/preload.ts",
  // },
  pluginOptions: {
    electronBuilder: {
      preload: "src/lib/electron/preload.js",
    },
  },
});
