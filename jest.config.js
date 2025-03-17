module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/js/core/**/*.js',
    '!src/js/core/defaults/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  setupFilesAfterEnv: ['./test/setup.js'],
  testTimeout: 10000
};