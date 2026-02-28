module.exports = {
  root: false,
  extends: ["next/core-web-vitals", "next/typescript"],
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" }
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error"
  },
  ignorePatterns: ["dist", "build", "node_modules", ".next", ".turbo"]
};
