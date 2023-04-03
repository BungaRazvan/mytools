const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      preload: "src/lib/electron/preload.js",
      builderOptions: {
        productName: "MyTools",
        appId: "e080f96c-d23f-11ed-afa1-0242ac120002",
        win: {
          target: ["nsis"],
          icon: "src/assets/img/icon310x310.ico",
        },
        nsis: {
          installerIcon: "src/assets/img/icon310x310.ico",
          uninstallerIcon: "src/assets/img/icon310x310.ico",
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
        },
        extraResources: [{ from: "./src/assets/img/", to: "./img/" }],
      },
    },
  },
});
