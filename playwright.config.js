// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  testMatch: 'tabulator-test.js',
  
  /* Maximum time one test can run for */
  timeout: 60 * 1000,
  
  expect: {
    /* Maximum time expect() should wait for the condition to be met */
    timeout: 5000
  },

  /* Run tests in files in parallel */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry tests */
  retries: 1,
  
  /* Reporter to use */
  reporter: [['html'], ['list']],
  
  /* Configure projects for browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx serve test -p 3000',
    port: 3000,
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});