describe('<Dashboard>', () => {
    beforeEach(() => {
        cy.viewport(1440, 761);
        cy.visit('http://localhost:3000');
    });

    it('Layout renders correctly', () => {
        // cy.viewport(1440, 761);

        // default state
        cy.compareSnapshot('dashboard_guest', 0.5);
        // // withdraw item selected
        // cy.get('#action-selector-withdraw').click();
        // cy.compareSnapshot('dashboard_guest_withdraw_selected', 0.1);

        // the same for mobile layout
        cy.viewport(390, 844);
        cy.compareSnapshot('mobile_dashboard_guest', 0.5);
    });

    it('Theme switcher click changes theme', () => {
        cy.viewport(1440, 761);
        // cy.get('#connect-wallet-btn').click();
        // cy.get('.WalletsModalWrapper').should('be.visible');
    });

    it('Connect wallet shows wallets modal', () => {
        cy.viewport(1440, 761);
        cy.get('#connect-wallet-btn').click();
        cy.get('.WalletsModalWrapper').should('be.visible');
    });
});
