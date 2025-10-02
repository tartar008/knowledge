import { test, expect } from '@playwright/test'


test('v-1 login successfully', async ({ page }) => {
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    await page.getByLabel('Username').fill('student');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Submit' }).click();
    expect(page.url()).toBe('https://practicetestautomation.com/logged-in-successfully/')
    expect(page.getByRole('heading', { name: 'Logged In Successfully' }))
});

test('v-2 login fail (username ผิด)', async ({ page }) => {
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    await page.getByLabel('Username').fill('incorrectUser');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Submit' }).click();
    expect(page.url()).toBe('https://practicetestautomation.com/practice-test-login/')
    expect(page.getByRole('heading', { name: 'Your username is invalid!' }))
});

test('v-3 login fail (password ผิด)', async ({ page }) => {
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    await page.getByLabel('Username').fill('student');
    await page.getByLabel('Password').fill('incorrectPassword ');
    await page.getByRole('button', { name: 'Submit' }).click();
    expect(page.url()).toBe('https://practicetestautomation.com/practice-test-login/')
    expect(page.getByRole('heading', { name: 'Your password is invalid!' }))
})