import { expect, test } from '@playwright/test'

test.describe('Index Page', () => {
  test('loads the search shell', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Search Results - Videos/i)
    await expect(page.locator('#results')).toBeVisible()
    await expect(page.locator('#pagination')).toBeVisible()
  })
})
