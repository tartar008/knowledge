import { test, expect } from "@playwright/test";
import { devices } from '@playwright/test';


test("Test", async ({ browser }) => {

    const iphone = devices['iPhone 12'];
    const context = await browser.newContext({
        ...iphone,
        locale: 'th-TH',
        geolocation: { longitude: 100.5018, latitude: 13.7563 },
        permissions: ['geolocation'],
    });
    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com/');
    const username = page.locator('[data-test="username"]');
    await username.fill('standard_user');
    const password = page.locator('[data-test="password"]');
    await password.fill('secret_sauce');


    // await page.waitForTimeout(2000); // รอโหลดหน้า
});
