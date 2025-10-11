import { test, expect } from '@playwright/test';

test('🔐 Login Success', async ({ page }) => {
    await page.goto('https://practicetestautomation.com/practice-test-login/');

    await page.getByLabel('Username').fill('student');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Logged In Successfully')).toBeVisible();
    await expect(page).toHaveURL(/logged-in-successfully/);
});

test('🚫 Login Fail', async ({ page }) => {
    await page.goto('https://practicetestautomation.com/practice-test-login/');

    await page.getByLabel('Username').fill('wronguser');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Submit' }).click();

    const message = page.locator('#error');
    await expect(message).toHaveText('Your username is invalid!');
}); 