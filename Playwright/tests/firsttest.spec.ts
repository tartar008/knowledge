import { test, expect } from '@playwright/test'


test('has title', async ({ page }) => {
    await page.goto('https://practicetestautomation.com/practice-test-login/')
})