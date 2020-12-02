import {AuthAuthenticationResponse} from '../../shared/schema/api/auth';
import {AccessLevel} from '../../shared/schema/constants/Auth';

context('Register', () => {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'GET',
      url: 'http://127.0.0.1:4200/api/auth/verify?*',
      response: {initialUser: true},
      status: 200,
    }).as('verify-request');
    cy.visit('http://127.0.0.1:4200/register');
    cy.url().should('include', 'register');
  });

  it('Client selection menu', () => {
    cy.get('.select').click();
    cy.get('.context-menu').should('be.visible');
    cy.get('.select__item').contains('qBittorrent').click();
    cy.get('.context-menu').should('not.exist');
    cy.get('.input[name="client"]').should('have.value', 'qBittorrent');
    cy.get('.input--text[name="url"]').should('be.visible');
    cy.get('.input--text[name="qbt-username"]').should('be.visible');
    cy.get('.input--text[name="qbt-password"]').should('be.visible');
  });

  it('Connection type selection', () => {
    cy.get('.toggle-input__label').contains('TCP').click();
    cy.get('.toggle-input__element[value="tcp"]').should('be.checked');
    cy.get('.toggle-input__element[value="socket"]').should('not.be.checked');
    cy.get('.input--text[name="host"]').should('be.visible');
    cy.get('.input--text[name="port"]').should('be.visible');
    cy.get('.input--text[name="socket"]').should('not.exist');

    cy.get('.toggle-input__label').contains('Socket').click();
    cy.get('.toggle-input__element[value="tcp"]').should('not.be.checked');
    cy.get('.toggle-input__element[value="socket"]').should('be.checked');
    cy.get('.input--text[name="host"]').should('not.exist');
    cy.get('.input--text[name="port"]').should('not.exist');
    cy.get('.input--text[name="socket"]').should('be.visible');
  });

  it('Register without username', () => {
    cy.get('.input[name="password"]').type('test');
    cy.get('.select').click();
    cy.get('.select__item').contains('rTorrent').click();
    cy.get('.toggle-input__label').contains('Socket').click();
    cy.get('.input--text[name="socket"]').type('/data/rtorrent.sock');
    cy.get('.button[type="submit"]').click();
    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');
    cy.get('.error').should('be.visible');
  });

  it('Register without password', () => {
    cy.get('.input[name="username"]').type('test');
    cy.get('.select').click();
    cy.get('.select__item').contains('rTorrent').click();
    cy.get('.toggle-input__label').contains('TCP').click();
    cy.get('.input--text[name="host"]').type('127.0.0.1');
    cy.get('.input--text[name="port"]').type('5000');
    cy.get('.button[type="submit"]').click();
    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');
    cy.get('.error').should('be.visible');
  });

  it('Register without connection settings', () => {
    cy.get('.input[name="username"]').type('test');
    cy.get('.input[name="password"]').type('test');
    cy.get('.button[type="submit"]').click();
    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');
    cy.get('.error').should('be.visible');
  });

  it('Register with socket connection settings, server error occurred', () => {
    cy.get('.input[name="username"]').type('test');
    cy.get('.input[name="password"]').type('test');
    cy.get('.select').click();
    cy.get('.select__item').contains('rTorrent').click();
    cy.get('.toggle-input__label').contains('Socket').click();
    cy.get('.input--text[name="socket"]').type('/data/rtorrent.sock');

    cy.server();
    cy.route({
      method: 'POST',
      url: 'http://127.0.0.1:4200/api/auth/register',
      response: {},
      status: 500,
    }).as('register-request');

    cy.get('.button[type="submit"]').click();

    cy.get('.application__view--auth-form').should('be.visible');
    cy.get('.application__content').should('not.exist');
    cy.get('.application__loading-overlay').should('not.exist');

    cy.get('.error').should('be.visible');
  });

  it('Register with qBittorrent connection settings', () => {
    cy.get('.input[name="username"]').type('test');
    cy.get('.input[name="password"]').type('test');
    cy.get('.select').click();
    cy.get('.select__item').contains('qBittorrent').click();
    cy.get('.input--text[name="url"]').type('http://127.0.0.1:8080');
    cy.get('.input--text[name="qbt-username"]').type('admin');
    cy.get('.input--text[name="qbt-password"]').type('adminadmin');

    cy.server();

    const response: AuthAuthenticationResponse = {
      success: true,
      username: 'test',
      level: AccessLevel.ADMINISTRATOR,
    };

    cy.route({
      method: 'POST',
      url: 'http://127.0.0.1:4200/api/auth/register',
      response,
      status: 200,
    }).as('register-request');

    cy.get('.button[type="submit"]').click();

    cy.get('.application__view--auth-form').should('not.exist');
    cy.get('.application__content').should('be.visible');
  });
});
