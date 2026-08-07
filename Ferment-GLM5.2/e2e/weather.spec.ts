import { test, expect } from '@playwright/test'

/**
 * Weather e2e — city list, current conditions + forecast, favorites persisted.
 */

async function openWeather(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-weather').click()
  await expect(page.getByTestId('weather-content')).toBeVisible()
}

test.describe('Weather', () => {
  test('opens from Dock showing the city list', async ({ page }) => {
    await openWeather(page)
    await expect(page.getByTestId('weather-list')).toBeVisible()
    await expect(page.getByTestId('weather-city-name').filter({ hasText: 'Cupertino' })).toBeVisible()
    await expect(page.getByTestId('weather-city-name').filter({ hasText: 'New York' })).toBeVisible()
    await expect(page.getByTestId('weather-city-name').filter({ hasText: 'London' })).toBeVisible()
  })

  test('shows current conditions for the selected city', async ({ page }) => {
    await openWeather(page)
    await expect(page.getByTestId('weather-city-title')).toHaveText('Cupertino')
    await expect(page.getByTestId('weather-temp')).toHaveText('72°')
    await expect(page.getByTestId('weather-condition')).toHaveText('Sunny')
  })

  test('shows a 5-day forecast', async ({ page }) => {
    await openWeather(page)
    await expect(page.getByTestId('weather-forecast-days')).toBeVisible()
    const days = page.getByTestId('weather-forecast-day')
    await expect(days).toHaveCount(5)
    // First day is Mon.
    await expect(days.first().getByTestId('weather-forecast-day-name')).toHaveText('Mon')
  })

  test('selecting a different city updates the detail view', async ({ page }) => {
    await openWeather(page)
    await page.getByTestId('weather-city').filter({ hasText: 'London' }).click()
    await expect(page.getByTestId('weather-city-title')).toHaveText('London')
    await expect(page.getByTestId('weather-temp')).toHaveText('55°')
    await expect(page.getByTestId('weather-condition')).toHaveText('Rainy')
  })

  test('search filters the city list', async ({ page }) => {
    await openWeather(page)
    await page.getByTestId('weather-search').fill('Tokyo')
    await expect(page.getByTestId('weather-city')).toHaveCount(1)
    await expect(page.getByTestId('weather-city-name').filter({ hasText: 'Tokyo' })).toBeVisible()
  })

  test('search with no match shows the empty state', async ({ page }) => {
    await openWeather(page)
    await page.getByTestId('weather-search').fill('Atlantis')
    await expect(page.getByTestId('weather-list')).toContainText('No cities found.')
  })

  test('favoriting a city pins it to the top of the list', async ({ page }) => {
    await openWeather(page)
    // London is not a favorite initially.
    await expect(page.getByTestId('weather-city').first()).not.toContainText('London')
    await page.getByTestId('weather-city').filter({ hasText: 'London' }).click()
    await page.getByTestId('weather-favorite-toggle').click()
    // Now London should be pinned at the top (after the seed favorite Cupertino).
    const cities = page.getByTestId('weather-city-name')
    await expect(cities.nth(1)).toHaveText('London')
  })

  test('favorites persist across a full reload', async ({ page }) => {
    await openWeather(page)
    await page.getByTestId('weather-city').filter({ hasText: 'Tokyo' }).click()
    await page.getByTestId('weather-favorite-toggle').click()
    await page.reload()
    await openWeather(page)
    // Tokyo should appear near the top (pinned as a favorite, after Cupertino).
    await expect(page.getByTestId('weather-city-name').nth(1)).toHaveText('Tokyo')
  })
})
