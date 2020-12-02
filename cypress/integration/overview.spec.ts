context('Overview', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4200/overview');
    cy.url().should('include', 'overview');
    cy.get('.application__loading-overlay').should('not.exist');
  });

  it('Overview', () => {
    cy.get('.application__view--auth-form').should('not.exist');
    cy.get('.application__content').should('be.visible');
    cy.get('.sidebar__actions').should('be.visible');
    cy.get('.view--torrent-list').should('be.visible');
  });

  it('Switch theme', () => {
    cy.get('.icon--theme-switch').should('be.visible');
    cy.get('.icon--theme-switch').parent().click();
    cy.screenshot('dark');
    cy.get('.icon--theme-switch').parent().click();
    cy.screenshot('light');
  });

  it('Tooltip', () => {
    cy.get('.icon--settings').should('be.visible');
    cy.get('.icon--settings').trigger('mouseover');
    cy.get('.tooltip__content').contains('Settings').should('exist');
    cy.get('.tooltip__content').contains('Settings').parent().should('have.class', 'is-open');
    cy.get('.icon--settings').trigger('mouseout');
    cy.get('.tooltip__content').contains('Settings').parent().should('not.have.class', 'is-open');

    cy.get('.icon--add').should('be.visible');
    cy.get('.icon--add').trigger('mouseover');
    cy.get('.tooltip__content').contains('Add Torrent').should('exist');
    cy.get('.tooltip__content').contains('Add Torrent').parent().should('have.class', 'is-open');
    cy.get('.icon--add').trigger('mouseout');
    cy.get('.tooltip__content').contains('Add Torrent').parent().should('not.have.class', 'is-open');
  });
});
