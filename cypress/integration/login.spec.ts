context('Login', () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: 'http://127.0.0.1:4200/api/auth/verify?*',
      response: {},
      status: 401,
    }).as('verify-request');
    cy.visit('http://127.0.0.1:4200/login');
    cy.url().should('include', 'login');
  });

  it('Login without username', () => {
    cy.get('.input[name="password"]').type('test');
    cy.get('.button[type="submit"]').click();
    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');
    cy.get('.error').should('be.visible');
  });

  it('Login without password', () => {
    cy.get('.input[name="username"]').type('test');
    cy.get('.button[type="submit"]').click();
    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');
    cy.get('.error').should('be.visible');
  });

  it('Login, server error occurred', () => {
    cy.get('.input[name="username"]').type('test');
    cy.get('.input[name="password"]').type('test');

    cy.server();
    cy.route({
      method: 'POST',
      url: 'http://127.0.0.1:4200/api/auth/authenticate',
      response: {},
      status: 500,
    }).as('verify-request');

    cy.get('.button[type="submit"]').click();
    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');
    cy.get('.error').should('be.visible');
  });

  it('Clear', () => {
    cy.get('.input[name="username"]').type('test').as('password');
    cy.get('.input[name="password"]').type('test').as('username');
    cy.get('.button__content').contains('Clear').parent().click();
    cy.get('@username').should('have.value', '');
    cy.get('@password').should('have.value', '');
  });
});
