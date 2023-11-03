describe('Cambiar el idioma a Español', () => {
    it('Cambia configuración del backend', () => {
        cy.doAdministratorLogin();
        cy.visit('administrator/index.php?option=com_languages&view=installed');
        cy.get('#client_id').select(1);
        cy.get('.icon-unfeatured').click();
    })

    it('Cambia configuración del frontend', () => {
        cy.doAdministratorLogin()
        cy.visit('administrator/index.php?option=com_languages&view=installed');
        cy.get('#client_id').select(0);
        cy.get('.icon-unfeatured').click();
    })
})