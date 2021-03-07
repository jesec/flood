context('Form elements', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:4200/overview');
    cy.url().should('include', 'overview');
    cy.get('.application__loading-overlay').should('not.exist');

    // Add torrents modal
    cy.get('.action--add-torrent').should('be.visible');
    cy.get('.action--add-torrent').click();
    cy.get('.modal__header').contains('Add Torrents').should('be.visible');
  });

  afterEach(() => {
    cy.get('.button__content').contains('Cancel').should('be.visible');
    cy.get('.button__content').contains('Cancel').click();
    cy.get('.modal__header').should('not.be.visible');
  });

  it('Textboxes', () => {
    cy.get('input[name="urls-0"]').should('be.visible');
    cy.get('input[name="urls-0"]').parents('.form__row--group').as('textboxesGroup');
    cy.get('input[name="urls-0"]').type('test');

    // Add textboxes with foo and bar
    cy.get('input[name="urls-0"]').siblings().first().click();
    cy.get('input[name="urls-1"]').should('be.visible');
    cy.get('input[name="urls-1"]').type('foo');

    cy.get('input[name="urls-1"]').siblings().first().click();
    cy.get('input[name="urls-2"]').should('be.visible');
    cy.get('input[name="urls-2"]').type('bar');

    // Insert test2
    cy.get('input[name="urls-0"]').siblings().first().click();
    cy.get('input[name="urls-3"]').should('be.visible');
    cy.get('input[name="urls-3"]').type('test2');

    // Assert order: test, test2, foo, bar
    cy.get('@textboxesGroup').children().eq(0).find('input').should('have.value', 'test');
    cy.get('@textboxesGroup').children().eq(1).find('input').should('have.value', 'test2');
    cy.get('@textboxesGroup').children().eq(2).find('input').should('have.value', 'foo');
    cy.get('@textboxesGroup').children().eq(3).find('input').should('have.value', 'bar');

    // Deletes test2
    cy.get('input[name="urls-3"]').siblings().last().click();

    // Assert order: test, foo, bar
    cy.get('@textboxesGroup').children().eq(0).find('input').should('have.value', 'test');
    cy.get('@textboxesGroup').children().eq(1).find('input').should('have.value', 'foo');
    cy.get('@textboxesGroup').children().eq(2).find('input').should('have.value', 'bar');

    // Deletes bar
    cy.get('input[name="urls-2"]').siblings().last().click();

    // Assert order: test, foo
    cy.get('@textboxesGroup').children().eq(0).find('input').should('have.value', 'test');
    cy.get('@textboxesGroup').children().eq(1).find('input').should('have.value', 'foo');
  });

  it('Tag selector', () => {
    // Tag input
    cy.get('.input[name="tags"]').should('be.visible');
    cy.get('.input[name="tags"]').type('foo,bar');

    // Open selector
    cy.get('.input[name="tags"]').siblings().click();
    cy.get('.context-menu__item').contains('Untagged').should('be.visible');

    // Expect foo and bar selected
    cy.get('.select__item--is-selected').first().should('contain', 'foo');
    cy.get('.select__item--is-selected').last().should('contain', 'bar');

    // Unselect foo
    cy.get('.select__item--is-selected').first().click();
    cy.get('.input[name="tags"]').should('have.value', 'bar');

    // Click "Untagged"
    cy.get('.context-menu__item').contains('Untagged').click();
    cy.get('.input[name="tags"]').should('have.value', '');

    // Close
    cy.get('.input[name="tags"]').siblings().click();
    cy.get('.context-menu__item').should('not.exist');
  });

  it('Toggle', () => {
    cy.get('input[name="start"]').then((startToggleElem) => {
      const start = Cypress.$(startToggleElem).attr('checked') != null ? true : false;

      // Click toggle
      cy.get('input[name="start"]').siblings().find('.icon--checkmark').click();

      // Expect change of state
      if (start) {
        cy.get('input[name="start"]').siblings().find('.icon--checkmark').should('not.be.visible');
      } else {
        cy.get('input[name="start"]').siblings().find('.icon--checkmark').should('be.visible');
      }
    });
  });
});
