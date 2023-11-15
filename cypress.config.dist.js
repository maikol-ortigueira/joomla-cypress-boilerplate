const { defineConfig } = require('cypress');
const setupPlugins = require('./test/cypress/plugins/index');

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
        baseUrl: 'http://localhost:8080/',
        specPattern: [
            'test/cypress/e2e/install/**/*.cy.{js,jsx,ts,tsx}',
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
        sitename: 'Joomla CMS - Entorno de pruebas',
        name: 'Maikol Fustes',
        email: 'admin@ejemplo.com',
        username: 'ci-admin',
        password: 'joomla-17082005',
        db_type: 'MySQLi',
        db_host: 'joomladb',
        db_port: '',
        db_name: 'test_joomla_4',
        db_user: 'root',
        db_password: 'password',
        db_prefix: 'jos_',
        smtp_host: 'localhost',
        smtp_port: '1025',
        cmsPath: '.',
    },
});
