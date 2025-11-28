module.exports = {
  presets: [
    ["@babel/preset-typescript", { allowNamespaces: true }],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        development: process.env.NODE_ENV === "development"
      }
    ]
  ],
  plugins: [
    [
      "babel-plugin-react-compiler",
      {
        target: "19",
        // Apply only to clean React component files
        sources: (filename) => {
          return (
            filename.includes("app/public/src") &&
            filename.endsWith(".tsx") &&
            !filename.includes("node_modules")
          )
        },
        // More lenient compilation
        runtimeModule: null // Disable runtime module for compatibility
      }
    ]
  ]
}
