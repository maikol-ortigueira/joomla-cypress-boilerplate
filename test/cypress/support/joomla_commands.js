/**
 * Imports commands fom files. The commands start with the folder name and an underscore as cypress doesn't support
 * namespaces for commands.
 *
 * https://github.com/cypress-io/cypress/issues/6575
 */

import './commands/api';
import './commands/config';
import './commands/db';

const { registerCommands } = require('../../../node_modules/joomla-cypress/src/index.js');

registerCommands();

Cypress.Commands.overwrite('doFrontendLogin', (originalFn, username, password, useSnapshot = true) => {
  // Ensure there are valid credentials
  const user = username ?? Cypress.env('username');
  const pw = password ?? Cypress.env('password');

  // Do normal login when no snapshot should be used
  if (!useSnapshot) {
    // Clear the session data
    Cypress.session.clearAllSavedSessions();

    // Call the normal function
    return originalFn(user, pw);
  }

  // Do login through the session
  return cy.session([user, pw, 'front'], () => originalFn(user, pw), { cacheAcrossSpecs: true });
});

Cypress.Commands.overwrite('doFrontendLogout', (originalFn) => {
  // Call the login function
  originalFn();

  // Clear the session data
  Cypress.session.clearAllSavedSessions();
});

const iniciarSesionAdmin = (user, pw) => {
    // Call the normal function
    cy.log('**Iniciar sesión en el Panel de administración**')
    cy.log('User: ' + user)
    cy.log('Password: ' + pw)
  
    cy.visit('administrator/index.php')
    cy.get('#mod-login-username').type(user)
    cy.get('#mod-login-password').type(pw)
    cy.get('#btn-login-submit').click()
    cy.get('h1.page-title').should('contain', 'Panel de inicio')
  
    cy.log('--Iniciar sesión en el Panel de administración--')
}

Cypress.Commands.add('doSpanishAdminLogin', (username, password, useSnapshot = true) => {
  const user = username ?? Cypress.env('username');
  const pw = password ?? Cypress.env('password');

  // Do normal login when no snapshot should be used
  if (!useSnapshot) {
    // Clear the session data
    Cypress.session.clearAllSavedSessions();
    iniciarSesionAdmin(user, pw);
  }

  // Do login through the session
  Cypress.session.clearAllSavedSessions();
  return cy.session([user, pw, 'back'], () => iniciarSesionAdmin(user, pw), { cacheAcrossSpecs: true });
});

Cypress.Commands.overwrite('doAdministratorLogin', (originalFn, username, password, useSnapshot = true) => {
  // Ensure there are valid credentials
  const user = username ?? Cypress.env('username');
  const pw = password ?? Cypress.env('password');

  // Do normal login when no snapshot should be used
  if (!useSnapshot) {
    // Clear the session data
    Cypress.session.clearAllSavedSessions();
    originalFn(user, pw);
  }

  // Do login through the session
  return cy.session([user, pw, 'back'], () => originalFn(user, pw), { cacheAcrossSpecs: true });
});

Cypress.Commands.overwrite('doAdministratorLogout', (originalFn) => {
  // Call the login function
  originalFn();

  // Clear the session data
  Cypress.session.clearAllSavedSessions();
});

