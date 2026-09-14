describe('Login flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/v1/login', (request) => {
      if (request.body.email === 'wrong@example.com') {
        request.reply({
          statusCode: 400,
          body: { message: 'Invalid credentials' },
        });
        return;
      }

      request.reply({
        statusCode: 200,
        body: {
          data: {
            token: 'e2e-token',
            user: { id: 'user-e2e', name: 'E2E User', avatar: '' },
          },
        },
      });
    }).as('loginRequest');

    cy.intercept('GET', '**/v1/threads', {
      statusCode: 200,
      body: { data: { threads: [] } },
    }).as('threadsRequest');

    cy.intercept('GET', '**/v1/users', {
      statusCode: 200,
      body: { data: { users: [] } },
    }).as('usersRequest');

    cy.intercept('GET', '**/v1/users/me', {
      statusCode: 200,
      body: {
        data: {
          user: { id: 'user-e2e', name: 'E2E User', avatar: '' },
        },
      },
    }).as('profileRequest');
  });

  it('shows an error for invalid credentials and navigates home after valid login', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrong-password');
    cy.get('button[type="submit"]').click();

    cy.get('[role="alert"]').should('contain.text', 'Invalid credentials');

    cy.get('input[name="email"]').clear().type('e2e@example.com');
    cy.get('input[name="password"]').clear().type('valid-password');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://127.0.0.1:3001/');
    cy.get('main').contains('h1', 'Discussion Forum').should('be.visible');
  });

  it('preserves the authenticated session after a browser refresh', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('e2e@example.com');
    cy.get('input[name="password"]').type('valid-password');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://127.0.0.1:3001/');
    cy.get('main').contains('h1', 'Discussion Forum').should('be.visible');

    cy.reload();

    cy.url().should('eq', 'http://127.0.0.1:3001/');
    cy.get('.user-greeting').should('contain.text', 'E2E User');
    cy.get('button').contains('Logout').should('be.visible');
  });
});
