describe('connect wallet spec', () => {
    before(() => {
        cy.visit('/');
    });

    it('should display no address and deposit/withdraw disabled', () => {
        cy.get('#deposit-btn').should('not.exist');
        cy.get('#withdraw-btn').should('not.exist');
        cy.get('#approve-btn').should('be.disabled');
        cy.get('#connect-wallet-btn').should('have.text', 'Add wallet');
    });

    it('should connect wallet with success', () => {
        cy.get('#connect-wallet-btn').click();
        cy.get('#connect-metamask-btn').click();
        cy.acceptMetamaskAccess();
        cy.get('#address').should('have.text', '0x113c...93F2');
    });

    it('should be approve only available when wallet connected', () => {
        cy.get('#deposit-btn').should('not.exist');
        cy.get('#withdraw-btn').should('not.exist');
        cy.get('#approve-btn').should('be.enabled');
    });
});
