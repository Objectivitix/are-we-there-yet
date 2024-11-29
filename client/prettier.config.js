export default {
  overrides: [
    {
      files: ["*.html", "commands.js"],
      options: {
        printWidth: 100,
      },
    },
    {
      files: "*.svg",
      options: {
        parser: "html",
        printWidth: Infinity,
      },
    },
  ],
  trailingComma: "all",
};
