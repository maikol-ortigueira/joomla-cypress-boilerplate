const { defineConfig } = require('cypress');
const setupPlugins = require('./cypress/plugins/index');

module.exports = defineConfig({
  fixturesFolder: 'cypress/fixtures',
  videosFolder: 'cypress/output/videos',
  screenshotsFolder: 'cypress/output/screenshots',
  viewportHeight: 1000,
  viewportWidth: 1200,
  e2e: {
    setupNodeEvents(on, config) {
      setupPlugins(on, config);
    },
    baseUrl: 'http://localhost/',
    specPattern: [
      'cypress/e2e/admin/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/site/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/api/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/plugins/**/*.cy.{js,jsx,ts,tsx}',
    ],
    supportFile: 'cypress/support/e2e.js',
    scrollBehavior: 'center',
    browser: 'firefox',
    screenshotOnRunFailure: true,
    video: false,
  },
  env: {
    sitename: 'Joomla CMS - Entorno de pruebas',
    name: 'Maikol Fustes',
    email: 'admin@ejemplo.com',
    username: 'ci-admin',
    password: 'joomla-17082005',
    db_type: 'MySQLi',
    db_host: '127.0.0.1',
    db_port: '',
    db_name: 'test_joomla_4',
    db_user: 'root',
    db_password: '',
    db_prefix: 'jos_',
    smtp_host: 'localhost',
    smtp_port: '1025',
    cmsPath: '.',
  },
});
