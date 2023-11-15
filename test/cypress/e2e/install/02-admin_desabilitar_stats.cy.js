describe('Deshabilitar Stats', () => {
    it('Se desabilitan', () => {
        cy.doAdministratorLogin();
        cy.visit('administrator/index.php')
        cy.get('.js-pstats-btn-allow-never').click();
    })
})