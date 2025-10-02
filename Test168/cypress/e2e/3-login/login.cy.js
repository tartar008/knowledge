const DataLogin = require('../../fixtures/login1.json')

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

        //     // 3. ใส่ค่า
        // cy.get('#username').type('student').should('have.value', 'student');
        // cy.get('#password').type('Password123').should('have.value', 'Password123');

        // 4. คลิก login
        // cy.get('#submit').click();
        cy.login1(DataLogin.username.positive, DataLogin.password.positive)

        // 5. ตรวจ redirect
        // cy.testLocation(
        //     DataLogin.baseUrl.protocal,
        //     DataLogin.baseUrl.domain,
        //     DataLogin.baseUrl.paths.Login   // ✅ ไม่ใช่ DataLogin.baseUrl.paths
        // )
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


    it('tc-02: Login ไม่สำเร็จ (username ผิด)', () => {
        // กรอกค่าผิด
        // cy.get('#username').type('incorrectUser');
        // cy.get('#password').type('Password123');
        // cy.get('#submit').click();

        // ต้อง "ยังอยู่" หน้า login (ไม่ redirect)
        cy.location('pathname').should('eq', '/practice-test-login/');
        cy.url().should('not.include', '/logged-in-successfully');

        // มี error message ชัดเจน
        // cy.get('#error').should('be.visible').and('contain.text', 'Your username is invalid!');

        // ไม่มีข้อความ success
        // cy.get('h1').should('not.contain.text', 'Logged In Successfully');
    });

    it('tc-03', () => {
        // cy.get('#username').type('student');
        // cy.get('#password').type('incorrectPassword');
        // cy.get('#submit').click();
        cy.login1(DataLogin.username.positive, DataLogin.password.nagative)

        // มี error message ชัดเจน
        // cy.get('#error').should('be.visible').and('contain.text', 'Your username is invalid!');

        // ไม่มีข้อความ success
        // cy.get('h1').should('not.contain.text', 'Logged In Successfully');
    })
});
