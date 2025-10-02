class LoginPage {
    // ✅ element ของข้อความ success
    get loginSuccessText() {
        return cy.get('.post-title');
    }

    // ✅ ตรวจสอบข้อความ success
    verifyLoginSuccessText() {
        this.loginSuccessText.should('have.text', 'Logged In Successfully');
    }

    // ✅ element ของ error (username หรือ password ผิดจะขึ้นตรงนี้เหมือนกัน)
    get loginError() {
        return cy.get('#error');
    }

    // ✅ ตรวจสอบ error กรณี username ผิด
    verifyLoginErrorUsername(text) {
        this.loginError.should('contain.text', text);
    }

    // ✅ ตรวจสอบ error กรณี password ผิด
    verifyLoginErrorPassword(text) {
        this.loginError.should('contain.text', text);
    }
}

export default new LoginPage();
