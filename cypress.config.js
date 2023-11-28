const { defineConfig } = require('cypress');
const setupPlugins = require('./test/cypress/plugins/index');
require('dotenv').config();

module.exports = defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  videosFolder: 'test/cypress/output/videos',
  screenshotsFolder: 'test/cypress/output/screenshots',
  viewportHeight: 1000,
  viewportWidth: 1200,
  e2e: {
    setupNodeEvents(on, config) {
      setupPlugins(on, config);
    },
    baseUrl: `http://${process.env.JOOMLA_VIRTUAL_HOST}/`,
    specPattern: [
      // 'test/cypress/e2e/install/**/*.cy.{js,jsx,ts,tsx}',
      'test/cypress/e2e/mi_install/**/*.cy.{js,jsx,ts,tsx}',
      'test/cypress/e2e/admin/**/*.cy.{js,jsx,ts,tsx}',
      'test/cypress/e2e/site/**/*.cy.{js,jsx,ts,tsx}',
      'test/cypress/e2e/api/**/*.cy.{js,jsx,ts,tsx}',
      'test/cypress/e2e/plugins/**/*.cy.{js,jsx,ts,tsx}',
    ],
    supportFile: 'test/cypress/support/e2e.js',
    scrollBehavior: 'center',
    browser: 'firefox',
    screenshotOnRunFailure: true,
    video: false,
  },
  env: {
    sitename: process.env.JOOMLA_SITENAME,
    name: process.env.SUPERUSER_NAME,
    email: process.env.SUPERUSER_EMAIL,
    username: process.env.SUPERUSER_USERNAME,
    password: process.env.SUPERUSER_PWD,
    db_type: process.env.JOOMLA_DB_TYPE,
    db_host: process.env.JOOMLA_DB_HOST,
    db_port: process.env.JOOMLA_DB_PORT,
    db_name: process.env.JOOMLA_DB_NAME,
    db_user: process.env.JOOMLA_DB_USER,
    db_password: process.env.JOOMLA_DB_PASSWORD,
    db_prefix: process.env.JOOMLA_DB_PREFIX,
    smtp_host: process.env.JOOMLA_SMTP_HOST,
    smtp_port: process.env.JOOMLA_SMTP_PORT,
    cmsPath: '.',
  },
});
