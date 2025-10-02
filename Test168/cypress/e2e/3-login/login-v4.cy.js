const DataLogin = require('../../fixtures/login1.json');
import loginPage from '../../support/loginPage';

describe('login', () => {
    const baseUrl = 'https://practicetestautomation.com/practice-test-login/';

    beforeEach(() => {
        cy.visit(baseUrl)
    });

    it('tc-01: Login สำเร็จ', () => {
        // 1. เข้าไปที่หน้า login
        cy.location('pathname').should('eq', '/practice-test-login/');

        // 2. ตรวจสอบ UI ของฟอร์ม
        cy.get('#username')
            .should('be.visible')
        cy.get('#password')
            .should('be.visible')
        cy.get('#submit')
            .should('be.visible')

        cy.login1(DataLogin.username.positive, DataLogin.password.positive)

        cy.location().should((location) => {
            // ตรวจสอบ URL หลัก
            expect(location.href).to.include('https://practicetestautomation.com/logged-in-successfully');

            // ตรวจสอบ path
            expect(location.pathname).to.include('/logged-in-successfully');

            // ตรวจสอบ protocol
            expect(location.protocol).to.eq('https:');

            // ตรวจสอบ origin
            expect(location.origin).to.eq('https://practicetestautomation.com');
        });


        // 6. ตรวจสอบเนื้อหาในหน้า logged-in
        cy.get('h1').should('contain.text', 'Logged In Successfully');
        cy.get('p').should(
            'contain.text',
            'Congratulations student. You successfully logged in!'
        );

        // 7. ตรวจสอบปุ่ม Log out
        cy.get('.wp-block-button__link')
            .should('be.visible')
            .and('have.attr', 'href')
            .and('include', 'practice-test-login/');

        // ค่อยคลิก element
        cy.get('.wp-block-button__link').click();


        cy.wait(4000)

        cy.location().should((location) => {
            expect(location.href).to.eq('https://practicetestautomation.com/practice-test-login/');   // กลับมาหน้า login

        });
    });


    it.only('tc-02: Login ไม่สำเร็จ (username ผิด)', () => {
        cy.login(DataLogin.username.nagative, DataLogin.password.positive)
        cy.location('pathname').should('eq', '/practice-test-login/');
        cy.url().should('not.include', '/logged-in-successfully');
        loginPage.verifyLoginErrorUsername('Your username is invalid!')
        // loginPage.loginError()


    });

    it('tc-03', () => {
        cy.login(DataLogin.username.positive, DataLogin.password.nagative)
        loginPage.verifyLoginErrorPassword('Your password is invalid')
    })
});
