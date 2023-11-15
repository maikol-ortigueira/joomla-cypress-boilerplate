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

Cypress.Commands.add('enablePlugin', (pluginName) => {
    cy.log(`**Habilitar plugin ${pluginName}**`)
    cy.visit('/administrator/index.php?option=com_plugins&view=plugins');
    cy.get('#filter_search').clear().type(pluginName);
    cy.get('.filter-search-bar__button').click();
    cy.get('[data-item-id="cb0"]').click();
    cy.get('#system-message-container').contains('enabled').should('exist');
});

const createMenu = (menuTitle, menuName, description) => {
    cy.log(`**Crear Menú ${menuTitle}**`);
    cy.visit('/administrator/index.php?option=com_menus&view=menus');

    // Tengo que procurar seleccionar primero site
    cy.clickToolbarButton('new');

    cy.get('#jform_title').click().clear().type(menuTitle);
    cy.get('#jform_menutype').click().clear().type(menuName);
    cy.get('#jform_menudescription').click().clear().type(description);

    cy.clickToolbarButton('save & close')
    cy.get('#system-message-container .alert-message').contains('saved').should('be.visible')
}

Cypress.Commands.add('createMenu', createMenu)

// Create a category
const createCategory = (title, extension = 'com_content', parent='', lang='') => {
    cy.log('**Crear una categoría**')
    cy.log('Title:' + title)
    cy.log('Extension: ' + extension)

    extension = '&extension=' + extension;

    cy.visit('administrator/index.php?option=com_categories' + extension)

    cy.clickToolbarButton('new')
    cy.get('#jform_title').clear().type(title)

    if (parent !== '') {
        cy.get(':nth-child(2) > .controls > joomla-field-fancy-select > .choices > .choices__inner').click()
        cy.get('div').contains(parent).click()
    }

    if (lang !== '') {
        cy.get('#jform_language').select(lang);
    }

    cy.clickToolbarButton('save & close')
    cy.get('#system-message-container .alert-message').contains('saved').should('be.visible')

    cy.log('--Create a category--')
}

Cypress.Commands.add('crearCategoria', createCategory)
