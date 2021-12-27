module.exports = {
    presets: [
      "@swissquote/crafty-preset-postcss",
      "@swissquote/crafty-runner-gulp"

    ],
    css: {
      app: {
        source: "docs/themes/default/theme.scss",
        destination: "themes/default/default.min.css",
        watch: ["docs/themes/default/**"]
      }
    }
  };