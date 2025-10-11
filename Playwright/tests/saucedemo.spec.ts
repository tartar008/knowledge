import test, { expect } from "@playwright/test";

test('E2E Checkout Flow', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // เพิ่มสินค้า
    await page.click('text=Add to cart');
    await page.click('.shopping_cart_link');

    // ดำเนินการ checkout
    await page.click('text=Checkout');
    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#postal-code', '10110');
    await page.click('#continue');
    await page.click('#finish');

    // ตรวจสอบข้อความสำเร็จ
    await expect(page.getByText('Thank you for your order!')).toBeVisible();
});