module.exports = function(api) {
  api.cache(true);

  return {
    presets: ["next/babel"],
    plugins: [
      [
        "@emotion",
        {
          sourceMap: true,
          autoLabel: "dev-only"
        }
      ]
    ]
  };
};
