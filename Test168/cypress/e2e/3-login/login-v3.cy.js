// cypress/e2e/login-v3.cy.js
describe('login v3: ใช้ custom command', () => {
    const baseUrl = 'https://practicetestautomation.com/practice-test-login/';

    beforeEach(() => {
        cy.visit(baseUrl);
    });

    it('tc-01: Login สำเร็จ', () => {
        cy.login('student', 'Password123');

        cy.url().should('include', '/logged-in-successfully');
        cy.get('h1').should('contain.text', 'Logged In Successfully');
        cy.get('p').should('contain.text', 'Congratulations student. You successfully logged in!');
    });

    it('tc-02: Login ไม่สำเร็จ (username ผิด)', () => {
        cy.login('incorrectUser', 'Password123');

        cy.url().should('not.include', '/logged-in-successfully');
        cy.get('#error').should('be.visible').and('contain.text', 'Your username is invalid!');
    });

    it('tc-03: Login ไม่สำเร็จ (password ผิด)', () => {
        cy.login('student', 'incorrectPassword');

        cy.url().should('not.include', '/logged-in-successfully');
        cy.get('#error').should('be.visible').and('contain.text', 'Your password is invalid!');
    });
});
