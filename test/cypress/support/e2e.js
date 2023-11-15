// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './joomla_commands'
import './commands'
import 'joomla-cypress'

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
  // cy.task('startMailServer');
  // cy.db_createPsicos(10);
  // cy.db_createComites(5);
  // cy.db_createSecciones(5);
  // cy.db_createAsociaciones(10);
  Cypress.on('uncaught:exception', (err, runnable) => {
    console.log(`err :${err}`);
    console.log(`runnable :${runnable}`);
    return false;
  });
});

afterEach(() => {
  cy.checkForPhpNoticesOrWarnings();
})

after(() => {
  //cy.task('cleanupDB');
});