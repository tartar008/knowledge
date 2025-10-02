// cypress/e2e/login-v2.cy.js
describe('login v2: ใช้ beforeEach', () => {
    const baseUrl = 'https://practicetestautomation.com/practice-test-login/';

    beforeEach(() => {
        cy.visit(baseUrl);
    });

    it('tc-01: Login สำเร็จ', () => {
        cy.get('#username').type('student');
        cy.get('#password').type('Password123');
        cy.get('#submit').click();

        // ตรวจสอบว่า redirect ไปหน้า success
        cy.url().should('include', '/logged-in-successfully');
        cy.get('h1').should('contain.text', 'Logged In Successfully');
        cy.get('p').should('contain.text', 'Congratulations student. You successfully logged in!');
    });

    it('tc-02: Login ไม่สำเร็จ (username ผิด)', () => {
        cy.get('#username').type('incorrectUser');
        cy.get('#password').type('Password123');
        cy.get('#submit').click();

        // ต้องไม่ redirect
        cy.url().should('not.include', '/logged-in-successfully');
        cy.get('#error').should('be.visible').and('contain.text', 'Your username is invalid!');
    });

    it('tc-03: Login ไม่สำเร็จ (password ผิด)', () => {
        cy.get('#username').type('student');
        cy.get('#password').type('incorrectPassword');
        cy.get('#submit').click();

        // ต้องไม่ redirect
        cy.url().should('not.include', '/logged-in-successfully');
        cy.get('#error').should('be.visible').and('contain.text', 'Your password is invalid!');
    });
});
