module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],
  moduleDirectories: [
    "node_modules",
    "dist"
  ],

  moduleFileExtensions: [
    "js",
    "json",
  ],
  testMatch: [
    '**/tests/**/*.spec.js',
  ],
};
