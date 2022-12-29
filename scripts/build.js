const packager = require("electron-packager");
const electronInstaller = require("electron-winstaller");

async function build(options) {
  const appPaths = await packager(options);

  console.log(
    `✅ App build ready in: ${appPaths.join("\n")}, creating installer...`
  );

  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: "./dist/app-win32-ia32",
      outputDirectory: "./dist/installer",
      authors: "Bunga Razvan",
      description: "Usefull Automation Tools",
      exe: "app.exe",
    });

    console.log("💻 Installer is created in dist/installer");
  } catch (e) {
    console.log(`The following error occured: ${e.message}`);
  }
}

build({
  name: "app",
  dir: "./",
  out: "dist",
  overwrite: true,
  asar: true,
  platform: "win32",
  arch: "ia32",
});
